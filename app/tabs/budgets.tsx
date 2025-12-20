// //budget
// import { StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useTransactions } from '../../context/TransactionContext';
// import { useTheme } from '../../context/ThemeContext';
// import { ExpensePieChart } from '../../components/dashboard/ExpensePieChart';

// export default function BudgetsScreen() {
//   const { state } = useTransactions();
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? '#020617' : '#f9fafb' },
//       ]}
//     >
//       <ExpensePieChart transactions={state.transactions} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
// });

// app/tabs/budget.tsx...........new version.......................
// app/tabs/budget.tsx
// app/tabs/budget.tsx
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { ExpensePieChart } from '../../components/dashboard/ExpensePieChart';

export default function BudgetsScreen() {
  const { state } = useTransactions();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      edges={['top', 'left', 'right']}
    >
      <ExpensePieChart transactions={state.transactions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});