import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';

import {
  transactionReducer,
  initialTransactionState,
  type TransactionAction,
  type TransactionState,
} from '../reducers/transactionReducer';

type TransactionContextValue = {
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
};

const TransactionContext =
  createContext<TransactionContextValue | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    transactionReducer,
    initialTransactionState,
  );

  return (
    <TransactionContext.Provider value={{ state, dispatch }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error(
      'useTransactions must be used inside <TransactionProvider>',
    );
  }
  return ctx;
}
