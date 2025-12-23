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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTransactions } from "../../context/TransactionContext";
import {
  getBalance,
  getTotalExpense,
  getTotalIncome,
} from "../../utils/calculations";
import { TopNavbar } from "../../components/layout/TopNavbar";

import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const TABS = ["All", "Expense", "Income"] as const;
type TabKey = (typeof TABS)[number];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "What’s up";
}

export default function HomeScreen() {
  const { state } = useTransactions();
  const transactions = state.transactions;

  const balance = getBalance(transactions);
  const totalExpense = getTotalExpense(transactions);
  const totalIncome = getTotalIncome(transactions);

  const [activeTab, setActiveTab] = React.useState<TabKey>("All");

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const slideX = React.useRef(new Animated.Value(-260)).current;

  // name + greeting from Firestore
  const [displayName, setDisplayName] = React.useState<string>("");
  const greeting = getGreeting();

  React.useEffect(() => {
    const fetchName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const data = snap.data() as any;
      const fullName: string = data?.name || "";
      const firstName = fullName.trim().split(" ")[0] || "";
      setDisplayName(firstName);
    };

    fetchName();
  }, []);

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

  const filtered = React.useMemo(() => {
    if (activeTab === "All") return transactions;
    if (activeTab === "Expense") return transactions.filter((t) => t.amount < 0);
    return transactions.filter((t) => t.amount > 0);
  }, [transactions, activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TopNavbar onMenuPress={openMenu} onNotificationsPress={() => {}} />

      {/* Greeting header using Firestore name */}
      <View style={styles.header}>
        <Text style={styles.greetingHeader}>{greeting}</Text>
        {displayName ? (
          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Top cards row */}
        <View style={styles.topCardsRow}>
          <TouchableOpacity style={[styles.mainCard, styles.bankCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Bank</Text>
              <View style={styles.greenDot} />
            </View>
            <Text style={styles.balanceText}>
              ₹{balance.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.transactionCount}>
              {transactions.length} transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCard}>
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={24}
              color="#666"
            />
            <Text style={styles.smallCardText}>Account</Text>
          </TouchableOpacity>
        </View>

        {/* Budget / graph placeholder */}
        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <MaterialCommunityIcons
              name="chart-line-variant"
              size={20}
              color="#666"
            />
            <Text style={styles.budgetLabel}>Budget</Text>
          </View>
          <View style={styles.placeholderGraph}>
            <Text style={{ color: "#333" }}>Line Chart Visualization</Text>
          </View>
        </View>

        {/* Filter tabs with real totals */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === "All" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("All")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "All" && styles.activeTabText,
              ]}
            >
              All (₹{(totalIncome + totalExpense).toFixed(0)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === "Expense" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Expense")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Expense" && styles.activeTabText,
              ]}
            >
              Expense (₹{Math.abs(totalExpense).toFixed(0)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === "Income" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Income")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Income" && styles.activeTabText,
              ]}
            >
              Income (₹{totalIncome.toFixed(0)})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions list */}
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            No {activeTab === "All" ? "" : activeTab.toLowerCase()} transactions
            yet.
          </Text>
        ) : (
          filtered.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={tx.amount < 0 ? "shopping" : "cash-plus"}
                  size={24}
                  color={tx.amount < 0 ? "#FB7185" : "#4ADE80"}
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.merchantName}>
                  {tx.category || "Others"}
                </Text>
              </View>
              <Text
                style={[
                  styles.expenseAmount,
                  tx.amount > 0 && { color: "#4ADE80" },
                ]}
              >
                {tx.amount < 0 ? "-" : "+"}₹{Math.abs(tx.amount).toFixed(0)}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All Transactions</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={30} color="black" />
      </TouchableOpacity>

      {/* slide menu */}
      {isMenuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.sideSheet,
              { transform: [{ translateX: slideX }] },
            ]}
          >
            <Text style={styles.menuTitle}>Menu</Text>
            {/* menu items here */}
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  greetingHeader: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  userName: {
    color: "#E2E8F0",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  topCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  mainCard: {
    flex: 1.5,
    backgroundColor: "#1A1C1A",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  bankCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4ADE80",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  cardTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "600",
  },
  balanceText: {
    color: "#E2E8F0",
    fontSize: 20,
    fontWeight: "bold",
  },
  transactionCount: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
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
    fontWeight: "500",
  },
  graphContainer: {
    backgroundColor: "#1A1C1A",
    borderRadius: 24,
    marginTop: 15,
    padding: 20,
    height: 200,
  },
  graphHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  budgetLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  placeholderGraph: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#333",
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#141414",
    borderRadius: 30,
    padding: 6,
    marginTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    color: "#666",
    fontSize: 13,
  },
  activeTab: {
    backgroundColor: "#2D2F2D",
  },
  activeTabText: {
    color: "#4ADE80",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#666",
    marginTop: 24,
    fontSize: 14,
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#3D1B2D",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  merchantName: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
  expenseAmount: {
    color: "#FB7185",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllBtn: {
    alignItems: "center",
    marginTop: 30,
    padding: 10,
  },
  viewAllText: {
    color: "#666",
    fontSize: 14,
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
    marginBottom: 20,
  },
});
