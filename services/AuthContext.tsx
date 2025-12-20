import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserProfile {
  username: string;
  email: string;
  uid: string; // Added UID to profile
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>; // Added refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    try {
      console.log('[AuthContext] Fetching user profile for UID:', firebaseUser.uid);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('[AuthContext] User profile found in Firestore:', data);
        
        return {
          uid: firebaseUser.uid,
          username: data.username || firebaseUser.email?.split('@')[0] || '',
          email: data.email || firebaseUser.email || '',
        };
      } else {
        console.log('[AuthContext] No user profile in Firestore, creating default');
        
        // Create a default profile if it doesn't exist
        const defaultProfile = {
          uid: firebaseUser.uid,
          username: firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          createdAt: new Date().toISOString(),
        };
        
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile, { merge: true });
          console.log('[AuthContext] Created default user profile');
        } catch (writeError) {
          console.warn('[AuthContext] Could not create user profile:', writeError);
        }
        
        return defaultProfile;
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching user profile:', error);
      
      // Return fallback profile
      return {
        uid: firebaseUser.uid,
        username: firebaseUser.email?.split('@')[0] || '',
        email: firebaseUser.email || '',
      };
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('[AuthContext] Manually refreshing user data...');
      try {
        const profile = await fetchUserProfile(currentUser);
        setUser(currentUser);
        setUserProfile(profile);
      } catch (error) {
        console.error('[AuthContext] Error refreshing user:', error);
      }
    }
  };

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
          // Verify the user object has all necessary properties
          console.log('[AuthContext] User details:', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
          });
          
          // Fetch user profile from Firestore
          const profile = await fetchUserProfile(firebaseUser);
          setUserProfile(profile);
          
          console.log('[AuthContext] ✅ User and profile loaded:', {
            uid: profile.uid,
            email: profile.email,
            username: profile.username,
          });
          
        } catch (error) {
          console.error('[AuthContext] ❌ Error during auth state change:', error);
          
          // Set fallback profile even on error
          setUserProfile({
            uid: firebaseUser.uid,
            username: firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || '',
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
      console.log('[AuthContext] Immediate auth check:', 
        currentUser ? `User exists (UID: ${currentUser.uid})` : 'No current user'
      );
      
      if (currentUser && !user) {
        // If there's a user but our state hasn't updated yet
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

  const signOut = async () => {
    console.log('[AuthContext] Signing out...');
    try {
      await firebaseSignOut(auth);
      console.log('[AuthContext] ✅ Sign out successful');
    } catch (error) {
      console.error('[AuthContext] ❌ Error signing out:', error);
      throw error;
    }
  };

  // Debug function to log current state
  const logAuthState = () => {
    console.log('[AuthContext] Current state:', {
      user: user ? `UID: ${user.uid}, Email: ${user.email}` : 'null',
      userProfile: userProfile ? `UID: ${userProfile.uid}, Username: ${userProfile.username}` : 'null',
      loading,
      currentAuthUser: auth.currentUser ? `UID: ${auth.currentUser.uid}` : 'null',
    });
  };

  // Log state changes
  useEffect(() => {
    logAuthState();
  }, [user, userProfile, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signOut,
      refreshUser // Added refresh function
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add a helper to get the UID safely
  const getUid = () => {
    if (context.user?.uid) return context.user.uid;
    if (context.userProfile?.uid) return context.userProfile.uid;
    return null;
  };
  
  // Return enhanced context
  return {
    ...context,
    getUid, // Helper method
    isAuthenticated: !!context.user,
  };
}