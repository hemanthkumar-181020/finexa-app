// app/goals/edit.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Category config (same as home screen)
const CATEGORY_CONFIG = {
  "Food & Dining": {
    icon: "silverware-fork-knife",
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#FF8E53"],
    defaultGoal: 10000,
  },
  "Groceries": {
    icon: "cart-outline",
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#44A08D"],
    defaultGoal: 8000,
  },
  "Travel": {
    icon: "airplane",
    color: "#45B7D1",
    gradient: ["#45B7D1", "#96C6EA"],
    defaultGoal: 15000,
  },
  "Fuel": {
    icon: "gas-station",
    color: "#FFA726",
    gradient: ["#FFA726", "#FF9800"],
    defaultGoal: 5000,
  },
  "Shopping": {
    icon: "shopping-outline",
    color: "#AB47BC",
    gradient: ["#AB47BC", "#CE93D8"],
    defaultGoal: 12000,
  },
  "Entertainment": {
    icon: "movie-open-outline",
    color: "#5C6BC0",
    gradient: ["#5C6BC0", "#7986CB"],
    defaultGoal: 6000,
  },
  "Utilities": {
    icon: "lightning-bolt-outline",
    color: "#FFEE58",
    gradient: ["#FFEE58", "#FFCA28"],
    defaultGoal: 7000,
  },
  "Recharge": {
    icon: "cellphone",
    color: "#26C6DA",
    gradient: ["#26C6DA", "#00ACC1"],
    defaultGoal: 2000,
  },
  "Healthcare": {
    icon: "hospital-box-outline",
    color: "#EF5350",
    gradient: ["#EF5350", "#E53935"],
    defaultGoal: 5000,
  },
  "Education": {
    icon: "school-outline",
    color: "#7E57C2",
    gradient: ["#7E57C2", "#9575CD"],
    defaultGoal: 10000,
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline",
    color: "#EC407A",
    gradient: ["#EC407A", "#D81B60"],
    defaultGoal: 4000,
  },
  "Home & Kitchen": {
    icon: "home-outline",
    color: "#66BB6A",
    gradient: ["#66BB6A", "#43A047"],
    defaultGoal: 9000,
  },
  "Vehicle Maintenance": {
    icon: "car-wrench",
    color: "#8D6E63",
    gradient: ["#8D6E63", "#795548"],
    defaultGoal: 3000,
  },
  "Hobbies & Leisure": {
    icon: "soccer",
    color: "#29B6F6",
    gradient: ["#29B6F6", "#0288D1"],
    defaultGoal: 4000,
  },
  "Gifts & Donations": {
    icon: "gift-outline",
    color: "#FF7043",
    gradient: ["#FF7043", "#FF5722"],
    defaultGoal: 3000,
  },
  "Business Expenses": {
    icon: "briefcase-outline",
    color: "#78909C",
    gradient: ["#78909C", "#546E7A"],
    defaultGoal: 20000,
  },
  "Technology & Software": {
    icon: "laptop",
    color: "#26A69A",
    gradient: ["#26A69A", "#00796B"],
    defaultGoal: 8000,
  },
};

export default function EditGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params.category as string;
  const currentGoal = parseFloat(params.currentGoal as string) || 0;

  const [goalAmount, setGoalAmount] = useState(currentGoal.toString());
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as any;
        const fullName = data?.name || "";
        const firstName = fullName.trim().split(" ")[0] || "";
        setUserName(firstName);
      }
    };
    fetchUserName();
  }, []);

  const handleSaveGoal = async () => {
    if (!category) {
      Alert.alert("Error", "No category selected");
      return;
    }

    const amount = parseFloat(goalAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid goal amount");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to save goals");
        return;
      }

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const currentGoals = currentData?.goals || {};
        
        await updateDoc(userRef, {
          goals: {
            ...currentGoals,
            [category]: amount,
          },
          updatedAt: new Date().toISOString(),
        });

        Alert.alert("Success", `Goal for ${category} updated successfully!`);
        router.back();
      }
    } catch (error: any) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", error.message || "Failed to save goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (amount: number) => {
    setGoalAmount(amount.toString());
  };

  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || {
    icon: "dots-horizontal-circle-outline",
    color: "#666",
    defaultGoal: 5000,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Goal</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hey {userName}</Text>
            <Text style={styles.subGreeting}>Set your spending goal for</Text>
          </View>

          {/* Category Card */}
          <View style={styles.categoryCard}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: `${config.color}20` },
              ]}
            >
              <MaterialCommunityIcons
                name={config.icon as any}
                size={32}
                color={config.color}
              />
            </View>
            <Text style={styles.categoryName}>{category}</Text>
          </View>

          {/* Goal Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Monthly Goal Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={goalAmount}
                onChangeText={setGoalAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>
            
            {/* Quick Select Buttons */}
            <View style={styles.quickSelectContainer}>
              <Text style={styles.quickSelectLabel}>Quick Select:</Text>
              <View style={styles.quickSelectRow}>
                {[1000, 2000, 5000, 10000, 20000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickSelectButton}
                    onPress={() => handleQuickSelect(amount)}
                  >
                    <Text style={styles.quickSelectText}>₹{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#4ADE80"
            />
            <Text style={styles.infoText}>
              This goal helps you track spending in {category.toLowerCase()} category.
              You'll receive notifications when you're close to or exceed this limit.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveGoal}
            disabled={loading}
          >
            {loading ? (
              <MaterialCommunityIcons
                name="loading"
                size={24}
                color="#0D0D0D"
              />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={24}
                  color="#0D0D0D"
                />
                <Text style={styles.saveButtonText}>
                  Save Goal
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setGoalAmount("0")}
          >
            <Text style={styles.resetButtonText}>Reset to Zero</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    backgroundColor: "#000000",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 32,
  },

  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* GREETING */
  greetingContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  greetingText: {
    color: "#F9FAFB",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  subGreeting: {
    color: "#9CA3AF",
    fontSize: 15,
  },

  /* CATEGORY CARD */
  categoryCard: {
    backgroundColor: "#000000",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  /* INPUT CARD */
  inputContainer: {
    backgroundColor: "#000000",
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  inputLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500",
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 12,
    marginBottom: 24,
  },
  currencySymbol: {
    color: "#F9FAFB",
    fontSize: 32,
    fontWeight: "800",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: "#F9FAFB",
    fontSize: 32,
    fontWeight: "800",
    padding: 0,
  },

  /* QUICK SELECT */
  quickSelectContainer: {
    marginTop: 8,
  },
  quickSelectLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 12,
  },
  quickSelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickSelectButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  quickSelectText: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "500",
  },

  /* INFO CARD */
  infoCard: {
    backgroundColor: "#00110b",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#064E3B",
  },
  infoText: {
    color: "#BBF7D0",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },

  /* SAVE BUTTON */
  saveButton: {
    backgroundColor: "#10b981",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#1F2937",
  },
  saveButtonText: {
    color: "#020817",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  /* RESET */
  resetButton: {
    padding: 16,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FB7185",
    fontSize: 16,
    fontWeight: "500",
  },
});
