// components/layout/TopNavbar.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export function TopNavbar() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: logo + name */}
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

        {/* Right: placeholder for bell/profile later */}
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
});
