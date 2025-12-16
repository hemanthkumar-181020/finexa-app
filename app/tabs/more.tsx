import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

import { auth } from "../../services/firebase";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function More() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ❗ DO NOT navigate here
      // RootLayout onAuthStateChanged will handle redirect
    } catch (err) {
      Alert.alert("Logout failed", "Please try again");
    }
  };

  type ItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    route?: string;
    danger?: boolean;
  };

  const Item = ({
    icon,
    title,
    value,
    route,
    danger = false,
  }: ItemProps) => (
    <Pressable
      onPress={() => route && router.push(route as any)}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
        danger && styles.dangerItem,
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconChip}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? "#fecaca" : "#e0f2ff"}
          />
        </View>
        <Text style={[styles.itemText, danger && { color: "#fecaca" }]}>
          {title}
        </Text>
      </View>

      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        !danger && (
          <Ionicons name="chevron-forward" size={18} color="#cbd5f5" />
        )
      )}
    </Pressable>
  );

  return (
    <LinearGradient
      colors={["#020b26", "#04738b"]}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>More</Text>

        {/* ================= ACCOUNT ================= */}
        <Text style={styles.section}>Account</Text>

        <Pressable
          style={styles.profileCard}
          onPress={() => router.push("/profile" as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.username?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {loading ? "Loading..." : profile?.username ?? "User"}
            </Text>
            <Text style={styles.email}>
              {loading ? "" : profile?.email ?? ""}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
        </Pressable>

        {/* ================= FINANCE ================= */}
        <Text style={styles.section}>Finance</Text>
        <Item icon="grid" title="Categories" route="/categories" />
        <Item icon="time" title="Scheduled Transactions" route="/scheduled" />
        <Item icon="cash" title="Main Currency" value="INR" />

        {/* ================= SETTINGS ================= */}
        <Text style={styles.section}>Settings</Text>
        <Item icon="notifications" title="Notifications" />
        <Item icon="settings" title="Advanced" route="/advanced" />

        {/* ================= LOGOUT ================= */}
        <Pressable
          onPress={() =>
            Alert.alert("Logout", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: handleLogout,
              },
            ])
          }
        >
          <Item icon="log-out" title="Logout" danger />
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#f9fafb",
    marginVertical: 12,
  },
  section: {
    fontSize: 13,
    color: "#cbd5f5",
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(9,16,40,0.92)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#e0f2fe", fontWeight: "700", fontSize: 18 },
  name: { color: "#e5e7eb", fontWeight: "600" },
  email: { color: "#9ca3af", fontSize: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(9,16,40,0.9)",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.6)",
  },
  itemPressed: { opacity: 0.9 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15,118,178,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { color: "#e5e7eb", fontSize: 15 },
  value: { color: "#dbeafe", fontSize: 14 },
  dangerItem: {
    borderColor: "rgba(248,113,113,0.7)",
    backgroundColor: "rgba(127,29,29,0.35)",
  },
  version: {
    textAlign: "center",
    color: "#cbd5f5",
    marginTop: 20,
    fontSize: 12,
  },
});