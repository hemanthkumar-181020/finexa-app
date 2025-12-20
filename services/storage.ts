// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction } from '../types/transaction';

const TRANSACTIONS_KEY = '@finexa:transactions_v1';

export async function saveTransactions(
  transactions: Transaction[],
): Promise<void> {
  try {
    // Don't add null values for utr - keep it undefined if not present
    const transactionsToSave = transactions.map(t => {
      const transactionToSave: any = {
        id: t.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
        note: t.note || '',
        source: t.source,
      };
      
      // Only add utr if it exists and is not empty
      if (t.utr && t.utr.trim() !== '') {
        transactionToSave.utr = t.utr.trim();
      }
      
      // Add optional fields if they exist
      if (t.createdAt) transactionToSave.createdAt = t.createdAt;
      if (t.updatedAt) transactionToSave.updatedAt = t.updatedAt;
      if (t.importedAt) transactionToSave.importedAt = t.importedAt;
      
      return transactionToSave;
    });
    
    const raw = JSON.stringify(transactionsToSave);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, raw);
    
    console.log(`💾 Saved ${transactions.length} transactions to local storage`);
    const withUTR = transactions.filter(t => t.utr && t.utr.trim() !== '').length;
    if (withUTR > 0) {
      console.log(`🔑 ${withUTR} transactions have UTR`);
    }
  } catch (err) {
    console.error('saveTransactions error', err);
    throw err;
  }
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      console.log('📭 No transactions in local storage');
      return [];
    }
    
    const parsed = JSON.parse(raw);
    const transactions = Array.isArray(parsed) ? parsed : [];
    
    // Transform to Transaction type
    const loadedTransactions: Transaction[] = transactions.map((item: any) => {
      const transaction: Transaction = {
        id: item.id || '',
        amount: typeof item.amount === 'number' ? item.amount : Number(item.amount) || 0,
        type: (item.type === 'income' || item.type === 'expense') ? item.type : 'expense',
        category: item.category || 'Uncategorized',
        date: item.date || new Date().toISOString(),
        note: item.note || '',
        source: (item.source === 'bank' || item.source === 'manual') ? item.source : 'manual',
      };
      
      // Only add utr if it exists and is not empty
      if (item.utr && item.utr.trim() !== '') {
        transaction.utr = item.utr.trim();
      }
      
      // Add optional fields
      if (item.createdAt) transaction.createdAt = item.createdAt;
      if (item.updatedAt) transaction.updatedAt = item.updatedAt;
      if (item.importedAt) transaction.importedAt = item.importedAt;
      
      return transaction;
    });
    
    console.log(`📱 Loaded ${loadedTransactions.length} transactions from local storage`);
    const withUTR = loadedTransactions.filter(t => t.utr && t.utr.trim() !== '').length;
    if (withUTR > 0) {
      console.log(`🔑 ${withUTR} transactions have UTR`);
    }
    
    return loadedTransactions;
  } catch (err) {
    console.error('loadTransactions error', err);
    return [];
  }
}

export async function clearTransactionsStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    console.log('🧹 Cleared local transactions storage');
  } catch (err) {
    console.error('clearTransactionsStorage error', err);
    throw err;
  }
}

// Optional: Sync function to merge local and Firestore data
export async function syncTransactionsWithFirestore(
  firestoreTransactions: Transaction[],
  localTransactions: Transaction[]
): Promise<Transaction[]> {
  try {
    console.log('🔄 Syncing Firestore and local transactions...');
    
    // Create a map of transactions by ID for quick lookup
    const transactionMap = new Map<string, Transaction>();
    
    // First add all local transactions
    localTransactions.forEach(t => {
      transactionMap.set(t.id, t);
    });
    
    // Then add/update with Firestore transactions (Firestore has priority)
    firestoreTransactions.forEach(t => {
      transactionMap.set(t.id, t);
    });
    
    const syncedTransactions = Array.from(transactionMap.values());
    
    // Sort by date (newest first)
    syncedTransactions.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    console.log(`🔄 Synced ${syncedTransactions.length} transactions (${firestoreTransactions.length} from Firestore, ${localTransactions.length} from local)`);
    
    // Save the synced transactions to local storage
    await saveTransactions(syncedTransactions);
    
    return syncedTransactions;
  } catch (err) {
    console.error('syncTransactionsWithFirestore error', err);
    return localTransactions; // Return local as fallback
  }
}