import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

export default function ReminderList() {
  const [reminders, setReminders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid)
    );

    return onSnapshot(q, snap => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const deleteReminder = async (id: string) => {
    Alert.alert('Delete Reminder?', 'This cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'reminders', id));
        },
      },
    ]);
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => deleteReminder(id)}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={26} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Reminders</Text>
        <TouchableOpacity onPress={() => router.push('/reminders/add')}>
          <MaterialCommunityIcons name="plus-circle-outline" size={28} color="#0ff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/reminders/edit',
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>
                {new Date(item.remindAt.seconds * 1000).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: { color: '#0ff', fontSize: 24, fontWeight: 'bold' },

  card: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { color: '#4ADE80', fontSize: 18, fontWeight: '600' },
  date: { color: '#0ff', marginTop: 6 },

  deleteBtn: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 12,
  },
});
