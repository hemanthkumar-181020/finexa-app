import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTransactions } from '../../context/TransactionContext';
import { autoCategorize } from '../../utils/categorize';
import { generateId } from '../../utils/id';

export default function TransactionForm() {
  const { dispatch } = useTransactions();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    const parsedAmount = Number(amount);

    if (!amount || !description) {
      Alert.alert('Validation Error', 'Amount and description are required');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Enter a valid amount');
      return;
    }

    const finalCategory = autoCategorize(description);

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: generateId(),
        amount: parsedAmount,
        type,
        category: finalCategory,
        date: new Date().toISOString(),
        source: 'manual',
      },
    });

    setAmount('');
    setDescription('');
    setNote('');
    setType('expense');
  };

  return (
    <View style={styles.container}>
      {/* Amount */}
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
      />

      {/* Type Toggle */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            type === 'expense' && styles.activeExpense,
          ]}
          onPress={() => setType('expense')}
        >
          <Text
            style={[
              styles.toggleText,
              type === 'expense' && styles.activeText,
            ]}
          >
            Expense
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            type === 'income' && styles.activeIncome,
          ]}
          onPress={() => setType('income')}
        >
          <Text
            style={[
              styles.toggleText,
              type === 'income' && styles.activeText,
            ]}
          >
            Income
          </Text>
        </Pressable>
      </View>

      {/* Description */}
      <Text style={styles.label}>Description (SMS / Bank text)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Swiggy order, Uber ride, Salary..."
      />
      {/* Submit */}
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add Transaction</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    color: '#444',
  },
  activeText: {
    fontWeight: '700',
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