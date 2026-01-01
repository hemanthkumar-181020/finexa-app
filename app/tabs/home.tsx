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
  Pressable,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";

import { useTransactions } from "../../context/TransactionContext";
import {
  getBalance,
  getTotalExpense,
  getTotalIncome,
} from "../../utils/calculations";
import { TopNavbar } from "../../components/layout/TopNavbar";

import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useFocusEffect } from "expo-router";

const TABS = ["All", "Expense", "Income"] as const;
type TabKey = (typeof TABS)[number];

const { width: screenWidth } = Dimensions.get("window");
const getTxDate = (date: any) =>
  date?.toDate ? date.toDate() : new Date(date);

// Enhanced Category → Icon map with colors
const CATEGORY_CONFIG = {
  "Food & Dining": {
    icon: "silverware-fork-knife" as const,
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#FF8E53"],
  },
  "Groceries": {
    icon: "cart-outline" as const,
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#44A08D"],
  },
  "Travel": {
    icon: "airplane" as const,
    color: "#45B7D1",
    gradient: ["#45B7D1", "#96C6EA"],
  },
  "Fuel": {
    icon: "gas-station" as const,
    color: "#FFA726",
    gradient: ["#FFA726", "#FF9800"],
  },
  "Shopping": {
    icon: "shopping-outline" as const,
    color: "#AB47BC",
    gradient: ["#AB47BC", "#CE93D8"],
  },
  "Entertainment": {
    icon: "movie-open-outline" as const,
    color: "#5C6BC0",
    gradient: ["#5C6BC0", "#7986CB"],
  },
  "Utilities": {
    icon: "lightning-bolt-outline" as const,
    color: "#FFEE58",
    gradient: ["#FFEE58", "#FFCA28"],
  },
  "Recharge": {
    icon: "cellphone" as const,
    color: "#26C6DA",
    gradient: ["#26C6DA", "#00ACC1"],
  },
  "Healthcare": {
    icon: "hospital-box-outline" as const,
    color: "#EF5350",
    gradient: ["#EF5350", "#E53935"],
  },
  "Education": {
    icon: "school-outline" as const,
    color: "#7E57C2",
    gradient: ["#7E57C2", "#9575CD"],
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline" as const,
    color: "#EC407A",
    gradient: ["#EC407A", "#D81B60"],
  },
  "Home & Kitchen": {
    icon: "home-outline" as const,
    color: "#66BB6A",
    gradient: ["#66BB6A", "#43A047"],
  },
  "Vehicle Maintenance": {
    icon: "car-wrench" as const,
    color: "#8D6E63",
    gradient: ["#8D6E63", "#795548"],
  },
  "Hobbies & Leisure": {
    icon: "soccer" as const,
    color: "#29B6F6",
    gradient: ["#29B6F6", "#0288D1"],
  },
  "Gifts & Donations": {
    icon: "gift-outline" as const,
    color: "#FF7043",
    gradient: ["#FF7043", "#FF5722"],
  },
  "Business Expenses": {
    icon: "briefcase-outline" as const,
    color: "#78909C",
    gradient: ["#78909C", "#546E7A"],
  },
  "Technology & Software": {
    icon: "laptop" as const,
    color: "#26A69A",
    gradient: ["#26A69A", "#00796B"],
  },
  "Income / Transfer In": {
    icon: "cash-plus" as const,
    color: "#4CAF50",
    gradient: ["#4CAF50", "#2E7D32"],
  },
  "Transfer Out": {
    icon: "bank-transfer-out" as const,
    color: "#F44336",
    gradient: ["#F44336", "#C62828"],
  },
};


// Function to check if transaction is fake/spam
const isFakeTransaction = (transaction: any) => {
  // Check for suspicious patterns
  const suspiciousKeywords = ["test", "fake", "spam", "demo", "sample"];
  const note = (transaction.note || "").toLowerCase();
  const category = (transaction.category || "").toLowerCase();
  
  // Check if contains suspicious keywords in note or category
  for (const keyword of suspiciousKeywords) {
    if (note.includes(keyword) || category.includes(keyword)) {
      return true;
    }
  }
  
  // Check for unrealistic amounts (too large or too small)
  if (Math.abs(transaction.amount) > 1000000) { // More than 1 million
    return true;
  }
  
  // Check for zero amount transactions
  if (Math.abs(transaction.amount) === 0) {
    return true;
  }
  
  return false;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "What's up";
}

export default function HomeScreen() {
  const [monthlyBudget, setMonthlyBudget] = React.useState<number>(0);
  const { state } = useTransactions();
  const allTransactions = state.transactions;

  const [activeTab, setActiveTab] = React.useState<TabKey>("All");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const slideX = React.useRef(new Animated.Value(-260)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  // User data
  const [displayName, setDisplayName] = React.useState("");
  const [userCategories, setUserCategories] = React.useState<string[]>([]);
  const [monthlyIncome, setMonthlyIncome] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  
  const greeting = getGreeting();
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/add");
  };

  // 🔹 Fetch user data and categories
  const fetchUserData = React.useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Fetch user data
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const fullName = data?.name || "";
      const firstName = fullName.trim().split(" ")[0] || "";
      setDisplayName(firstName);
    

      // Get user's preferred categories (EXCLUDE "Income / Transfer In" since it's income, not expense)
      const categories = (data?.preferredCategoryNames || [])
        .filter((cat: string) => cat !== "Income / Transfer In");
      setUserCategories(categories);

      // Fetch monthly income
      const userBudget = data?.monthlyBudget || data?.monthlyIncome || 0; // fallback to income
setMonthlyBudget(userBudget);

      
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  React.useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, [fetchUserData]);

  // 🔹 Filter: current month + ONLY user's selected categories + Remove fake transactions + Block "Income / Transfer In"
  const transactions = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter out fake/spam transactions and "Income / Transfer In" category
    const validTransactions = allTransactions.filter((tx) => {
      // Skip fake transactions
      if (isFakeTransaction(tx)) return false;
      
      // Skip "Income / Transfer In" category (we'll calculate income separately)
      if (tx.category === "Income / Transfer In") return false;
      
      return true;
    });

    // If user hasn't selected categories yet, show all current month transactions
    if (userCategories.length === 0) {
      return validTransactions.filter((tx) => {
        const txDate = new Date(tx.date);
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
      // Include "Transfer Out" even if not in user categories (it's always an expense)
      return userCategories.includes(tx.category) || tx.category === "Transfer Out";
    });
  }, [allTransactions, userCategories]);

  // Calculate income from "Income / Transfer In" category only
  const incomeTransactions = React.useMemo(() => {
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
  const totalExpense = transactions
    .filter(tx => tx.type === "expense" || tx.category === "Transfer Out")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalIncome = incomeTransactions
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const balance = totalIncome - totalExpense;

  // Filtered transactions for display (based on active tab)
  const filteredTransactions = React.useMemo(() => {
    if (activeTab === "All") {
      // Show all transactions except fake ones
      return [...incomeTransactions, ...transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    if (activeTab === "Income") return incomeTransactions;
    // For expense tab, show both regular expenses and Transfer Out
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

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideX, {
      toValue: -260,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsMenuOpen(false));
  };

  // Calculate budget utilization percentage
  const totalSpent = totalExpense;
  const remainingBudget = monthlyBudget - totalSpent;
const budgetUtilization = monthlyBudget > 0 
  ? (totalSpent / monthlyBudget) * 100 
  : 0;

  // Navigate to goals page
  const navigateToGoals = () => {
    router.push("/analysis");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#4ADE80" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TopNavbar onMenuPress={openMenu} onNotificationsPress={() => {}} />

      {/* Greeting */}
      <View style={styles.header}>
        <Text style={styles.greetingHeader}>{greeting}</Text>
        {displayName ? (
          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ADE80"
            colors={["#4ADE80"]}
          />
        }
      >
        {/* Budget Overview Card - Navigates to goals page */}
        <View style={styles.topCardsRow}>
          <TouchableOpacity 
            style={[styles.mainCard, styles.budgetCard]}
            onPress={navigateToGoals}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Monthly Budget</Text>
              <View style={[
                styles.budgetDot,
                { backgroundColor: remainingBudget > 0 ? "#4ADE80" : "#FB7185" }
              ]} />
            </View>
            <Text style={styles.balanceText}>
              ₹{remainingBudget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </Text>
            <View style={styles.budgetDetails}>
              <Text style={styles.budgetDetailText}>
                Income: ₹{monthlyBudget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.budgetDetailText}>
                Spent: ₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            {monthlyIncome > 0 && (
              <View style={styles.budgetProgressContainer}>
                <Progress.Bar
                  progress={budgetUtilization / 100}
                  width={null}
                  height={6}
                  color={budgetUtilization > 80 ? "#FB7185" : "#4ADE80"}
                  unfilledColor="#2D2F2D"
                  borderWidth={0}
                />
                <Text style={styles.budgetProgressText}>
                  {budgetUtilization.toFixed(0)}% utilized
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallCard} 
            onPress={navigateToGoals}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={24}
              color="#666"
            />
            <Text style={styles.smallCardText}>analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="arrow-up" size={20} color="#4ADE80" />
            <Text style={styles.statValue}>₹{totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="arrow-down" size={20} color="#FB7185" />
            <Text style={styles.statValue}>₹{totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#FBBF24" />
            <Text style={styles.statValue}>{transactionCounts.all}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.filterTabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
              >
                {tab === "All" &&
                  `All (${transactionCounts.all})`}
                {tab === "Expense" &&
                  `Expense (₹${totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })})`}
                {tab === "Income" &&
                  `Income (₹${totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info about current month/user categories */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Showing {userCategories.length > 0 
              ? `${userCategories.length} user-selected categories` 
              : "all categories"} for current month
          </Text>
        </View>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={60}
              color="#666"
            />
            <Text style={styles.emptyText}>
              No {activeTab === "All" ? "" : activeTab.toLowerCase()}{" "}
              transactions this month
              {userCategories.length > 0 && " in your selected categories"}
            </Text>
          </View>
        ) : (
          filteredTransactions.slice(0, 10).map((tx) => {
            const config = CATEGORY_CONFIG[tx.category as keyof typeof CATEGORY_CONFIG] || {
              icon: "dots-horizontal-circle-outline",
              color: "#666",
            };

            const txDate = new Date(tx.date);
            const formattedDate = txDate.toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short',
              year: txDate.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
            });

            // Determine if this is income, expense, or transfer
            const isIncome = tx.category === "Income / Transfer In";
            const isTransferOut = tx.category === "Transfer Out";
            const amountColor = isIncome ? "#4ADE80" : (isTransferOut ? "#FBBF24" : "#FB7185");
            const typeText = isIncome ? "income" : (isTransferOut ? "transfer" : tx.type);

            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.transactionItem}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isTransferOut ? '#FBBF2415' : `${config.color}15`,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={config.icon}
                    size={24}
                    color={isTransferOut ? "#FBBF24" : (isIncome ? "#4ADE80" : config.color)}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.merchantName}>
                    {tx.category || "Others"}
                  </Text>
                  {tx.note ? (
                    <Text style={styles.descriptionText} numberOfLines={1}>
                      {tx.note}
                    </Text>
                  ) : null}
                  <Text style={styles.transactionDate}>
                    {formattedDate}
                    {tx.source && tx.source !== 'manual' && (
                      <Text style={styles.transactionSource}> • {tx.source}</Text>
                    )}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.expenseAmount,
                      { color: amountColor }
                    ]}
                  >
                    {isIncome ? "+" : "-"}₹
                    {Math.abs(tx.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </Text>
                  <Text style={[
                    styles.transactionType,
                    { color: amountColor }
                  ]}>
                    {typeText}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {filteredTransactions.length > 10 && (
          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => router.push("/tabs/transactions")}
          >
            <Text style={styles.viewAllText}>View All Transactions</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNavigation}>
        <MaterialCommunityIcons name="plus" size={30} color="black" />
      </TouchableOpacity>

      {/* Side Menu */}
      {isMenuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <Animated.View
            style={[styles.sideSheet, { transform: [{ translateX: slideX }] }]}
          >
            <Text style={styles.menuTitle}>Menu</Text>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0D0D0D" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    marginTop: 12,
    fontSize: 16,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 10 
  },
  greetingHeader: { 
    color: "#666", 
    fontSize: 16, 
    fontWeight: "500" 
  },
  userName: {
    color: "#E2E8F0",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  scrollPadding: { 
    paddingHorizontal: 16, 
    paddingBottom: 100 
  },
  topCardsRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: 15 
  },
  mainCard: {
    flex: 1.5,
    backgroundColor: "#1A1C1A",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  budgetCard: { 
    borderLeftWidth: 4, 
    borderLeftColor: "#4ADE80" 
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: { 
    color: "#E2E8F0", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  balanceText: { 
    color: "#E2E8F0", 
    fontSize: 28, 
    fontWeight: "bold",
    marginBottom: 8,
  },
  budgetDetails: {
    marginBottom: 12,
  },
  budgetDetailText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 2,
  },
  budgetProgressContainer: {
    marginTop: 8,
  },
  budgetProgressText: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#1A1C1A",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  smallCardText: { 
    color: "#666", 
    marginTop: 8, 
    fontSize: 12 
  },
  
  // Quick Stats
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1C1A",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  statValue: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
  statLabel: {
    color: "#666",
    fontSize: 10,
    marginTop: 4,
  },
  
  // Info Container
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1C1A",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },

  // Tabs & Transactions
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#141414",
    borderRadius: 30,
    padding: 6,
    marginTop: 20,
  },
  tabChip: { 
    flex: 1, 
    alignItems: "center", 
    paddingVertical: 8 
  },
  tabText: { 
    color: "#666", 
    fontSize: 13,
    textAlign: "center",
  },
  activeTab: { 
    backgroundColor: "#2D2F2D", 
    borderRadius: 20 
  },
  activeTabText: { 
    color: "#4ADE80", 
    fontWeight: "bold" 
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingVertical: 40,
  },
  emptyText: {
    color: "#666",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1C1A",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDetails: { 
    flex: 1, 
    marginLeft: 15 
  },
  merchantName: { 
    color: "#E2E8F0", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  descriptionText: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  transactionDate: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
  },
  transactionSource: {
    color: "#666",
    fontSize: 10,
    fontStyle: "italic",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  expenseAmount: { 
    fontSize: 16, 
    fontWeight: "bold",
  },
  transactionType: {
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
    color: "#666", 
    marginRight: 4, 
    fontSize: 14 
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#D1FAE5",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sideSheet: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: "#111827",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuTitle: {
    color: "#E5E7EB",
    fontSize: 20,
    fontWeight: "700",
  },
});