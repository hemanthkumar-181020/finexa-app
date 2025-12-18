import { KeyboardAvoidingView, Platform, View } from 'react-native';
import TransactionForm from '../../components/transactions/TransactionForm';

export default function AddTransactionScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ padding: 16 }}>
        <TransactionForm />
      </View>
    </KeyboardAvoidingView>
  );
}
