// app/tabs/home.tsx
import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useTransactions } from "../../context/TransactionContext";
import { TopNavbar } from "../../components/layout/TopNavbar";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../services/AuthContext";
import { fetchTransactionsFromFirestore } from "../../services/firestoreTransactions";

const TABS = ["All", "Expense", "Income"] as const;
type TabKey = (typeof TABS)[number];

// Complete category → icon/color map
const CATEGORY_CONFIG = {
  // Income
  "Income / Transfer In": {
    icon: "cash-plus" as const,
    color: "#4CAF50",
  },

  // Core Expenses
  "Food & Dining": {
    icon: "silverware-fork-knife" as const,
    color: "#FF6B6B",
  },
  "Groceries": {
    icon: "cart-outline" as const,
    color: "#4ECDC4",
  },
  "Travel": {
    icon: "airplane" as const,
    color: "#45B7D1",
  },
  "Fuel": {
    icon: "gas-station" as const,
    color: "#FFA726",
  },
  "Shopping": {
    icon: "shopping-outline" as const,
    color: "#AB47BC",
  },
  "Entertainment": {
    icon: "movie-open-outline" as const,
    color: "#5C6BC0",
  },
  "Utilities": {
    icon: "lightning-bolt-outline" as const,
    color: "#FFEE58",
  },
  "Recharge": {
    icon: "cellphone" as const,
    color: "#26C6DA",
  },
  "Healthcare": {
    icon: "hospital-box-outline" as const,
    color: "#EF5350",
  },
  "Education": {
    icon: "school-outline" as const,
    color: "#7E57C2",
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline" as const,
    color: "#EC407A",
  },
  "Home & Kitchen": {
    icon: "home-outline" as const,
    color: "#66BB6A",
  },
  "Vehicle Maintenance": {
    icon: "car-wrench" as const,
    color: "#8D6E63",
  },
  "Hobbies & Leisure": {
    icon: "soccer" as const,
    color: "#29B6F6",
  },
  "Gifts & Donations": {
    icon: "gift-outline" as const,
    color: "#FF7043",
  },
  "Business Expenses": {
    icon: "briefcase-outline" as const,
    color: "#78909C",
  },
  "Technology & Software": {
    icon: "laptop" as const,
    color: "#26A69A",
  },
  
  // Additional categories
  "Banking & Finance": {
    icon: "bank-outline" as const,
    color: "#9C27B0",
  },
  "Child & Family": {
    icon: "account-child-outline" as const,
    color: "#FF9800",
  },
  "Transfer Out": {
    icon: "bank-transfer-out" as const,
    color: "#F44336",
  },
  "Other Expense": {
    icon: "dots-horizontal-circle-outline" as const,
    color: "#94a3b8",
  },
} as const;

// Helper function to get category config with fallback
const getCategoryConfig = (category: string) => {
  if (CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]) {
    return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  }
  
  const lowerCaseCategory = category.toLowerCase();
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (key.toLowerCase() === lowerCaseCategory) {
      return config;
    }
  }
  
  return {
    icon: "help-circle-outline" as const,
    color: "#94a3b8",
  };
};

// Fixed fake transaction filter (less strict)
const isFakeTransaction = (transaction: any) => {
  // Only filter truly fake transactions
  const note = (transaction.note || "").toLowerCase();
  const category = (transaction.category || "").toLowerCase();
  
  // Only filter if BOTH conditions are true:
  // 1. Note contains explicit fake keywords
  // 2. Amount is suspiciously small or large
  const isSuspiciousNote = note === "test" || note === "fake" || 
                           note === "spam" || note === "demo" || 
                           note === "sample";
  
  const isSuspiciousAmount = Math.abs(transaction.amount) === 0 || 
                            Math.abs(transaction.amount) > 1000000;
  
  if (isSuspiciousNote && isSuspiciousAmount) {
    return true;
  }
  
  return false;
};

const getTxDate = (date: any) =>
  date?.toDate ? date.toDate() : new Date(date);

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  if (hour < 21) return "Good evening,";
  return "What's up,";
}

export default function HomeScreen() {
  const [monthlyBudget, setMonthlyBudget] = React.useState<number>(0);
  const [displayName, setDisplayName] = React.useState("");
  const [userCategories, setUserCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>("All");

  const { state, dispatch } = useTransactions();
  const { user } = useAuth();
  const allTransactions = state.transactions;
  const router = useRouter();

  const greeting = getGreeting();

  // Load transactions when component mounts or user changes
  React.useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user && !loading) {
        refreshData();
      }
    }, [user, loading])
  );

  const loadTransactions = React.useCallback(async () => {
    if (!user) return;
    
    try {
      const txns = await fetchTransactionsFromFirestore(user.uid);
      dispatch({ type: "SET_TRANSACTIONS", payload: txns });
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, [user, dispatch]);

  const fetchUserData = React.useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setDisplayName(data?.name?.split(" ")[0] || "User");
        const budget = data?.monthlyBudget || data?.monthlyIncome || 0;
        setMonthlyBudget(budget);
        
        // Get user's preferred categories (EXCLUDE "Income / Transfer In")
        const categories = (data?.preferredCategoryNames || [])
          .filter((cat: string) => cat !== "Income / Transfer In");
        setUserCategories(categories);
      }
    } catch (error) {
      console.error("User fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refreshData = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserData(),
        loadTransactions()
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await refreshData();
  };

  // Current month expense transactions
  const currentMonthExpenseTransactions = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter out fake/spam transactions and "Income / Transfer In" category
    const validTransactions = allTransactions.filter((tx) => {
      if (isFakeTransaction(tx)) return false;
      if (tx.category === "Income / Transfer In") return false;
      return true;
    });

    // If user hasn't selected categories yet, show all current month transactions
    if (userCategories.length === 0) {
      return validTransactions.filter((tx) => {
        const txDate = getTxDate(tx.date);
        return (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      });
    }

    // Filter by current month AND user's selected categories
    return validTransactions.filter((tx) => {
      const txDate = getTxDate(tx.date);
      
      // Check if transaction is in current month
      const isCurrentMonth =
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear;

      if (!isCurrentMonth) return false;

      // Check if transaction category is in user's selected categories
      // OR if it's Transfer Out (always show transfers)
      return userCategories.includes(tx.category) || tx.category === "Transfer Out";
    });
  }, [allTransactions, userCategories]);

  // Calculate income from "Income / Transfer In" category only (current month)
  const currentMonthIncomeTransactions = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return allTransactions.filter((tx) => {
      // Only include "Income / Transfer In" category
      if (tx.category !== "Income / Transfer In") return false;
      
      // Filter out fake income transactions
      if (isFakeTransaction(tx)) return false;
      
      // Check if in current month
      const txDate = getTxDate(tx.date);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });
  }, [allTransactions]);

  // Calculate totals - INCLUDING Transfer Out as expense
  const totalExpense = React.useMemo(() => {
    return currentMonthExpenseTransactions
      .filter(tx => tx.type === "expense" || tx.category === "Transfer Out")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [currentMonthExpenseTransactions]);

  const totalIncome = React.useMemo(() => {
    return currentMonthIncomeTransactions
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [currentMonthIncomeTransactions]);

  // Calculate budget utilization
  const remainingBudget = monthlyBudget - totalExpense;
  const budgetUtilization =
    monthlyBudget > 0
      ? Math.min(totalExpense / monthlyBudget, 1)
      : 0;

  // Filtered transactions for display (based on active tab)
  const filteredTransactions = React.useMemo(() => {
    if (activeTab === "All") {
      // Show all transactions except fake ones
      return [...currentMonthIncomeTransactions, ...currentMonthExpenseTransactions]
        .sort((a, b) => 
          getTxDate(b.date).getTime() - getTxDate(a.date).getTime()
        );
    }
    if (activeTab === "Income") return currentMonthIncomeTransactions;
    
    // For expense tab, show both regular expenses and Transfer Out
    return currentMonthExpenseTransactions.filter(tx => 
      tx.type === "expense" || tx.category === "Transfer Out"
    );
  }, [currentMonthExpenseTransactions, currentMonthIncomeTransactions, activeTab]);

  // Calculate transaction counts for tab labels
  const transactionCounts = React.useMemo(() => {
    const expenseCount = currentMonthExpenseTransactions.filter(tx => 
      tx.type === "expense" || tx.category === "Transfer Out"
    ).length;
    
    return {
      all: currentMonthExpenseTransactions.length + currentMonthIncomeTransactions.length,
      expense: expenseCount,
      income: currentMonthIncomeTransactions.length,
    };
  }, [currentMonthExpenseTransactions, currentMonthIncomeTransactions]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Financing your life...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TopNavbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.userNameText}>{displayName}</Text>
        </View>

        {/* Top cards row */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.budgetCard}
            activeOpacity={0.9}
            onPress={() => router.push("/analysis")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Remaining Budget</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      remainingBudget > 0 ? "#10b981" : "#ef4444",
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetValue}>
              ₹{remainingBudget.toLocaleString("en-IN")}
            </Text>

            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={budgetUtilization}
                width={null}
                height={6}
                color="#10b981"
                unfilledColor="#1e293b"
                borderWidth={0}
                borderRadius={10}
              />
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>
                  {Math.round(budgetUtilization * 100)}% used
                </Text>
                <Text style={styles.progressText}>
                  Limit: ₹{monthlyBudget.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analysisSmallCard}
            onPress={() => router.push("/analysis")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="chart-arc"
                size={24}
                color="#10b981"
              />
            </View>
            <Text style={styles.analysisLabel}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Income</Text>
            <Text
              style={[styles.statAmount, { color: "#10b981" }]}
            >
              +₹{totalIncome.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Expense</Text>
            <Text
              style={[styles.statAmount, { color: "#fb7185" }]}
            >
              -₹{totalExpense.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Total TX</Text>
            <Text
              style={[styles.statAmount, { color: "#facc15" }]}
            >
              {transactionCounts.all}
            </Text>
          </View>
        </View>

        {/* Current month & categories info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons 
            name="calendar-month" 
            size={14} 
            color="#64748b" 
          />
          <Text style={styles.infoText}>
            {userCategories.length > 0 
              ? `Showing ${userCategories.length} categories for ${new Date().toLocaleString('default', { month: 'long' })}`
              : `Showing all categories for ${new Date().toLocaleString('default', { month: 'long' })}`
            }
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
              <View style={styles.tabCount}>
                <Text style={[
                  styles.tabCountText,
                  activeTab === tab && styles.activeTabCountText,
                ]}>
                  {transactionCounts[tab.toLowerCase() as keyof typeof transactionCounts]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity
            onPress={() => router.push("/tabs/transactions")}
          >
            <Text style={styles.viewAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={48}
              color="#64748b"
            />
            <Text style={styles.emptyTitle}>
              No {activeTab === "All" ? "" : activeTab.toLowerCase()}{" "}
              transactions this month
            </Text>
            <Text style={styles.emptySubtitle}>
              {userCategories.length > 0 && "in your selected categories"}
            </Text>
          </View>
        ) : (
          <>
            {filteredTransactions.slice(0, 10).map((tx: any, idx: number) => {
              const config = getCategoryConfig(tx.category);

              const isIncome =
                tx.category === "Income / Transfer In" ||
                tx.type === "income";
              const isTransferOut = tx.category === "Transfer Out";
              const amountColor = isIncome
                ? "#10b981"
                : isTransferOut
                ? "#facc15"
                : "#fb7185";

              const dateObj = getTxDate(tx.date);
              const dateLabel = dateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: dateObj.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
              });

              const typeText = isIncome ? "income" : (isTransferOut ? "transfer" : tx.type);

              return (
                <TouchableOpacity
                  key={tx.id || idx}
                  style={styles.transactionItem}
                  onPress={() => {
                    // Optional: Add transaction detail view
                  }}
                >
                  <View style={[
                    styles.txIconBox,
                    { backgroundColor: isTransferOut ? '#facc1515' : `${config.color}15` }
                  ]}>
                    <MaterialCommunityIcons
                      name={config.icon}
                      size={20}
                      color={isTransferOut ? "#facc15" : (isIncome ? "#10b981" : config.color)}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txCategory}>
                      {tx.category || "Others"}
                    </Text>
                    {tx.note ? (
                      <Text style={styles.txNote} numberOfLines={1}>
                        {tx.note}
                      </Text>
                    ) : null}
                    <View style={styles.txMeta}>
                      <Text style={styles.txDate}>{dateLabel}</Text>
                      <Text style={[
                        styles.txType,
                        { color: amountColor }
                      ]}>
                        {typeText}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount, { color: amountColor }]}>
                    {isIncome ? "+" : "-"}₹
                    {Math.abs(tx.amount).toLocaleString("en-IN")}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {filteredTransactions.length > 10 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push("/tabs/transactions")}
              >
                <Text style={styles.viewAllButtonText}>
                  View All {filteredTransactions.length} Transactions
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#10b981"
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { 
    color: "#64748b", 
    fontSize: 14,
    marginTop: 10,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  header: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 15,
  },
  greetingText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userNameText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
    height: 170,
    marginTop: 10,
  },
  budgetCard: {
    flex: 2,
    backgroundColor: "#0f172a",
    borderRadius: 28,
    padding: 20,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  budgetValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  progressContainer: { marginTop: 10 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
  },

  analysisSmallCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#10b98115",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  analysisLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  statTitle: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Info Container
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 6,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
  },
  activeTab: { backgroundColor: "#1e293b" },
  tabText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 13,
  },
  activeTabText: { color: "#10b981" },
  tabCount: {
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabCountText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },
  activeTabCountText: {
    color: "#10b981",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  viewAllText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 13,
  },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { 
    flex: 1, 
    marginLeft: 16 
  },
  txCategory: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 15,
  },
  txNote: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  txMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  txDate: {
    color: "#64748b",
    fontSize: 12,
  },
  txType: {
    fontSize: 10,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  txAmount: {
    fontWeight: "800",
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  viewAllButtonText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 8,
  },

  fab: {
    position: "absolute",
    bottom: 40,
    right: 25,
    backgroundColor: "#10b981",
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});