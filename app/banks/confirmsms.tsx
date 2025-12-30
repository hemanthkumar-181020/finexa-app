import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { saveManualTransactionToFirestore, saveTransactionsToFirestore } from "../../services/firestoreTransactions";

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

export default function ConfirmSMS() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  if (!uid) {
    Alert.alert("Error", "User not logged in");
    router.push("/login");
    return null;
  }

  // Initial values from params
  const initialAmount = parseFloat((params.amount as string) || "0");
  const initialType = (params.type as "income" | "expense") || "expense";
  const initialCategory = (params.category as string) || "Uncategorized";
  const initialNote = (params.note as string) || "";
  const initialDate = params.date ? new Date(params.date as string) : new Date();
  const utr = params.utr ? (params.utr as string) : undefined;

  const [amount, setAmount] = useState<number>(initialAmount);
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [note, setNote] = useState(initialNote);
  const [date, setDate] = useState<Date>(initialDate);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    // Validation
    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    if (!category.trim()) {
      Alert.alert("Invalid category", "Please enter a category.");
      return;
    }

    setLoading(true);
    try {
      const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

      if (utr && utr.trim() !== "") {
        // Bank transaction
        const result = await saveTransactionsToFirestore(uid, [
          {
            amount,
            type: type === "expense" ? "DEBIT" : "CREDIT",
            category,
            description: note.trim(),
            date: safeDate, // pass Date object
            utr,
            source: "bank",
          },
        ]);
        Alert.alert(
          "Transaction saved!",
          `Saved: ${result.saved}, Skipped: ${result.skipped}`,
          [{ text: "OK", onPress: () => router.replace("/tabs/transactions") }]
        );
      } else {
        // Manual transaction
        const transactionId = await saveManualTransactionToFirestore(uid, {
          amount,
          type,
          category,
          note: note.trim(),
          date: safeDate, // pass Date object
        });
        Alert.alert(
          "Transaction saved!",
          `ID: ${transactionId}`,
          [{ text: "OK", onPress: () => router.replace("/tabs/transactions") }]
        );
      }
    } catch (error: any) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", error.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E5F3E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type */}
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === "expense" && styles.typeButtonActive]}
            onPress={() => setType("expense")}
            disabled={loading}
          >
            <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === "income" && styles.typeButtonActive]}
            onPress={() => setType("income")}
            disabled={loading}
          >
            <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              value={amount.toString()}
              onChangeText={(t) => setAmount(Number(t))}
              editable={!loading}
            />
          </View>
        </View>

        {/* Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        {/* Date */}
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

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                onPress={() => setCategory(cat)}
                disabled={loading}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#020B06" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#020B06" />
              <Text style={styles.addButtonText}>Save Transaction</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles (reuse from add.tsx)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020B06" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A231E",
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#132016", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#E5F3E5" },
  content: { padding: 16 },
  typeContainer: { flexDirection: "row", backgroundColor: "#132016", borderRadius: 12, padding: 4, marginBottom: 24 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  typeButtonActive: { backgroundColor: "#4ADE80" },
  typeText: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
  typeTextActive: { color: "#020B06" },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#E5F3E5", marginBottom: 8 },
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#132016", borderRadius: 12, paddingHorizontal: 16 },
  currencySymbol: { fontSize: 24, fontWeight: "700", color: "#4ADE80", marginRight: 8 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: "700", color: "#E5F3E5", paddingVertical: 12 },
  input: { backgroundColor: "#132016", borderRadius: 12, padding: 16, color: "#E5F3E5", fontSize: 16, textAlignVertical: "top" },
  dateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#132016", borderRadius: 12, padding: 16 },
  dateText: { marginLeft: 12, fontSize: 16, color: "#E5F3E5", fontWeight: "500" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: "#374151", borderWidth: 1, borderColor: "#4B5563" },
  categoryChipSelected: { backgroundColor: "#4ADE80", borderColor: "#4ADE80" },
  categoryText: { fontSize: 14, color: "#9CA3AF", fontWeight: "500" },
  categoryTextSelected: { color: "#020B06" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#1A231E" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#4ADE80", borderRadius: 12, padding: 16, gap: 8 },
  addButtonDisabled: { opacity: 0.7 },
  addButtonText: { fontSize: 16, fontWeight: "600", color: "#020B06" },
});
