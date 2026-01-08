import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet
} from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../services/firebase";

import { PieChart } from "react-native-chart-kit";
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get("window").width - 32;

const chartConfig = {
  backgroundGradientFrom: "#000",
  backgroundGradientTo: "#000",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export default function SpendingPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [selectedChart, setSelectedChart] = useState<"Bar" | "Pie">("Bar");

  // Gradient colors for all categories [dark, light]
  const categoryGradients: Record<string, readonly [string, string]> = {
    // Income/Transfer
    "Income / Transfer In": ["#059669", "#10B981"], // Emerald Green
    
    // Core Expenses
    "Recharge": ["#3B82F6", "#60A5FA"], // Blue
    "Food & Dining": ["#EF4444", "#F87171"], // Red
    "Fuel": ["#F59E0B", "#FBBF24"], // Amber
    "Shopping": ["#8B5CF6", "#A78BFA"], // Purple
    "Groceries": ["#EC4899", "#F472B6"], // Pink
    "Travel": ["#06B6D4", "#22D3EE"], // Cyan
    "Entertainment": ["#F97316", "#FB923C"], // Orange
    "Utilities": ["#84CC16", "#A3E635"], // Lime Green
    "Education": ["#6366F1", "#818CF8"], // Indigo
    "Healthcare": ["#DC2626", "#EF4444"], // Dark Red
    "Banking & Finance": ["#0EA5E9", "#38BDF8"], // Sky Blue
    "Transfer Out": ["#6B7280", "#9CA3AF"], // Gray
    
    // Extended Coverage
    "Personal Care": ["#A855F7", "#C084FC"], // Light Purple
    "Home & Kitchen": ["#FACC15", "#FDE047"], // Yellow
    "Gifts & Donations": ["#E11D48", "#F43F5E"], // Rose
    "Business Expenses": ["#7C3AED", "#8B5CF6"], // Violet
    "Hobbies & Leisure": ["#14B8A6", "#2DD4BF"], // Teal
    "Vehicle Maintenance": ["#B45309", "#D97706"], // Amber Dark
    "Child & Family": ["#BE185D", "#DB2777"], // Pink Dark
    "Technology & Software": ["#1E40AF", "#3B82F6"], // Blue Dark
    
    // Fallback
    "Other Expense": ["#64748B", "#94A3B8"], // Slate Gray
    
    // Legacy categories for backward compatibility
    "Food": ["#EF4444", "#F87171"], // Red (mapped to Food & Dining)
    "Transport": ["#06B6D4", "#22D3EE"], // Cyan (mapped to Travel)
    "Bills": ["#6366F1", "#818CF8"], // Indigo (mapped to Utilities)
    "Other": ["#64748B", "#94A3B8"], // Slate Gray (mapped to Other Expense)
  };

  // Grid lines for bar chart background
  const renderGridLines = () => {
    return (
      <View style={styles.gridLinesContainer}>
        {[0, 1, 2, 3, 4].map((line) => (
          <View
            key={line}
            style={[
              styles.gridLine,
              {
                top: `${line * 20}%`,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserTransactions(user.uid);
      } else {
        setError("Please log in to see predictions");
        setUserId(null);
      }
    });
    return unsubscribe;
  }, []);

  async function fetchUserTransactions(uid: string) {
    try {
      const txRef = collection(db, "users", uid, "transactions");
      const snapshot = await getDocs(txRef);
      const userTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
          category: data.category || "Other Expense",
          amount: Number(data.amount) || 0
        };
      });
      setTransactions(userTransactions);
      setHasTransactions(userTransactions.length > 0);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load your transactions");
    }
  }

  async function handlePredict() {
    if (!userId) {
      setError("Please log in first");
      return;
    }
    if (!hasTransactions) {
      setError("No transactions found. Add some transactions first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPredictions([]);

      const API_URL = "https://spending-predict-api-5.onrender.com/predict";
     
      const requestData = { transactions, days: selectedDays };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error("Invalid JSON from API: " + text); }

      if (data.predictions && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
      } else {
        throw new Error("API returned invalid format");
      }

    } catch (err: any) {
      console.error("Prediction error:", err);
      setError("API connection failed. Showing demo data.");
      showDemoPredictions();
    } finally {
      setLoading(false);
    }
  }

  function showDemoPredictions() {
    const demoPredictions = [];
    const categories = [
      "Food & Dining", 
      "Transport", 
      "Entertainment", 
      "Utilities", 
      "Other Expense",
      "Recharge",
      "Education", 
      "Fuel",
      "Shopping",
      "Healthcare"
    ];
    
    for (let cat of categories) {
      let amount = 0;
      switch(cat) {
        case "Food & Dining":
          amount = Math.floor(Math.random() * 5000) + 2000;
          break;
        case "Transport":
          amount = Math.floor(Math.random() * 3000) + 1000;
          break;
        case "Fuel":
          amount = Math.floor(Math.random() * 4000) + 1500;
          break;
        case "Recharge":
          amount = Math.floor(Math.random() * 1000) + 500;
          break;
        case "Education":
          amount = Math.floor(Math.random() * 8000) + 3000;
          break;
        case "Utilities":
          amount = Math.floor(Math.random() * 7000) + 3000;
          break;
        case "Shopping":
          amount = Math.floor(Math.random() * 6000) + 2000;
          break;
        case "Healthcare":
          amount = Math.floor(Math.random() * 4000) + 1500;
          break;
        default:
          amount = Math.floor(Math.random() * 3000) + 500;
      }
      
      demoPredictions.push({
        category: cat,
        amount: amount,
        isDemo: true
      });
    }
    setPredictions(demoPredictions);
  }

  // Custom Test Tube Bar Component
  const TestTubeBar = ({ category, amount, maxAmount }: { category: string, amount: number, maxAmount: number }) => {
    const heightPercentage = (amount / maxAmount) * 100;
    const gradientColors = categoryGradients[category] || ["#64748B", "#94A3B8"];
    const [color1, color2] = gradientColors;
    
    return (
      <View style={styles.testTubeContainer}>
        {/* Amount Label on Top */}
        <Text style={styles.amountLabel}>₹{amount.toLocaleString('en-IN')}</Text>
        
        {/* Test Tube */}
        <View style={styles.testTubeOuter}>
          {/* Test tube body */}
          <View style={styles.testTubeBody}>
            {/* Filled portion with gradient */}
            <View style={[styles.testTubeFill, { height: `${heightPercentage}%` }]}>
              <LinearGradient
                colors={[color2, color1]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {/* Shine effect */}
                <View style={styles.shineEffect} />
              </LinearGradient>
            </View>
          </View>
        </View>
        
        {/* Category Label */}
        <Text style={styles.categoryLabel} numberOfLines={2}>{category}</Text>
      </View>
    );
  };

  const pieData = predictions.map(p => ({
    name: p.category,
    population: p.amount,
    color: categoryGradients[p.category]?.[0] || "#64748B",
    legendFontColor: "#fff",
    legendFontSize: 12
  }));

  const maxAmount = Math.max(...predictions.map(p => p.amount), 1);

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Please log in to use predictions</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Spending Predictions</Text>

      <View style={styles.daysButtons}>
        {[7, 14, 30, 60, 90].map(days => (
          <TouchableOpacity
            key={days}
            style={[styles.dayButton, selectedDays === days && styles.dayButtonActive]}
            onPress={() => setSelectedDays(days)}
          >
            <Text style={[styles.dayButtonText, selectedDays === days && styles.dayButtonTextActive]}>
              {days} Days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.predictButton, (!hasTransactions || loading) && styles.predictButtonDisabled]}
        onPress={handlePredict}
        disabled={!hasTransactions || loading}
      >
        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.predictButtonText}>Predict</Text>}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {predictions.length > 0 && (
        <View style={styles.chartTypeContainer}>
          {["Bar", "Pie"].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chartTypeButton,
                selectedChart === type && styles.chartTypeButtonActive
              ]}
              onPress={() => setSelectedChart(type as "Bar" | "Pie")}
            >
              <Text style={[
                styles.chartTypeText,
                selectedChart === type && styles.chartTypeTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {predictions.length > 0 && selectedChart === "Bar" && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Predicted Spending by Category</Text>
          
          <View style={styles.chartWithAxis}>
            {/* Grid Lines Background */}
            {renderGridLines()}
            
            {/* Y-Axis */}
            <View style={styles.yAxis}>
              {[5, 4, 3, 2, 1, 0].map((segment) => {
                const value = Math.round((maxAmount * segment) / 5);
                return (
                  <View key={segment} style={styles.yAxisLabel}>
                    <Text style={styles.yAxisText}>₹{value.toLocaleString('en-IN', { notation: 'compact' })}</Text>
                  </View>
                );
              })}
            </View>
            
            {/* Chart Area */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.testTubeScrollContent}
            >
              <View style={styles.testTubesRow}>
                {predictions.map((p, index) => (
                  <TestTubeBar 
                    key={index}
                    category={p.category}
                    amount={p.amount}
                    maxAmount={maxAmount}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

    {predictions.length > 0 && selectedChart === "Pie" && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Distribution</Text>
          
          {/* Use existing PieChart but with better styling */}
          <View style={styles.pieChartWrapper}>
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[10, 0]}
              absolute
              hasLegend={false}
            />
          </View>
          
          {/* Premium Card-based Legend */}
          <View style={styles.premiumLegendContainer}>
            {predictions.map((p, i) => {
              const total = predictions.reduce((sum, pr) => sum + pr.amount, 0);
              const percentage = ((p.amount / total) * 100).toFixed(1);
              const gradientColors = categoryGradients[p.category] || ["#64748B", "#94A3B8"];
              
              return (
                <View key={i} style={styles.legendCard}>
                  <View style={styles.legendCardLeft}>
                    <LinearGradient
                      colors={gradientColors}
                      style={styles.legendDot}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendCardCategory}>{p.category}</Text>
                      <Text style={styles.legendCardPercentage}>{percentage}%</Text>
                    </View>
                  </View>
                  <Text style={styles.legendCardAmount}>₹{p.amount.toLocaleString('en-IN')}</Text>
                </View>
              );
            })}
          </View>
          
          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>{predictions.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg/Category</Text>
              <Text style={styles.summaryValue}>
                ₹{(predictions.reduce((s, p) => s + p.amount, 0) / predictions.length).toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
)}

      {predictions.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalTitle}>Total Predicted Spending</Text>
          <Text style={styles.totalAmount}>
            ₹{predictions.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.totalPeriod}>for next {selectedDays} days</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 20,
    backgroundColor: "#000",
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
    backgroundColor: "#000"
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#34D399", 
    marginTop: 20, 
    marginBottom: 10, 
    textAlign: "center",
    textShadowColor: "#10B981",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  daysButtons: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    marginBottom: 20,
    marginHorizontal: 16,
  },
  dayButton: { 
    backgroundColor: "#111", 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 10, 
    margin: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  dayButtonActive: { 
    backgroundColor: "#34D399", 
    borderColor: "#10B981",
  },
  dayButtonText: { 
    color: "#34D399", 
    fontWeight: "700",
    fontSize: 12,
  },
  dayButtonTextActive: { 
    color: "#000",
    fontWeight: "800",
  },
  predictButton: { 
    backgroundColor: "#34D399", 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginHorizontal: 16, 
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  predictButtonDisabled: { 
    backgroundColor: "#555",
    shadowColor: "transparent",
  },
  predictButtonText: { 
    color: "#000", 
    fontWeight: "700", 
    fontSize: 16,
  },
  errorText: { 
    color: "#E6B1B1", 
    textAlign: "center", 
    marginVertical: 10, 
    fontWeight: "700",
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: "rgba(197, 122, 122, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C57A7A",
  },
  chartTypeContainer: {
    flexDirection: "row", 
    justifyContent: "center", 
    marginVertical: 12,
    marginHorizontal: 16,
  },
  chartTypeButton: {
    backgroundColor: "#111", 
    paddingHorizontal: 20,
    paddingVertical: 10, 
    borderRadius: 10, 
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#34D399",
    minWidth: 80,
    alignItems: "center",
  },
  chartTypeButtonActive: { 
    backgroundColor: "#34D399",
  },
  chartTypeText: { 
    color: "#34D399", 
    fontWeight: "700",
    fontSize: 14,
  },
  chartTypeTextActive: { 
    color: "#000",
    fontWeight: "800",
  },
  chartContainer: {
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  chartTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  chartWithAxis: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: 'relative',
    height: 280,
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 60,
    right: 0,
    top: 0,
    bottom: 40,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#064E3B',
  },
  yAxis: {
    width: 60,
    height: 230,
    justifyContent: "space-between",
    paddingRight: 8,
    paddingTop: 15,
  },
  yAxisLabel: {
    alignItems: "flex-end",
  },
  yAxisText: {
    color: "#888",
    fontSize: 10,
    fontWeight: "600",
  },
  testTubeScrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  testTubesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 260,
    paddingBottom: 10,
  },
  testTubeContainer: {
    alignItems: "center",
    marginHorizontal: 6,
    width: 55,
    height: 260,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  amountLabel: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    position: "absolute",
    top: 0,
  },
  testTubeOuter: {
    width: 32,
    height: 200,
    alignItems: "center",
  },
  testTubeBody: {
    width: 32,
    height: 200,
    backgroundColor: "#0a0a0a",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  testTubeFill: {
    width: "100%",
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  shineEffect: {
    position: "absolute",
    left: 3,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 12,
  },
  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 10,
  },
  premiumLegendContainer: {
    marginTop: 24,
    gap: 10,
  },
  legendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0a0a0a",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  legendCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendCardCategory: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  legendCardPercentage: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
  },
  legendCardAmount: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#222",
  },
  totalContainer: {
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#34D399",
    alignItems: "center",
  },
  totalTitle: {
    color: "#34D399",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 5,
  },
  totalPeriod: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
});