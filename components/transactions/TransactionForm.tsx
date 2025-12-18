import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
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

    // 🔥 AUTO CATEGORY
    const finalCategory = autoCategorize(description);

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: generateId(),
        amount: parsedAmount,
        type,
        category: finalCategory,
        date: new Date().toISOString(),
        note: note.trim() || undefined,
      },
    });

    // reset
    setAmount('');
    setDescription('');
    setNote('');
    setType('expense');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Amount</Text>
      <TextInput
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
      />

      <Text>Type</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={() => setType('expense')}>
          <Text style={{ fontWeight: type === 'expense' ? 'bold' : 'normal' }}>
            Expense
          </Text>
        </Pressable>
        <Pressable onPress={() => setType('income')}>
          <Text style={{ fontWeight: type === 'income' ? 'bold' : 'normal' }}>
            Income
          </Text>
        </Pressable>
      </View>

      <Text>Description (SMS / Bank text)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Swiggy order, Uber ride, Salary..."
      />

      <Text>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
      />

      <Pressable onPress={handleSubmit} style={{ marginTop: 16 }}>
        <Text>Add Transaction</Text>
      </Pressable>
    </View>
  );
}
