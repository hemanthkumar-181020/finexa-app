import React, { useState } from "react";
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
import { useRouter } from "expo-router";

import { useTransactions } from "../context/TransactionContext";
import { saveManualTransactionToFirestore } from "../services/firestoreTransactions";
import { useAuth } from "../services/AuthContext";

// ✅ SINGLE SOURCE OF TRUTH
export const ALL_CATEGORIES = [
  // Income
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
  "Other Expense", // ✅ IMPORTANT
];


export default function AddTransactionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { dispatch } = useTransactions();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddTransaction = async () => {
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
    if (!user) {
      Alert.alert("Error", "Please log in to add transactions");
      return;
    }

    setLoading(true);

    try {
      const transactionId = await saveManualTransactionToFirestore(user.uid, {
        amount: parseFloat(amount),
        type,
        category,
        note: note.trim(),
        date,
      });

      const newTransaction = {
        id: transactionId,
        amount: parseFloat(amount),
        type,
        category,
        note: note.trim(),
        date: date.toISOString(),
        source: "manual",
        uid: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({
        type: "ADD_TRANSACTION",
        payload: newTransaction,
      });

      Alert.alert("Success", "Transaction added successfully!", [
        {
          text: "OK",
          onPress: () => {
            setAmount("");
            setNote("");
            setCategory("");
            setDate(new Date());
            setType("expense");
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E5F3E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TYPE */}
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

        {/* AMOUNT */}
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
            />
          </View>
        </View>

        {/* NOTE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor="#6B7280"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        {/* DATE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#6EE7B7" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString("en-IN")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* CATEGORIES */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
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

      {/* SAVE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddTransaction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#020B06" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#020B06" />
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- STYLES (UNCHANGED) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020B06" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
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
  headerTitle: { color: "#E5F3E5", fontSize: 18, fontWeight: "600" },
  content: { padding: 16 },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: { flex: 1, padding: 12, alignItems: "center" },
  typeButtonActive: { backgroundColor: "#4ADE80", borderRadius: 8 },
  typeText: { color: "#9CA3AF", fontWeight: "600" },
  typeTextActive: { color: "#020B06" },
  inputGroup: { marginBottom: 24 },
  label: { color: "#E5F3E5", marginBottom: 8, fontWeight: "600" },
  amountContainer: {
    flexDirection: "row",
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 16,
  },
  currencySymbol: { fontSize: 24, color: "#4ADE80", marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, color: "#E5F3E5" },
  input: {
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 16,
    color: "#E5F3E5",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132016",
    padding: 16,
    borderRadius: 12,
  },
  dateText: { marginLeft: 12, color: "#E5F3E5" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#374151",
  },
  categoryChipSelected: { backgroundColor: "#4ADE80" },
  categoryText: { color: "#9CA3AF" },
  categoryTextSelected: { color: "#020B06" },
  footer: { padding: 16 },
  addButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4ADE80",
    padding: 16,
    borderRadius: 12,
  },
  addButtonDisabled: { opacity: 0.7 },
  addButtonText: { marginLeft: 8, fontWeight: "600", color: "#020B06" },
});
