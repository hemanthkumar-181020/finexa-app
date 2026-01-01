import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useRouter, useFocusEffect } from "expo-router";

const RemindersIndex = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [globalRemindersEnabled, setGlobalRemindersEnabled] = useState(true);
  const router = useRouter();
  const user = auth.currentUser;

  // Fetch reminders
  const fetchReminders = async () => {
    if (!user) return;

    const snap = await getDocs(collection(db, "users", user.uid, "reminders"));
    setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // Fetch global toggle
  const fetchGlobalToggle = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setGlobalRemindersEnabled(snap.data()?.reminders ?? true);
    }
  };

  // Update global toggle in Firestore
  const toggleGlobalReminders = async (value: boolean) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { reminders: value });
    setGlobalRemindersEnabled(value);
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "reminders", id));
    fetchReminders();
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
      fetchGlobalToggle();
    }, [])
  );

  const formatDateTime = (remindAt: any) => {
    if (!remindAt) return "";
    if (remindAt.seconds) {
      return new Date(remindAt.seconds * 1000).toLocaleString();
    }
    return new Date(remindAt).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#22d3ee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Global toggle */}
      <View style={styles.globalToggle}>
        <Text style={styles.toggleText}>Enable Reminders</Text>
        <Switch
          value={globalRemindersEnabled}
          onValueChange={toggleGlobalReminders}
        />
      </View>

      {/* Reminders list */}
      <View style={styles.container}>
        {globalRemindersEnabled ? (
          <FlatList
            data={reminders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{formatDateTime(item.remindAt)}</Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/reminders/edit",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={22} color="#22d3ee" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteReminder(item.id)}>
                    <Ionicons name="trash-outline" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.disabledText}>
            Reminders are disabled globally.
          </Text>
        )}

        {/* Floating Add Button */}
        {globalRemindersEnabled && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/reminders/add")}
          >
            <Ionicons name="add" size={34} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RemindersIndex;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  globalToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  toggleText: { color: "#e5e7eb", fontWeight: "600" },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#22d3ee40",
  },
  title: { color: "#e5e7eb", fontSize: 16, fontWeight: "700" },
  date: { marginTop: 6, color: "#9ca3af", fontSize: 13 },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 12 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#22c55e",
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
  disabledText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 30,
    fontSize: 16,
  },
});
