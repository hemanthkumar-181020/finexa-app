// app/goals/setup.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

const CATEGORY_CONFIG = {
  "Food & Dining": { defaultGoal: 10000 },
  "Groceries": { defaultGoal: 8000 },
  "Travel": { defaultGoal: 15000 },
  "Shopping": { defaultGoal: 12000 },
  // ... other categories
};

export default function GoalsSetupScreen() {
  const router = useRouter();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [goals, setGoals] = useState<Record<string, string>>({});

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/(auth)/signup");
        return;
      }

      const income = parseFloat(monthlyIncome);
      if (isNaN(income) || income < 0) {
        Alert.alert("Invalid Income", "Please enter a valid monthly income");
        return;
      }

      const goalsData: Record<string, number> = {};
      Object.keys(CATEGORY_CONFIG).forEach(category => {
        const goal = parseFloat(goals[category] || "0");
        goalsData[category] = isNaN(goal) ? 0 : goal;
      });

      await updateDoc(doc(db, "users", user.uid), {
        monthlyIncome: income,
        goals: goalsData,
      });

      router.push("/tabs/home");
    } catch (error) {
      console.error("Error saving goals:", error);
      Alert.alert("Error", "Failed to save goals");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView>
        <Text style={styles.title}>Set Up Your Budget</Text>
        <Text style={styles.subtitle}>Configure your monthly income and category goals</Text>
        
        {/* Income Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Monthly Income</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              style={styles.input}
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Category Goals */}
        {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
          <View key={category} style={styles.goalCard}>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={styles.goalInput}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.input}
                value={goals[category] || config.defaultGoal.toString()}
                onChangeText={(text) => setGoals(prev => ({ ...prev, [category]: text }))}
                keyboardType="numeric"
                placeholder={config.defaultGoal.toString()}
                placeholderTextColor="#666"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save & Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  title: { color: "#E2E8F0", fontSize: 28, fontWeight: "bold", margin: 20 },
  subtitle: { color: "#666", fontSize: 14, marginHorizontal: 20, marginBottom: 30 },
  inputCard: { backgroundColor: "#1A1C1A", margin: 16, padding: 20, borderRadius: 16 },
  inputLabel: { color: "#E2E8F0", fontSize: 16, marginBottom: 12 },
  amountInput: { flexDirection: "row", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#4ADE80", paddingBottom: 8 },
  currency: { color: "#E2E8F0", fontSize: 32, fontWeight: "bold", marginRight: 8 },
  input: { flex: 1, color: "#E2E8F0", fontSize: 32, fontWeight: "bold" },
  goalCard: { backgroundColor: "#1A1C1A", marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryName: { color: "#E2E8F0", fontSize: 16 },
  goalInput: { flexDirection: "row", alignItems: "center" },
  saveButton: { backgroundColor: "#4ADE80", margin: 20, padding: 18, borderRadius: 16, alignItems: "center" },
  saveButtonText: { color: "#0D0D0D", fontSize: 18, fontWeight: "bold" },
});