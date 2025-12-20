import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  doc,
  getCountFromServer,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '../types/transaction';

// Helper function for safe error logging
const getSafeErrorDetails = (error: any) => {
  if (!error) return { code: 'NO_ERROR', message: 'No error object provided' };
  
  if (error.code && error.message) {
    return {
      code: error.code,
      message: error.message,
      name: error.name || 'FirebaseError'
    };
  }
  
  if (error.message) {
    return {
      code: error.code || 'UNKNOWN_CODE',
      message: error.message,
      name: error.name || 'Error'
    };
  }
  
  return {
    code: 'NON_STANDARD_ERROR',
    message: String(error),
    name: typeof error
  };
};

/* SAVE BACKEND DATA → FIRESTORE (for bank imports) */
export async function saveTransactionsToFirestore(
  uid: string,
  transactions: any[],
): Promise<{ saved: number; skipped: number }> {
  console.log(`🔥 saveTransactionsToFirestore called for UID: ${uid}`);
  console.log(`📊 Processing ${transactions.length} transactions from bank statement`);
  
  if (!uid || uid.trim() === '') {
    throw new Error('❌ Invalid UID provided');
  }

  if (!transactions || !Array.isArray(transactions)) {
    throw new Error('❌ Invalid transactions array');
  }

  if (transactions.length === 0) {
    console.log('⚠️ No transactions to save');
    return { saved: 0, skipped: 0 };
  }

  const txRef = collection(db, 'users', uid, 'transactions');
  const batch = writeBatch(db);
  let savedCount = 0;
  let skippedCount = 0;

  // Log first few transactions for debugging
  console.log('📝 First 3 transactions to save:');
  transactions.slice(0, 3).forEach((t, i) => {
    console.log(`  ${i + 1}. Amount: ${t.amount}, Type: ${t.type}, Date: ${t.date}, UTR: ${t.utr || 'NO UTR'}`);
  });

  for (const [index, t] of transactions.entries()) {
    try {
      // 🔁 Deduplication using UTR
      if (t.utr && t.utr.trim() !== '') {
        const q = query(txRef, where('utr', '==', t.utr.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          console.log(`⏭️ Skipping duplicate UTR: ${t.utr}`);
          skippedCount++;
          continue;
        }
      }

      // Validate amount
      const amount = Number(t.amount);
      if (isNaN(amount) || amount <= 0) {
        console.warn(`⚠️ Invalid amount at index ${index}: ${t.amount}`);
        skippedCount++;
        continue;
      }

      // Parse date
      let transactionDate: Date;
      try {
        transactionDate = new Date(t.date);
        if (isNaN(transactionDate.getTime())) {
          console.warn(`⚠️ Invalid date at index ${index}, using current date: ${t.date}`);
          transactionDate = new Date();
        }
      } catch {
        console.warn(`⚠️ Date parsing error at index ${index}, using current date: ${t.date}`);
        transactionDate = new Date();
      }

      // Create document reference
      const docRef = doc(txRef);
      
      // Prepare transaction data
      const hasUTR = t.utr && t.utr.trim() !== '';
      const transactionData: any = {
        amount: amount,
        type: t.type === 'DEBIT' ? 'expense' : 'income',
        category: t.category?.trim() || 'Uncategorized',
        date: Timestamp.fromDate(transactionDate),
        note: t.description?.trim() || '',
        source: 'bank',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        importedAt: Timestamp.now(),
      };
      
      // Only add UTR field if it exists
      if (hasUTR) {
        transactionData.utr = t.utr.trim();
      } else {
        // Don't add utr field at all if it doesn't exist
        if (transactionData.note) {
          transactionData.note = `${transactionData.note} [No UTR]`;
        } else {
          transactionData.note = '[No UTR]';
        }
      }

      batch.set(docRef, transactionData);
      savedCount++;

      // Log progress every 10 transactions
      if (savedCount % 10 === 0) {
        console.log(`📈 Processed ${savedCount + skippedCount}/${transactions.length} transactions`);
      }

    } catch (error) {
      const errorDetails = getSafeErrorDetails(error);
      console.error(`❌ Error processing transaction at index ${index}:`, errorDetails);
      console.error('Transaction data:', t);
      skippedCount++;
    }
  }

  // Commit batch if we have documents to save
  if (savedCount > 0) {
    try {
      console.log(`💾 Committing batch with ${savedCount} documents...`);
      await batch.commit();
      console.log(`✅ Successfully saved ${savedCount} transactions to Firestore`);
      console.log(`⏭️ Skipped ${skippedCount} transactions (duplicates/invalid)`);
      
      // Log UTR statistics
      const transactionsWithUTR = transactions.filter(t => t.utr && t.utr.trim() !== '');
      const savedWithUTR = transactionsWithUTR.length - 
        (skippedCount > transactionsWithUTR.length ? transactionsWithUTR.length : skippedCount);
      console.log(`🔑 ${savedWithUTR} transactions saved WITH UTR`);
      console.log(`📭 ${savedCount - savedWithUTR} transactions saved WITHOUT UTR`);
      
    } catch (error) {
      const errorDetails = getSafeErrorDetails(error);
      console.error('❌ Firestore batch commit error:', errorDetails);
      
      // Check for common Firestore errors
      if (errorDetails.code === 'permission-denied') {
        console.error('🔒 Permission denied! Check your Firestore security rules.');
      } else if (errorDetails.code === 'failed-precondition') {
        console.error('⚙️ Database precondition failed. Check your data structure.');
      } else if (errorDetails.code === 'unavailable') {
        console.error('🌐 Network/Firestore service unavailable. Check internet connection.');
      }
      
      throw new Error(`Firestore save failed: ${errorDetails.message}`);
    }
  } else {
    console.log(`⚠️ No new transactions saved. Skipped: ${skippedCount}`);
  }

  return { saved: savedCount, skipped: skippedCount };
}

/* SAVE MANUAL TRANSACTION (without UTR) */
export async function saveManualTransactionToFirestore(
  uid: string,
  transactionData: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    note: string;
    date?: Date;
  }
): Promise<string> {
  console.log(`➕ Saving manual transaction for UID: ${uid}`);
  console.log(`📝 Data: ${transactionData.note} - ₹${transactionData.amount} - ${transactionData.type}`);
  
  const txRef = collection(db, 'users', uid, 'transactions');
  
  // Manual transactions: Don't include utr field at all
  const data = {
    amount: transactionData.amount,
    type: transactionData.type,
    category: transactionData.category,
    note: transactionData.note,
    date: transactionData.date ? 
      Timestamp.fromDate(transactionData.date) : 
      Timestamp.now(),
    source: 'manual',
    // No utr field at all for manual transactions
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  try {
    const docRef = await addDoc(txRef, data);
    console.log(`✅ Manual transaction saved with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    const errorDetails = getSafeErrorDetails(error);
    console.error('❌ Error saving manual transaction:', errorDetails);
    throw error;
  }
}

/* READ FROM FIRESTORE → UI */
export async function fetchTransactionsFromFirestore(
  uid: string,
): Promise<Transaction[]> {
  console.log(`📥 fetchTransactionsFromFirestore called for UID: ${uid}`);
  
  if (!uid || uid.trim() === '') {
    console.error('❌ Invalid UID');
    return [];
  }

  try {
    const txRef = collection(db, 'users', uid, 'transactions');
    
    // Get count
    const countSnapshot = await getCountFromServer(txRef);
    const totalCount = countSnapshot.data().count;
    console.log(`📊 Total transactions in Firestore: ${totalCount}`);
    
    const q = query(txRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log(`✅ Retrieved ${snapshot.docs.length} documents from Firestore`);
    
    if (snapshot.empty) {
      console.log('📭 No transactions found in Firestore');
      return [];
    }
    
    const transactions: Transaction[] = [];
    let utrCount = 0;
    let bankTransactionsCount = 0;
    let manualTransactionsCount = 0;
    
    snapshot.docs.forEach((doc, index) => {
      const d = doc.data();
      
      // Convert Firestore Timestamp to ISO string
      let dateString: string;
      try {
        if (d.date && d.date.toDate) {
          dateString = d.date.toDate().toISOString();
        } else {
          console.warn(`⚠️ Transaction ${doc.id} has no valid date, using current date`);
          dateString = new Date().toISOString();
        }
      } catch (error) {
        console.error(`❌ Error parsing date for transaction ${doc.id}:`, error);
        dateString = new Date().toISOString();
      }
      
      // Check if UTR exists in the document
      const hasUTR = 'utr' in d && d.utr !== undefined && d.utr !== null && d.utr.trim() !== '';
      
      const transaction: Transaction = {
        id: doc.id,
        amount: d.amount || 0,
        type: d.type || 'expense',
        category: d.category || 'Uncategorized',
        date: dateString,
        note: d.note || '',
        source: d.source || 'manual',
        // Only include utr if it exists and is not empty
        utr: hasUTR ? d.utr.trim() : undefined,
      };
      
      // Count statistics
      if (hasUTR) {
        utrCount++;
        if (index < 3) {
          console.log(`🔑 Transaction ${doc.id} has UTR: ${d.utr}`);
        }
      }
      
      if (d.source === 'bank') {
        bankTransactionsCount++;
      } else {
        manualTransactionsCount++;
      }
      
      transactions.push(transaction);
    });
    
    return transactions;
  } catch (error) {
    const errorDetails = getSafeErrorDetails(error);
    console.error(`❌ Error fetching transactions for user ${uid}:`, errorDetails);
    return [];
  }
}

/* CHECK FOR DUPLICATE UTR */
export async function checkDuplicateUTR(
  uid: string,
  utr: string
): Promise<boolean> {
  if (!utr || utr.trim() === '') {
    console.log('⚠️ Empty UTR provided, skipping duplicate check');
    return false;
  }
  
  console.log(`🔍 Checking for duplicate UTR: ${utr}`);
  
  try {
    const txRef = collection(db, 'users', uid, 'transactions');
    const q = query(txRef, where('utr', '==', utr.trim()));
    const snap = await getDocs(q);
    
    const isDuplicate = !snap.empty;
    if (isDuplicate) {
      console.log(`⚠️ Duplicate UTR found: ${utr}`);
    } else {
      console.log(`✅ UTR ${utr} is unique`);
    }
    
    return isDuplicate;
  } catch (error) {
    const errorDetails = getSafeErrorDetails(error);
    console.error('❌ Error checking duplicate UTR:', errorDetails);
    return false;
  }
}

/* TEST FIRESTORE CONNECTION */
export async function testFirestoreConnection(uid: string): Promise<boolean> {
  console.log('🔍 Testing Firestore connection...');
  
  try {
    if (!uid || uid.trim() === '') {
      console.error('❌ Invalid UID provided for connection test');
      return false;
    }
    
    // Try to create a test document
    const testRef = collection(db, 'users', uid, '_connection_test');
    const testData = {
      test: true,
      timestamp: Timestamp.now(),
      message: 'Firestore connection test'
    };
    
    console.log('✏️ Attempting to write test document...');
    const docRef = await addDoc(testRef, testData);
    console.log('✅ Test document written with ID:', docRef.id);
    
    // Try to read it back
    console.log('📖 Attempting to read test document...');
    const q = query(testRef, where('__name__', '==', docRef.id));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log('✅ Successfully read test document');
      return true;
    }
    
    return false;
  } catch (error) {
    const errorDetails = getSafeErrorDetails(error);
    console.error('❌ Firestore connection test failed:', errorDetails);
    return false;
  }
}