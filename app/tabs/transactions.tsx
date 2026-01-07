// app/tabs/transactions.tsx (FUNCTIONALITY FIXED)
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { useTransactions } from "../../context/TransactionContext";
import { importBankStatement } from "../../services/bankImport";
import {
  fetchTransactionsFromFirestore,
  deleteTransactionFromFirestore,
} from "../../services/firestoreTransactions";
import { useAuth } from "../../services/AuthContext";
import type { Transaction } from "../../types/transaction";
import { useRouter } from "expo-router";

/* ------------------- HELPERS ------------------- */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TRANSACTION_TYPES = [
  { label: "All", value: "all" },
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
];

const CATEGORIES = [
  "Income / Transfer In",
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
  "Personal Care",
  "Home & Kitchen",
  "Gifts & Donations",
  "Business Expenses",
  "Hobbies & Leisure",
  "Vehicle Maintenance",
  "Child & Family",
  "Technology & Software",
  "Other Expense",
];

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((txn) => {
    const date = new Date(txn.date);
    const key = date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  });

  return Object.keys(groups).map((date) => ({
    title: date,
    data: groups[date],
  }));
}

/* ------------------- SCREEN ------------------- */
export default function TransactionsScreen() {
  const { state, dispatch } = useTransactions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return MONTHS[now.getMonth()];
  });
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!authLoading && user) {
      loadTransactions();
    }
  }, [authLoading, user]);

  useFocusEffect(
    useCallback(() => {
      if (user && !loading) {
        refreshData();
      }
    }, [user, loading])
  );

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const txns = await fetchTransactionsFromFirestore(user.uid);
      if (txns) {
        dispatch({ type: "SET_TRANSACTIONS", payload: txns });
      } else {
        console.warn("No transactions returned from Firestore");
      }
    } catch (err) {
      console.error("Load transactions error:", err);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const txns = await fetchTransactionsFromFirestore(user.uid);
      if (txns) {
        dispatch({ type: "SET_TRANSACTIONS", payload: txns });
      }
    } catch (err) {
      console.error("Refresh error:", err);
      Alert.alert("Error", "Failed to refresh transactions");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to upload statements");
      return;
    }

    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Error", "No file selected");
        return;
      }

      const count = await importBankStatement(file, user.uid);

      Alert.alert("Success", `Imported ${count} transactions successfully!`, [
        {
          text: "OK",
          onPress: () => {
            loadTransactions();
          },
        },
      ]);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to import bank statement"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    router.push({
      pathname: "/update",
      params: {
        transaction: JSON.stringify(transaction),
      },
    });
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user || !transaction.id) {
                Alert.alert("Error", "Invalid transaction data");
                return;
              }

              await deleteTransactionFromFirestore(user.uid, transaction.id);

              dispatch({
                type: "DELETE_TRANSACTION",
                payload: transaction.id,
              });

              setExpandedTransactionId(null);
              await refreshData();

              Alert.alert("Success", "Transaction deleted successfully");
            } catch (error: any) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete transaction"
              );
            }
          },
        },
      ]
    );
  };

  const toggleExpandTransaction = (transactionId: string) => {
    setExpandedTransactionId(
      expandedTransactionId === transactionId ? null : transactionId
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinAmount("");
    setMaxAmount("");
    setSelectedType("all");
  };

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((txn) => {
      // Fix: Parse date properly
      let transactionDate;
      try {
        transactionDate = new Date(txn.date);
        if (isNaN(transactionDate.getTime())) {
          console.warn(`Invalid date for transaction: ${txn.id}`);
          return false;
        }
      } catch (error) {
        console.warn(`Date parsing error for transaction: ${txn.id}`);
        return false;
      }

      // Fix: Month and year filtering
      const monthMatches = MONTHS[transactionDate.getMonth()] === selectedMonth;
      const yearMatches = transactionDate.getFullYear() === currentYear;
      
      if (!monthMatches || !yearMatches) return false;

      // Fix: Type filter
      let typeMatches = true;
      if (selectedType === "credit") {
        typeMatches = txn.type === "income";
      } else if (selectedType === "debit") {
        typeMatches = txn.type === "expense";
      }
      if (!typeMatches) return false;

      // Fix: Search filter (corrected logic)
      let searchMatches = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const note = (txn.note || "").toLowerCase();
        const category = (txn.category || "").toLowerCase();
        searchMatches = note.includes(query) || category.includes(query);
      }
      if (!searchMatches) return false;

      // Fix: Category filter
      let categoryMatches = true;
      if (selectedCategories.length > 0) {
        categoryMatches = selectedCategories.includes(txn.category);
      }
      if (!categoryMatches) return false;

      // Fix: Amount range filter with validation
      let amountMatches = true;
      const amount = txn.amount;
      if (minAmount.trim()) {
        const min = parseFloat(minAmount);
        if (!isNaN(min)) {
          amountMatches = amountMatches && amount >= min;
        }
      }
      if (maxAmount.trim()) {
        const max = parseFloat(maxAmount);
        if (!isNaN(max)) {
          amountMatches = amountMatches && amount <= max;
        }
      }

      return amountMatches;
    });
  }, [
    state.transactions,
    selectedMonth,
    currentYear,
    selectedType,
    searchQuery,
    selectedCategories,
    minAmount,
    maxAmount,
  ]);

  const sections = groupByDate(filteredTransactions);

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isExpanded = expandedTransactionId === item.id;

    // Fix: Parse date for display
    let displayDate = "Invalid date";
    try {
      const dateObj = new Date(item.date);
      if (!isNaN(dateObj.getTime())) {
        displayDate = dateObj.toLocaleString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.warn(`Date display error for transaction: ${item.id}`);
    }

    return (
      <TouchableOpacity
        style={[styles.row, isExpanded && styles.rowExpanded]}
        onPress={() => toggleExpandTransaction(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.rowContent}>
          <View style={styles.rowLeft}>
            <View style={styles.categoryRow}>
              <Text style={styles.category}>{item.category || "Uncategorized"}</Text>
              <View
                style={[
                  styles.sourceBadge,
                  item.source === "manual"
                    ? styles.manualBadge
                    : styles.bankBadge,
                ]}
              >
                <Text style={styles.sourceBadgeText}>
                  {item.source === "manual" ? "Manual" : "Bank"}
                </Text>
              </View>
            </View>
            <Text style={styles.note} numberOfLines={1}>
              {item.note || "No description"}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    item.type === "expense" ? "#F97373" : "#4ADE80",
                },
              ]}
            >
              {item.type === "expense" ? "- " : "+ "}₹
              {Math.abs(item.amount).toLocaleString("en-IN")}
            </Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6EE7B7"
              style={styles.expandIcon}
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>
                {displayDate}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.id ? `${item.id.substring(0, 8)}...` : "N/A"}
              </Text>
            </View>

            {item.utr && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UTR:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.utr}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Source:</Text>
              <Text style={styles.detailValue}>
                {item.source === "manual"
                  ? "Added Manually"
                  : "Bank Statement"}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditTransaction(item)}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color="#020B06"
                />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTransaction(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#FFF"
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    styles.deleteButtonText,
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const showEmpty = !loading && !uploading && sections.length === 0;

  // Fix: Month transactions calculation with year filter
  const monthTransactions = state.transactions.filter((txn) => {
    try {
      const d = new Date(txn.date);
      if (isNaN(d.getTime())) return false;
      return MONTHS[d.getMonth()] === selectedMonth && 
             d.getFullYear() === currentYear;
    } catch (error) {
      return false;
    }
  });

  const totalCredit = monthTransactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  const totalDebit = monthTransactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  const netBalance = totalCredit - totalDebit;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {isSearchActive ? (
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by description or category..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={handleCloseSearch}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.headerTitleBlock}>
                <Text style={styles.headerEyebrow}>
                  Activity · {selectedMonth} {currentYear}
                </Text>
                <Text style={styles.headerTitle}>Transactions</Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons
                    name="filter"
                    size={18}
                    color="#E5F3E5"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleSearchPress}
                >
                  <Ionicons
                    name="search"
                    size={18}
                    color="#E5F3E5"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator
                      size="small"
                      color="#E5F3E5"
                    />
                  ) : (
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color="#E5F3E5"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={refreshData}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator
                      size="small"
                      color="#E5F3E5"
                    />
                  ) : (
                    <Ionicons
                      name="refresh"
                      size={18}
                      color="#E5F3E5"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* MONTH STRIP */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthStrip}
        >
          {MONTHS.map((m) => {
            const isActive = m === selectedMonth;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMonth(m)}
                style={[
                  styles.monthTab,
                  isActive && styles.monthTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.monthText,
                    isActive && styles.monthTextActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TYPE FILTERS */}
        <View style={styles.typeFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFilterStrip}
          >
            {TRANSACTION_TYPES.map((type) => {
              const isActive = type.value === selectedType;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  style={[
                    styles.typeTab,
                    isActive && styles.typeTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      isActive && styles.typeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SUMMARY CARD */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Credit</Text>
            <Text
              style={[styles.summaryValue, styles.creditText]}
            >
              ₹{totalCredit.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Debit</Text>
            <Text
              style={[styles.summaryValue, styles.debitText]}
            >
              ₹{totalDebit.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text
              style={[
                styles.summaryValue,
                netBalance >= 0
                  ? styles.creditText
                  : styles.debitText,
              ]}
            >
              ₹{netBalance.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      {loading && !uploading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#A7F3D0" />
          <Text style={styles.loadingText}>
            Loading transactions...
          </Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/images/transactions-empty.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>
            No {selectedType !== "all" ? selectedType : ""} transactions
            for {selectedMonth} {currentYear}.
          </Text>
          <Text style={styles.emptySubtext}>
            Add manual transactions or upload a bank statement PDF.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id + (item.utr || "")}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>
                {section.data.length} transactions
              </Text>
            </View>
          )}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshData}
              colors={["#4ADE80"]}
              tintColor="#4ADE80"
            />
          }
        />
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModal}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterTitle}>Filters</Text>
                  <TouchableOpacity
                    onPress={() => setShowFilterModal(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color="#E5F3E5"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.filterContent}>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>
                      Categories
                    </Text>
                    <View style={styles.categoryChips}>
                      {CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryChip,
                            selectedCategories.includes(
                              category
                            ) && styles.categoryChipSelected,
                          ]}
                          onPress={() => toggleCategory(category)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              selectedCategories.includes(
                                category
                              ) &&
                                styles.categoryChipTextSelected,
                            ]}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>
                      Amount Range
                    </Text>
                    <View style={styles.amountInputs}>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.amountLabel}>Min (₹)</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="0"
                          placeholderTextColor="#6B7280"
                          value={minAmount}
                          onChangeText={(text) => {
                            // Allow only numbers and decimal
                            const numeric = text.replace(/[^0-9.]/g, '');
                            // Ensure only one decimal point
                            const parts = numeric.split('.');
                            if (parts.length <= 2) {
                              setMinAmount(numeric);
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <Text style={styles.amountDash}>-</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.amountLabel}>Max (₹)</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="100000"
                          placeholderTextColor="#6B7280"
                          value={maxAmount}
                          onChangeText={(text) => {
                            const numeric = text.replace(/[^0-9.]/g, '');
                            const parts = numeric.split('.');
                            if (parts.length <= 2) {
                              setMaxAmount(numeric);
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.filterActions}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetButtonText}>Reset All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApplyFilters}
                  >
                    <Text style={styles.applyButtonText}>
                      Apply Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FLOATING ADD TRANSACTION BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={28} color="#020B06" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000ff",
  },

  /* HEADER */
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: "#000000ff",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleBlock: {
    flexDirection: "column",
  },
  headerEyebrow: {
    fontSize: 11,
    color: "#6EE7B7",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: "row",
    columnGap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },

  /* SEARCH BAR */
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020817",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#F9FAFB",
    fontSize: 15,
    paddingVertical: 4,
  },

  /* MONTH STRIP */
  monthStrip: {
    paddingVertical: 6,
  },
  monthTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  monthTabActive: {
    backgroundColor: "#0F172A",
    borderColor: "#10b981",
  },
  monthText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  monthTextActive: {
    color: "#F9FAFB",
  },

  /* TYPE FILTERS */
  typeFilterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  typeFilterStrip: {
    paddingVertical: 4,
  },
  typeTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  typeTabActive: {
    backgroundColor: "#0F172A",
    borderColor: "#10b981",
  },
  typeText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#F9FAFB",
  },

  /* SUMMARY CARD */
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020817",
    borderRadius: 24,
    padding: 14,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  creditText: {
    color: "#22C55E",
  },
  debitText: {
    color: "#FB7185",
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#111827",
  },

  /* LOADING ROW */
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#9CA3AF",
    fontSize: 14,
  },

  /* SECTION + LIST */
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#000000ff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  sectionCount: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },

  /* TRANSACTION ROW */
  row: {
    backgroundColor: "#020817",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  rowExpanded: {
    borderColor: "#10b981",
    backgroundColor: "#020617",
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  category: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9FAFB",
    marginRight: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  manualBadge: {
    backgroundColor: "#374151",
  },
  bankBadge: {
    backgroundColor: "#1E3A8A",
  },
  sourceBadgeText: {
    fontSize: 10,
    color: "#F9FAFB",
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
  },
  expandIcon: {
    marginTop: 6,
  },

  /* EXPANDED DETAILS */
  expandedDetails: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1F2933",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: "#F9FAFB",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },

  /* ACTION BUTTONS */
  actionButtons: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: "#10b981",
  },
  deleteButton: {
    backgroundColor: "#F97373",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#020817",
  },
  deleteButtonText: {
    color: "#FFFFFF",
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "30%",
    paddingHorizontal: 24,
    backgroundColor: "#000000ff",
  },
  emptyImage: {
    width: "75%",
    height: 240,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },

  /* FILTER MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "#020817",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  filterContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 12,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  categoryChipSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#020817",
  },
  amountInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: "#020817",
    borderRadius: 8,
    padding: 10,
    color: "#F9FAFB",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  amountDash: {
    fontSize: 18,
    color: "#9CA3AF",
    marginTop: 24,
  },
  filterActions: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#020817",
    fontSize: 15,
    fontWeight: "600",
  },

  /* FLOATING ADD BUTTON */
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});