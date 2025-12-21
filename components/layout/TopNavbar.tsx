// components/layout/TopNavbar.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet, Image } from "react-native";

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

      <TextInput
        placeholder="Try searching for budgets, transactions..."
        placeholderTextColor="#9CA3AF"
        style={styles.search}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,              // bigger top padding like GfG
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",  // light bar
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // very light line at bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,            // perfect circle
    backgroundColor: "#000000",  // black circle behind logo
    borderWidth: 1,
    borderColor: "#111827",      // very slight line around circle
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
  search: {
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 9,
    color: "#111827",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
