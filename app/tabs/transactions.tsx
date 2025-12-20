import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { useTransactions } from '../../context/TransactionContext';
import { importBankStatement } from '../../services/bankImport';
import { fetchTransactionsFromFirestore } from '../../services/firestoreTransactions';
import { useAuth } from '../../services/AuthContext';
import type { Transaction } from '../../types/transaction';

/* ------------------- HELPERS ------------------- */
function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(txn => {
    const key = new Date(txn.date).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  });

  return Object.keys(groups).map(date => ({
    title: date,
    data: groups[date],
  }));
}

/* ------------------- SCREEN ------------------- */
export default function TransactionsScreen() {
  const { state, dispatch } = useTransactions();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

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
      dispatch({ type: 'SET_TRANSACTIONS', payload: txns });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
      });

      // Check if user canceled
      if ('canceled' in result && result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      // Pass the picked file to your import function
      const count = await importBankStatement(file, user.uid);
      Alert.alert('Success', `Imported ${count} transactions`);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to import bank statement');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <Button title="Upload Bank Statement (PDF)" onPress={handleUpload} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <SectionList
        sections={groupByDate(state.transactions)}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.category}</Text>
            <Text style={{ color: item.type === 'expense' ? 'red' : 'green' }}>
              ₹{item.amount}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  section: { fontWeight: 'bold', marginTop: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
});
