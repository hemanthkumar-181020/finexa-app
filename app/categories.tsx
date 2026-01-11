import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
};

const NON_SELECTABLE_CATEGORIES = ["Income / Transfer In", "Transfer Out"];

type Category = {
  name: string;
  isSelected: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  description: string;
  isSelectable: boolean;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newGoalAmount, setNewGoalAmount] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push("/(auth)/signup");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const selectedCategories = data?.preferredCategoryNames || [];

      const allCategories: Category[] = Object.entries(CATEGORY_CONFIG).map(
        ([name, config]) => {
          const isSelectable = !NON_SELECTABLE_CATEGORIES.includes(name);
          const isSelected = isSelectable
            ? selectedCategories.includes(name)
            : false;

          return {
            name,
            isSelected,
            icon: config.icon,
            color: config.color,
            description: config.description,
            isSelectable,
          };
        }
      );

      setCategories(allCategories);
      setFilteredCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = async (categoryName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const currentCategories = data?.preferredCategoryNames || [];

      let updatedCategories: string[];
      if (currentCategories.includes(categoryName)) {
        updatedCategories = currentCategories.filter(
          (cat: string) => cat !== categoryName
        );
      } else {
        updatedCategories = [...currentCategories, categoryName];
      }

      await updateDoc(userRef, {
        preferredCategoryNames: updatedCategories,
        updatedAt: new Date().toISOString(),
      });

      setCategories((prev) =>
        prev.map((cat) =>
          cat.name === categoryName
            ? { ...cat, isSelected: !cat.isSelected }
            : cat
        )
      );
    } catch (error) {
      console.error("Error updating categories:", error);
      Alert.alert("Error", "Failed to update category");
    }
  };

  const handleEditGoal = (category: Category) => {
    const fetchUserGoals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const userGoals = data?.goals || {};
          const currentGoal =
            userGoals[category.name] ||
            CATEGORY_CONFIG[category.name]?.defaultGoal ||
            0;
          setEditingCategory(category);
          setNewGoalAmount(currentGoal.toString());
          setShowEditModal(true);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchUserGoals();
  };

  const handleSaveGoal = async () => {
    if (!editingCategory) return;

    const amount = parseFloat(newGoalAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid goal amount");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const currentGoals = currentData?.goals || {};

        await updateDoc(userRef, {
          goals: {
            ...currentGoals,
            [editingCategory.name]: amount,
          },
        });

        setShowEditModal(false);
        setEditingCategory(null);
        setNewGoalAmount("");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", "Failed to save goal");
    }
  };

  const getSelectedCount = () => {
    return categories.filter((cat) => cat.isSelected && cat.isSelectable).length;
  };

  const getSelectableCategoriesCount = () => {
    return categories.filter((cat) => cat.isSelectable).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#10B981" />
          <Text style={styles.loadingText}>Loading categories...</Text>
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
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#10B981"
          />
        </Pressable>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <Pressable
          onPress={fetchCategories}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <MaterialCommunityIcons name="refresh" size={22} color="#10B981" />
        </Pressable>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color="#10B981"
            />
          </View>
          <Text style={styles.statValue}>{getSelectedCount()}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons name="grid" size={28} color="#34D399" />
          </View>
          <Text style={styles.statValue}>{getSelectableCategoriesCount()}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={28}
              color="#6EE7B7"
            />
          </View>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={22}
              color="#6B7280"
            />
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories List */}
        <View style={styles.categoriesList}>
          {filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="folder-search-outline"
                size={64}
                color="#374151"
              />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          ) : (
            filteredCategories.map((category) => (
              <Pressable
                key={category.name}
                style={({ pressed }) => [
                  styles.categoryCard,
                  category.isSelected && styles.selectedCategoryCard,
                  !category.isSelectable && styles.nonSelectableCard,
                  pressed && styles.categoryCardPressed,
                ]}
                onPress={() =>
                  category.isSelectable &&
                  toggleCategorySelection(category.name)
                }
                disabled={!category.isSelectable}
              >
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      {
                        backgroundColor: category.isSelected
                          ? `${category.color}25`
                          : "#1F2937",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={26}
                      color={category.color}
                    />
                  </View>

                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text
                      style={styles.categoryDescription}
                      numberOfLines={1}
                    >
                      {category.description}
                    </Text>
                  </View>

                  {category.isSelectable ? (
                    <View
                      style={[
                        styles.selectionToggle,
                        category.isSelected && styles.selectedToggle,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          category.isSelected
                            ? "check-circle"
                            : "circle-outline"
                        }
                        size={26}
                        color={category.isSelected ? "#10B981" : "#4B5563"}
                      />
                    </View>
                  ) : (
                    <View style={styles.nonSelectableBadge}>
                      <MaterialCommunityIcons
                        name="lock"
                        size={12}
                        color="#6B7280"
                      />
                      <Text style={styles.nonSelectableText}>Auto</Text>
                    </View>
                  )}
                </View>

                {category.isSelected && category.isSelectable && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.editGoalButton,
                      pressed && styles.editGoalButtonPressed,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEditGoal(category);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="target"
                      size={16}
                      color="#10B981"
                    />
                    <Text style={styles.editGoalText}>Set Monthly Goal</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color="#6B7280"
                    />
                  </Pressable>
                )}
              </Pressable>
            ))
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={24}
              color="#10B981"
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Quick Tips</Text>
            <Text style={styles.infoText}>
              • Tap categories to enable/disable tracking{"\n"}
              • Set monthly goals for better budgeting{"\n"}
              • Auto categories track automatically{"\n"}
              • Changes sync instantly across devices
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Goal Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {editingCategory && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalCategoryIcon,
                      { backgroundColor: `${editingCategory.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={editingCategory.icon}
                      size={28}
                      color={editingCategory.color}
                    />
                  </View>
                  <View style={styles.modalHeaderText}>
                    <Text style={styles.modalTitle}>
                      {editingCategory.name}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Set Monthly Budget Goal
                    </Text>
                  </View>
                </View>

                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencyLabel}>₹</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newGoalAmount}
                    onChangeText={setNewGoalAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    autoFocus
                  />
                </View>

                <View style={styles.quickAmounts}>
                  <Text style={styles.quickAmountsLabel}>Quick Select</Text>
                  <View style={styles.quickAmountsRow}>
                    {[1000, 2000, 5000, 10000, 15000].map((amount) => (
                      <Pressable
                        key={amount}
                        style={({ pressed }) => [
                          styles.quickAmountButton,
                          pressed && styles.quickAmountButtonPressed,
                        ]}
                        onPress={() => setNewGoalAmount(amount.toString())}
                      >
                        <Text style={styles.quickAmountText}>
                          ₹{amount}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      styles.cancelButton,
                      pressed && styles.cancelButtonPressed,
                    ]}
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingCategory(null);
                      setNewGoalAmount("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalButton,
                      styles.saveButton,
                      pressed && styles.saveButtonPressed,
                    ]}
                    onPress={handleSaveGoal}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#000"
                    />
                    <Text style={styles.saveButtonText}>Save Goal</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  headerTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  buttonPressed: {
    backgroundColor: "#1F2937",
    transform: [{ scale: 0.96 }],
  },
  statsContainer: {
    flexDirection: "row",
    margin: 20,
    padding: 20,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statValue: {
    color: "#F9FAFB",
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#6B7280",
    fontSize: 14,
  },
  categoryCard: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  selectedCategoryCard: {
    backgroundColor: "#0A2E1C",
    borderColor: "#10B981",
    borderWidth: 2,
  },
  nonSelectableCard: {
    backgroundColor: "#0A0A0A",
    borderColor: "#1F2937",
    opacity: 0.6,
  },
  categoryCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  categoryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  categoryDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "400",
  },
  selectionToggle: {
    padding: 4,
  },
  selectedToggle: {},
  nonSelectableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  nonSelectableText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  editGoalButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1F2937",
    borderRadius: 10,
    marginTop: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  editGoalButtonPressed: {
    backgroundColor: "#374151",
    transform: [{ scale: 0.97 }],
  },
  editGoalText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#0A2E1C",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#10B981",
    gap: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#10B98115",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    gap: 8,
  },
  infoTitle: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoText: {
    color: "#6EE7B7",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#0F172A",
    width: "100%",
    maxWidth: 400,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 16,
  },
  modalCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    color: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#10B981",
    paddingBottom: 16,
    marginBottom: 28,
    gap: 8,
  },
  currencyLabel: {
    color: "#10B981",
    fontSize: 36,
    fontWeight: "700",
  },
  modalInput: {
    flex: 1,
    color: "#F9FAFB",
    fontSize: 36,
    fontWeight: "700",
    padding: 0,
  },
  quickAmounts: {
    marginBottom: 28,
    gap: 12,
  },
  quickAmountsLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  quickAmountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  quickAmountButtonPressed: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  quickAmountText: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  cancelButtonPressed: {
    backgroundColor: "#374151",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonPressed: {
    backgroundColor: "#059669",
  },
  cancelButtonText: {
    color: "#9CA3AF",
  },
  saveButtonText: {
    color: "#000",
    fontWeight: "700",
  },
});
