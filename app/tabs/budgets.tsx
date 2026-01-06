// app/goals/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as Progress from "react-native-progress";
import { useTransactions } from "../../context/TransactionContext";

const CATEGORY_CONFIG = {
  "Food & Dining": {
    icon: "silverware-fork-knife" as const,
    color: "#FF6B6B",
    defaultGoal: 10000,
  },
  "Groceries": {
    icon: "cart-outline" as const,
    color: "#4ECDC4",
    defaultGoal: 8000,
  },
  "Travel": {
    icon: "airplane" as const,
    color: "#45B7D1",
    defaultGoal: 15000,
  },
  "Fuel": {
    icon: "gas-station" as const,
    color: "#FFA726",
    defaultGoal: 5000,
  },
  "Shopping": {
    icon: "shopping-outline" as const,
    color: "#AB47BC",
    defaultGoal: 12000,
  },
  "Entertainment": {
    icon: "movie-open-outline" as const,
    color: "#5C6BC0",
    defaultGoal: 6000,
  },
  "Utilities": {
    icon: "lightning-bolt-outline" as const,
    color: "#FFEE58",
    defaultGoal: 7000,
  },
  "Recharge": {
    icon: "cellphone" as const,
    color: "#26C6DA",
    defaultGoal: 2000,
  },
  "Healthcare": {
    icon: "hospital-box-outline" as const,
    color: "#EF5350",
    defaultGoal: 5000,
  },
  "Education": {
    icon: "school-outline" as const,
    color: "#7E57C2",
    defaultGoal: 10000,
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline" as const,
    color: "#EC407A",
    defaultGoal: 4000,
  },
  "Home & Kitchen": {
    icon: "home-outline" as const,
    color: "#66BB6A",
    defaultGoal: 9000,
  },
  "Vehicle Maintenance": {
    icon: "car-wrench" as const,
    color: "#8D6E63",
    defaultGoal: 3000,
  },
  "Hobbies & Leisure": {
    icon: "soccer" as const,
    color: "#29B6F6",
    defaultGoal: 4000,
  },
  "Gifts & Donations": {
    icon: "gift-outline" as const,
    color: "#FF7043",
    defaultGoal: 3000,
  },
  "Business Expenses": {
    icon: "briefcase-outline" as const,
    color: "#78909C",
    defaultGoal: 20000,
  },
  "Technology & Software": {
    icon: "laptop" as const,
    color: "#26A69A",
    defaultGoal: 8000,
  },
  "Income / Transfer In": {
    icon: "cash-plus" as const,
    color: "#4CAF50",
    defaultGoal: 0,
  },
  "Transfer Out": {
    icon: "bank-transfer-out" as const,
    color: "#F44336",
    defaultGoal: 0,
  },
};

type Goal = {
  category: string;
  goalAmount: number;
  currentSpending: number;
  progress: number;
  isOverBudget: boolean;
};

export default function GoalsScreen() {
  const router = useRouter();
  const { state } = useTransactions();
  const allTransactions = state.transactions;
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [newIncome, setNewIncome] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [userGoals, setUserGoals] = useState<Record<string, number>>({});

  // Get current month debit transactions (expenses)
  const getCurrentMonthDebitTransactions = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allTransactions.filter((tx) => {
      if (!tx.date) return false;
      
      const txDate = new Date(tx.date);
      const isCurrentMonth =
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear;
      
      // Only include DEBIT transactions (expenses)
      return isCurrentMonth && tx.type === "expense";
    });
  }, [allTransactions]);

  // Get current month credit transactions (income)
  const getCurrentMonthCreditTransactions = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allTransactions.filter((tx) => {
      if (!tx.date) return false;
      
      const txDate = new Date(tx.date);
      const isCurrentMonth =
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear;
      
      // Only include CREDIT transactions (income)
      return isCurrentMonth && tx.type === "income";


      
    });
  }, [allTransactions]);

  const calculateCategorySpending = useCallback((transactions: any[]) => {
    const spending: Record<string, number> = {};
    
    transactions.forEach((tx) => {
      const category = tx.category || "Others";
      // Use Math.abs to get positive amount
      const amount = Math.abs(tx.amount);
      spending[category] = (spending[category] || 0) + amount;
    });
    
    return spending;
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        router.push("/(auth)/signup");
        return;
      }

      // Fetch user data
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const categories = data?.preferredCategoryNames || [];
      const income = data?.monthlyIncome || 0;
      const fetchedUserGoals = data?.goals || {};

      setMonthlyIncome(income);
      setUserCategories(categories);
      setUserGoals(fetchedUserGoals);

      // Get current month DEBIT transactions (expenses)
      const currentMonthDebitTransactions = getCurrentMonthDebitTransactions();

      // Calculate actual spending per category
      const allCategorySpending = calculateCategorySpending(currentMonthDebitTransactions);

      console.log("Total debit transactions this month:", currentMonthDebitTransactions.length);
      console.log("Category spending:", allCategorySpending);

      // Create goals for user's selected categories
      const goalsList = categories.map((category: string) => {
        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || {
          icon: "dots-horizontal-circle-outline" as const,
          color: "#666",
          defaultGoal: 5000,
        };
        
        // Use user's goal or default
        const goalAmount = fetchedUserGoals[category] || config.defaultGoal;
        
        // Get actual spending for this category
        const currentSpending = allCategorySpending[category] || 0;
        console.log(`Goal - ${category}: ${currentSpending} / ${goalAmount}`);
        
        // Calculate progress (cap at 1 for display)
        const progress = goalAmount > 0 ? Math.min(currentSpending / goalAmount, 1) : 0;
        const isOverBudget = currentSpending > goalAmount;

        return {
          category,
          goalAmount,
          currentSpending,
          progress,
          isOverBudget,
        };
      });

      console.log("Setting goals:", goalsList);
      setGoals(goalsList);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCurrentMonthDebitTransactions, calculateCategorySpending, router]);

  // Use both useEffect and useFocusEffect to ensure updates
  useEffect(() => {
    if (allTransactions.length > 0) {
      fetchGoals();
    }
  }, [allTransactions, fetchGoals]);

  useFocusEffect(
    React.useCallback(() => {
      fetchGoals();
    }, [fetchGoals])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGoals();
  }, [fetchGoals]);

  const handleEditIncome = async () => {
    const income = parseFloat(newIncome);
    if (isNaN(income) || income < 0) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        monthlyIncome: income,
      });

      setMonthlyIncome(income);
      setShowIncomeModal(false);
      setNewIncome("");
      
      // Refresh goals
      fetchGoals();
    } catch (error) {
      console.error("Error updating income:", error);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoalAmount(goal.goalAmount.toString());
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) return;

    const amount = parseFloat(newGoalAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update goal in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`goals.${editingGoal.category}`]: amount,
      });

      // Update local userGoals state
      const updatedUserGoals = { ...userGoals, [editingGoal.category]: amount };
      setUserGoals(updatedUserGoals);

      // Recalculate the specific goal with current spending
      const currentMonthDebitTransactions = getCurrentMonthDebitTransactions();
      const allCategorySpending = calculateCategorySpending(currentMonthDebitTransactions);
      const currentSpending = allCategorySpending[editingGoal.category] || 0;
      const progress = amount > 0 ? Math.min(currentSpending / amount, 1) : 0;
      const isOverBudget = currentSpending > amount;

      // Update local goals state
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.category === editingGoal.category
            ? {
                ...goal,
                goalAmount: amount,
                currentSpending,
                progress,
                isOverBudget,
              }
            : goal
        )
      );

      setShowGoalModal(false);
      setEditingGoal(null);
      setNewGoalAmount("");
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const calculateTotalBudget = () => {
    return goals.reduce((sum, goal) => sum + goal.goalAmount, 0);
  };

  const calculateTotalSpent = () => {
    return goals.reduce((sum, goal) => sum + goal.currentSpending, 0);
  };

  const getBudgetStatus = () => {
    const totalSpent = calculateTotalSpent();
    const remaining = monthlyIncome - totalSpent;
    
    if (remaining < 0) return { text: "Over Budget", color: "#FB7185" };
    if (remaining < monthlyIncome * 0.2) return { text: "Low Budget", color: "#FBBF24" };
    return { text: "On Track", color: "#4ADE80" };
  };

  const navigateToEditGoal = (category: string) => {
    const goal = goals.find(g => g.category === category);
    if (goal) {
      handleEditGoal(goal);
    }
  };

  // Get total credit transactions (income)
  const getTotalIncome = () => {
    const currentMonthCreditTransactions = getCurrentMonthCreditTransactions();
    return currentMonthCreditTransactions
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  };

  // Get total debit transactions (expenses)
  const getTotalExpense = () => {
    const currentMonthDebitTransactions = getCurrentMonthDebitTransactions();
    return currentMonthDebitTransactions
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  };

  // Get total transactions (both credit and debit)
  const getTotalTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    }).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#4ADE80" />
          <Text style={styles.loadingText}>Loading Budgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> Budgets</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ADE80"
            colors={["#4ADE80"]}
          />
        }
      >
        {/* Monthly Income Card */}
        <View style={styles.incomeCard}>
          <View style={styles.incomeHeader}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#4ADE80" />
            <Text style={styles.incomeTitle}>Monthly Income</Text>
            <TouchableOpacity
              onPress={() => {
                setNewIncome(monthlyIncome.toString());
                setShowIncomeModal(true);
              }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.incomeAmount}>
            ₹{monthlyIncome.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.incomeSubtitle}>Set your monthly income to track spending</Text>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>This Month's Summary</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <View style={styles.summaryStatHeader}>
                <MaterialCommunityIcons name="arrow-up" size={16} color="#4ADE80" />
                <Text style={styles.summaryStatLabel}>Income (Credit)</Text>
              </View>
              <Text style={styles.summaryStatValue}>
                ₹{getTotalIncome().toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={styles.summaryStat}>
              <View style={styles.summaryStatHeader}>
                <MaterialCommunityIcons name="arrow-down" size={16} color="#FB7185" />
                <Text style={styles.summaryStatLabel}>Expenses (Debit)</Text>
              </View>
              <Text style={styles.summaryStatValue}>
                ₹{getTotalExpense().toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={styles.summaryStat}>
              <View style={styles.summaryStatHeader}>
                <MaterialCommunityIcons name="swap-horizontal" size={16} color="#FBBF24" />
                <Text style={styles.summaryStatLabel}>Transactions</Text>
              </View>
              <Text style={styles.summaryStatValue}>
                {getTotalTransactions()}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Overview */}
        <View style={styles.budgetOverviewCard}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>
          
          <View style={styles.budgetStatsRow}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Total Budget</Text>
              <Text style={styles.budgetStatValue}>
                ₹{calculateTotalBudget().toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Total Spent</Text>
              <Text style={styles.budgetStatValue}>
                ₹{calculateTotalSpent().toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getBudgetStatus().color }]} />
                <Text style={[styles.statusText, { color: getBudgetStatus().color }]}>
                  {getBudgetStatus().text}
                </Text>
              </View>
            </View>
          </View>

          {/* Budget Progress */}
          <View style={styles.budgetProgressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Budget Utilization</Text>
              <Text style={styles.progressPercentage}>
                {monthlyIncome > 0 ? ((calculateTotalSpent() / monthlyIncome) * 100).toFixed(0) : "0"}%
              </Text>
            </View>
            <Progress.Bar
              progress={monthlyIncome > 0 ? calculateTotalSpent() / monthlyIncome : 0}
              width={null}
              height={10}
              color={getBudgetStatus().color}
              unfilledColor="#2D2F2D"
              borderWidth={0}
              borderRadius={5}
            />
            <View style={styles.progressFooter}>
              <Text style={styles.progressFooterText}>
                Remaining: ₹{Math.max(0, monthlyIncome - calculateTotalSpent()).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Goals */}
        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="flag-checkered" size={20} color="#4ADE80" />
            <Text style={styles.sectionTitle}>Budgets categories Goals</Text>
            <Text style={styles.goalsCount}>{goals.length} categories</Text>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyGoals}>
              <MaterialCommunityIcons name="flag-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>No goals set yet</Text>
              <Text style={styles.emptySubtext}>
                Set up category goals to track your spending
              </Text>
            </View>
          ) : (
            goals.map((goal) => {
              const config = CATEGORY_CONFIG[goal.category as keyof typeof CATEGORY_CONFIG] || {
                icon: "dots-horizontal-circle-outline" as const,
                color: "#666",
              };

              return (
                <TouchableOpacity
                  key={goal.category}
                  style={[
                    styles.goalItem,
                    goal.isOverBudget && styles.overBudgetItem,
                  ]}
                  onPress={() => navigateToEditGoal(goal.category)}
                >
                  <View style={styles.goalItemHeader}>
                    <View style={[styles.categoryIconContainer, { backgroundColor: `${config.color}20` }]}>
                      <MaterialCommunityIcons
                        name={config.icon}
                        size={20}
                        color={config.color}
                      />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalCategory}>{goal.category}</Text>
                      <Text style={styles.goalAmounts}>
                        ₹{goal.currentSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / ₹{goal.goalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <View style={styles.goalProgress}>
                      <Text style={styles.progressPercentage}>
                        {Math.round(goal.progress * 100)}%
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#666"
                      />
                    </View>
                  </View>

                  <Progress.Bar
                    progress={goal.progress}
                    width={null}
                    height={6}
                    color={goal.isOverBudget ? "#FB7185" : config.color}
                    unfilledColor="#2D2F2D"
                    borderWidth={0}
                    borderRadius={3}
                  />

                  {goal.isOverBudget && (
                    <View style={styles.overBudgetWarning}>
                      <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={14}
                        color="#FB7185"
                      />
                      <Text style={styles.overBudgetWarningText}>
                        Over budget by ₹{(goal.currentSpending - goal.goalAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <MaterialCommunityIcons name="bug-outline" size={14} color="#666" />
          <Text style={styles.debugText}>
            Showing {getCurrentMonthDebitTransactions().length} debit transactions this month
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/categories")}
          >
            <MaterialCommunityIcons name="view-grid-outline" size={20} color="#4ADE80" />
            <Text style={styles.quickActionText}>Manage Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/tabs/transactions")}
          >
            <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#4ADE80" />
            <Text style={styles.quickActionText}>View Transactions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Income Edit Modal */}
      <Modal
        visible={showIncomeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIncomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Monthly Income</Text>
            <TextInput
              style={styles.modalInput}
              value={newIncome}
              onChangeText={setNewIncome}
              keyboardType="numeric"
              placeholder="Enter monthly income"
              placeholderTextColor="#666"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowIncomeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditIncome}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Edit Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit Goal: {editingGoal?.category}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newGoalAmount}
              onChangeText={setNewGoalAmount}
              keyboardType="numeric"
              placeholder="Enter goal amount"
              placeholderTextColor="#666"
              autoFocus
            />
            <View style={styles.quickAmounts}>
              {[1000, 2000, 5000, 10000, 20000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setNewGoalAmount(amount.toString())}
                >
                  <Text style={styles.quickAmountText}>₹{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowGoalModal(false);
                  setEditingGoal(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveGoal}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020817",
  },
  loadingText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 16,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    backgroundColor: "#020817",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 32,
  },

  /* INCOME CARD */
  incomeCard: {
    backgroundColor: "#020817",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  incomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  incomeTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  incomeAmount: {
    color: "#22C55E",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  incomeSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  /* MONTHLY SUMMARY */
  summaryCard: {
    backgroundColor: "#020817",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  sectionTitle: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "700",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
  },
  summaryStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryStatLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginLeft: 4,
  },
  summaryStatValue: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "700",
  },

  /* BUDGET OVERVIEW */
  budgetOverviewCard: {
    backgroundColor: "#020817",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  budgetStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  budgetStat: {
    alignItems: "center",
    flex: 1,
  },
  budgetStatLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  budgetStatValue: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020817",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  budgetProgressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  progressPercentage: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },
  progressFooter: {
    marginTop: 8,
  },
  progressFooterText: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
  },

  /* GOALS SECTION */
  goalsSection: {
    backgroundColor: "#000000ff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  goalsCount: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  emptyGoals: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#F9FAFB",
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },

  goalItem: {
    backgroundColor: "#020817",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  overBudgetItem: {
    backgroundColor: "#111827",
    borderColor: "#FB7185",
  },
  goalItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalCategory: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  goalAmounts: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  goalProgress: {
    flexDirection: "row",
    alignItems: "center",
  },

  overBudgetWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#3A1A1A",
    borderRadius: 8,
  },
  overBudgetWarningText: {
    color: "#FB7185",
    fontSize: 12,
    marginLeft: 6,
  },

  /* DEBUG CHIP */
  debugContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020817",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  debugText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },

  /* QUICK ACTIONS */
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 28,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020817",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  quickActionText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },

  /* MODALS */
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#000000ff",
    width: "85%",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  modalTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#020817",
    color: "#F9FAFB",
    fontSize: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quickAmountButton: {
    backgroundColor: "#020817",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  quickAmountText: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  cancelButtonText: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#020817",
    fontSize: 16,
    fontWeight: "700",
  },
});