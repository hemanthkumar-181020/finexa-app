// app/hooks/useSpendingPredictions.ts
import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import * as Haptics from "expo-haptics";
import { auth, db } from "../services/firebase";

export type Transaction = {
  id: string;
  date: string;
  category: string;
  amount: number;
};

export type Prediction = {
  category: string;
  amount: number;
  isDemo?: boolean;
};

const API_URL = "https://spending-predict-api-5.onrender.com/predict";

const DEMO_CATEGORIES = [
  { name: "Food & Dining", min: 2000, max: 5000 },
  { name: "Transport", min: 1000, max: 3000 },
  { name: "Fuel", min: 1500, max: 4000 },
  { name: "Recharge", min: 500, max: 1000 },
  { name: "Education", min: 3000, max: 8000 },
  { name: "Utilities", min: 3000, max: 7000 },
  { name: "Shopping", min: 2000, max: 6000 },
  { name: "Healthcare", min: 1500, max: 4000 },
  { name: "Entertainment", min: 500, max: 3000 },
  { name: "Other Expense", min: 500, max: 3000 },
];

export function useSpendingPredictions() {
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(7);

  const hasTransactions = transactions.length > 0;

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async (uid: string) => {
    try {
      const txRef = collection(db, "users", uid, "transactions");
      const snapshot = await getDocs(txRef);

      const userTransactions: Transaction[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          date:
            data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
          category: data.category || "Other Expense",
          amount: Number(data.amount) || 0,
        };
      });

      setTransactions(userTransactions);

      if (userTransactions.length === 0) {
        setError("No transactions found. Add some transactions first.");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load your transactions");
    }
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserTransactions(user.uid);
      } else {
        setError("Please log in to see predictions");
        setUserId(null);
        setTransactions([]);
      }
    });
    return unsubscribe;
  }, [fetchUserTransactions]);

  // Demo predictions
  const generateDemoPredictions = useCallback((): Prediction[] => {
    return DEMO_CATEGORIES.map(({ name, min, max }) => ({
      category: name,
      amount: Math.floor(Math.random() * (max - min + 1)) + min,
      isDemo: true,
    }));
  }, []);

  // API call + haptics + fallback
  const handlePredict = useCallback(async () => {
    if (!userId) {
      setError("Please log in first");
      return;
    }

    if (!hasTransactions) {
      setError("No transactions found. Add some transactions first.");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setLoading(true);
      setError(null);
      setPredictions([]);

      const requestData = { transactions, days: selectedDays };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const text = await res.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from API: " + text);
      }

      if (data.predictions && Array.isArray(data.predictions)) {
        const normalized: Prediction[] = data.predictions.map((p: any) => ({
          category: String(p.category),
          amount: Number(p.amount) || 0,
        }));
        setPredictions(normalized);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        throw new Error("API returned invalid format");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError("API connection failed. Showing demo data.");
      const demo = generateDemoPredictions();
      setPredictions(demo);
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    hasTransactions,
    transactions,
    selectedDays,
    generateDemoPredictions,
  ]);

  const setDays = useCallback(async (days: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDays(days);
  }, []);

  const getTotalPredicted = useCallback((): number => {
    return predictions.reduce((sum, p) => sum + p.amount, 0);
  }, [predictions]);

  const getMaxAmount = useCallback((): number => {
    return Math.max(...predictions.map((p) => p.amount), 1);
  }, [predictions]);

  const getAveragePerCategory = useCallback((): number => {
    if (predictions.length === 0) return 0;
    return getTotalPredicted() / predictions.length;
  }, [predictions, getTotalPredicted]);

  return {
    userId,
    transactions,
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
  };
}
