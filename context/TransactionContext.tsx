import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import {
  transactionReducer,
  initialTransactionState,
  type TransactionAction,
  type TransactionState,
} from '../reducers/transactionReducer';

import {
  loadTransactions,
  saveTransactions,
} from '../services/storage';

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

  // prevents saving before initial load completes
  const isHydratedRef = useRef(false);

  // debounce timer for saving
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* -----------------------------
     Load persisted transactions
     ----------------------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const persisted = await loadTransactions();
        if (!mounted) return;

        if (persisted.length > 0) {
          dispatch({
            type: 'SET_TRANSACTIONS',
            payload: persisted,
          });
        }
      } catch (err) {
        console.warn('Failed to load transactions', err);
      } finally {
        isHydratedRef.current = true;
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* -----------------------------
     Persist on change (debounced)
     ----------------------------- */
  useEffect(() => {
    if (!isHydratedRef.current) return;

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      saveTransactions(state.transactions).catch(err => {
        console.error('Failed to save transactions', err);
      });
    }, 500);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [state.transactions]);

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

