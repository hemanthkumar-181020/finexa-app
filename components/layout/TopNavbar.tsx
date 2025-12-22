// components/layout/TopNavbar.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TopNavbarProps = {
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
};

export function TopNavbar({
  onMenuPress,
  onNotificationsPress,
}: TopNavbarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: hamburger + logo + name */}
        <View style={styles.leftGroup}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.brand}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>Finexa</Text>
          </View>
        </View>

        {/* Right: notification icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
