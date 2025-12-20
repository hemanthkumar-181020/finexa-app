import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from '../types/transaction';

/* SAVE BACKEND DATA → FIRESTORE */
export async function saveTransactionsToFirestore(
  uid: string,
  transactions: any[],
) {
  const txRef = collection(db, 'users', uid, 'transactions');

  for (const t of transactions) {
    // 🔁 Deduplication using UTR
    if (t.utr) {
      const q = query(txRef, where('utr', '==', t.utr));
      const snap = await getDocs(q);
      if (!snap.empty) continue;
    }

    await addDoc(txRef, {
      amount: Number(t.amount),
      type: t.type === 'DEBIT' ? 'expense' : 'income',
      category: t.category ?? 'Uncategorized',
      date: Timestamp.fromDate(new Date(t.date)),
      note: t.description,
      source: 'bank',
      utr: t.utr ?? null,
      createdAt: Timestamp.now(),
    });
  }
}

/* READ FROM FIRESTORE → UI */
export async function fetchTransactionsFromFirestore(
  uid: string,
): Promise<Transaction[]> {
  const txRef = collection(db, 'users', uid, 'transactions');

  const q = query(txRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      amount: d.amount,
      type: d.type,
      category: d.category,
      date: d.date.toDate().toISOString(),
      note: d.note,
      source: d.source,
    };
  });
}
