import { View, Text, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function Details() {
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={{ borderWidth: 1, marginBottom: 16, padding: 8 }}
      />

      <Text>Monthly Income</Text>
      <TextInput
        value={income}
        onChangeText={setIncome}
        placeholder="Enter income"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 24, padding: 8 }}
      />

      <Pressable
        onPress={() => {
          router.replace("../tabs");
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 16 }}>
          Continue to App
        </Text>
      </Pressable>
    </View>
  );
}