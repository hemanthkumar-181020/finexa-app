import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  targetMonth: string;      // "YYYY-MM"
  savedSoFar: number;       // total saved for this goal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getUserGoals = async (uid: string): Promise<Goal[]> => {
  const goalsRef = collection(db, "users", uid, "goals");
  const q = query(goalsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const goals: Goal[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    goals.push({
      id: docSnap.id,
      name: data.name,
      targetAmount: data.targetAmount,
      targetMonth: data.targetMonth,
      savedSoFar: data.savedSoFar ?? 0,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? "",
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? "",
    });
  });

  return goals;
};

export const createGoal = async (
  uid: string,
  payload: {
    name: string;
    targetAmount: number;
    targetMonth: string;
  }
): Promise<string> => {
  const goalsRef = collection(db, "users", uid, "goals");
  const docRef = await addDoc(goalsRef, {
    ...payload,
    savedSoFar: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateGoal = async (
  uid: string,
  goalId: string,
  updates: Partial<{
    name: string;
    targetAmount: number;
    targetMonth: string;
    savedSoFar: number;
    isActive: boolean;
  }>
) => {
  const goalRef = doc(db, "users", uid, "goals", goalId);
  await updateDoc(goalRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const addToGoalSaved = async (
  uid: string,
  goalId: string,
  amount: number
) => {
  const goalRef = doc(db, "users", uid, "goals", goalId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(goalRef);
    if (!snap.exists()) throw new Error("Goal not found");
    const data = snap.data() as any;
    const current = data.savedSoFar ?? 0;
    tx.update(goalRef, {
      savedSoFar: current + amount,
      updatedAt: serverTimestamp(),
    });
  });
};

export const deleteGoal = async (uid: string, goalId: string) => {
  const goalRef = doc(db, "users", uid, "goals", goalId);
  await deleteDoc(goalRef);
};
