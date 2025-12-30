import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock Data - In a real app, you would fetch this from Firestore
const MOCK_SPENDING = {
  '2025-12-18': 1200, // Danger
  '2025-12-19': 600,  // Warning
  '2025-12-21': 200,  // Safe
  '2025-12-27': 500,  // Safe (from your video)
};

export default function HeatmapScreen() {
  const router = useRouter();
  const [safeLimit] = useState(500);
  const [dangerLimit] = useState(1000);

  // Generate days for December 2025
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const getDayColor = (day: number) => {
    const dateKey = `2025-12-${day < 10 ? '0' + day : day}`;
    const amount = MOCK_SPENDING[dateKey as keyof typeof MOCK_SPENDING] || 0;

    if (amount === 0) return '#E2E8F0'; // No spending (Gray)
    if (amount >= dangerLimit) return '#EF4444'; // Danger (Red)
    if (amount > safeLimit) return '#F59E0B'; // Warning (Orange)
    return '#22C55E'; // Safe (Green)
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Heatmap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month Selector UI */}
        <View style={styles.selectorCard}>
           <View style={styles.tabContainer}>
              <TouchableOpacity style={styles.tabActive}><Text style={styles.tabTextActive}>YEAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tabInactive}><Text style={styles.tabTextInactive}>MONTH</Text></TouchableOpacity>
           </View>
           
           <View style={styles.monthNav}>
              <Ionicons name="chevron-back" size={20} color="#64748b" />
              <Text style={styles.monthText}>December 2025</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
           </View>

           {/* Heatmap Grid */}
           <View style={styles.grid}>
              {days.map((day) => (
                <View 
                  key={day} 
                  style={[styles.dayCell, { backgroundColor: getDayColor(day) }]}
                >
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
           </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
           <Text style={styles.legendTitle}>Thresholds</Text>
           <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>Safe (Up to ₹{safeLimit})</Text>
           </View>
           <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Danger (Above ₹{dangerLimit})</Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  backButton: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: 16 },
  selectorCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    padding: 4,
    marginBottom: 20
  },
  tabActive: { flex: 1, backgroundColor: '#FFF', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabInactive: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  tabTextActive: { fontWeight: 'bold', color: '#1E293B' },
  tabTextInactive: { color: '#64748b' },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  dayCell: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  dayText: { fontSize: 12, fontWeight: '600', color: '#1E293B' },
  legendContainer: { marginTop: 24, paddingHorizontal: 10 },
  legendTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendText: { fontSize: 14, color: '#475569' }
});