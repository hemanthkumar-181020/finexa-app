// utils/charts.ts

import { Transaction } from '../types/transaction';

export type PieData = {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

const COLOR_PALETTE = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#C9CBCF',
  '#8AFFC1',
  '#FF8A80',
  '#80D8FF',
];

export function groupExpensesByCategory(
  transactions: Transaction[],
): PieData[] {
  const totals = new Map<string, number>();

  for (const tx of transactions ?? []) {
    // ✅ Supports both manual + bank-imported data
    const isExpense =
      tx.type?.toLowerCase() === 'expense' ||
      (typeof tx.amount === 'number' && tx.amount < 0);

    if (!isExpense) continue;

    const category = tx.category?.toString() || 'Uncategorized';
    const amount = Math.abs(Number(tx.amount) || 0);

    if (amount === 0) continue;

    totals.set(category, (totals.get(category) || 0) + amount);
  }

  return Array.from(totals.entries()).map(([name, amount], index) => ({
    name,
    amount,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    legendFontColor: '#fff',
    legendFontSize: 14,
  }));
}
