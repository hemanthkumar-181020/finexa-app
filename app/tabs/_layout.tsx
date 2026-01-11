import { Tabs, Redirect } from "expo-router";
import { Ionicons,Octicons,MaterialIcons} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Image, StyleSheet, AppState, Platform } from "react-native";
import { useAuth } from "../../services/AuthContext";
import * as NavigationBar from "expo-navigation-bar";

NavigationBar.setBehaviorAsync("overlay-swipe");
NavigationBar.setVisibilityAsync("hidden");

const brandLogos = [
  require("../../assets/images/phonepe.png"),
  require("../../assets/images/message.png"),
  require("../../assets/images/yono1.png"),
  require("../../assets/images/icici.png"),
];

function RotatingBrandIcon() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % brandLogos.length);
    }, 1000); // faster: change brand every 0.8s
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.bigCircle}>
      <Image source={brandLogos[index]} style={styles.brandImage} />
    </View>
  );
}

export default function TabsLayout() {
  

  const { user, loading } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const hideNavBar = async () => {
      try {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (e) {
        console.log("NavigationBar error:", e);
      }
    };

    // Initial hide
    hideNavBar();

    // Re-hide when coming from recent apps
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        hideNavBar();
      }
    });

    return () => subscription.remove();
  }, []);



  if (loading) {
    return (

      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0D0D0D",
          borderTopColor: "#0f0f10ff",
          height: 64,
        },
        tabBarActiveTintColor: "#16A34A",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />

      {/* BIG CENTER CIRCLE WITH ROTATING BRAND ICONS */}
      <Tabs.Screen
        name="banks"
        options={{
          title: "Add",
          tabBarIcon: () => <RotatingBrandIcon />,
          tabBarLabel: "",
        }}
      />

      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budgets",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "analytics",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bigCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  brandImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "contain",
  },
  
});