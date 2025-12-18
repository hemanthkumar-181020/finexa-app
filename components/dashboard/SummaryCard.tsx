import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  amount: number;
  color?: string;
};

export const SummaryCard = ({ title, amount, color = '#fff' }: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color }]}>
        ₹ {amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  title: {
    color: '#aaa',
    fontSize: 14,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
});
