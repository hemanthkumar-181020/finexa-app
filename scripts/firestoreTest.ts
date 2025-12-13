import { db } from "../services/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export async function testFirestore() {
  try {
    console.log("🚀 Firestore test started");

    const docRef = await addDoc(collection(db, "users"), {
      name: "Test User",
      createdAt: new Date(),
    });

    console.log("✅ Document written:", docRef.id);

    const snapshot = await getDocs(collection(db, "users"));
    snapshot.forEach((doc) => {
      console.log("📄", doc.id, doc.data());
    });

  } catch (error) {
    console.error("❌ Firestore ERROR:", error);
  }
}