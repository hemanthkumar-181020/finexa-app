import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTransactions } from '../../context/TransactionContext';
import { 
  fetchTransactionsFromFirestore, 
  saveManualTransactionToFirestore 
} from '../../services/firestoreTransactions';
import { autoCategorize } from '../../utils/categorize';
import { useAuth } from '../../services/AuthContext';

export default function TransactionForm() {
  const { dispatch } = useTransactions();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const parsedAmount = Number(amount);
    if (!amount || !description) {
      Alert.alert('Validation Error', 'Amount and description are required');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      const category = autoCategorize(description);

      // ✅ Save MANUAL transaction (NO UTR)
      await saveManualTransactionToFirestore(user.uid, {
        amount: parsedAmount,
        type,
        category,
        note: description,
      });

      // Fetch updated transactions
      const updated = await fetchTransactionsFromFirestore(user.uid);
      dispatch({ type: 'SET_TRANSACTIONS', payload: updated });

      // Reset form
      setAmount('');
      setDescription('');
      setType('expense');

      Alert.alert('Success', 'Transaction added');
    } catch (err) {
      console.error('Error saving transaction:', err);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, type === 'expense' && styles.activeExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={styles.toggleText}>Expense</Text>
        </Pressable>

        <Pressable
          style={[styles.toggleButton, type === 'income' && styles.activeIncome]}
          onPress={() => setType('income')}
        >
          <Text style={styles.toggleText}>Income</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Swiggy, Uber, Salary..."
      />

      <Pressable
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? 'Saving...' : 'Add Transaction'}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  activeExpense: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  activeIncome: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});