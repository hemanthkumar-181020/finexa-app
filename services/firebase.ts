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
  apiKey: 'AIzaSyChxNmWVtKLf8Hv3KLon2Bpmq_Un2_1cFc',
  authDomain: 'finexa-app-a6a96.firebaseapp.com',
  projectId: 'finexa-app-a6a96',
  storageBucket: 'finexa-app-a6a96.firebasestorage.app',
  messagingSenderId: '1033553163040',
  appId: '1:1033553163040:web:8e089c8e3af4705cdb1d45',
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
