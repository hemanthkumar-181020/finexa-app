import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useTransactions } from "../context/TransactionContext";
import { updateTransactionInFirestore } from "../services/firestoreTransactions";
import { useAuth } from "../services/AuthContext";
import type { Transaction } from "../types/transaction";

const CATEGORIES = [
  "Income / Transfer In",

  // Core Expenses
  "Recharge",
  "Food & Dining",
  "Fuel",
  "Shopping",
  "Groceries",
  "Travel",
  "Entertainment",
  "Utilities",
  "Education",
  "Healthcare",
  "Banking & Finance",
  "Transfer Out",

  // Extended Coverage
  "Personal Care",
  "Home & Kitchen",
  "Gifts & Donations",
  "Business Expenses",
  "Hobbies & Leisure",
  "Vehicle Maintenance",
  "Child & Family",
  "Technology & Software",

  // Fallback
  "Other Expense",
];

export default function UpdateTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { dispatch } = useTransactions();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [transactionId, setTransactionId] = useState("");

  // Parse transaction data from params
  useEffect(() => {
    if (params.transaction) {
      try {
        const transaction = JSON.parse(params.transaction as string) as Transaction;
        setTransactionId(transaction.id);
        setAmount(transaction.amount.toString());
        setNote(transaction.note || "");
        setCategory(transaction.category || "");
        setDate(new Date(transaction.date));
        setType(transaction.type);
      } catch (error) {
        console.error("Error parsing transaction:", error);
        Alert.alert("Error", "Failed to load transaction data");
        router.back();
      }
    }
  }, [params.transaction]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!note.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!user || !transactionId) {
      Alert.alert("Error", "Invalid transaction data");
      return;
    }

    setLoading(true);

    try {
      const updatedTransaction: Transaction = {
        id: transactionId,
        amount: parseFloat(amount),
        note: note.trim(),
        category,
        date: date.toISOString(),
        type,
        source: "manual", 
        uid: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update in Firestore
      await updateTransactionInFirestore(user.uid, transactionId, updatedTransaction);

      // Update in local state
      dispatch({
        type: "UPDATE_TRANSACTION",
        payload: updatedTransaction,
      });

      Alert.alert("Success", "Transaction updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E5F3E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type Selection */}
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === "expense" && styles.typeButtonActive]}
            onPress={() => setType("expense")}
          >
            <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === "income" && styles.typeButtonActive]}
            onPress={() => setType("income")}
          >
            <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor="#6B7280"
            value={note}
            onChangeText={setNote}
            editable={!loading}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={20} color="#6EE7B7" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#020B06" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#020B06" />
              <Text style={styles.updateButtonText}>Update Transaction</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020B06",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A231E",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#132016",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E5F3E5",
  },
  content: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#4ADE80",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  typeTextActive: {
    color: "#020B06",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E5F3E5",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132016",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4ADE80",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#E5F3E5",
    paddingVertical: 12,
  },
  input: {
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 16,
    color: "#E5F3E5",
    fontSize: 16,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#E5F3E5",
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  categoryChipSelected: {
    backgroundColor: "#4ADE80",
    borderColor: "#4ADE80",
  },
  categoryText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  categoryTextSelected: {
    color: "#020B06",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#1A231E",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ADE80",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#020B06",
  },
});