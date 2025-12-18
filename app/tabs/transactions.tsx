import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { importBankStatement } from '../../services/bankImport';
import type { Transaction } from '../../types/transaction';

export default function TransactionsScreen() {
  const { state, dispatch } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const importedTransactions = await importBankStatement(file);

      dispatch({
        type: 'SET_TRANSACTIONS',
        payload: [...importedTransactions, ...state.transactions],
      });

      Alert.alert(
        'Success',
        `Imported ${importedTransactions.length} transactions`,
      );
    } catch (error) {
      console.error('Bank import failed:', error);
      Alert.alert('Error', 'Failed to import bank statement');
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.row}>
      <Text
        style={[
          styles.category,
          { color: isDark ? '#e5e7eb' : '#111827' },
        ]}
      >
        {item.category}
      </Text>
      <Text
        style={[
          styles.amount,
          {
            color:
              item.type === 'expense'
                ? '#ef4444'
                : '#16a34a',
          },
        ]}
      >
        ₹{item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#020617' : '#f9fafb' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? '#f9fafb' : '#020617' },
        ]}
      >
        Transactions
      </Text>

      <View style={styles.uploadBox}>
        <Button title="Upload Bank Statement (PDF)" onPress={handleUpload} />
      </View>

      <FlatList
        data={state.transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? '#9ca3af' : '#6b7280' },
            ]}
          >
            No transactions yet
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  uploadBox: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#374151',
  },
  category: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
});
