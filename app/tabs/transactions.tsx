import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

import { useTransactions } from "../../context/TransactionContext";
import { importBankStatement } from "../../services/bankImport";
import { fetchTransactionsFromFirestore } from "../../services/firestoreTransactions";
import { useAuth } from "../../services/AuthContext";
import type { Transaction } from "../../types/transaction";

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

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return MONTHS[now.getMonth()];
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadTransactions();
    }
  }, [authLoading, user]);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const txns = await fetchTransactionsFromFirestore(user.uid);
      dispatch({ type: "SET_TRANSACTIONS", payload: txns });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setLoading(false);
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
        { text: "OK", onPress: () => loadTransactions() },
      ]);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Failed to import bank statement");
    } finally {
      setUploading(false);
    }
  };

  const handleFilterPress = () => {
    Alert.alert("Filters", "Open filters sheet here");
  };

  const handleSearchPress = () => {
    Alert.alert("Search", "Open search screen here");
  };

  // Filter by month
  const filteredTransactions = state.transactions.filter((txn) => {
    const d = new Date(txn.date);
    return MONTHS[d.getMonth()] === selectedMonth;
  });

  const sections = groupByDate(filteredTransactions);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.note} numberOfLines={1}>
          {item.note || "No description"}
        </Text>
        {item.utr && (
          <Text style={styles.utr} numberOfLines={1}>
            UTR: {item.utr}
          </Text>
        )}
        <Text style={styles.source}>
          Source: {item.source} •{" "}
          {new Date(item.date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
      </View>
    </TouchableOpacity>
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const showEmpty = !loading && !uploading && sections.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleFilterPress}>
              <Ionicons name="filter" size={20} color="#E5F3E5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
              <Ionicons name="search" size={20} color="#E5F3E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MONTH STRIP (short like original screenshot) */}
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
      </View>

      {/* CONTENT */}
      {loading && !uploading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#A7F3D0" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      )}

      {showEmpty ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/images/transactions-empty.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>
            No transactions for {selectedMonth}.
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
        />
      )}
    </SafeAreaView>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020B06", // dark green background
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  category: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E5F3E5",
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  utr: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  source: {
    fontSize: 12,
    color: "#6B7280",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },

  /* Empty state – image slightly below center */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "30%",          // pushes image+text down ~30% of screen
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
});
