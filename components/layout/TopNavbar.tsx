import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../services/AuthContext";

const { width, height } = Dimensions.get("window");

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
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const displayName = userProfile?.username || "User";
  const displayEmail = userProfile?.email || "Premium Member";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert("Logout", "Sign out of Finexa?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            setMenuVisible(false);
          } catch {
            Alert.alert("Error", "Failed to logout.");
          }
        },
      },
    ]);
  };

  const DrawerItem = ({ icon, title, subtitle, route, color, isMCI = false }: DrawerItemProps) => (
    <Pressable
      onPress={() => {
        setMenuVisible(false);
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
      {/* 1. SLIM TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={26} color="#111827" />
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/")}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* 2. FULL-BLEED LEFT DRAWER */}
      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <LinearGradient colors={["#064e3b", "#020617"]} style={styles.drawerHeader}>
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
                  onPress={() => { setMenuVisible(false); router.push("/profile"); }}
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
                    icon="notifications-outline"       // notification/bell icon
                    title="Reminders"           // drawer title
                    subtitle="Manage reminders" // optional subtitle
                    route="/reminders"    // must match hidden screen path
                    color="#f59e0b"             // any color you like (amber)
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
                    route="/profile/sms" 
                    color="#8b5cf6" 
                  />
                </View>

                <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                  <Text style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          <Pressable style={styles.closeArea} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: Platform.OS === 'ios' ? 100 : 70, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    zIndex: 10,
  },
  logoRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "flex-start", 
    flex: 1,                      
    marginLeft: 8,                
  },
  logoCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: "#000000", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  logoImage: { width: 22, height: 22 },
  appName: { fontSize: 22, fontWeight: "800", color: "#111827", marginLeft: 10 },
  iconButton: { padding: 4, width: 40, alignItems: 'center' },

  modalOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.6)" },
  drawerContainer: { width: width * 0.76, height: '100%', backgroundColor: "#020617" },
  closeArea: { flex: 1, height: "100%" },

  drawerHeader: { 
    paddingTop: Platform.OS === 'ios' ? 65 : 55, 
    paddingBottom: 25, 
    paddingHorizontal: 20 
  },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#10b981" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  uName: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  uEmail: { color: "#94a3b8", fontSize: 12 },
  viewProfile: { marginTop: 15, backgroundColor: "rgba(255,255,255,0.08)", paddingVertical: 8, borderRadius: 12, alignItems: "center" },
  viewProfileText: { color: "#10b981", fontWeight: "700", fontSize: 12 },
  
  drawerBody: { padding: 15 },
  groupLabel: { color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, marginTop: 15, fontWeight: "800", paddingLeft: 5 },
  groupCard: { backgroundColor: "#0f172a", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#1e293b" },
  drawerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "600" },
  itemSubtitle: { color: "#64748b", fontSize: 10 },
  divider: { height: 1, backgroundColor: "#1e293b", marginHorizontal: 12 },
  pressed: { opacity: 0.7 },
  logoutRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 30, padding: 14, backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 15 },
  logoutLabel: { color: "#ef4444", fontWeight: "bold", fontSize: 14 },
});