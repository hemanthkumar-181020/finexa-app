import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type UserProfile = {
  id: string;
  monthlyIncome: number | null;
  // add other fields if you want to read them
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    id: snap.id,
    monthlyIncome:
      typeof data.monthlyIncome === "number" ? data.monthlyIncome : null,
  };
};
