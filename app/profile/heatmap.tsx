// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// // Mock Data - In a real app, you would fetch this from Firestore
// const MOCK_SPENDING = {
//   '2025-12-18': 1200, // Danger
//   '2025-12-19': 600,  // Warning
//   '2025-12-21': 200,  // Safe
//   '2025-12-27': 500,  // Safe (from your video)
// };

// export default function HeatmapScreen() {
//   const router = useRouter();
//   const [safeLimit] = useState(500);
//   const [dangerLimit] = useState(1000);

//   // Generate days for December 2025
//   const days = Array.from({ length: 31 }, (_, i) => i + 1);

//   const getDayColor = (day: number) => {
//     const dateKey = `2025-12-${day < 10 ? '0' + day : day}`;
//     const amount = MOCK_SPENDING[dateKey as keyof typeof MOCK_SPENDING] || 0;

//     if (amount === 0) return '#E2E8F0'; // No spending (Gray)
//     if (amount >= dangerLimit) return '#EF4444'; // Danger (Red)
//     if (amount > safeLimit) return '#F59E0B'; // Warning (Orange)
//     return '#22C55E'; // Safe (Green)
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="chevron-back" size={24} color="#111827" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Expense Heatmap</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Month Selector UI */}
//         <View style={styles.selectorCard}>
//            <View style={styles.tabContainer}>
//               <TouchableOpacity style={styles.tabActive}><Text style={styles.tabTextActive}>YEAR</Text></TouchableOpacity>
//               <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabTextInactive}>MONTH</Text></TouchableOpacity>
//            </View>
           
//            <View style={styles.monthNav}>
//               <Ionicons name="chevron-back" size={20} color="#64748b" />
//               <Text style={styles.monthText}>December 2025</Text>
//               <Ionicons name="chevron-forward" size={20} color="#64748b" />
//            </View>

//            {/* Heatmap Grid */}
//            <View style={styles.grid}>
//               {days.map((day) => (
//                 <View 
//                   key={day} 
//                   style={[styles.dayCell, { backgroundColor: getDayColor(day) }]}
//                 >
//                   <Text style={styles.dayText}>{day}</Text>
//                 </View>
//               ))}
//            </View>
//         </View>

//         {/* Legend */}
//         <View style={styles.legendContainer}>
//            <Text style={styles.legendTitle}>Thresholds</Text>
//            <View style={styles.legendRow}>
//               <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
//               <Text style={styles.legendText}>Safe (Up to ₹{safeLimit})</Text>
//            </View>
//            <View style={styles.legendRow}>
//               <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
//               <Text style={styles.legendText}>Danger (Above ₹{dangerLimit})</Text>
//            </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   header: {
//     height: Platform.OS === 'ios' ? 100 : 70,
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     backgroundColor: '#FFF',
//   },
//   backButton: { width: 40, alignItems: 'center' },
//   headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
//   scrollContent: { padding: 16 },
//   selectorCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 24,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     elevation: 2,
//   },
//   tabContainer: { 
//     flexDirection: 'row', 
//     backgroundColor: '#F1F5F9', 
//     borderRadius: 12, 
//     padding: 4,
//     marginBottom: 20
//   },
//   tabActive: { flex: 1, backgroundColor: '#FFF', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
//   tabInactive: { flex: 1, paddingVertical: 8, alignItems: 'center' },
//   tabTextActive: { fontWeight: 'bold', color: '#1E293B' },
//   tabTextInactive: { color: '#64748b' },
//   monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
//   monthText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
//   dayCell: { 
//     width: 40, 
//     height: 40, 
//     borderRadius: 8, 
//     alignItems: 'center', 
//     justifyContent: 'center',
//   },
//   dayText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
//   legendContainer: { marginTop: 24, paddingHorizontal: 10 },
//   legendTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
//   legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//   dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
//   legendText: { fontSize: 14, color: '#475569' }
// });

////////////...............new............................................................................................................................................

// app/screens/HeatmapScreen.tsx
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   Modal,
//   FlatList,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { collection, getDocs } from 'firebase/firestore';
// import { auth, db } from '../../services/firebase';

// /* ===============================
//    Transaction Type
// ================================ */
// export type Transaction = {
//   id: string;
//   amount: number;
//   type: 'income' | 'expense';
//   category: string;
//   date?: string;
//   note?: string;
//   source?: 'bank' | 'manual';
//   utr?: string;
//   createdAt?: any;
//   updatedAt?: any;
//   importedAt?: any;
// };

// /* ===============================
//    Resolve transaction date
// ================================ */
// const resolveTxDate = (tx: Transaction): Date | null => {
//   const raw =
//     tx.date ||
//     tx.importedAt ||
//     tx.createdAt ||
//     tx.updatedAt;

//   if (!raw) return null;

//   // Firestore Timestamp support
//   if (typeof raw === 'object' && raw.toDate) {
//     return raw.toDate();
//   }

//   const d = new Date(raw);
//   return isNaN(d.getTime()) ? null : d;
// };

// export default function HeatmapScreen() {
//   const router = useRouter();

//   /* ===============================
//      CURRENT MONTH / YEAR
//   ================================ */
//   const today = new Date();
//   const [year, setYear] = useState(today.getFullYear());
//   const [month, setMonth] = useState(today.getMonth()); // 0-based

//   const [safeLimit] = useState(500);
//   const [dangerLimit] = useState(1000);

//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [dailyTotals, setDailyTotals] = useState<Map<number, number>>(new Map());

//   const [selectedDayTxs, setSelectedDayTxs] = useState<Transaction[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   /* ===============================
//      DAYS IN MONTH
//   ================================ */
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

//   /* ===============================
//      FETCH FROM FIRESTORE
//      /users/{userId}/transactions
//   ================================ */
//   const fetchTransactions = useCallback(async () => {
//     const user = auth.currentUser;
//     if (!user) {
//       console.warn('User not logged in');
//       setTransactions([]);
//       return;
//     }

//     const ref = collection(db, 'users', user.uid, 'transactions');
//     const snapshot = await getDocs(ref);

//     const list: Transaction[] = [];

//     snapshot.forEach(doc => {
//       list.push({
//         id: doc.id,
//         ...(doc.data() as Omit<Transaction, 'id'>),
//       });
//     });

//     setTransactions(list);
//   }, []);

//   /* ===============================
//      INITIAL LOAD
//   ================================ */
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         await fetchTransactions();
//       } catch (e) {
//         console.error('Firestore fetch error', e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [fetchTransactions]);

//   /* ===============================
//      PULL TO REFRESH (FIXED)
//   ================================ */
//   const onRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await fetchTransactions();
//     } catch (e) {
//       console.error('Refresh error', e);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   /* ===============================
//      BUILD HEATMAP (O(n))
//   ================================ */
//   useEffect(() => {
//     const map = new Map<number, number>();

//     for (const tx of transactions) {
//       if (tx.type !== 'expense') continue;

//       const d = resolveTxDate(tx);
//       if (!d) continue;

//       if (d.getFullYear() !== year || d.getMonth() !== month) continue;

//       const day = d.getDate();
//       map.set(day, (map.get(day) || 0) + Number(tx.amount || 0));
//     }

//     setDailyTotals(map);
//   }, [transactions, year, month]);

//   /* ===============================
//      COLOR LOGIC
//   ================================ */
//   const getDayColor = useMemo(() => {
//     return (day: number) => {
//       const amount = dailyTotals.get(day) || 0;
//       if (amount === 0) return '#E2E8F0';
//       if (amount >= dangerLimit) return '#EF4444';
//       if (amount > safeLimit) return '#F59E0B';
//       return '#22C55E';
//     };
//   }, [dailyTotals, safeLimit, dangerLimit]);

//   /* ===============================
//      DAY TAP
//   ================================ */
//   const onPressDay = (day: number) => {
//     const list = transactions.filter(tx => {
//       if (tx.type !== 'expense') return false;
//       const d = resolveTxDate(tx);
//       return (
//         d &&
//         d.getFullYear() === year &&
//         d.getMonth() === month &&
//         d.getDate() === day
//       );
//     });

//     setSelectedDayTxs(list);
//     setModalVisible(true);
//   };

//   /* ===============================
//      MONTH NAVIGATION
//   ================================ */
//   const goPrevMonth = () => {
//     if (month === 0) {
//       setMonth(11);
//       setYear(y => y - 1);
//     } else setMonth(m => m - 1);
//   };

//   const goNextMonth = () => {
//     if (month === 11) {
//       setMonth(0);
//       setYear(y => y + 1);
//     } else setMonth(m => m + 1);
//   };

//   const monthLabel = new Date(year, month).toLocaleString('default', {
//     month: 'long',
//     year: 'numeric',
//   });

//   /* ===============================
//      LOADING STATE
//   ================================ */
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text>Loading heatmap…</Text>
//       </View>
//     );
//   }

//   /* ===============================
//      UI
//   ================================ */
//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="chevron-back" size={24} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Expense Heatmap</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.selectorCard}>
//           <View style={styles.monthNav}>
//             <TouchableOpacity onPress={goPrevMonth}>
//               <Ionicons name="chevron-back" size={20} />
//             </TouchableOpacity>
//             <Text style={styles.monthText}>{monthLabel}</Text>
//             <TouchableOpacity onPress={goNextMonth}>
//               <Ionicons name="chevron-forward" size={20} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.grid}>
//             {days.map(day => (
//               <TouchableOpacity
//                 key={day}
//                 style={[styles.dayCell, { backgroundColor: getDayColor(day) }]}
//                 onPress={() => onPressDay(day)}
//               >
//                 <Text style={styles.dayText}>{day}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </ScrollView>

//       {/* DAY MODAL */}
//       <Modal visible={modalVisible} animationType="slide">
//         <View style={{ flex: 1 }}>
//           <TouchableOpacity
//             style={{ padding: 16 }}
//             onPress={() => setModalVisible(false)}
//           >
//             <Ionicons name="close" size={24} />
//           </TouchableOpacity>

//           <FlatList
//             data={selectedDayTxs}
//             keyExtractor={item => item.id}
//             ListEmptyComponent={
//               <Text style={{ padding: 20 }}>No expenses for this day</Text>
//             }
//             renderItem={({ item }) => (
//               <View style={styles.txRow}>
//                 <Text style={styles.txCategory}>{item.category}</Text>
//                 <Text style={styles.txAmount}>₹{item.amount}</Text>
//               </View>
//             )}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// }

// /* ===============================
//    STYLES
// ================================ */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAFC' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   header: {
//     height: Platform.OS === 'ios' ? 100 : 70,
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     backgroundColor: '#FFF',
//   },
//   headerTitle: { fontSize: 20, fontWeight: '800' },

//   scrollContent: { padding: 16 },

//   selectorCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 24,
//     padding: 20,
//   },

//   monthNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   monthText: { fontSize: 16, fontWeight: '600' },

//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     justifyContent: 'center',
//   },
//   dayCell: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dayText: { fontWeight: '600' },

//   txRow: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E5E7EB',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   txCategory: { fontWeight: '600' },
//   txAmount: { fontWeight: '700' },
// });


//gotcha........................................................................................................................................................................................
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

/* =========================
   Transaction Type
========================= */
export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date?: string;
  note?: string;
  source?: 'bank' | 'manual';
  utr?: string;
  createdAt?: any;
  updatedAt?: any;
  importedAt?: any;
};

/* =========================
   Resolve transaction date
========================= */
const resolveTxDate = (tx: Transaction): Date | null => {
  const raw =
    tx.date ||
    tx.importedAt ||
    tx.createdAt ||
    tx.updatedAt;

  if (!raw) return null;

  if (typeof raw === 'object' && raw.toDate) {
    return raw.toDate();
  }

  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

export default function HeatmapScreen() {
  const router = useRouter();

  /* =========================
     CURRENT MONTH/YEAR
  ========================= */
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  /* =========================
     USER PROFILE DATA
  ========================= */
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  /* =========================
     DATA STATE
  ========================= */
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Map<number, number>>(new Map());

  const [selectedDayTxs, setSelectedDayTxs] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const alertShownRef = useRef(false);

  /* =========================
     DAYS IN MONTH
  ========================= */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* =========================
     FETCH USER PROFILE
  ========================= */
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;

    const data = snap.data();
    setMonthlyLimit(data.monthlySpendingLimit || 0);
  };

  /* =========================
     FETCH TRANSACTIONS
  ========================= */
  const fetchTransactions = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, 'users', user.uid, 'transactions');
    const snapshot = await getDocs(ref);

    const list: Transaction[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...(doc.data() as any) });
    });

    setTransactions(list);
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchUserProfile(), fetchTransactions()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchTransactions]);

  /* =========================
     PULL TO REFRESH
  ========================= */
  const onRefresh = async () => {
    setRefreshing(true);
    alertShownRef.current = false;
    await Promise.all([fetchUserProfile(), fetchTransactions()]);
    setRefreshing(false);
  };

  /* =========================
     BUILD HEATMAP (O(n))
  ========================= */
  useEffect(() => {
    const map = new Map<number, number>();

    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;

      const d = resolveTxDate(tx);
      if (!d) continue;

      if (d.getFullYear() !== year || d.getMonth() !== month) continue;

      const day = d.getDate();
      map.set(day, (map.get(day) || 0) + Number(tx.amount || 0));
    }

    setDailyTotals(map);
  }, [transactions, year, month]);

  /* =========================
     DAILY LIMITS
  ========================= */
  const dailyLimit = useMemo(() => {
    if (!monthlyLimit) return 0;
    return monthlyLimit / daysInMonth;
  }, [monthlyLimit, daysInMonth]);

  /* =========================
     COLOR LOGIC (REQUESTED)
  ========================= */
  const getDayColor = useMemo(() => {
    return (day: number) => {
      const amount = dailyTotals.get(day) || 0;

      if (!dailyLimit || amount === 0) return '#E2E8F0';

      const percent = (amount / dailyLimit) * 100;

      if (percent > 100) return '#EF4444';       // Red
      if (percent > 70) return '#F59E0B';        // Yellow
      return '#22C55E';                          // Green
    };
  }, [dailyTotals, dailyLimit]);

  /* =========================
     PROJECTION ALERT
  ========================= */
  useEffect(() => {
    if (!monthlyLimit || alertShownRef.current) return;

    let totalSpent = 0;
    let activeDays = 0;

    dailyTotals.forEach(val => {
      if (val > 0) {
        totalSpent += val;
        activeDays++;
      }
    });

    if (activeDays === 0) return;

    const avgDailySpend = totalSpent / activeDays;
    const projectedMonthSpend = avgDailySpend * daysInMonth;

    if (projectedMonthSpend > monthlyLimit) {
      alertShownRef.current = true;
      Alert.alert(
        'Spending Alert ⚠️',
        `At your current pace, you may spend ₹${Math.round(
          projectedMonthSpend
        )}, which exceeds your monthly limit of ₹${monthlyLimit}.`
      );
    }
  }, [dailyTotals, monthlyLimit, daysInMonth]);

  /* =========================
     DAY PRESS
  ========================= */
  const onPressDay = (day: number) => {
    const list = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const d = resolveTxDate(tx);
      return (
        d &&
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

    setSelectedDayTxs(list);
    setModalVisible(true);
  };

  /* =========================
     MONTH NAV
  ========================= */
  const goPrevMonth = () => {
    alertShownRef.current = false;
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  };

  const goNextMonth = () => {
    alertShownRef.current = false;
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  };

  const monthLabel = new Date(year, month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading heatmap…</Text>
      </View>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Heatmap</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.selectorCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goPrevMonth}>
              <Ionicons name="chevron-back" size={20} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthLabel}</Text>
            <TouchableOpacity onPress={goNextMonth}>
              <Ionicons name="chevron-forward" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayCell, { backgroundColor: getDayColor(day) }]}
                onPress={() => onPressDay(day)}
              >
                <Text style={styles.dayText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* DAY MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ padding: 16 }} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} />
          </TouchableOpacity>

          <FlatList
            data={selectedDayTxs}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ padding: 20 }}>No expenses for this day</Text>}
            renderItem={({ item }) => (
              <View style={styles.txRow}>
                <Text style={styles.txCategory}>{item.category}</Text>
                <Text style={styles.txAmount}>₹{item.amount}</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  scrollContent: { padding: 16 },

  selectorCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },

  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthText: { fontSize: 16, fontWeight: '600' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontWeight: '600' },

  txRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txCategory: { fontWeight: '600' },
  txAmount: { fontWeight: '700' },
});
