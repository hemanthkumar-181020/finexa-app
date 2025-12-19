import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../../types/transaction';

export const RecentTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  if (!transactions.length) {
    return <Text style={styles.empty}>No transactions yet</Text>;
  }

  return (
    <View>
      {transactions.map(t => (
        <View key={t.id} style={styles.row}>
          <Text style={styles.category}>{t.category}</Text>
          <Text
            style={{
              color: t.type === 'expense' ? '#ff6b6b' : '#4cd964',
            }}>
            {t.type === 'expense' ? '-' : '+'}₹{t.amount}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#333',
  },
  category: {
    color: '#fff',
  },
  empty: {
    color: '#777',
    marginTop: 12,
  },
});
