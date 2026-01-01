import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

/* ============== Types & helpers ============== */
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

const resolveTxDate = (tx: Transaction): Date | null => {
  const raw = tx.date || tx.importedAt || tx.createdAt || tx.updatedAt;
  if (!raw) return null;
  if (typeof raw === 'object' && raw.toDate) return raw.toDate();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

export default function HeatmapScreen() {
  const router = useRouter();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyTotals, setDailyTotals] = useState<Map<number, number>>(new Map());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [selectedDayTxs, setSelectedDayTxs] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const alertShownRef = useRef(false);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  /* ============== derived ============== */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* ============== data fetching ============== */
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;
    const data = snap.data();
    setMonthlyLimit(data.monthlySpendingLimit || 0);
  };

  const fetchTransactions = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = collection(db, 'users', user.uid, 'transactions');
    const snapshot = await getDocs(ref);
    const list: Transaction[] = [];
    snapshot.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
    setTransactions(list);
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    alertShownRef.current = false;
    await Promise.all([fetchUserProfile(), fetchTransactions()]);
    setRefreshing(false);
  };

  /* ============== build heatmap totals ============== */
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

  const dailyLimit = useMemo(
    () => (monthlyLimit ? monthlyLimit / daysInMonth : 0),
    [monthlyLimit, daysInMonth],
  );

  /* ============== color logic (dark theme) ============== */
  const getDayColor = useCallback(
    (day: number) => {
      const amount = dailyTotals.get(day) || 0;
      if (!dailyLimit || amount === 0) return '#1A1C1E'; // base tile
      const percent = (amount / dailyLimit) * 100;
      if (percent > 100) return '#FF5F75'; // over
      if (percent > 70) return '#FFB347'; // warning
      return '#10B981'; // safe
    },
    [dailyLimit, dailyTotals],
  );

  /* ============== projection alert ============== */
  useEffect(() => {
    if (!monthlyLimit || alertShownRef.current) return;

    let totalSpent = 0;
    let activeDays = 0;
    dailyTotals.forEach(v => {
      if (v > 0) {
        totalSpent += v;
        activeDays++;
      }
    });
    if (activeDays === 0) return;

    const avg = totalSpent / activeDays;
    const projected = avg * daysInMonth;

    if (projected > monthlyLimit) {
      alertShownRef.current = true;
      Alert.alert(
        'Spending Alert ⚠️',
        `At your current pace, you may spend ₹${Math.round(
          projected,
        )}, which exceeds your monthly limit of ₹${monthlyLimit}.`,
      );
    }
  }, [dailyTotals, monthlyLimit, daysInMonth]);

  /* ============== selected day ============== */
  useEffect(() => {
    if (!selectedDay) return;
    const list = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const d = resolveTxDate(tx);
      return (
        d &&
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === selectedDay
      );
    });
    setSelectedDayTxs(list);
  }, [selectedDay, transactions, year, month]);

  const totalForSelectedDay =
    (selectedDay && dailyTotals.get(selectedDay)) || 0;

  const totalMonthSpent = useMemo(
    () => Array.from(dailyTotals.values()).reduce((a, b) => a + b, 0),
    [dailyTotals],
  );

  const highestDayValue = useMemo(
    () => Math.max(...Array.from(dailyTotals.values()), 0),
    [dailyTotals],
  );

  /* ============== weekly trend data for chart ============== */
  const weeklyTrendData = useMemo(() => {
    const result: {
      day: string;
      amount: number;
      isToday: boolean;
    }[] = [];
    const baseDate = new Date(year, month, daysInMonth);
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;

      const dayNum = d.getDate();
      const amount = dailyTotals.get(dayNum) || 0;
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      result.push({
        day: label,
        amount,
        isToday: key === todayKey,
      });
    }
    return result;
  }, [dailyTotals, month, year, daysInMonth, today]);

  const maxWeeklySpend = useMemo(
    () =>
      weeklyTrendData.reduce(
        (m, d) => (d.amount > m ? d.amount : m),
        0,
      ),
    [weeklyTrendData],
  );

  /* ============== month nav ============== */
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

  /* ============== loading ============== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  /* ============== UI ============== */
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spending Heatmap</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month selector & stats */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goPrevMonth}>
            <Ionicons name="chevron-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.monthInfo}>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Text style={styles.totalSpentLabel}>
              TOTAL SPENT: ₹{totalMonthSpent.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity onPress={goNextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Daily Average</Text>
            <Text style={styles.statValue}>
              ₹{(totalMonthSpent / daysInMonth || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Highest Day</Text>
            <Text style={[styles.statValue, { color: '#FF5F75' }]}>
              ₹{highestDayValue}
            </Text>
          </View>
        </View>

        {/* Weekly Trend Chart Component */}
        {weeklyTrendData.length > 0 && maxWeeklySpend > 0 && (
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Weekly Trend</Text>
              <Text style={styles.limitValue}>
                Goal: ₹{Math.round(dailyLimit)}/day
              </Text>
            </View>

            <View style={styles.chartArea}>
              {/* Dashed target line */}
              {dailyLimit > 0 && (
                <View
                  style={[
                    styles.limitLine,
                    {
                      bottom:
                        (dailyLimit / maxWeeklySpend) * 120 + 20,
                    },
                  ]}
                >
                  <View style={styles.limitLineDashed} />
                </View>
              )}

              {/* Bars */}
              <View style={styles.chartRow}>
                {weeklyTrendData.map((item, idx) => {
                  const barHeight = Math.max(
                    (item.amount / maxWeeklySpend) * 120,
                    6,
                  );
                  const isOverLimit = item.amount > dailyLimit;

                  return (
                    <View key={idx} style={styles.chartCol}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeight,
                              backgroundColor: isOverLimit
                                ? '#FF5F75'
                                : '#10B981',
                              opacity: item.isToday ? 1 : 0.6,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          item.isToday && styles.activeBarLabel,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Heatmap */}
        <View style={styles.heatmapContainer}>
          <View style={styles.weekLabels}>
            {weekDays.map((d, i) => (
              <Text key={i} style={styles.weekText}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {days.map(day => {
              const color = getDayColor(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.dayCell,
                    { backgroundColor: color },
                    selectedDay === day && styles.selectedDayCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      color === '#1A1C1E'
                        ? { color: '#4B5563' }
                        : { color: '#FFF' },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FFB347' }]} />
            <Text style={styles.legendText}>Warning</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF5F75' }]} />
            <Text style={styles.legendText}>Over</Text>
          </View>
        </View>

        {/* Detail card */}
        {selectedDay && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailDate}>
                  {new Date(year, month, selectedDay).toLocaleDateString(
                    'en-US',
                    { weekday: 'short', month: 'short', day: 'numeric' },
                  )}
                </Text>
                <Text style={styles.detailCount}>
                  {selectedDayTxs.length} transactions
                </Text>
              </View>
              <View style={styles.detailTotalContainer}>
                <Text style={styles.detailTotal}>
                  ₹{totalForSelectedDay.toFixed(2)}
                </Text>
                <View style={styles.onTrackBadge}>
                  <Text style={styles.onTrackText}>On Track</Text>
                </View>
              </View>
            </View>

            {selectedDayTxs.map(item => (
              <View key={item.id} style={styles.txItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cart-outline" size={20} color="#FFF" />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txCategory}>{item.category}</Text>
                  <Text style={styles.txNote}>{item.note || 'Expense'}</Text>
                </View>
                <Text style={styles.txAmount}>-₹{item.amount}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* DAY MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#0F1113' }}>
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <FlatList
            data={selectedDayTxs}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={{ padding: 20, color: '#E5E7EB' }}>
                No expenses for this day
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.txItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cart-outline" size={20} color="#FFF" />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txCategory}>{item.category}</Text>
                  <Text style={styles.txNote}>{item.note || 'Expense'}</Text>
                </View>
                <Text style={styles.txAmount}>-₹{item.amount}</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ============== styles: dark fintech theme + weekly chart ============== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1113' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1113',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  monthSelector: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  monthInfo: { alignItems: 'center', marginHorizontal: 20 },
  monthLabel: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  totalSpentLabel: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1C1E',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2F31',
  },
  statLabel: { color: '#9CA3AF', fontSize: 12 },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 4 },

  // Weekly trend styles (from your snippet)
  trendCard: {
    backgroundColor: '#1A1C1E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trendTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  limitValue: { color: '#9CA3AF', fontSize: 12 },

  chartArea: { height: 160, justifyContent: 'flex-end' },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  chartCol: { alignItems: 'center', flex: 1 },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: { width: 14, borderRadius: 7 },
  barLabel: {
    color: '#4B5563',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  activeBarLabel: { color: '#10B981' },

  limitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    height: 1,
  },
  limitLineDashed: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    width: '100%',
  },

  heatmapContainer: { backgroundColor: '#111315', paddingVertical: 10 },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  weekText: {
    color: '#4B5563',
    width: 40,
    textAlign: 'center',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayCell: { borderWidth: 2, borderColor: '#FFF' },
  dayText: { fontWeight: '600', fontSize: 13 },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#9CA3AF', fontSize: 12 },

  detailCard: {
    backgroundColor: '#1A1C1E',
    borderRadius: 28,
    padding: 20,
    marginTop: 25,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailDate: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  detailCount: { color: '#6B7280', fontSize: 12 },
  detailTotalContainer: { alignItems: 'flex-end' },
  detailTotal: { color: '#10B981', fontSize: 20, fontWeight: '700' },
  onTrackBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  onTrackText: { color: '#10B981', fontSize: 10, fontWeight: '700' },

  txItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2F31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1, marginLeft: 12 },
  txCategory: { color: '#FFF', fontWeight: '600' },
  txNote: { color: '#6B7280', fontSize: 12 },
  txAmount: { color: '#FFF', fontWeight: '700' },
});
