import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { parseBankSms } from "../../utils/parseBankSms";

export default function Messages() {
  const [smsText, setSmsText] = useState("");

  const handleExtract = () => {
    if (!smsText.trim()) {
      Alert.alert("Error", "Paste SMS message");
      return;
    }

    const parsed = parseBankSms(smsText);

    if (parsed.amount === null || parsed.amount === undefined) {
      Alert.alert("Unable to extract", "Please edit manually");
      return;
    }

    router.push({
      pathname: "/banks/confirmsms",
      params: {
        amount: parsed.amount.toString(),
        type: parsed.type,
        category: parsed.category,
        date: parsed.date.toISOString(),
        note: parsed.note,
        utr: parsed.utr ?? "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Paste SMS</Text>

      <TextInput
        value={smsText}
        onChangeText={setSmsText}
        placeholder="Paste bank / UPI SMS here"
        placeholderTextColor="#6B7280"
        multiline
        style={styles.textArea}
      />

      <TouchableOpacity style={styles.button} onPress={handleExtract}>
        <Text style={styles.buttonText}>Extract Transaction</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020B06",
    padding: 16,
  },
  title: {
    color: "#E5F3E5",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#132016",
    color: "#E5F3E5",
    borderRadius: 12,
    padding: 14,
    height: 180,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#4ADE80",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#020B06",
    fontWeight: "700",
  },
});
