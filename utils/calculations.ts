import { Transaction } from '../types/transaction';

export const getTotalIncome = (transactions: Transaction[]) =>
  transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

export const getTotalExpense = (transactions: Transaction[]) =>
  transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

export const getBalance = (transactions: Transaction[]) => {
  return getTotalIncome(transactions) - getTotalExpense(transactions);
};

export const getRecentTransactions = (
  transactions: Transaction[],
  limit = 5,
) => transactions.slice(0, limit);

// utils/calculations.ts - Ensure this function works
export function getCategorySpending(transactions: Transaction[]): CategorySpending {
  const categorySpending: CategorySpending = {};
  
  transactions.forEach((tx) => {
    if (tx.amount < 0) { // Only expenses
      const category = tx.category || 'Uncategorized';
      const amount = Math.abs(tx.amount);
      
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += amount;
    }
  });
  
  return categorySpending;
}