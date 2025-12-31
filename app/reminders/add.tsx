import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddReminder() {
  const [title, setTitle] = useState('');
  const [remindAt, setRemindAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  const handleAddReminder = async () => {
    if (!title.trim()) {
      alert('Please enter reminder title');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('User not logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'reminders'), {
        title: title.trim(),
        userId: user.uid,
        remindAt: Timestamp.fromDate(remindAt),
        completed: false,
        notified: false, // 🔥 REQUIRED for Cloud Function
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder');
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setRemindAt(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add Reminder</Text>

      <TextInput
        placeholder="Reminder title"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateBtn}
      >
        <Text style={styles.dateText}>
          ⏰ {remindAt.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={remindAt}
          mode="datetime"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAddReminder}
      >
        <Text style={styles.addBtnText}>Save Reminder</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    padding: 16,
  },
  header: {
    color: '#0ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
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
  dateText: {
    color: '#4ADE80',
    fontSize: 16,
  },
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
