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
  const { theme } = useTheme(); // kept as-is
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
            colors={["#5FB79A", "#A9E3D1"]}
          />
          <GradientCard
            title="Expense"
            subtitle={`₹ ${expense.toFixed(2)}`}
            colors={["#B96A6A", "#E3A7A7"]}
          />
        </View>

        {/* 2nd row */}
        <View style={styles.row}>
          <GradientCard
            title="Balance"
            subtitle={`₹ ${balance.toFixed(2)}`}
            colors={["#4F79B8", "#9BB6E2"]}
          />
          <GradientCard
            title="Transactions"
            subtitle={`${recent.length} recent`}
            colors={["#6E4A9C", "#9F88C3"]}
          />
        </View>

        {/* 3rd row */}
        <View style={styles.row}>
          <GradientCard
            title="Budgets"
            subtitle="Plan your spending"
            colors={["#D38A57", "#F0B183"]}
          />
          <GradientCard
            title="Insights"
            subtitle="View analytics"
            colors={["#3FA0AA", "#8ED0D6"]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Single GFG-style gradient card
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
              backgroundColor: colors[1],
              opacity: 0.75,
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