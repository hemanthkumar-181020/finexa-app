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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { useTransactions } from "../../context/TransactionContext";
import { importBankStatement } from "../../services/bankImport";
import { 
  fetchTransactionsFromFirestore,
  deleteTransactionFromFirestore 
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
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  // Load transactions on initial mount
  useEffect(() => {
    if (!authLoading && user) {
      loadTransactions();
    }
  }, [authLoading, user]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 TransactionsScreen focused, refreshing data...");
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
      dispatch({ type: "SET_TRANSACTIONS", payload: txns });
      console.log(`✅ Loaded ${txns.length} transactions`);
    } catch (err) {
      console.error(err);
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
      dispatch({ type: "SET_TRANSACTIONS", payload: txns });
      console.log(`🔄 Refreshed ${txns.length} transactions`);
    } catch (err) {
      console.error("Refresh error:", err);
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
        { text: "OK", onPress: () => {
          loadTransactions(); // Refresh after import
        } },
      ]);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Failed to import bank statement");
    } finally {
      setUploading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    router.push({
      pathname: "/update",
      params: { 
        transaction: JSON.stringify(transaction)
      }
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

              console.log(`🗑️ Deleting transaction: ${transaction.id}`);
              
              // Delete from Firestore
              await deleteTransactionFromFirestore(user.uid, transaction.id);
              
              // Delete from local state
              dispatch({
                type: "DELETE_TRANSACTION",
                payload: transaction.id,
              });
              
              setExpandedTransactionId(null);
              
              // Refresh the list to get updated data
              await refreshData();
              
              Alert.alert("Success", "Transaction deleted successfully");
            } catch (error: any) {
              console.error("Delete error:", error);
              Alert.alert("Error", error.message || "Failed to delete transaction");
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
      const d = new Date(txn.date);
      const monthMatches = MONTHS[d.getMonth()] === selectedMonth;
      
      // Type filter
      let typeMatches = true;
      if (selectedType === "credit") {
        typeMatches = txn.type === "income";
      } else if (selectedType === "debit") {
        typeMatches = txn.type === "expense";
      }

      // Search filter
      let searchMatches = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        searchMatches = 
          (txn.note?.toLowerCase().includes(query) || false) ||
          (txn.category?.toLowerCase().includes(query) || false);
      }

      // Category filter
      let categoryMatches = true;
      if (selectedCategories.length > 0) {
        categoryMatches = selectedCategories.includes(txn.category);
      }

      // Amount range filter
      let amountMatches = true;
      const amount = txn.amount;
      if (minAmount) {
        amountMatches = amountMatches && amount >= parseFloat(minAmount);
      }
      if (maxAmount) {
        amountMatches = amountMatches && amount <= parseFloat(maxAmount);
      }

      return monthMatches && typeMatches && searchMatches && categoryMatches && amountMatches;
    });
  }, [state.transactions, selectedMonth, selectedType, searchQuery, selectedCategories, minAmount, maxAmount]);

  const sections = groupByDate(filteredTransactions);

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isExpanded = expandedTransactionId === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.row, isExpanded && styles.rowExpanded]}
        onPress={() => toggleExpandTransaction(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.rowContent}>
          <View style={styles.rowLeft}>
            <View style={styles.categoryRow}>
              <Text style={styles.category}>{item.category}</Text>
              <View style={[
                styles.sourceBadge,
                item.source === "manual" ? styles.manualBadge : styles.bankBadge
              ]}>
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
                { color: item.type === "expense" ? "#F97373" : "#4ADE80" },
              ]}
            >
              {item.type === "expense" ? "- " : "+ "}₹
              {item.amount.toLocaleString("en-IN")}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6EE7B7" 
              style={styles.expandIcon}
            />
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.date).toLocaleString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.id.substring(0, 8)}...
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
                {item.source === "manual" ? "Added Manually" : "Bank Statement"}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditTransaction(item)}
              >
                <Ionicons name="create-outline" size={18} color="#020B06" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteTransaction(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#FFF" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
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
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
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

  // Calculate summary for selected month
  const monthTransactions = state.transactions.filter((txn) => {
    const d = new Date(txn.date);
    return MONTHS[d.getMonth()] === selectedMonth;
  });

  const totalCredit = monthTransactions
    .filter(txn => txn.type === "income")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalDebit = monthTransactions
    .filter(txn => txn.type === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const netBalance = totalCredit - totalDebit;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {isSearchActive ? (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by description or category..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={handleCloseSearch}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.headerTitle}>Transactions</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons name="filter" size={20} color="#E5F3E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleSearchPress}
                >
                  <Ionicons name="search" size={20} color="#E5F3E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#E5F3E5" />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={20} color="#E5F3E5" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={refreshData}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="#E5F3E5" />
                  ) : (
                    <Ionicons name="refresh" size={20} color="#E5F3E5" />
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
                style={[styles.monthTab, isActive && styles.monthTabActive]}
              >
                <Text
                  style={[styles.monthText, isActive && styles.monthTextActive]}
                  numberOfLines={1}
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
                  style={[styles.typeTab, isActive && styles.typeTabActive]}
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

        {/* SUMMARY FOR SELECTED MONTH */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Credit</Text>
            <Text style={[styles.summaryValue, styles.creditText]}>
              ₹{totalCredit.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Debit</Text>
            <Text style={[styles.summaryValue, styles.debitText]}>
              ₹{totalDebit.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[
              styles.summaryValue, 
              netBalance >= 0 ? styles.creditText : styles.debitText
            ]}>
              ₹{netBalance.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      {loading && !uploading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#A7F3D0" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/images/transactions-empty.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>
            No {selectedType !== "all" ? selectedType : ""} transactions for {selectedMonth}.
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
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModal}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterTitle}>Filters</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Ionicons name="close" size={24} color="#E5F3E5" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.filterContent}>
                  {/* Categories */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Categories</Text>
                    <View style={styles.categoryChips}>
                      {CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryChip,
                            selectedCategories.includes(category) && styles.categoryChipSelected
                          ]}
                          onPress={() => toggleCategory(category)}
                        >
                          <Text style={[
                            styles.categoryChipText,
                            selectedCategories.includes(category) && styles.categoryChipTextSelected
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Amount Range */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Amount Range</Text>
                    <View style={styles.amountInputs}>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.amountLabel}>Min</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="0"
                          placeholderTextColor="#6B7280"
                          value={minAmount}
                          onChangeText={setMinAmount}
                          keyboardType="numeric"
                        />
                      </View>
                      <Text style={styles.amountDash}>-</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.amountLabel}>Max</Text>
                        <TextInput
                          style={styles.amountInput}
                          placeholder="100000"
                          placeholderTextColor="#6B7280"
                          value={maxAmount}
                          onChangeText={setMaxAmount}
                          keyboardType="numeric"
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
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    backgroundColor: "#020B06",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020B06",
  },

  header: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 16,
    backgroundColor: "#020B06",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E5F3E5",
  },
  headerIcons: {
    flexDirection: "row",
    columnGap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#132016",
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132016",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#E5F3E5",
    fontSize: 16,
    paddingVertical: 4,
  },

  monthStrip: {
    paddingVertical: 4,
  },
  monthTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  monthTabActive: {
    backgroundColor: "#E5F3E5",
  },
  monthText: {
    fontSize: 14,
    color: "#6EE7B7",
    fontWeight: "600",
  },
  monthTextActive: {
    color: "#020B06",
  },

  typeFilterContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  typeFilterStrip: {
    paddingVertical: 4,
  },
  typeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  typeTabActive: {
    backgroundColor: "#4ADE80",
    borderColor: "#4ADE80",
  },
  typeText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#020B06",
  },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#132016",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  creditText: {
    color: "#4ADE80",
  },
  debitText: {
    color: "#F97373",
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#374151",
  },

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

  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1FAE5",
  },
  sectionCount: {
    fontSize: 12,
    color: "#6EE7B7",
  },
  row: {
    backgroundColor: "#0A100D",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1A231E",
  },
  rowExpanded: {
    borderColor: "#4ADE80",
    backgroundColor: "#0F1712",
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
    marginBottom: 8,
    flexWrap: "wrap",
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E5F3E5",
    marginRight: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  manualBadge: {
    backgroundColor: "#374151",
  },
  bankBadge: {
    backgroundColor: "#1E3A8A",
  },
  sourceBadgeText: {
    fontSize: 10,
    color: "#E5F3E5",
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  expandIcon: {
    marginTop: 8,
  },

  // Expanded Details
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#E5F3E5",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#4ADE80",
  },
  deleteButton: {
    backgroundColor: "#F97373",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#020B06",
  },
  deleteButtonText: {
    color: "#FFF",
  },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "30%",
    paddingHorizontal: 24,
  },
  emptyImage: {
    width: "75%",
    height: 240,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E5F3E5",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },

  /* Filter Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "#020B06",
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
    borderBottomColor: "#374151",
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E5F3E5",
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
    color: "#E5F3E5",
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
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  categoryChipSelected: {
    backgroundColor: "#4ADE80",
    borderColor: "#4ADE80",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#020B06",
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
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    color: "#E5F3E5",
    fontSize: 16,
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
    borderTopColor: "#374151",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#4ADE80",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#020B06",
    fontSize: 16,
    fontWeight: "600",
  },

  /* ADD TRANSACTION BUTTON */
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4ADE80",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});