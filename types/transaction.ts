// types/transaction.ts
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;          // positive number
  type: TransactionType;   // 'income' | 'expense'
  category: string;        // e.g. 'Food', 'Bills'
  date: string;            // ISO string
  source?: 'manual' | 'csv' | 'sms' | 'import';
}
