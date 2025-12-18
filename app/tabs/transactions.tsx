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
import { importBankStatement } from '../../services/bankImport';
import type { Transaction } from '../../types/transaction';

export default function TransactionsScreen() {
  const { state, dispatch } = useTransactions();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];

      const importedTransactions = await importBankStatement(file);

      // merge imported + existing (new first)
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
      <Text style={styles.category}>{item.category}</Text>
      <Text
        style={[
          styles.amount,
          { color: item.type === 'expense' ? '#ff6b6b' : '#4cd964' },
        ]}
      >
        ₹{item.amount}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      {/* BANK STATEMENT UPLOAD */}
      <View style={styles.uploadBox}>
        <Button title="Upload Bank Statement (PDF)" onPress={handleUpload} />
      </View>

      {/* TRANSACTION LIST */}
      <FlatList
        data={state.transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
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
    borderColor: '#333',
  },
  category: {
    color: '#fff',
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});
