// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction } from '../types/transaction';

const TRANSACTIONS_KEY = '@finexa:transactions_v1';

export async function saveTransactions(
  transactions: Transaction[],
): Promise<void> {
  try {
    const raw = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, raw);
  } catch (err) {
    console.error('saveTransactions error', err);
    throw err;
  }
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
  } catch (err) {
    console.error('loadTransactions error', err);
    return [];
  }
}

export async function clearTransactionsStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (err) {
    console.error('clearTransactionsStorage error', err);
    throw err;
  }
}
