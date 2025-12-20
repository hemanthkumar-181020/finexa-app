import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  Platform
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
    const date = new Date(txn.date);
    const key = date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  const [uploading, setUploading] = useState(false);

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
    if (!user) {
      Alert.alert('Error', 'Please log in to upload statements');
      return;
    }

    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      // Check if user canceled
      if (result.canceled) {
        console.log('User cancelled document picker');
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      console.log('Selected file:', file.name, file.size, 'bytes');
      
      // Pass the picked file to your import function
      const count = await importBankStatement(file, user.uid);
      
      Alert.alert(
        'Success', 
        `Imported ${count} transactions successfully!`,
        [{ text: 'OK', onPress: () => loadTransactions() }]
      );
      
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Error', err.message || 'Failed to import bank statement');
    } finally {
      setUploading(false);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.note} numberOfLines={1}>
          {item.note || 'No description'}
        </Text>
        {item.utr && (
          <Text style={styles.utr} numberOfLines={1}>
            UTR: {item.utr}
          </Text>
        )}
        <Text style={styles.source}>
          Source: {item.source} • {new Date(item.date).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[
          styles.amount,
          { color: item.type === 'expense' ? '#ef4444' : '#22c55e' }
        ]}>
          {item.type === 'expense' ? '- ' : '+ '}₹{item.amount.toLocaleString('en-IN')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={uploading || !user}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {state.transactions.length} transactions total
        {user ? ` • User: ${user.email?.split('@')[0]}` : ' • Not logged in'}
      </Text>

      {loading && !uploading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      )}

      <SectionList
        sections={groupByDate(state.transactions)}
        keyExtractor={item => item.id + (item.utr || '')}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length} transactions</Text>
          </View>
        )}
        renderItem={renderTransactionItem}
        ListEmptyComponent={
          !loading && !uploading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Add manual transactions or upload a bank statement PDF
              </Text>
              {!user && (
                <Text style={styles.emptyWarning}>
                  Please log in to sync transactions
                </Text>
              )}
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  uploadButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  utr: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  source: {
    fontSize: 12,
    color: '#9ca3af',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyWarning: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
  },
});