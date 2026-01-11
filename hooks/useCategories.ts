// hooks/useCategories.ts
import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as Haptics from "expo-haptics";

export type Category = {
  name: string;
  isSelected: boolean;
  icon: string;
  color: string;
  description: string;
  isSelectable: boolean;
  slug: string;
};

type CategoryGoals = {
  [key: string]: {
    limit: number;
    updatedAt: string;
  };
};

// Utility function to create safe keys
const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export function useCategories(
  categoryConfig: any,
  nonSelectableCategories: string[]
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<CategoryGoals>({});

  const fetchCategories = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        throw new Error("User document not found");
      }

      const data = userSnap.data();
      const selectedCategories = data?.preferredCategoryNames || [];
      const userGoals = data?.goals || {};

      const allCategories = Object.entries(categoryConfig).map(
        ([name, config]: [string, any]) => {
          const isSelectable = !nonSelectableCategories.includes(name);
          const isSelected = isSelectable
            ? selectedCategories.includes(name)
            : false;
          const slug = slugify(name);

          return {
            name,
            isSelected,
            icon: config.icon,
            color: config.color,
            description: config.description,
            isSelectable,
            slug,
          };
        }
      );

      setCategories(allCategories);
      setGoals(userGoals);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [categoryConfig, nonSelectableCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleCategorySelection = useCallback(
    async (categoryName: string) => {
      try {
        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const data = userSnap.data();
        const currentCategories = data?.preferredCategoryNames || [];

        let updatedCategories;
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

        // Optimistic update
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
        // Revert optimistic update on error
        fetchCategories();
      }
    },
    [fetchCategories]
  );

  const saveGoal = useCallback(
    async (categorySlug: string, amount: number) => {
      try {
        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const user = auth.currentUser;
        if (!user) return false;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const currentData = userSnap.data();
          const currentGoals = currentData?.goals || {};

          await updateDoc(userRef, {
            goals: {
              ...currentGoals,
              [categorySlug]: {
                limit: amount,
                updatedAt: new Date().toISOString(),
              },
            },
          });

          // Update local state
          setGoals((prev) => ({
            ...prev,
            [categorySlug]: {
              limit: amount,
              updatedAt: new Date().toISOString(),
            },
          }));

          return true;
        }
        return false;
      } catch (error) {
        console.error("Error saving goal:", error);
        Alert.alert("Error", "Failed to save goal");
        return false;
      }
    },
    []
  );

  const getGoalForCategory = useCallback(
    (categorySlug: string): number => {
      return goals[categorySlug]?.limit || 0;
    },
    [goals]
  );

  const getSelectedCount = useCallback(() => {
    return categories.filter((cat) => cat.isSelected && cat.isSelectable)
      .length;
  }, [categories]);

  const getSelectableCategoriesCount = useCallback(() => {
    return categories.filter((cat) => cat.isSelectable).length;
  }, [categories]);

  return {
    categories,
    loading,
    goals,
    fetchCategories,
    toggleCategorySelection,
    saveGoal,
    getGoalForCategory,
    getSelectedCount,
    getSelectableCategoriesCount,
  };
}