import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTransactions } from "../context/TransactionContext";
import {
  fetchTransactionsFromFirestore,
  saveManualTransactionToFirestore,
} from "../services/firestoreTransactions";
import { autoCategorize } from "../utils/categorize";
import { useAuth } from "../services/AuthContext";

export default function TransactionForm() {
  const { dispatch } = useTransactions();
  const { user } = useAuth();

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const parsedAmount = Number(amount);

    if (!amount || !description) {
      Alert.alert("Validation Error", "Amount and description are required");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Validation Error", "Enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      const category = autoCategorize(description);

      // Save MANUAL transaction (no UTR)
      await saveManualTransactionToFirestore(user.uid, {
        amount: parsedAmount,
        type,
        category,
        note: description,
      });

      const updated = await fetchTransactionsFromFirestore(user.uid);
      dispatch({ type: "SET_TRANSACTIONS", payload: updated });

      setAmount("");
      setDescription("");
      setType("expense");

      Alert.alert("Success", "Transaction added");
    } catch (err) {
      console.error("Error saving transaction:", err);
      Alert.alert("Error", "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.heading}>Add Transaction</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            type === "expense" && styles.activeExpense,
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "expense" && styles.activeTextDark,
            ]}
          >
            Expense
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            type === "income" && styles.activeIncome,
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.toggleText,
              type === "income" && styles.activeTextDark,
            ]}
          >
            Income
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Swiggy, Uber, Salary..."
        placeholderTextColor="#9CA3AF"
      />

      <Pressable
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Saving..." : "Add Transaction"}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  activeExpense: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  activeIncome: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  activeTextDark: {
    color: "#111827",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});