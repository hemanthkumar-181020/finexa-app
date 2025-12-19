// reducers/transactionReducer.ts
import type { Transaction } from '../types/transaction';

export type TransactionState = {
  transactions: Transaction[];
};

export type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } // transaction id
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'RESET_TRANSACTIONS' };

/**
 * DEV-ONLY seed data
 * Automatically removed in production builds
 */
const devSeedTransactions: Transaction[] = [
  {
    id: 'dev-1',
    amount: 500,
    type: 'income',
    category: 'Salary',
    date: new Date().toISOString(),
  },
  {
    id: 'dev-2',
    amount: 120,
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString(),
  },
];

export const initialTransactionState: TransactionState = {
  transactions: __DEV__ ? devSeedTransactions : [],
};

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction,
): TransactionState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        transactions: [action.payload, ...state.transactions],
      };

    case 'DELETE_TRANSACTION':
      return {
        transactions: state.transactions.filter(
          t => t.id !== action.payload,
        ),
      };

    case 'SET_TRANSACTIONS':
      return {
        transactions: action.payload,
      };

    case 'RESET_TRANSACTIONS':
      return initialTransactionState;

    default:
      return state;
  }
}
