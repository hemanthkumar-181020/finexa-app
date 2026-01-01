import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useRouter, useLocalSearchParams } from "expo-router";

const EditReminder = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    const fetchReminder = async () => {
      if (!user || !id) return;

      const ref = doc(db, "users", user.uid, "reminders", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data: any = snap.data();
        setTitle(data.title || "");
        if (data.remindAt?.seconds) {
          setDate(new Date(data.remindAt.seconds * 1000));
        }
        setNotificationsEnabled(data.notificationsEnabled ?? true);
      }
    };

    fetchReminder();
  }, [id]);

  const saveReminder = async () => {
    if (!user || !id) return;

    const ref = doc(db, "users", user.uid, "reminders", id);
    await updateDoc(ref, {
      title,
      remindAt: Timestamp.fromDate(date),
      notificationsEnabled,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#22d3ee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Reminder</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.value}>{title || "Reminder title"}</Text>
        </TouchableOpacity>

        {/* Date Picker */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDate(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#22d3ee" />
          <Text style={styles.value}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {/* Time Picker */}
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTime(true)}
        >
          <Ionicons name="time-outline" size={20} color="#22d3ee" />
          <Text style={styles.value}>
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveReminder}>
          <Text style={styles.saveText}>Save Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={(_, selected) => {
            setShowDate(false);
            if (selected) {
              const d = new Date(date);
              d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
              setDate(d);
            }
          }}
        />
      )}

      {/* Time Picker Modal */}
      {showTime && (
        <DateTimePicker
          value={date}
          mode="time"
          display="clock"
          onChange={(_, selected) => {
            setShowTime(false);
            if (selected) {
              const d = new Date(date);
              d.setHours(selected.getHours(), selected.getMinutes());
              setDate(d);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default EditReminder;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#22d3ee30",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  container: { flex: 1, padding: 16 },
  label: { color: "#9ca3af", marginBottom: 6, marginTop: 8 },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#22d3ee40",
  },
  value: { color: "#e5e7eb", fontSize: 15 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  switchText: { color: "#e5e7eb", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});
