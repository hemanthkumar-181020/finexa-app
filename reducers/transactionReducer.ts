import type { Transaction } from '../types/transaction';

export type TransactionState = {
  transactions: Transaction[];
};

export type TransactionAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] };

export const initialTransactionState: TransactionState = {
  transactions: [],
};

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction,
): TransactionState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    default:
      return state;
  }
}
