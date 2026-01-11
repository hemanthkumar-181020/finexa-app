
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

import { useSpendingPredictions } from "../../hooks/useSpendingPredictions";
import {
  CATEGORY_GRADIENTS,
  getCategoryGradient,
} from "../../constants/categoryGradients";
import { Colors } from "../../constants/theme";

const screenWidth = Dimensions.get("window").width - 32;

type ChartType = "Bar" | "Pie";

type CategoryConfig = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  defaultGoal: number;
  description: string;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "Food & Dining": {
    icon: "silverware-fork-knife",
    color: "#FF6B6B",
    defaultGoal: 10000,
    description: "Restaurants, cafes, and food deliveries",
  },
  Groceries: {
    icon: "cart-outline",
    color: "#4ECDC4",
    defaultGoal: 8000,
    description: "Supermarket and grocery shopping",
  },
  Travel: {
    icon: "airplane",
    color: "#45B7D1",
    defaultGoal: 15000,
    description: "Flights, trains, hotels, and cab rides",
  },
  Fuel: {
    icon: "gas-station",
    color: "#FFA726",
    defaultGoal: 5000,
    description: "Petrol, diesel, and gas station expenses",
  },
  Shopping: {
    icon: "shopping-outline",
    color: "#AB47BC",
    defaultGoal: 12000,
    description: "Clothing, electronics, and retail purchases",
  },
  Entertainment: {
    icon: "movie-open-outline",
    color: "#5C6BC0",
    defaultGoal: 6000,
    description: "Movies, concerts, and streaming services",
  },
  Utilities: {
    icon: "lightning-bolt-outline",
    color: "#FFEE58",
    defaultGoal: 7000,
    description: "Electricity, water, and internet bills",
  },
  Recharge: {
    icon: "cellphone",
    color: "#26C6DA",
    defaultGoal: 2000,
    description: "Mobile recharges and data packs",
  },
  Healthcare: {
    icon: "hospital-box-outline",
    color: "#EF5350",
    defaultGoal: 5000,
    description: "Medicines, doctor visits, and hospital bills",
  },
  Education: {
    icon: "school-outline",
    color: "#7E57C2",
    defaultGoal: 10000,
    description: "Tuition fees, books, and courses",
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline",
    color: "#EC407A",
    defaultGoal: 4000,
    description: "Salon, spa, and grooming services",
  },
  "Home & Kitchen": {
    icon: "home-outline",
    color: "#66BB6A",
    defaultGoal: 9000,
    description: "Home appliances and kitchen supplies",
  },
  "Vehicle Maintenance": {
    icon: "car-wrench",
    color: "#8D6E63",
    defaultGoal: 3000,
    description: "Car servicing and repairs",
  },
  "Hobbies & Leisure": {
    icon: "soccer",
    color: "#29B6F6",
    defaultGoal: 4000,
    description: "Sports, books, and hobby expenses",
  },
  "Gifts & Donations": {
    icon: "gift-outline",
    color: "#FF7043",
    defaultGoal: 3000,
    description: "Presents and charitable contributions",
  },
  "Business Expenses": {
    icon: "briefcase-outline",
    color: "#78909C",
    defaultGoal: 20000,
    description: "Office supplies and professional costs",
  },
  "Technology & Software": {
    icon: "laptop",
    color: "#26A69A",
    defaultGoal: 8000,
    description: "Gadgets, apps, and software subscriptions",
  },
  "Income / Transfer In": {
    icon: "cash-plus",
    color: "#4CAF50",
    defaultGoal: 0,
    description: "Salary, freelance, and incoming transfers",
  },
  "Transfer Out": {
    icon: "bank-transfer-out",
    color: "#F44336",
    defaultGoal: 0,
    description: "Money transfers to other accounts",
  },
  "Goal Contribution": {
    icon: "target",
    color: "#7c8331",          // green for saving/progress
    defaultGoal: 0,
    description: "Money moved into saving goals",
  },
};

const NON_SELECTABLE_CATEGORIES = ["Income / Transfer In", "Transfer Out"];






export default function AnalyticsScreen() {
  const router = useRouter();
  const [selectedChart, setSelectedChart] = useState<ChartType>("Bar");
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  const {
    userId,
    predictions,
    loading,
    error,
    selectedDays,
    hasTransactions,
    handlePredict,
    setDays,
    getTotalPredicted,
    getMaxAmount,
    getAveragePerCategory,
  } = useSpendingPredictions();

  const totalPredicted = getTotalPredicted();
  const maxAmount = getMaxAmount();
  const avgPerCategory = getAveragePerCategory();

  const filteredPredictions = predictions.filter((p) =>
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPredictions = [...filteredPredictions].sort(
    (a, b) => b.amount - a.amount
  );
  const top = sortedPredictions[0];

  if (!userId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Please log in to use analytics</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#10B981" />
        </Pressable>
        <Text style={styles.headerTitle}>Spending Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Insight Card */}
        {predictions.length === 0 && !loading && (
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Smart Spending Forecast</Text>
            <Text style={styles.heroSubtitle}>
              Analyze your past spending and predict where your money may go in
              the next {selectedDays} days.
            </Text>
            <View style={styles.heroHighlightsRow}>
              <View style={styles.heroChip}>
                <MaterialCommunityIcons
                  name="star-four-points-outline"
                  size={14}
                  color="#34D399"
                />
                <Text style={styles.heroChipText}>AI-powered insights</Text>
              </View>
              <View style={styles.heroChip}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={14}
                  color="#A7F3D0"
                />
                <Text style={styles.heroChipText}>Private & secure</Text>
              </View>
            </View>
          </View>
        )}

        {/* Days selector with recommended badge */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Forecast Range</Text>
        </View>
        <View style={styles.daysButtons}>
          {[7, 14, 30, 60, 90].map((days) => (
            <View key={days} style={{ position: "relative" }}>
              {days === 30 && (
                <Text style={styles.recommendedBadge}>Recommended</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  selectedDays === days && styles.dayButtonActive,
                ]}
                onPress={() => setDays(days)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays === days && styles.dayButtonTextActive,
                  ]}
                >
                  {days}d
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Predict button */}
        <TouchableOpacity
          style={[
            styles.predictButton,
            (!hasTransactions || loading) && styles.predictButtonDisabled,
          ]}
          onPress={handlePredict}
          disabled={!hasTransactions || loading}
        >
          {loading ? (
            <View style={styles.predictContentRow}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.predictButtonText}>Analyzing patterns...</Text>
            </View>
          ) : (
            <View style={styles.predictContentRow}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={18}
                color="#000"
              />
              <Text style={styles.predictButtonText}>Predict Spending</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Inline info for no transactions */}
        {!hasTransactions && (
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#FCD34D"
            />
            <Text style={styles.infoBannerText}>
              Add a few transactions to unlock personalized predictions.
            </Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color="#FCA5A5"
            />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Only show analytics when predictions available */}
        {predictions.length > 0 && (
          <>
            {/* Top summary chips */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total forecast</Text>
                <Text style={styles.statValue}>
                  ₹{totalPredicted.toLocaleString("en-IN")}
                </Text>
                <Text style={styles.statSub}>Next {selectedDays} days</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg / category</Text>
                <Text style={styles.statValue}>
                  ₹{avgPerCategory.toFixed(0)}
                </Text>
                <Text style={styles.statSub}>
                  {predictions.length} categories
                </Text>
              </View>
            </View>

            {/* Key Insights Card */}
            {top && (
              <View style={styles.insightsCard}>
                <View style={styles.insightsHeaderRow}>
                  <Text style={styles.insightsTitle}>Key Insights</Text>
                  <MaterialCommunityIcons
                    name="lightbulb-on-outline"
                    size={18}
                    color="#FBBF24"
                  />
                </View>
                <Text style={styles.insightsBullet}>
                  • Highest predicted spending:{" "}
                  <Text style={styles.insightsHighlight}>{top.category}</Text>{" "}
                  (₹{top.amount.toLocaleString("en-IN")}).
                </Text>
                <Text style={styles.insightsBullet}>
                  • Top {Math.min(3, sortedPredictions.length)} categories take{" "}
                  <Text style={styles.insightsHighlight}>
                    {getTopShare(sortedPredictions, totalPredicted)}%
                  </Text>{" "}
                  of your forecast.
                </Text>
                <Text style={styles.insightsBullet}>
                  • Consider reducing{" "}
                  <Text style={styles.insightsHighlight}>{top.category}</Text>{" "}
                  by 10–15% to stay under budget.
                </Text>
              </View>
            )}

            {/* Search within categories */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#6B7280"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Filter forecasted categories..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              )}
            </View>

            {/* Chart toggle (segmented control) */}
            <View style={styles.segmented}>
              {(["Bar", "Pie"] as ChartType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.segment,
                    selectedChart === type && styles.segmentActive,
                  ]}
                  onPress={() => setSelectedChart(type)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedChart === type && styles.segmentTextActive,
                    ]}
                  >
                    {type === "Bar" ? "Categories" : "Distribution"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Charts */}
            {selectedChart === "Bar" && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                  Predicted Spending by Category
                </Text>
                <View style={styles.chartWithAxis}>
                  <GridLines />
                  <View style={styles.yAxis}>
                    {[5, 4, 3, 2, 1, 0].map((segment) => {
                      const value = Math.round((maxAmount * segment) / 5);
                      return (
                        <View key={segment} style={styles.yAxisLabel}>
                          <Text style={styles.yAxisText}>
                            ₹
                            {value.toLocaleString("en-IN", {
                              notation: "compact",
                            })}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    contentContainerStyle={styles.testTubeScrollContent}
                  >
                    <View style={styles.testTubesRow}>
                      {sortedPredictions.map((p, index) => {
                        const isTop = top && p.category === top.category;
                        return (
                          <Pressable
                            key={`${p.category}-${index}`}
                            onPress={() =>
                              setFocusedCategory(
                                focusedCategory === p.category
                                  ? null
                                  : p.category
                              )
                            }
                          >
                            <TestTubeBar
                              category={p.category}
                              amount={p.amount}
                              maxAmount={maxAmount}
                              isTop={isTop}
                              isFocused={focusedCategory === p.category}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                {/* Focused tooltip */}
                {focusedCategory && (
                  <View style={styles.tooltipCard}>
                    <Text style={styles.tooltipTitle}>{focusedCategory}</Text>
                    <Text style={styles.tooltipText}>
                      ₹
                      {getAmountForCategory(
                        sortedPredictions,
                        focusedCategory
                      ).toLocaleString("en-IN")}{" "}
                      •{" "}
                      {getShareForCategory(
                        sortedPredictions,
                        totalPredicted,
                        focusedCategory
                      )}
                      % of total
                    </Text>
                  </View>
                )}
              </View>
            )}

            {selectedChart === "Pie" && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Spending Distribution</Text>
                <View style={styles.pieChartWrapper}>
                  <PieChart
                    data={sortedPredictions.map((p) => ({
                      name: p.category,
                      population: p.amount,
                      color: getCategoryGradient(p.category)[0],
                      legendFontColor: "#fff",
                      legendFontSize: 12,
                    }))}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: "#000",
                      backgroundGradientTo: "#000",
                      decimalPlaces: 0,
                      color: (opacity = 1) =>
                        `rgba(52, 211, 153, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"0"}
                    center={[10, 0]}
                    absolute
                    hasLegend={false}
                  />
                </View>

                {/* Premium legend with icons */}
                <View style={styles.premiumLegendContainer}>
                  {sortedPredictions.map((p, i) => {
                    const percentage = (
                      (p.amount / totalPredicted) *
                      100
                    ).toFixed(1);
                    const categoryConfig = CATEGORY_CONFIG[p.category] || {
                      icon: 'help-circle-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
                      color: '#64748B',
                    };
                    const gradientColors =
                      CATEGORY_GRADIENTS[p.category] || [
                        "#64748B",
                        "#94A3B8",
                      ];
                    const isActive = focusedCategory === p.category;
                    return (
                      <Pressable
                        key={`${p.category}-${i}`}
                        onPress={() =>
                          setFocusedCategory(
                            isActive ? null : p.category
                          )
                        }
                      >
                        <View
                          style={[
                            styles.legendCard,
                            isActive && styles.legendCardActive,
                          ]}
                        >
                          <View style={styles.legendCardLeft}>
                            <LinearGradient
                              colors={gradientColors}
                              style={styles.legendIconContainer}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                            >
                              <MaterialCommunityIcons
                                name={categoryConfig.icon}
                                size={20}
                                color="#FFFFFF"
                              />
                            </LinearGradient>
                            <View style={styles.legendTextContainer}>
                              <Text style={styles.legendCardCategory}>
                                {p.category}
                              </Text>
                              <Text style={styles.legendCardPercentage}>
                                {percentage}% of total
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.legendCardAmount}>
                            ₹{p.amount.toLocaleString("en-IN")}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Summary stats */}
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Categories</Text>
                    <Text style={styles.summaryValue}>
                      {predictions.length}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Avg / category</Text>
                    <Text style={styles.summaryValue}>
                      ₹{avgPerCategory.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Total forecast card */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalTitle}>Total Predicted Spending</Text>
              <Text style={styles.totalAmount}>
                ₹{totalPredicted.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.totalPeriod}>
                for next {selectedDays} days
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* Helpers */

function getTopShare(preds: { amount: number }[], total: number): string {
  if (!total || preds.length === 0) return "0.0";
  const top3 = preds.slice(0, 3).reduce((s, p) => s + p.amount, 0);
  return ((top3 / total) * 100).toFixed(1);
}

function getAmountForCategory(
  preds: { category: string; amount: number }[],
  cat: string
): number {
  const found = preds.find((p) => p.category === cat);
  return found ? found.amount : 0;
}

function getShareForCategory(
  preds: { category: string; amount: number }[],
  total: number,
  cat: string
): string {
  if (!total) return "0.0";
  const amount = getAmountForCategory(preds, cat);
  return ((amount / total) * 100).toFixed(1);
}

/* Small components */

type TestTubeProps = {
  category: string;
  amount: number;
  maxAmount: number;
  isTop: boolean;
  isFocused: boolean;
};

const TestTubeBar = ({
  category,
  amount,
  maxAmount,
  isTop,
  isFocused,
}: TestTubeProps) => {
  const heightPercentage = (amount / maxAmount) * 100;
  const [color1, color2] = getCategoryGradient(category);

  return (
    <View style={styles.testTubeContainer}>
      <Text style={styles.amountLabel}>
        ₹{amount.toLocaleString("en-IN")}
      </Text>
      <View style={styles.testTubeOuter}>
        <View
          style={[
            styles.testTubeBody,
            isTop && styles.testTubeBodyTop,
            isFocused && styles.testTubeBodyFocused,
          ]}
        >
          <View
            style={[styles.testTubeFill, { height: `${heightPercentage}%` }]}
          >
            <LinearGradient
              colors={[color2, color1]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.shineEffect} />
            </LinearGradient>
          </View>
        </View>
      </View>
      <Text style={styles.categoryLabel} numberOfLines={2}>
        {category}
      </Text>
    </View>
  );
};

const GridLines = () => (
  <View style={styles.gridLinesContainer}>
    {[0, 1, 2, 3, 4].map((line) => (
      <View
        key={line}
        style={[
          styles.gridLine,
          {
            top: `${line * 20}%`,
          },
        ]}
      />
    ))}
  </View>
);

/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop:24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  iconButtonPressed: {
    opacity: 0.5,
  },
  headerTitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "700",
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#22C55E33",
  },
  heroTitle: {
    color: "#A7F3D0",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  heroHighlightsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#05966955",
  },
  heroChipText: {
    color: "#f7f7f7",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    marginTop: 4,
    marginHorizontal: 16,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
  daysButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginHorizontal: 20,
    gap: 9,
  },
  dayButton: {
    backgroundColor: "#020817",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 990,
    borderWidth: 5,
    borderColor: "#1F2937",
  },
  dayButtonActive: {
    backgroundColor: "#020817",
    borderColor: "#4ADE80",
    
  },
  dayButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  dayButtonTextActive: {
    color: "#fefefe",
    fontWeight: "800",
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 9,
    color: "#022C22",
    fontWeight: "800",
  },
  predictButton: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    shadowColor: "#48b16f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  predictButtonDisabled: {
    backgroundColor: "#4B5563",
    shadowOpacity: 0,
  },
  predictContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  predictButtonText: {
    color: "#022C22",
    fontWeight: "800",
    fontSize: 15,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    gap: 8,
    marginBottom: 8,
  },
  infoBannerText: {
    color: "#E5E7EB",
    fontSize: 12,
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#451A1A",
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: {
    color: "#FECACA",
    fontSize: 12,
    flex: 1,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#60a884",
  },
  statLabel: {
    color: "#a4dece",
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "800",
  },
  statSub: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 3,
  },
  insightsCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#020817",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  insightsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  insightsTitle: {
    color: "#71bb94",
    fontSize: 13,
    fontWeight: "700",
  },
  insightsBullet: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
  },
  insightsHighlight: {
    color: "#FDE68A",
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#d5d7dc",
    fontSize: 13,
    paddingVertical: 0,
  },
  segmented: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 5,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  segment: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
   
  },
  segmentActive: {
    backgroundColor: "#88ecad",
  },
  segmentText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#022C22",
    fontWeight: "800",
  },
  chartContainer: {
    backgroundColor: "#000000",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#111827",
  },
  chartTitle: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
    textAlign: "center",
  },
  chartWithAxis: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    height: 260,
  },
  gridLinesContainer: {
    position: "absolute",
    left: 60,
    right: 0,
    top: 0,
    bottom: 40,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#064E3B",
  },
  yAxis: {
    width: 60,
    height: 220,
    justifyContent: "space-between",
    paddingRight: 8,
    paddingTop: 10,
  },
  yAxisLabel: {
    alignItems: "flex-end",
  },
  yAxisText: {
    color: "#6B7280",
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
    height: 240,
    paddingBottom: 10,
  },
  testTubeContainer: {
    alignItems: "center",
    marginHorizontal: 6,
    width: 55,
    height: 240,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  amountLabel: {
    color: "#E5E7EB",
    fontSize: 9,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    position: "absolute",
    top: 0,
  },
  testTubeOuter: {
    width: 32,
    height: 180,
    alignItems: "center",
  },
  testTubeBody: {
    width: 32,
    height: 180,
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1F2937",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  testTubeBodyTop: {
    borderColor: "#22C55E",
  },
  testTubeBodyFocused: {
    borderColor: "#FBBF24",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
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
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 2,
  },
  categoryLabel: {
    color: "#E5E7EB",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 12,
  },
  tooltipCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#0B1120",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  tooltipTitle: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  tooltipText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 10,
    marginLeft:"50%",
  },
  premiumLegendContainer: {
    marginTop: 18,
    gap: 12,
  },
  legendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#111827',
  },
  legendCardActive: {
    borderColor: '#22C55E',
    backgroundColor: '#022C22',
    transform: [{ scale: 1.02 }],
  },
  legendCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  legendIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendCardCategory: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  legendCardPercentage: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  legendCardAmount: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "800",
  },
  summaryDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#111827",
  },
  totalContainer: {
    backgroundColor: "#020617",
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 32,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#22C55E",
    alignItems: "center",
  },
  totalTitle: {
    color: "#A7F3D0",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  totalAmount: {
    color: "#F9FAFB",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  totalPeriod: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
});