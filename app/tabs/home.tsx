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
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useTransactions } from "../../context/TransactionContext";
import { TopNavbar } from "../../components/layout/TopNavbar";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useFocusEffect } from "expo-router";

const TABS = ["All", "Expense", "Income"] as const;
type TabKey = (typeof TABS)[number];

const getTxDate = (date: any) =>
  date?.toDate ? date.toDate() : new Date(date);

// Enhanced Category → Icon map with colors
const CATEGORY_CONFIG = {
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
  "Income / Transfer In": {
    icon: "cash-plus" as const,
    color: "#10b981",
  },
  "Transfer Out": {
    icon: "bank-transfer-out" as const,
    color: "#fbbf24",
  },
};

// Function to check if transaction is fake/spam
const isFakeTransaction = (transaction: any) => {
  const suspiciousKeywords = ["test", "fake", "spam", "demo", "sample"];
  const note = (transaction.note || "").toLowerCase();
  const category = (transaction.category || "").toLowerCase();
  
  for (const keyword of suspiciousKeywords) {
    if (note.includes(keyword) || category.includes(keyword)) {
      return true;
    }
  }
  
  if (Math.abs(transaction.amount) > 1000000) {
    return true;
  }
  
  if (Math.abs(transaction.amount) === 0) {
    return true;
  }
  
  return false;
};

export default function HomeScreen() {
  const [monthlyBudget, setMonthlyBudget] = React.useState<number>(0);
  const { state } = useTransactions();
  const allTransactions = state.transactions;

  const [activeTab, setActiveTab] = React.useState<TabKey>("All");
  const [refreshing, setRefreshing] = React.useState(false);

  const [displayName, setDisplayName] = React.useState("");
  const [userCategories, setUserCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    if (hour < 21) return "Good evening,";
    return "What's up,";
  };

  const fetchUserData = React.useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        const fullName = data?.name || "";
        const firstName = fullName.trim().split(" ")[0] || "User";
        setDisplayName(firstName);
        setMonthlyBudget(data?.monthlyBudget || 0);
        
        // Get user's preferred categories (EXCLUDE "Income / Transfer In")
        const categories = (data?.preferredCategoryNames || [])
          .filter((cat: string) => cat !== "Income / Transfer In");
        setUserCategories(categories);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  // Filter: current month + ONLY user's selected categories + Remove fake transactions
  const transactions = React.useMemo(() => {
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
      
      const isCurrentMonth =
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear;

      if (!isCurrentMonth) return false;

      // Include "Transfer Out" even if not in user categories
      return userCategories.includes(tx.category) || tx.category === "Transfer Out";
    });
  }, [allTransactions, userCategories]);

  // Calculate income from "Income / Transfer In" category only
  const incomeTransactions = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return allTransactions.filter((tx) => {
      if (tx.category !== "Income / Transfer In") return false;
      if (isFakeTransaction(tx)) return false;
      
      const txDate = getTxDate(tx.date);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });
  }, [allTransactions]);

  // Calculate totals - INCLUDING Transfer Out as expense
  const totalExpense = transactions
    .filter(tx => tx.type === "expense" || tx.category === "Transfer Out")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalIncome = incomeTransactions
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const remainingBudget = monthlyBudget - totalExpense;
  const budgetUtilizationRaw =
    monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
  const budgetUtilization = Math.min(budgetUtilizationRaw, 100);

  // Escalating risk color
  const budgetColor =
    budgetUtilization > 90 ? "#dc2626" :
    budgetUtilization > 75 ? "#f59e0b" :
    "#10b981";

  // Filtered transactions for display (based on active tab)
  const filteredRecent = React.useMemo(() => {
    if (activeTab === "All") {
      return [...incomeTransactions, ...transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    if (activeTab === "Income") return incomeTransactions;
    return transactions.filter(tx => tx.type === "expense" || tx.category === "Transfer Out");
  }, [transactions, incomeTransactions, activeTab]);

  // Calculate transaction counts for tab labels
  const transactionCounts = React.useMemo(() => {
    const expenseCount = transactions.filter(tx => 
      tx.type === "expense" || tx.category === "Transfer Out"
    ).length;
    
    return {
      all: transactions.length + incomeTransactions.length,
      expense: expenseCount,
      income: incomeTransactions.length,
    };
  }, [transactions, incomeTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#10b981" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TopNavbar />

      {/* Greeting block */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>
          {getGreeting()} 👋
        </Text>
        <Text style={styles.userNameText}>{displayName}</Text>
      </View>

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
        {/* Main Dashboard Cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.budgetCard, { borderLeftColor: budgetColor }]}
            activeOpacity={0.9}
            onPress={() => router.push("/analysis")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Monthly Budget</Text>
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

            {monthlyBudget > 0 && (
              <View style={styles.progressContainer}>
                <Progress.Bar
                  progress={budgetUtilization / 100}
                  width={null}
                  height={6}
                  color={budgetColor}
                  unfilledColor="#1e293b"
                  borderWidth={0}
                  borderRadius={10}
                />
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>
                    {Math.round(budgetUtilization)}% spent
                  </Text>
                  <Text style={styles.progressText}>
                    Limit: ₹{monthlyBudget.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analysisSmallCard}
            onPress={() => router.push("/analysis")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="finance"
                size={24}
                color="#10b981"
              />
            </View>
            <Text style={styles.analysisLabel}>Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Income</Text>
            <Text style={[styles.statAmount, { color: "#10b981" }]}>
              +₹{totalIncome.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Expense</Text>
            <Text style={[styles.statAmount, { color: "#fb7185" }]}>
              -₹{totalExpense.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statTitle}>Total</Text>
            <Text style={[styles.statAmount, { color: "#fbbf24" }]}>
              {transactionCounts.all}
            </Text>
          </View>
        </View>

        {/* Info about current month/user categories */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>
            Showing {userCategories.length > 0 
              ? `${userCategories.length} selected categories` 
              : "all categories"} for current month
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => [
                styles.tab,
                activeTab === tab && styles.activeTab,
                pressed && { opacity: 0.7 },
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
            </Pressable>
          ))}
        </View>

        {/* Recent Transactions Section */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {filteredRecent.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={60}
              color="#64748b"
            />
            <Text style={styles.emptyText}>
              No {activeTab === "All" ? "" : activeTab.toLowerCase()}{" "}
              transactions this month
              {userCategories.length > 0 && " in your selected categories"}
            </Text>
          </View>
        ) : (
          filteredRecent.slice(0, 10).map((tx, idx) => {
            const config = CATEGORY_CONFIG[tx.category as keyof typeof CATEGORY_CONFIG] || {
              icon: "dots-horizontal-circle-outline",
              color: "#64748b",
            };

            const isIncome = tx.category === "Income / Transfer In";
            const isTransferOut = tx.category === "Transfer Out";
            const color = isIncome
              ? "#10b981"
              : isTransferOut
              ? "#fbbf24"
              : "#f9fafc";

            const txDate = getTxDate(tx.date);
            const formattedDate = txDate.toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short',
              year: txDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
            });

            return (
              <View key={tx.id || idx} style={styles.transactionItem}>
                <View style={[
                  styles.txIconBox,
                  { backgroundColor: isTransferOut ? '#fbbf2415' : `${config.color}15` }
                ]}>
                  <MaterialCommunityIcons
                    name={config.icon}
                    size={24}
                    color={isTransferOut ? "#fbbf24" : (isIncome ? "#10b981" : config.color)}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                  {tx.note ? (
                    <Text style={styles.txNote} numberOfLines={1}>
                      {tx.note}
                    </Text>
                  ) : null}
                  <Text style={styles.txDate}>
                    {formattedDate}
                    {tx.source && tx.source !== 'manual' && (
                      <Text style={styles.txSource}> • {tx.source}</Text>
                    )}
                  </Text>
                </View>
                <View style={styles.txAmountContainer}>
                  <Text style={[styles.txAmount, { color }]}>
                    {isIncome ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.txType, { color }]}>
                    {isIncome ? "income" : (isTransferOut ? "transfer" : tx.type)}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {filteredRecent.length > 10 && (
          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => router.push("/tabs/transactions")}
          >
            <Text style={styles.viewAllText}>View All Transactions</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#64748b"
            />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="#022C22" />
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
    marginTop: 12,
    fontSize: 16,
  },

  // Greeting block
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0D0D0D",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1C1A",
  },
  greetingText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  userNameText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textTransform: "capitalize",
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // Cards
  cardRow: { flexDirection: "row", gap: 12, height: 160, marginTop: 16 },
  budgetCard: {
    flex: 2,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  budgetValue: { color: "#fff", fontSize: 30, fontWeight: "700" },

  progressContainer: { marginTop: 10 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600",
  },

  analysisSmallCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b98115",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  analysisLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Quick stats
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  statTitle: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  statAmount: { fontSize: 16, fontWeight: "700" },

  // Info Container
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoText: {
    color: "#64748b",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 15,
    padding: 5,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#1e293b",
  },
  tabText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabText: {
    color: "#10b981",
  },

  // Transactions
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingVertical: 40,
  },
  emptyText: {
    color: "#64748b",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F2933",
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1, marginLeft: 15 },
  txCategory: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: 14,
  },
  txNote: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  txDate: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  txSource: {
    color: "#64748b",
    fontSize: 10,
    fontStyle: "italic",
  },
  txAmountContainer: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontWeight: "700",
    fontSize: 15,
    minWidth: 90,
    textAlign: "right",
  },
  txType: {
    fontSize: 10,
    marginTop: 2,
    textTransform: "capitalize",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 20,
    paddingVertical: 12,
  },
  viewAllText: { 
    color: "#64748b", 
    marginRight: 4, 
    fontSize: 14 
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#34D399",
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});