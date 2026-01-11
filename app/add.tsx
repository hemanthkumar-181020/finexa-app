// app/add.tsx

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
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useNavigation } from "expo-router";

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
  "Other Expense",
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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

  // 🔒 Block back navigation while saving
  useEffect(() => {
    if (!loading) return;

    const beforeRemove = navigation.addListener("beforeRemove", (e: any) => {
      e.preventDefault();
    });

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true // block hardware back
    );

    return () => {
      beforeRemove && beforeRemove();
      backHandler.remove();
    };
  }, [loading, navigation]);

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

    // ✅ prevent double submit as early as possible
    setLoading(true);

    const parsedAmount = parseFloat(amount);

    // ✅ Optimistic transaction
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTx = {
      id: optimisticId,
      amount: parsedAmount,
      type,
      category,
      note: note.trim(),
      date: date.toISOString(),
      source: "manual",
      uid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Transaction appears immediately in UI
    dispatch({
      type: "ADD_TRANSACTION",
      payload: optimisticTx,
    });

    try {
      const transactionId = await saveManualTransactionToFirestore(user.uid, {
        amount: parsedAmount,
        type,
        category,
        note: note.trim(),
        date,
      });

      // Replace optimistic ID with real ID
      dispatch({
        type: "REPLACE_TRANSACTION_ID",
        payload: { oldId: optimisticId, newId: transactionId },
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
      // 🔁 Firestore failed → rollback optimistic item
      dispatch({
        type: "REMOVE_TRANSACTION",
        payload: { id: optimisticId },
      });

      Alert.alert("Error", error.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (!loading) router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#e5f3e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TYPE */}
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "expense" && styles.typeButtonActive,
            ]}
            onPress={() => setType("expense")}
            disabled={loading}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.typeTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "income" && styles.typeButtonActive,
            ]}
            onPress={() => setType("income")}
            disabled={loading}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.typeTextActive,
              ]}
            >
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
              placeholderTextColor="#64748b"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* NOTE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor="#64748b"
            value={note}
            onChangeText={setNote}
            multiline
            editable={!loading}
          />
        </View>

        {/* DATE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => !loading && setShowDatePicker(true)}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={18} color="#6ee7b7" />
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
                onPress={() => !loading && setCategory(cat)}
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

      {/* SAVE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddTransaction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#020617" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#020617" />
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- HOME-THEME STYLES, LOGIC UNCHANGED ---------- */
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
    paddingBottom: 120,
    paddingTop: 10,
  },

  // Type toggle
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
  },
  typeButtonActive: {
    backgroundColor: "#1e293b",
  },
  typeText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 13,
  },
  typeTextActive: {
    color: "#10b981",
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

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  currencySymbol: {
    fontSize: 26,
    color: "#10b981",
    marginRight: 8,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    color: "#f9fafb",
    fontWeight: "700",
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

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  dateText: {
    marginLeft: 10,
    color: "#e5f3e5",
    fontSize: 14,
    fontWeight: "500",
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  categoryChipSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  categoryText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#020617",
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#020617",
    backgroundColor: "#000",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: "#10b981",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 15,
    color: "#020617",
  },
});
