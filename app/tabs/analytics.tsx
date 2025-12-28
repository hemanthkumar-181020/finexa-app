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

import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32; // padding

const chartConfig = {
  backgroundGradientFrom: "#000",
  backgroundGradientTo: "#000",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForLabels: { fontWeight: "700" },
  propsForBackgroundLines: { stroke: "#00ff00", strokeWidth: 0.5 },
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

  // Updated category colors including new categories
  const categoryColors: Record<string, string> = {
    "Food": "#00ff00",        // Green
    "Transport": "#0ff",      // Cyan
    "Entertainment": "#ff00ff", // Magenta
    "Bills": "#ff9900",       // Orange
    "Other Expense": "#ff4444", // Red
    "Recharge": "#3366ff",    // Blue for Recharge
    "Education": "#9933ff",   // Purple for Education
    "Fuel": "#ff6600",        // Dark Orange for Fuel
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

      const API_URL = "https://female-harmonie-santhosh1307-cfbbd226.koyeb.app/predict";
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
      "Food", 
      "Transport", 
      "Entertainment", 
      "Bills", 
      "Other Expense",
      "Recharge",
      "Education", 
      "Fuel"
    ];
    
    for (let cat of categories) {
      // Adjust amounts based on category for more realistic demo data
      let amount = 0;
      switch(cat) {
        case "Food":
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
        case "Bills":
          amount = Math.floor(Math.random() * 7000) + 3000;
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

  // Prepare data for charts
  const labels = predictions.map(p => p.category);
  const amounts = predictions.map(p => p.amount);

  // Prepare data for Bar Chart with custom colors
  const barChartData = {
    labels: labels,
    datasets: [{
      data: amounts,
      colors: predictions.map((p, index) => 
        (opacity = 1) => categoryColors[p.category] || "#0ff"
      )
    }]
  };

  // Prepare data for Pie Chart
  const pieData = predictions.map(p => ({
    name: p.category,
    population: p.amount,
    color: categoryColors[p.category] || "#0ff",
    legendFontColor: "#fff",
    legendFontSize: 12
  }));

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Please log in to use predictions</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Spending Predictions</Text>

      {/* Days Selection */}
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

      {/* Chart Type Selector */}
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

      {/* Bar Chart */}
      {predictions.length > 0 && selectedChart === "Bar" && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Predicted Spending by Category</Text>
          <BarChart
            data={barChartData}
            width={screenWidth}
            height={300}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              barColors: predictions.map(p => categoryColors[p.category] || "#0ff"),
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForLabels: { 
                fontWeight: "700", 
                fontSize: 10,
                fill: "#fff"
              },
            }}
            fromZero
            showValuesOnTopOfBars
            withCustomBarColorFromData={true}
            flatColor={true}
            style={styles.chartStyle}
            verticalLabelRotation={30}
            segments={5}
            barPercentage={0.6}
          />
          
          {/* Category Labels */}
          <View style={styles.categoryLabelsContainer}>
            {predictions.map((p, i) => (
              <View key={i} style={styles.categoryLabelWrapper}>
                <View style={[styles.colorIndicator, { backgroundColor: categoryColors[p.category] || "#0ff" }]} />
                <Text style={styles.categoryLabelText}>
                  {p.category}: ₹{p.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pie Chart */}
      {predictions.length > 0 && selectedChart === "Pie" && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending Distribution</Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
            hasLegend={false}
          />
          
          {/* Custom Legend */}
          <View style={styles.legendContainer}>
            {predictions.map((p, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: categoryColors[p.category] || "#0ff" }]} />
                <Text style={styles.legendText}>
                  {p.category}: ₹{p.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Total Prediction */}
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
    color: "#0ff", 
    marginTop: 20, 
    marginBottom: 10, 
    textAlign: "center",
    textShadowColor: "#0ff",
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
    backgroundColor: "#0ff", 
    transform: [{ scale: 1.05 }],
    borderColor: "#0ff",
  },
  dayButtonText: { 
    color: "#0ff", 
    fontWeight: "700",
    fontSize: 12,
  },
  dayButtonTextActive: { 
    color: "#000",
    fontWeight: "800",
  },
  predictButton: { 
    backgroundColor: "#0ff", 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginHorizontal: 16, 
    marginBottom: 20,
    shadowColor: "#0ff",
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
    color: "#ff4d4d", 
    textAlign: "center", 
    marginVertical: 10, 
    fontWeight: "700",
    marginHorizontal: 16,
    padding: 10,
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4d4d",
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
    borderColor: "#0ff",
    minWidth: 80,
    alignItems: "center",
  },
  chartTypeButtonActive: { 
    backgroundColor: "#0ff",
  },
  chartTypeText: { 
    color: "#0ff", 
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
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  chartTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  categoryLabelsContainer: {
    marginTop: 20,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryLabelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "48%",
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryLabelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  legendContainer: {
    marginTop: 20,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "48%",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  totalContainer: {
    backgroundColor: "#111",
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0ff",
    alignItems: "center",
  },
  totalTitle: {
    color: "#0ff",
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