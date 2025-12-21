import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { ExpensePieChart } from '../../components/dashboard/ExpensePieChart';


export default function BudgetsScreen() {
  const { state } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#020617' : '#f9fafb' },
      ]}
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
