import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import { useAuth } from "../../services/AuthContext";
import { useTransactions } from "../../context/TransactionContext";
import { getUserProfile } from "../../services/firestoreUser";
import { deleteTransactionAndRevertGoal } from "../../services/firestoreTransactions";
import {
  getUserGoals,
  Goal,
  addToGoalSaved,
} from "../../services/firestoreGoals";
import { createGoalContributionTransaction } from "../../services/firestoreTransactions";

const getCurrentMonthLabel = () => {
  const now = new Date();
  return now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const isSameMonth = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  );
};

export default function GoalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { state: txState } = useTransactions();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  const monthLabel = getCurrentMonthLabel();

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [profile, goalsData] = await Promise.all([
        getUserProfile(user.uid),
        getUserGoals(user.uid),
      ]);
      setMonthlyIncome(profile?.monthlyIncome ?? null);
      setGoals(goalsData);
    } catch (err) {
      console.error("Error loading goals/profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user) {
        load();
      }
    }, [user, load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const monthSpend = useMemo(
    () =>
      txState.transactions
        .filter((t) => t.type === "expense" && isSameMonth(t.date))
        .reduce((sum, t) => sum + t.amount, 0),
    [txState.transactions]
  );

  const remaining =
    monthlyIncome !== null ? monthlyIncome - monthSpend : null;

  const openContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionAmount("");
    setContributeModalVisible(true);
  };

  const handleAddNow = async () => {
    if (!user || !selectedGoal) return;
    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid amount", "Enter a positive number.");
      return;
    }

    try {
      await createGoalContributionTransaction(user.uid, {
        amount: amt,
        goalId: selectedGoal.id,
        goalName: selectedGoal.name,
      });

      await addToGoalSaved(user.uid, selectedGoal.id, amt);

      setContributeModalVisible(false);
      await load();
    } catch (e: any) {
      console.error("Error adding to goal:", e);
      Alert.alert("Error", e.message || "Failed to add to goal");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#e5f3e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saving Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#10b981" />
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Overview */}
          <Text style={styles.monthLabel}>{monthLabel}</Text>

          <View style={styles.overviewCard}>
            <Row
              label="Monthly income"
              value={
                monthlyIncome !== null
                  ? `₹${monthlyIncome.toLocaleString("en-IN")}`
                  : "Not set"
              }
            />
            <Row
              label="Spent this month"
              value={`₹${monthSpend.toLocaleString("en-IN")}`}
            />
            <Row
              label="Remaining"
              value={
                monthlyIncome !== null
                  ? `₹${(remaining || 0).toLocaleString("en-IN")}`
                  : "-"
              }
              highlight={remaining !== null && remaining < 0}
            />
          </View>

          {/* Goals list */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your goals</Text>
            <Text style={styles.sectionSubtitle}>{goals.length} active</Text>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flag-outline" size={40} color="#64748b" />
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySubtitle}>
                Create goals like car, gold, travel and track how much is left.
              </Text>
            </View>
          ) : (
            goals.map((goal) => {
              const remainingForGoal = Math.max(
                goal.targetAmount - goal.savedSoFar,
                0
              );
              const progress =
                goal.targetAmount > 0
                  ? Math.min(goal.savedSoFar / goal.targetAmount, 1)
                  : 0;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/profile/goals-add",
                        params: { goalId: goal.id },
                      })
                    }
                    style={{ flex: 1 }}
                  >
                    <View style={styles.goalHeaderRow}>
                      <Text style={styles.goalName}>
                        {goal.name} · ₹{remainingForGoal.toLocaleString("en-IN")} left
                      </Text>
                    </View>

                    <View style={styles.goalMetaRow}>
                      <Text style={styles.goalMetaText}>
                        Target: ₹{goal.targetAmount.toLocaleString("en-IN")}
                      </Text>
                      <Text style={styles.goalMetaText}>
                        Target month: {goal.targetMonth}
                      </Text>
                    </View>

                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress * 100}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.goalFooterRow}>
                      <Text style={styles.goalMetaText}>
                        Saved: ₹{goal.savedSoFar.toLocaleString("en-IN")}
                      </Text>
                      <Text style={styles.goalMetaText}>
                        {Math.round(progress * 100)}% complete
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addNowButton}
                    onPress={() => openContributeModal(goal)}
                  >
                    <Text style={styles.addNowText}>Add now</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/profile/goals-add")}
      >
        <Ionicons name="add" size={26} color="#020617" />
      </TouchableOpacity>

      {/* Contribution modal */}
      <Modal
        visible={contributeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContributeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add to {selectedGoal?.name ?? "goal"}
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={contributionAmount}
                onChangeText={setContributionAmount}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => setContributeModalVisible(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={handleAddNow}
              >
                <Text style={styles.modalPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.overviewRow}>
    <Text style={styles.overviewLabel}>{label}</Text>
    <Text
      style={[
        styles.overviewValue,
        highlight && { color: "#f97316" },
      ]}
    >
      {value}
    </Text>
  </View>
);

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

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#64748b" },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },

  monthLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },

  overviewCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 24,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  overviewLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  overviewValue: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  sectionSubtitle: { color: "#64748b", fontSize: 13, fontWeight: "600" },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },

  goalCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  goalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalName: { color: "#f9fafb", fontSize: 16, fontWeight: "700" },
  goalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  goalMetaText: { color: "#64748b", fontSize: 12 },
  progressBarBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#1e293b",
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#10b981",
  },
  goalFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  addNowButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#022c22",
  },
  addNowText: {
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: "600",
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "86%",
    backgroundColor: "#020617",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  currencySymbol: {
    fontSize: 22,
    color: "#10b981",
    marginRight: 8,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: "#f9fafb",
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 10,
  },
  modalSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalSecondaryText: {
    color: "#f97316",
    fontWeight: "600",
  },
  modalPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#10b981",
  },
  modalPrimaryText: {
    color: "#020617",
    fontWeight: "700",
  },
});
