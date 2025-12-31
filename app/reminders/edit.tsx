import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditReminder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'reminders', String(id)));
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setRemindAt(data.remindAt.toDate());
      }
    };
    load();
  }, [id]);

  const saveChanges = async () => {
    if (remindAt <= new Date()) {
      Alert.alert('Invalid time', 'Choose a future date');
      return;
    }

    await updateDoc(doc(db, 'reminders', String(id)), {
      title,
      remindAt: Timestamp.fromDate(remindAt),
      notified: false, // 🔥 reschedule notification
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Edit Reminder</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{remindAt.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={remindAt}
          mode="datetime"
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShowPicker(Platform.OS === 'ios');
            if (d) setRemindAt(d);
          }}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={saveChanges}>
        <Text style={styles.addBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 16 },
  header: { color: '#0ff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: {
    backgroundColor: '#111827',
    color: '#0ff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateBtn: {
    backgroundColor: '#1F2937',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  dateText: { color: '#4ADE80', fontSize: 16 },
  addBtn: {
    backgroundColor: '#0ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
