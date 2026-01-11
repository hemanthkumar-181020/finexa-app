import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../services/AuthContext";
import { deleteTransactionAndRevertGoal } from "../../services/firestoreTransactions";
import {
  createGoal,
  updateGoal,
  getUserGoals,
  Goal,
} from "../../services/firestoreGoals";

export default function GoalsAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ goalId?: string }>();
  const goalId = params.goalId as string | undefined;

  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [existingGoal, setExistingGoal] = useState<Goal | null>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetMonth, setTargetMonth] = useState(""); // "YYYY-MM"

  const isEdit = !!goalId;

  useEffect(() => {
    const loadGoal = async () => {
      if (!user || !goalId) return;
      try {
        setLoading(true);
        const allGoals = await getUserGoals(user.uid);
        const g = allGoals.find((x) => x.id === goalId) || null;
        if (g) {
          setExistingGoal(g);
          setName(g.name);
          setTargetAmount(g.targetAmount.toString());
          setTargetMonth(g.targetMonth);
        }
      } catch (e) {
        console.error("Error loading goal:", e);
      } finally {
        setLoading(false);

      }
    };
    loadGoal();
  }, [user, goalId]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }
    const amt = parseFloat(targetAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }
    if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
      Alert.alert("Error", "Please enter target month as YYYY-MM");
      return;
    }

    setLoading(true);

    try {
      if (isEdit && existingGoal) {
        await updateGoal(user.uid, existingGoal.id, {
          name: name.trim(),
          targetAmount: amt,
          targetMonth,
        });
      } else {
        await createGoal(user.uid, {
          name: name.trim(),
          targetAmount: amt,
          targetMonth,
        });
      }

      router.back();
    } catch (error: any) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", error.message || "Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Coming soon", "Deleting goals can be added later.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#e5f3e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Goal" : "Add Goal"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NAME */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Car, Gold, Travel..."
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* TARGET AMOUNT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
          </View>
        </View>

        {/* TARGET MONTH */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Month</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM (e.g. 2026-12)"
            placeholderTextColor="#64748b"
            value={targetMonth}
            onChangeText={setTargetMonth}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#10b981"
          />
          <Text style={styles.infoText}>
            You can track how much you have saved towards this goal over time
            from your transactions.
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.buttonRow}>
          {isEdit && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDelete}
            >
              <Text style={styles.secondaryButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Goal"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    color: "#94a3b8",
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#e5f3e5",
    borderWidth: 1,
    borderColor: "#1e293b",
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  currencySymbol: {
    fontSize: 22,
    color: "#10b981",
    marginRight: 8,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: "#f9fafb",
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#022c22",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  infoText: {
    color: "#a7f3d0",
    fontSize: 12,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#f97316",
    fontWeight: "700",
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 14,
  },
});
