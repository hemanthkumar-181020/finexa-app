// app/tabs/home.tsx
import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTransactions } from "../../context/TransactionContext";
import { useTheme } from "../../context/ThemeContext";

import {
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getRecentTransactions,
} from "../../utils/calculations";

import { TopNavbar } from "../../components/layout/TopNavbar";

export default function HomeScreen() {
  const { state } = useTransactions();
  const { theme } = useTheme(); // still here if you need later
  const transactions = state.transactions;

  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  const balance = getBalance(transactions);
  const recent = getRecentTransactions(transactions);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNavbar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1st row */}
        <View style={styles.row}>
          <GradientCard
            title="Income"
            subtitle={`₹ ${income.toFixed(2)}`}
            colors={["#34D399", "#22C55E"]}
          />
          <GradientCard
            title="Expense"
            subtitle={`₹ ${expense.toFixed(2)}`}
            colors={["#F97373", "#EF4444"]}
          />
        </View>

        {/* 2nd row */}
        <View style={styles.row}>
          <GradientCard
            title="Balance"
            subtitle={`₹ ${balance.toFixed(2)}`}
            colors={["#60A5FA", "#3B82F6"]}
          />
          <GradientCard
            title="Transactions"
            subtitle={`${recent.length} recent`}
            colors={["#A855F7", "#7C3AED"]}
          />
        </View>

        {/* 3rd row – extra tiles */}
        <View style={styles.row}>
          <GradientCard
            title="Budgets"
            subtitle="Plan your spending"
            colors={["#FDBA74", "#F97316"]}
          />
          <GradientCard
            title="Insights"
            subtitle="View analytics"
            colors={["#38BDF8", "#0EA5E9"]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Single GeeksforGeeks-like card
 */
function GradientCard({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: [string, string];
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors[0],
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: 0.7,
              backgroundColor: colors[1],
            },
          ]}
        />

        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 110,
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export {};
