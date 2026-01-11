import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../services/AuthContext";

const { width } = Dimensions.get("window");

interface DrawerItemProps {
  icon: any;
  title: string;
  subtitle: string;
  route?: string;
  color: string;
  isMCI?: boolean;
}

export function TopNavbar() {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideX = useRef(new Animated.Value(-width * 0.8)).current;

  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const displayName = userProfile?.username || "User";
  const displayEmail = userProfile?.email || "Premium Member";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideX, {
      toValue: -width * 0.8,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Sign out of Finexa?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            closeMenu();

            if (Platform.OS === "web") {
              try {
                localStorage.clear();
              } catch {}
              try {
                sessionStorage.clear();
              } catch {}
              try {
                if (window.indexedDB) {
                  indexedDB.deleteDatabase("firebaseLocalStorageDb");
                }
              } catch {}
              setTimeout(() => {
                window.location.href = "/login";
                window.location.reload();
              }, 300);
            } else {
              router.replace("/login");
            }
          } catch (error) {
            console.error("Logout error:", error);
            if (Platform.OS === "web") {
              window.location.href = "/login";
            } else {
              router.replace("/login");
            }
          }
        },
      },
    ]);
  };

  const DrawerItem = ({
    icon,
    title,
    subtitle,
    route,
    color,
    isMCI = false,
  }: DrawerItemProps) => (
    <Pressable
      onPress={() => {
        closeMenu();
        if (route) router.push(route as any);
      }}
      style={({ pressed }) => [styles.drawerItem, pressed && styles.pressed]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${color}12` }]}>
          {isMCI ? (
            <MaterialCommunityIcons name={icon} size={18} color={color} />
          ) : (
            <Ionicons name={icon} size={18} color={color} />
          )}
        </View>
        <View>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={14} color="#475569" />
    </Pressable>
  );

  return (
    <>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#0f172a" }]}
          onPress={openMenu}
        >
          <Ionicons name="menu" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.appName}>FINEXA</Text>
            <Text style={styles.appTag}>Personal Finance OS</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#0f172a" }]}
          onPress={() => router.push("/reminders")}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#FFFFFF"
          />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Drawer (fade overlay + animated slide from left) */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideX }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <LinearGradient
                colors={["#064e3b", "#020617"]}
                style={styles.drawerHeader}
              >
                <View style={styles.profileInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarLetter}</Text>
                  </View>
                  <View>
                    <Text style={styles.uName}>{displayName}</Text>
                    <Text style={styles.uEmail}>{displayEmail}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewProfile}
                  onPress={() => {
                    closeMenu();
                    router.push("/profile");
                  }}
                >
                  <Text style={styles.viewProfileText}>Manage Account</Text>
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.drawerBody}>
                <Text style={styles.groupLabel}>Insights</Text>
                <View style={styles.groupCard}>
                  <DrawerItem
                    icon="fire"
                    title="Heat Map"
                    subtitle="Spending hotspots"
                    route="/profile/heatmap"
                    color="#f59e0b"
                    isMCI
                  />
                  <View style={styles.divider} />
                  <DrawerItem
                    icon="grid-outline"
                    title="Categories"
                    subtitle="Manage icons"
                    route="/categories"
                    color="#10b981"
                  />
                  <View style={styles.divider} />
                  <DrawerItem
  icon="trending-up-outline" // Focuses on the "Future" and growth direction
  title="Forecast"
  subtitle="Predictive spending"
  route="/tabs/analytics"
  color="#0EA5E9" 
/>

                  
                </View>

                <Text style={styles.groupLabel}>Automation</Text>
                <View style={styles.groupCard}>
                  <DrawerItem
                    icon="bullseye-arrow"
                    title="Saving Goals"
                    subtitle="Reach targets"
                    route="/profile/goals"
                    color="#f43f5e"
                    isMCI
                  />
                  <View style={styles.divider} />
                  <DrawerItem
                    icon="chatbubble-ellipses-outline"
                    title="SMS Parsing"
                    subtitle="Auto-logging"
                    route="/tabs/banks"
                    color="#8b5cf6"
                  />
                  <View style={styles.divider} />
                  <DrawerItem
                    icon="alarm"
                    title="Reminders"
                    subtitle="Manage notifications"
                    route="/reminders"
                    color="#b45309"
                    isMCI
                  />
                  

                </View>

                <TouchableOpacity
                  style={styles.logoutRow}
                  onPress={handleLogout}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color="#ef4444"
                  />
                  <Text style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>

          <Pressable style={styles.closeArea} onPress={closeMenu} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: Platform.OS === "ios" ? 100 : 72,
    paddingTop: Platform.OS === "ios" ? 50 : 24,
    paddingHorizontal: 20,
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoImage: {
    width: "70%",
    height: "70%",
  },
  appName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  appTag: {
    fontSize: 11,
    color: "#9ca3af",
    letterSpacing: 0.7,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#000000",
  },

  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  drawerContainer: {
    width: width * 0.8,
    height: "100%",
    backgroundColor: "#000000",
  },
  closeArea: { flex: 1 },

  drawerHeader: {
    padding: 30,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 15 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#064e3b",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  uName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  uEmail: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  viewProfile: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  viewProfileText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 12,
  },

  drawerBody: { padding: 20 },
  groupLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 20,
  },
  groupCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingVertical: 5,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "600" },
  itemSubtitle: { color: "#64748b", fontSize: 12, marginTop: 1 },
  divider: { height: 1, backgroundColor: "#1e293b", marginHorizontal: 16 },
  pressed: { opacity: 0.6 },

  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 30,
    marginBottom: 40,
    padding: 14,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 15,
  },
  logoutLabel: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: 14,
  },
});
