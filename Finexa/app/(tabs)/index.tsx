import React from "react";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-600">
        Hello from Finexa 🚀
      </Text>

      <Text className="text-lg mt-3 text-gray-700">
        NativeWind + Expo is working!
      </Text>

      <View className="mt-6 w-40 h-20 bg-red-500 rounded-xl items-center justify-center">
        <Text className="text-white font-semibold">Test Box</Text>
      </View>
    </View>
  );
}