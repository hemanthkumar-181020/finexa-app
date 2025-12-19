import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Transaction } from '../../types/transaction';
import { groupExpensesByCategory } from '../../utils/charts';


type Props = {
  transactions: Transaction[];
};

const screenWidth = Dimensions.get('window').width;

export function ExpensePieChart({ transactions }: Props) {
  const data = groupExpensesByCategory(transactions);

  if (!data.length) {
    return <Text style={{ color: '#aaa' }}>No expense data</Text>;
  }

  return (
    <View>
      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12 }}>
        Expense Breakdown
      </Text>

      <PieChart
        data={data}
        width={screenWidth - 32}
        height={220}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="16"
        chartConfig={{
          color: () => '#fff',
        }}
        absolute
      />
    </View>
  );
}
