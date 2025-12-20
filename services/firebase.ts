import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  type Auth,
  // @ts-expect-error – available at runtime but missing in typings
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAGBdFiqd1OxLaI0-7znhxEH4UDKOP3qbs",
  authDomain: "finexa-1c27d.firebaseapp.com",
  projectId: "finexa-1c27d",
  storageBucket: "finexa-1c27d.firebasestorage.app",
  messagingSenderId: "898226239130",
  appId: "1:898226239130:web:4625a353957b0d9d691123",
  measurementId: "G-0T69N4LZ65"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;

try {
  auth = initializeAuth(app, {
    // TS complains about typings, but this works at runtime
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
