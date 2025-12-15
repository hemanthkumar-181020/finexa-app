import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function More() {
  const router = useRouter();

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
            color={danger ? "#fde2e2" : "#e0f2ff"}
          />
        </View>
        <Text
          style={[
            styles.itemText,
            danger && { color: "#fecaca" },
          ]}
        >
          {title}
        </Text>
      </View>

      {value ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        !danger && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#cbd5f5"
          />
        )
      )}
    </Pressable>
  );

  return (
    <LinearGradient
      // dark–to–teal like your provided themes
      colors={["#020b26", "#04738b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>More</Text>

        {/* Account */}
        <Text style={styles.section}>Account</Text>
        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => router.push("/profile" as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Hemanth Kumar Bommi</Text>
            <Text style={styles.email}>
              bommihemanthkumar979@gmail.com
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
        </Pressable>

        {/* Upgrade button with same gradient as login/signup */}
        <Pressable
          style={({ pressed }) => [
            styles.upgradeWrapper,
            pressed && styles.cardPressed,
          ]}
          onPress={() => {}}
        >
          <LinearGradient
            colors={["#0284c7", "#22c1c3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgrade}
          >
            <Ionicons name="rocket" size={20} color="#e0f2fe" />
            <Text style={styles.upgradeText}>Upgrade Now</Text>
          </LinearGradient>
        </Pressable>

        {/* Finance */}
        <Text style={styles.section}>Finance</Text>
        <Item icon="grid" title="Categories" route="/categories" />
        <Item icon="pricetag" title="Labels" route="/labels" />
        <Item
          icon="time"
          title="Scheduled Transactions"
          route="/scheduled"
        />
        <Item
          icon="cash"
          title="Main Currency"
          value="INR"
          route="/currency"
        />

        {/* Wallets */}
        <Text style={styles.section}>Accounts & Wallets</Text>
        <Item
          icon="wallet"
          title="Manual Wallets"
          route="/wallets/manual"
        />
        <Item
          icon="card"
          title="Bank Accounts & E-Wallets"
          route="/wallets/bank"
        />
        <Item
          icon="logo-bitcoin"
          title="Crypto Wallets"
          route="/wallets/crypto"
        />

        {/* App Settings */}
        <Text style={styles.section}>App Settings</Text>
        <Item icon="notifications" title="Notifications" />
        <Item icon="color-palette" title="Appearance" />
        <Item icon="language" title="Language" />
        <Item icon="settings" title="Advanced" route="/advanced" />

        {/* Support */}
        <Text style={styles.section}>Support</Text>
        <Item icon="help-circle" title="Help Center" />
        <Item icon="mail" title="Contact Support" />
        <Item icon="document-text" title="Terms & Policies" />

        {/* Logout */}
        <Item
          icon="log-out"
          title="Logout"
          danger
          route="/(auth)/login"
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    color: "#f9fafb",
    marginTop: 8,
    marginBottom: 12,
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
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
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
  avatarText: {
    color: "#e0f2fe",
    fontWeight: "700",
    fontSize: 18,
  },
  name: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  email: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  upgradeWrapper: {
    marginTop: 14,
  },
  upgrade: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#22c1c3",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 8,
  },
  upgradeText: {
    fontWeight: "700",
    color: "#f9fafb",
    fontSize: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(9,16,40,0.9)",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.6)",
  },
  itemPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15,118,178,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    color: "#e5e7eb",
    fontSize: 15,
  },
  value: {
    color: "#dbeafe",
    fontSize: 14,
  },
  dangerItem: {
    borderColor: "rgba(248,113,113,0.7)",
    backgroundColor: "rgba(127,29,29,0.35)",
  },
  version: {
    textAlign: "center",
    color: "#cbd5f5",
    marginTop: 18,
    fontSize: 12,
    marginBottom: 8,
  },
});
