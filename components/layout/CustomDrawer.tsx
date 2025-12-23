import React from "react";
import {
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";

export function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Home"
        onPress={() => props.navigation.navigate("home")}
      />
    </DrawerContentScrollView>
  );
}
