import React from "react";
import { Drawer } from "expo-router/drawer";
import { CustomDrawer } from "../../components/layout/CustomDrawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ drawerType: "slide", headerShown: false }}
    >
      <Drawer.Screen
        name="home"   // MUST match app/drawer/home.tsx
        options={{ drawerLabel: "Home", title: "Home" }}
      />
    </Drawer>
  );
}
