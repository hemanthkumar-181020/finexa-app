// services/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Platform } from 'react-native';

interface UserProfile {
  username: string;
  email: string;
  uid: string;
  theme?: 'dark' | 'light';
  isProfileComplete?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAllData: () => Promise<void>;
  updateUserTheme: (theme: 'dark' | 'light') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to clear ALL web storage (Firebase persistence)
  const clearWebStorage = async () => {
    if (Platform.OS !== 'web') return;
    
    try {
      console.log('[AuthContext] 🧹 Clearing web storage...');
      
      // 1. Clear localStorage (Firebase stores tokens here)
      const firebaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('firebase') || 
        key.includes('google') || 
        key.includes('auth') ||
        key.includes('token')
      );
      
      firebaseKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear our app-specific storage
      localStorage.removeItem('finexa_user');
      localStorage.removeItem('finexa_auth');
      
      // 2. Clear sessionStorage
      sessionStorage.clear();
      
      // 3. Clear IndexedDB (Firebase LocalStorage)
      if (window.indexedDB) {
        try {
          // List all databases
          const databases = await window.indexedDB.databases();
          databases.forEach(dbInfo => {
            if (dbInfo.name && (
              dbInfo.name.includes('firebase') || 
              dbInfo.name.includes('Firebase') ||
              dbInfo.name === 'firebaseLocalStorageDb'
            )) {
              console.log(`Deleting IndexedDB: ${dbInfo.name}`);
              window.indexedDB.deleteDatabase(dbInfo.name);
            }
          });
        } catch (idbError) {
          console.warn('IndexedDB cleanup warning:', idbError);
        }
      }
      
      // 4. Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        // Remove auth-related cookies
        if (
          name.includes('firebase') ||
          name.includes('google') ||
          name.includes('oauth') ||
          name.includes('g_state') ||
          name.includes('auth')
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
      });
      
      // 5. Clear service worker cache
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
      
      console.log('[AuthContext] ✅ Web storage cleared');
      
    } catch (error) {
      console.error('[AuthContext] ❌ Error clearing web storage:', error);
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    try {
      console.log('[AuthContext] 📥 Fetching user profile for UID:', firebaseUser.uid);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('[AuthContext] ✅ User profile found in Firestore');
        
        // Log theme specifically for debugging
        console.log('[AuthContext] 🔍 Theme field in Firestore:', data.theme);
        console.log('[AuthContext] 🔍 Full data keys:', Object.keys(data));
        
        return {
          uid: firebaseUser.uid,
          username: data.username || firebaseUser.email?.split('@')[0] || '',
          email: data.email || firebaseUser.email || '',
          theme: data.theme || 'dark', // Default to dark theme if not found
          isProfileComplete: data.isProfileComplete || false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      } else {
        console.log('[AuthContext] ⚠️ No user profile in Firestore, creating default');
        
        // Create a default profile if it doesn't exist
        const defaultProfile = {
          uid: firebaseUser.uid,
          username: firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          theme: 'dark', // Default theme
          isProfileComplete: false,
          createdAt: new Date().toISOString(),
        };
        
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile, { merge: true });
          console.log('[AuthContext] ✅ Created default user profile');
        } catch (writeError) {
          console.warn('[AuthContext] Could not create user profile:', writeError);
        }
        
        return defaultProfile;
      }
    } catch (error) {
      console.error('[AuthContext] ❌ Error fetching user profile:', error);
      
      // Return fallback profile
      return {
        uid: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || '',
        email: firebaseUser.email || '',
        theme: 'dark', // Default theme on error
        isProfileComplete: false,
      };
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('[AuthContext] 🔄 Manually refreshing user data...');
      try {
        const profile = await fetchUserProfile(currentUser);
        setUser(currentUser);
        setUserProfile(profile);
        console.log('[AuthContext] ✅ User data refreshed');
      } catch (error) {
        console.error('[AuthContext] ❌ Error refreshing user:', error);
      }
    }
  };

  // Function to update user theme
  const updateUserTheme = async (theme: 'dark' | 'light') => {
    if (!user) {
      console.warn('[AuthContext] ⚠️ No user found, cannot update theme');
      return;
    }
    
    try {
      console.log(`[AuthContext] 🎨 Updating theme to: ${theme}`);
      
      await updateDoc(doc(db, 'users', user.uid), {
        theme: theme,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setUserProfile(prev => {
        if (!prev) {
          console.warn('[AuthContext] No userProfile to update');
          return prev;
        }
        console.log(`[AuthContext] ✅ Local theme updated to: ${theme}`);
        return { ...prev, theme };
      });
      
    } catch (error) {
      console.error('[AuthContext] ❌ Error updating theme:', error);
      throw error;
    }
  };

  // Function to clear ALL data (public API)
  const clearAllData = async () => {
    console.log('[AuthContext] 🧹 Clearing all user data...');
    setUser(null);
    setUserProfile(null);
    await clearWebStorage();
  };

  // FIXED SIGN OUT FUNCTION
  const signOut = async (): Promise<void> => {
    console.log('[AuthContext] 🔐 Starting sign out process...');
    
    try {
      // 1. Clear local React state FIRST
      setUser(null);
      setUserProfile(null);
      
      // 2. Sign out from Firebase
      await firebaseSignOut(auth);
      console.log('[AuthContext] ✅ Firebase sign out successful');
      
      // 3. Clear web storage (important for web!)
      await clearWebStorage();
      
      // 4. Verify logout was successful
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (auth.currentUser) {
        console.warn('[AuthContext] ⚠️ User still appears to be logged in, forcing cleanup...');
        // Force additional cleanup
        if (Platform.OS === 'web') {
          localStorage.clear();
          sessionStorage.clear();
        }
      }
      
      console.log('[AuthContext] 🎉 Sign out completed successfully');
      
    } catch (error: any) {
      console.error('[AuthContext] ❌ Error during sign out:', error);
      
      // Even on error, clear local state
      setUser(null);
      setUserProfile(null);
      
      // Force web cleanup
      if (Platform.OS === 'web') {
        await clearWebStorage();
      }
      
      throw new Error(`Sign out failed: ${error.message}`);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('[AuthContext] 🔥 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] 🔄 Auth state changed:', 
        firebaseUser ? `User logged in (UID: ${firebaseUser.uid})` : 'No user'
      );
      
      // Always update the user state first
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const profile = await fetchUserProfile(firebaseUser);
          setUserProfile(profile);
          
          console.log('[AuthContext] ✅ User and profile loaded successfully');
          console.log('[AuthContext] 📋 Profile details:', {
            uid: profile.uid,
            email: profile.email,
            username: profile.username,
            theme: profile.theme,
          });
          
        } catch (error) {
          console.error('[AuthContext] ❌ Error during auth state change:', error);
          
          // Set fallback profile even on error
          setUserProfile({
            uid: firebaseUser.uid,
            username: firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || '',
            theme: 'dark',
            isProfileComplete: false,
          });
        }
      } else {
        console.log('[AuthContext] 👤 No user, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('[AuthContext] ❌ Auth state change error:', error);
      setLoading(false);
    });

    // Also check immediate auth state
    const immediateCheck = async () => {
      const currentUser = auth.currentUser;
      console.log('[AuthContext] ⚡ Immediate auth check:', 
        currentUser ? `User exists (UID: ${currentUser.uid})` : 'No current user'
      );
      
      if (currentUser) {
        // Set user immediately if exists
        setUser(currentUser);
        const profile = await fetchUserProfile(currentUser);
        setUserProfile(profile);
      }
    };
    
    immediateCheck();

    return () => {
      console.log('[AuthContext] 🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Debug function
  const debugAuthState = () => {
    console.log('[AuthContext] === DEBUG ===');
    console.log('User:', user?.email || 'null');
    console.log('User Profile:', userProfile?.email || 'null');
    console.log('Current Theme:', userProfile?.theme || 'dark');
    console.log('Firebase Current User:', auth.currentUser?.email || 'null');
    console.log('Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      console.log('LocalStorage keys:', Object.keys(localStorage));
      console.log('SessionStorage keys:', Object.keys(sessionStorage));
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    if (userProfile) {
      console.log('[AuthContext] 📊 Auth state updated:', {
        user: user?.email || 'null',
        userProfile: userProfile.email || 'null',
        theme: userProfile.theme || 'dark',
        loading
      });
    }
  }, [user, userProfile, loading]);

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    refreshUser,
    clearAllData,
    updateUserTheme,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Enhanced return with helper methods
  return {
    ...context,
    // Helper to get UID safely
    getUid: () => {
      if (context.user?.uid) return context.user.uid;
      if (context.userProfile?.uid) return context.userProfile.uid;
      return null;
    },
    // Check if user is authenticated
    isAuthenticated: !!context.user,
    // Check if profile is complete
    isProfileComplete: context.userProfile?.isProfileComplete || false,
    // Get current theme
    currentTheme: context.userProfile?.theme || 'dark',
    // Quick logout with redirect (web only)
    logoutAndRedirect: async (redirectPath: string = '/login') => {
      try {
        await context.signOut();
        if (Platform.OS === 'web') {
          window.location.href = redirectPath;
        }
      } catch (error) {
        console.error('Logout and redirect failed:', error);
        if (Platform.OS === 'web') {
          window.location.href = redirectPath;
        }
      }
    },
    // Quick theme toggle helper
    toggleTheme: async () => {
      if (!context.userProfile) {
        console.warn('No user profile to toggle theme');
        return 'dark';
      }
      
      const newTheme = context.userProfile.theme === 'dark' ? 'light' : 'dark';
      await context.updateUserTheme(newTheme);
      return newTheme;
    },
  };
}