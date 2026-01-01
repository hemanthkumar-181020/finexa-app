import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddReminder() {
  const router = useRouter();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const saveReminder = async () => {
    if (!user || !title.trim()) return;

    await addDoc(collection(db, "users", user.uid, "reminders"), {
      title,
      remindAt: date,
      notificationsEnabled,
      completed: false,
      createdAt: serverTimestamp(),
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Reminder</Text>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What do you want to remember?"
        placeholderTextColor="#6b7280"
        style={styles.input}
      />

      {/* Date Picker */}
      <TouchableOpacity style={styles.card} onPress={() => setShowDate(true)}>
        <Ionicons name="calendar-outline" size={22} color="#22d3ee" />
        <Text style={styles.cardText}>{date.toDateString()}</Text>
      </TouchableOpacity>

      {/* Time Picker */}
      <TouchableOpacity style={styles.card} onPress={() => setShowTime(true)}>
        <Ionicons name="time-outline" size={22} color="#22c55e" />
        <Text style={styles.cardText}>
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>

      {/* Notification Toggle */}
      <View style={styles.toggleRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name={
              notificationsEnabled
                ? "notifications-outline"
                : "notifications-off-outline"
            }
            size={22}
            color={notificationsEnabled ? "#22c55e" : "#6b7280"}
          />
          <Text style={styles.toggleText}> Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#1f2933", true: "#22c55e" }}
          thumbColor="#000"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveReminder}>
        <Ionicons name="add-circle-outline" size={22} color="#000" />
        <Text style={styles.saveText}>Save Reminder</Text>
      </TouchableOpacity>

      {/* Pickers */}
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            setShowDate(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            setShowTime(false);
            if (selected) {
              const newDate = new Date(date);
              newDate.setHours(selected.getHours());
              newDate.setMinutes(selected.getMinutes());
              setDate(newDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#22d3ee",
    marginBottom: 25,
  },
  label: {
    color: "#9ca3af",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 14,
    color: "#e5e7eb",
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#22d3ee40",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#22c55e40",
  },
  cardText: {
    color: "#e5e7eb",
    fontSize: 16,
    marginLeft: 12,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  toggleText: {
    color: "#e5e7eb",
    fontSize: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: "#22c55e",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  saveText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
});
