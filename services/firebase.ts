import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChxNmWVtKLf8Hv3KLon2Bpmq_Un2_1cFc",
  authDomain: "finexa-app-a6a96.firebaseapp.com",
  projectId: "finexa-app-a6a96",
  storageBucket: "finexa-app-a6a96.firebasestorage.app",
  messagingSenderId: "1033553163040",
  appId: "1:1033553163040:web:8e089c8e3af4705cdb1d45",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = initializeAuth(app, {
  // @ts-ignore – exists at runtime
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);