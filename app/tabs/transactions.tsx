// //transactions
// import React, { useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Button,
//   Alert,
//   ActivityIndicator,
//   SectionList,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import * as DocumentPicker from 'expo-document-picker';

// import { useTransactions } from '../../context/TransactionContext';
// import { useTheme } from '../../context/ThemeContext';
// import { importBankStatement } from '../../services/bankImport';
// import type { Transaction } from '../../types/transaction';

// /* -------------------- HELPERS -------------------- */

// // Group transactions by date
// function groupTransactionsByDate(transactions: Transaction[], selectedMonth?: string) {
//   const groups: Record<string, Transaction[]> = {};

//   transactions.forEach(txn => {
//     const dateObj = new Date(txn.date);
//     const monthKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

//     if (selectedMonth && monthKey !== selectedMonth) return; // filter by selected month

//     const dateKey = dateObj.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });

//     if (!groups[dateKey]) groups[dateKey] = [];
//     groups[dateKey].push(txn);
//   });

//   return Object.keys(groups)
//     .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
//     .map(date => ({ title: date, data: groups[date] }));
// }

// // Get unique months from transactions
// function getUniqueMonths(transactions: Transaction[]) {
//   const months = transactions.map(txn => {
//     const d = new Date(txn.date);
//     return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
//   });
//   return Array.from(new Set(months)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
// }

// /* -------------------- SCREEN -------------------- */

// export default function TransactionsScreen() {
//   const { state, dispatch } = useTransactions();
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

//   const months = useMemo(() => getUniqueMonths(state.transactions), [state.transactions]);

//   const handleUpload = async () => {
//     try {
//       setIsLoading(true);

//       const result = await DocumentPicker.getDocumentAsync({
//         type: ['application/pdf'],
//         copyToCacheDirectory: true,
//       });

//       if (result.canceled || !result.assets?.length) {
//         setIsLoading(false);
//         return;
//       }

//       const file = result.assets[0];
//       const importedTransactions = await importBankStatement(file);

//       dispatch({
//         type: 'SET_TRANSACTIONS',
//         payload: [...importedTransactions, ...state.transactions],
//       });

//       Alert.alert('Success', `Imported ${importedTransactions.length} transactions`);
//     } catch (error) {
//       console.error('Bank import failed:', error);
//       Alert.alert('Error', 'Failed to import bank statement');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? '#020617' : '#f9fafb' },
//       ]}
//     >
//       <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#020617' }]}>
//         Transactions
//       </Text>

//       <View style={styles.uploadBox}>
//         <Button
//           title={isLoading ? 'Uploading...' : 'Upload Bank Statement (PDF)'}
//           onPress={handleUpload}
//           disabled={isLoading}
//         />
//       </View>

//       {/* Horizontal Month Selector */}
//       {months.length > 0 && (
//         <FlatList
//           horizontal
//           data={months}
//           keyExtractor={item => item}
//           contentContainerStyle={styles.monthList}
//           showsHorizontalScrollIndicator={false}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               onPress={() => setSelectedMonth(selectedMonth === item ? undefined : item)}
//               style={[
//                 styles.monthItem,
//                 {
//                   backgroundColor:
//                     selectedMonth === item
//                       ? '#3b82f6'
//                       : isDark
//                       ? '#1f2937'
//                       : '#e5e7eb',
//                 },
//               ]}
//             >
//               <Text
//                 style={{
//                   color: selectedMonth === item ? '#fff' : isDark ? '#f9fafb' : '#111827',
//                   fontWeight: selectedMonth === item ? 'bold' : '500',
//                 }}
//               >
//                 {item}
//               </Text>
//             </TouchableOpacity>
//           )}
//         />
//       )}

//       {/* Loading Indicator */}
//       {isLoading && (
//         <View style={styles.loadingBox}>
//           <ActivityIndicator size="large" color="#3b82f6" />
//           <Text style={[styles.loadingText, { color: isDark ? '#9ca3af' : '#374151' }]}>
//             Processing bank statement…
//           </Text>
//         </View>
//       )}

//       {/* Date-wise Transactions */}
//       <SectionList
//         sections={groupTransactionsByDate(state.transactions, selectedMonth)}
//         keyExtractor={item => item.id}
//         stickySectionHeadersEnabled
//         renderSectionHeader={({ section }) => (
//           <Text style={[styles.sectionHeader, { color: isDark ? '#e5e7eb' : '#111827' }]}>
//             {section.title}
//           </Text>
//         )}
//         renderItem={({ item }) => (
//           <View style={styles.row}>
//             <Text style={[styles.category, { color: isDark ? '#e5e7eb' : '#111827' }]}>
//               {item.category}
//             </Text>
//             <Text
//               style={[
//                 styles.amount,
//                 { color: item.type === 'expense' ? '#ef4444' : '#16a34a' },
//               ]}
//             >
//               ₹{item.amount}
//             </Text>
//           </View>
//         )}
//         ListEmptyComponent={
//           !isLoading ? (
//             <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
//               No transactions yet
//             </Text>
//           ) : null
//         }
//       />
//     </SafeAreaView>
//   );
// }

// /* -------------------- STYLES -------------------- */

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
//   uploadBox: { marginBottom: 16 },
//   loadingBox: { alignItems: 'center', marginVertical: 20 },
//   loadingText: { marginTop: 8, fontSize: 14 },
//   sectionHeader: { fontSize: 15, fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#4b5563' },
//   category: { fontSize: 16 },
//   amount: { fontSize: 16, fontWeight: '600' },
//   emptyText: { textAlign: 'center', marginTop: 40 },
//   monthList: { paddingVertical: 8 },
//   monthItem: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//   },
// });

// app/tabs/transactions.tsx.......................................................................................................new version
// app/tabs/transactions.tsx
// app/tabs/transactions.tsx
// app/tabs/transactions.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SectionList,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { importBankStatement } from '../../services/bankImport';
import type { Transaction } from '../../types/transaction';

/* -------------------- HELPERS -------------------- */

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[], selectedMonth?: string) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach(txn => {
    const dateObj = new Date(txn.date);
    const monthKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    if (selectedMonth && monthKey !== selectedMonth) return;

    const dateKey = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(txn);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({ title: date, data: groups[date] }));
}

// Get unique months from transactions
function getUniqueMonths(transactions: Transaction[]) {
  const months = transactions.map(txn => {
    const d = new Date(txn.date);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  });
  return Array.from(new Set(months)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

/* -------------------- SCREEN -------------------- */

export default function TransactionsScreen() {
  const { state, dispatch } = useTransactions();
  const { colors, isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

  const months = useMemo(() => getUniqueMonths(state.transactions), [state.transactions]);

  const handleUpload = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setIsLoading(false);
        return;
      }

      const file = result.assets[0];
      const importedTransactions = await importBankStatement(file);

      dispatch({
        type: 'SET_TRANSACTIONS',
        payload: [...importedTransactions, ...state.transactions],
      });

      Alert.alert('Success', `Imported ${importedTransactions.length} transactions`);
    } catch (error) {
      console.error('Bank import failed:', error);
      Alert.alert('Error', 'Failed to import bank statement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Transactions
      </Text>

      <View style={styles.uploadBox}>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isLoading}
          style={[
            styles.uploadButton,
            { backgroundColor: colors.primary },
            isLoading && { opacity: 0.6 }
          ]}
        >
          <Text style={[styles.uploadButtonText, { color: colors.textInverse }]}>
            {isLoading ? 'Uploading...' : 'Upload Bank Statement (PDF)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Month Selector */}
      {months.length > 0 && (
        <View style={styles.monthListWrapper}>
          <FlatList
            horizontal
            data={months}
            keyExtractor={item => item}
            contentContainerStyle={styles.monthList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedMonth(selectedMonth === item ? undefined : item)}
              style={[
                styles.monthItem,
                {
                  backgroundColor:
                    selectedMonth === item
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedMonth === item ? colors.textInverse : colors.text,
                  fontWeight: selectedMonth === item ? 'bold' : '600',
                  fontSize: 15,
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Processing bank statement…
          </Text>
        </View>
      )}

      {/* Date-wise Transactions */}
      <SectionList
        sections={groupTransactionsByDate(state.transactions, selectedMonth)}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.category, { color: colors.text }]}>
              {item.category}
            </Text>
            <Text
              style={[
                styles.amount,
                { color: item.type === 'expense' ? colors.expense : colors.income },
              ]}
            >
              ₹{item.amount}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  uploadBox: { marginBottom: 16 },
  uploadButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingBox: { alignItems: 'center', marginVertical: 20 },
  loadingText: { marginTop: 8, fontSize: 14 },
  sectionHeaderContainer: {
    paddingVertical: 8,
  },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  category: { fontSize: 16 },
  amount: { fontSize: 16, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  monthListWrapper: { 
    marginBottom: 12,
  },
  monthList: { 
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  monthItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});