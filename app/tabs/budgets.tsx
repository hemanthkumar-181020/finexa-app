import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../context/TransactionContext';
import { ExpensePieChart } from '../../components/dashboard/ExpensePieChart';

export default function BudgetsScreen() {
  const { state } = useTransactions();

  return (
    <SafeAreaView style={styles.container}>
      <ExpensePieChart transactions={state.transactions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
});
