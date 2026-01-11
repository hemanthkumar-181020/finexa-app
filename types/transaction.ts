// types/transaction.ts
export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO date string
  note?: string;
  source: 'bank' | 'manual'|'goal';
  utr?: string; // Optional - only present for bank transactions with UTR
  createdAt?: string;
  updatedAt?: string;
  importedAt?: string;
};

// Type for Firestore transaction document
export type FirestoreTransaction = {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: any; // Firestore Timestamp
  note: string;
  source: 'bank' | 'manual';
  utr: string | null; // Important: null for manual, string for bank
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
};