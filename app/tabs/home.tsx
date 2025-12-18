import { View, StyleSheet } from 'react-native';
import { useTransactions } from '../../context/TransactionContext';

import {
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getRecentTransactions,
} from '../../utils/calculations';

import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';

export default function HomeScreen() {
  const { state } = useTransactions();
  const transactions = state.transactions;

  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  const balance = getBalance(transactions);
  const recent = getRecentTransactions(transactions);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SummaryCard title="Income" amount={income} color="#4cd964" />
        <SummaryCard title="Expense" amount={expense} color="#ff6b6b" />
      </View>

      <SummaryCard title="Balance" amount={balance} color="#5dade2" />

      <RecentTransactions transactions={recent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});
