// import { View, StyleSheet } from 'react-native';
// import { useTransactions } from '../../context/TransactionContext';
// import { useTheme } from '../../context/ThemeContext';

// import {
//   getTotalIncome,
//   getTotalExpense,
//   getBalance,
//   getRecentTransactions,
// } from '../../utils/calculations';

// import { SummaryCard } from '../../components/dashboard/SummaryCard';
// import { RecentTransactions } from '../../components/dashboard/RecentTransactions';

// export default function HomeScreen() {
//   const { state } = useTransactions();
//   const { theme } = useTheme();
//   const transactions = state.transactions;

//   const income = getTotalIncome(transactions);
//   const expense = getTotalExpense(transactions);
//   const balance = getBalance(transactions);
//   const recent = getRecentTransactions(transactions);

//   const isDark = theme === 'dark';

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? '#020617' : '#f9fafb' },
//       ]}
//     >
//       <View style={styles.row}>
//         <SummaryCard title="Income" amount={income} color="#4cd964" />
//         <SummaryCard title="Expense" amount={expense} color="#ff6b6b" />
//       </View>

//       <SummaryCard title="Balance" amount={balance} color="#5dade2" />

//       <RecentTransactions transactions={recent} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     flex: 1,
//   },
//   row: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
// });

//home.tsx..........................newer version........................
// app/tabs/home.tsx
import { View, StyleSheet } from 'react-native';
import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();
  const transactions = state.transactions;

  const income = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  const balance = getBalance(transactions);
  const recent = getRecentTransactions(transactions);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.row}>
        <SummaryCard title="Income" amount={income} color={colors.income} />
        <SummaryCard title="Expense" amount={expense} color={colors.expense} />
      </View>

      <SummaryCard title="Balance" amount={balance} color={colors.balance} />

      <RecentTransactions transactions={recent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});