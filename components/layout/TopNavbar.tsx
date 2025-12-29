import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "../../services/AuthContext";

export function TopNavbar() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const displayName = userProfile?.username || "User";
  const displayEmail = userProfile?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <View style={styles.topBar}>
        {/* LEFT: HAMBURGER */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#111827" />
        </TouchableOpacity>

        {/* LEFT-CENTER: LOGO + NAME (same row, like screenshot) */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Finexa</Text>
        </View>

        {/* RIGHT: BELL */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/")}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#111827"
          />
        </TouchableOpacity>
      </View>

      {/* ================= SIDE MENU ================= */}
      <Modal visible={menuVisible} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            {/* USER HEADER */}
            <LinearGradient
              colors={["#0284c7", "#22c1c3"]}
              style={styles.userHeader}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>

              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>

              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => {
                  setMenuVisible(false);
                  router.push("/profile");
                }}
              >
                <Text style={styles.profileBtnText}>View Profile</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* MENU ITEMS */}
            <MenuItem
              icon="grid-outline"
              label="Categories"
              onPress={() => {
                setMenuVisible(false);
                router.push("/add");
              }}
            />
            <MenuItem
              icon="wallet-outline"
              label="Wallets"
              onPress={() => {
                setMenuVisible(false);
                router.push("/add");
              }}
            />
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => {
                setMenuVisible(false);
                router.push("/add");
              }}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {
                setMenuVisible(false);
                router.push("/add");
              }}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#DC2626" : "#111827"}
      />
      <Text
        style={[
          styles.menuText,
          danger && { color: "#DC2626", fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  /* TOP BAR */
  topBar: {
    paddingTop: 28,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // logo + Finexa text, left side (not centered)
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 26,
    height: 26,
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginLeft: 10,
  },

  /* MENU OVERLAY */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    width: "78%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },

  /* USER HEADER */
  userHeader: {
    paddingTop: 56,
    paddingBottom: 24,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#e0f2fe",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
  },
  userEmail: {
    fontSize: 13,
    color: "#e0f2fe",
    marginTop: 2,
  },
  profileBtn: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileBtnText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 13,
  },

  /* MENU ITEMS */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuText: {
    marginLeft: 14,
    fontSize: 16,
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
});