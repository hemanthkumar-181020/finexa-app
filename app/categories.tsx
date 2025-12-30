// app/categories/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const CATEGORY_CONFIG = {
  "Food & Dining": {
    icon: "silverware-fork-knife" as const,
    color: "#FF6B6B",
    description: "Restaurants, cafes, food delivery",
  },
  "Groceries": {
    icon: "cart-outline" as const,
    color: "#4ECDC4",
    description: "Supermarket shopping, vegetables, fruits",
  },
  "Travel": {
    icon: "airplane" as const,
    color: "#45B7D1",
    description: "Flights, hotels, vacations",
  },
  "Fuel": {
    icon: "gas-station" as const,
    color: "#FFA726",
    description: "Petrol, diesel, vehicle fuel",
  },
  "Shopping": {
    icon: "shopping-outline" as const,
    color: "#AB47BC",
    description: "Clothing, electronics, online shopping",
  },
  "Entertainment": {
    icon: "movie-open-outline" as const,
    color: "#5C6BC0",
    description: "Movies, concerts, events",
  },
  "Utilities": {
    icon: "lightning-bolt-outline" as const,
    color: "#FFEE58",
    description: "Electricity, water, internet bills",
  },
  "Recharge": {
    icon: "cellphone" as const,
    color: "#26C6DA",
    description: "Mobile, DTH, wallet recharge",
  },
  "Healthcare": {
    icon: "hospital-box-outline" as const,
    color: "#EF5350",
    description: "Medicines, doctor visits, health checkups",
  },
  "Education": {
    icon: "school-outline" as const,
    color: "#7E57C2",
    description: "Courses, books, tuition fees",
  },
  "Personal Care": {
    icon: "face-woman-shimmer-outline" as const,
    color: "#EC407A",
    description: "Salon, spa, grooming",
  },
  "Home & Kitchen": {
    icon: "home-outline" as const,
    color: "#66BB6A",
    description: "Furniture, appliances, home supplies",
  },
  "Vehicle Maintenance": {
    icon: "car-wrench" as const,
    color: "#8D6E63",
    description: "Repairs, servicing, insurance",
  },
  "Hobbies & Leisure": {
    icon: "soccer" as const,
    color: "#29B6F6",
    description: "Sports, hobbies, leisure activities",
  },
  "Gifts & Donations": {
    icon: "gift-outline" as const,
    color: "#FF7043",
    description: "Gifts, charity, donations",
  },
  "Business Expenses": {
    icon: "briefcase-outline" as const,
    color: "#78909C",
    description: "Office supplies, business travel",
  },
  "Technology & Software": {
    icon: "laptop" as const,
    color: "#26A69A",
    description: "Gadgets, software, subscriptions",
  },
  "Income / Transfer In": {
    icon: "cash-plus" as const,
    color: "#4CAF50",
    description: "Salary, transfers, income",
  },
  "Transfer Out": {
    icon: "bank-transfer-out" as const,
    color: "#F44336",
    description: "Transfers, payments to others",
  },
};

// Define non-selectable categories (income/transfer related)
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
      const filtered = categories.filter(cat =>
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

      // Fetch user data
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;

      const data = userSnap.data();
      const selectedCategories = data?.preferredCategoryNames || [];

      // Create categories list from all available categories
      const allCategories = Object.entries(CATEGORY_CONFIG).map(([name, config]) => {
        const isSelectable = !NON_SELECTABLE_CATEGORIES.includes(name);
        const isSelected = isSelectable ? selectedCategories.includes(name) : false;
        
        return {
          name,
          isSelected,
          icon: config.icon,
          color: config.color,
          description: config.description,
          isSelectable,
        };
      });

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
      
      let updatedCategories;
      if (currentCategories.includes(categoryName)) {
        // Remove category
        updatedCategories = currentCategories.filter((cat: string) => cat !== categoryName);
      } else {
        // Add category
        updatedCategories = [...currentCategories, categoryName];
      }

      await updateDoc(userRef, {
        preferredCategoryNames: updatedCategories,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setCategories(prev =>
        prev.map(cat =>
          cat.name === categoryName
            ? { ...cat, isSelected: !cat.isSelected }
            : cat
        )
      );

      // Success alert removed - changes happen silently
    } catch (error) {
      console.error("Error updating categories:", error);
      Alert.alert("Error", "Failed to update category");
    }
  };

  const handleEditGoal = (category: Category) => {
    // Fetch actual goals from user data
    const fetchUserGoals = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const userGoals = data?.goals || {};
          const currentGoal = userGoals[category.name] || 0;
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

        // Success alert removed - changes happen silently
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
    return categories.filter(cat => cat.isSelected && cat.isSelectable).length;
  };

  const getSelectableCategoriesCount = () => {
    return categories.filter(cat => cat.isSelectable).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={40} color="#4ADE80" />
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#E2E8F0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity
          onPress={fetchCategories}
          style={styles.refreshButton}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#4ADE80" />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="checkbox-multiple-marked" size={24} color="#4ADE80" />
          <Text style={styles.statValue}>{getSelectedCount()}</Text>
          <Text style={styles.statLabel}>Selected</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#45B7D1" />
          <Text style={styles.statValue}>{getSelectableCategoriesCount()}</Text>
          <Text style={styles.statLabel}>Selectable</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#FFA726" />
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories List */}
        <View style={styles.categoriesList}>
          {filteredCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify-remove" size={60} color="#666" />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term
              </Text>
            </View>
          ) : (
            filteredCategories.map((category) => (
              <View
                key={category.name}
                style={[
                  styles.categoryCard,
                  category.isSelected && styles.selectedCategoryCard,
                  !category.isSelectable && styles.nonSelectableCard,
                ]}
              >
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription} numberOfLines={1}>
                      {category.description}
                    </Text>
                  </View>
                  {category.isSelectable ? (
                    <TouchableOpacity
                      style={[
                        styles.selectionToggle,
                        category.isSelected && styles.selectedToggle,
                      ]}
                      onPress={() => toggleCategorySelection(category.name)}
                    >
                      <MaterialCommunityIcons
                        name={category.isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={20}
                        color={category.isSelected ? "#4ADE80" : "#666"}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.nonSelectableBadge}>
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.nonSelectableText}>Auto</Text>
                    </View>
                  )}
                </View>

                {category.isSelected && category.isSelectable && (
                  <TouchableOpacity
                    style={styles.editGoalButton}
                    onPress={() => handleEditGoal(category)}
                  >
                    <MaterialCommunityIcons
                      name="target"
                      size={14}
                      color="#666"
                    />
                    <Text style={styles.editGoalText}>Set Monthly Goal</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#4ADE80" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Managing Categories</Text>
            <Text style={styles.infoText}>
              • Select expense categories you want to track
              • Set monthly spending goals for selected categories
              • Income/Transfer categories are automatically tracked
              • Only selected categories appear in your dashboard
              • You can change selections anytime
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Goal Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editingCategory && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalCategoryIcon}>
                    <MaterialCommunityIcons
                      name={editingCategory.icon}
                      size={24}
                      color={editingCategory.color}
                    />
                  </View>
                  <Text style={styles.modalTitle}>{editingCategory.name}</Text>
                </View>

                <Text style={styles.modalSubtitle}>Set Monthly Goal</Text>
                
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencyLabel}>₹</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newGoalAmount}
                    onChangeText={setNewGoalAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#666"
                    autoFocus
                  />
                </View>

                <View style={styles.quickAmounts}>
                  <Text style={styles.quickAmountsLabel}>Quick Select:</Text>
                  <View style={styles.quickAmountsRow}>
                    {[1000, 2000, 5000, 10000, 15000].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={styles.quickAmountButton}
                        onPress={() => setNewGoalAmount(amount.toString())}
                      >
                        <Text style={styles.quickAmountText}>₹{amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingCategory(null);
                      setNewGoalAmount("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveGoal}
                  >
                    <Text style={styles.saveButtonText}>Save Goal</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1C1A",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "600",
  },
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1C1A",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D2F2D",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#2D2F2D",
  },
  statValue: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    color: "#666",
    fontSize: 10,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1C1A",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  searchInput: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 16,
    marginLeft: 12,
    padding: 0,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  categoryCard: {
    backgroundColor: "#1A1C1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  selectedCategoryCard: {
    backgroundColor: "#1A2C1A",
    borderColor: "#2D3E2D",
  },
  nonSelectableCard: {
    backgroundColor: "#1A1A1A",
    borderColor: "#2D2D2D",
    opacity: 0.7,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryDescription: {
    color: "#666",
    fontSize: 12,
  },
  selectionToggle: {
    padding: 4,
  },
  selectedToggle: {
    // Additional styles for selected state if needed
  },
  nonSelectableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D2F2D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nonSelectableText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  editGoalButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#2D2F2D",
    borderRadius: 8,
    marginTop: 12,
  },
  editGoalText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#1A2C1A",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D3E2D",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    color: "#A7F3A0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  infoText: {
    color: "#A7F3A0",
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1C1A",
    width: "90%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D2F2D",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2D2F2D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  modalSubtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#4ADE80",
    paddingBottom: 12,
    marginBottom: 20,
  },
  currencyLabel: {
    color: "#E2E8F0",
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 32,
    fontWeight: "bold",
    padding: 0,
  },
  quickAmounts: {
    marginBottom: 24,
  },
  quickAmountsLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
  },
  quickAmountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: "#2D2F2D",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickAmountText: {
    color: "#E2E8F0",
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#2D2F2D",
  },
  saveButton: {
    backgroundColor: "#4ADE80",
  },
  cancelButtonText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#0D0D0D",
    fontSize: 16,
    fontWeight: "bold",
  },
});