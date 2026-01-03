import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const getAge = (dob: any) => {
  if (!dob || !dob.seconds) return 'Not provided';
  const birthDate = new Date(dob.seconds * 1000);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [themeLoading, setThemeLoading] = useState(false);
  
  // 🎨 THEME (Firestore only)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<any>(null);

  /* ---------------- THEME COLORS ---------------- */
  const colors = {
    dark: {
      background: '#000000',
      card: '#111827',
      inputBg: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      accent: '#00FFF0',
      accentLight: 'rgba(0, 255, 240, 0.1)',
      buttonGradient: ['#00FFF0', '#10B981'],
      buttonDisabled: ['#4B5563', '#6B7280'],
      error: '#EF4444',
      header: '#00FFF0',
      label: '#00FFF0',
      toggleTrack: '#374151',
      toggleThumb: '#00FFF0',
      icon: '#00FFF0',
    },
    light: {
      background: '#F9FAFB',
      card: '#FFFFFF',
      inputBg: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#D1D5DB',
      accent: '#10B981',
      accentLight: 'rgba(16, 185, 129, 0.1)',
      buttonGradient: ['#10B981', '#00FFF0'],
      buttonDisabled: ['#D1D5DB', '#9CA3AF'],
      error: '#EF4444',
      header: '#111827',
      label: '#10B981',
      toggleTrack: '#D1D5DB',
      toggleThumb: '#10B981',
      icon: '#10B981',
    }
  };

  // Use useMemo to prevent unnecessary recalculations
  const currentColors = useMemo(() => colors[theme], [theme]);

  /* ---------------- LOAD PROFILE + THEME ---------------- */
  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('🔄 Loading profile from Firestore...');
    
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));

      if (snap.exists()) {
        const d = snap.data();
        console.log('📋 Profile data:', d);
        setProfile(d);

        // ✅ FETCH THEME FROM FIRESTORE
        // Always use the theme from Firestore, don't reference local state
        if (d.theme === 'dark' || d.theme === 'light') {
          console.log('🎨 Setting theme to:', d.theme);
          setTheme(d.theme);
        } else {
          console.log('🎨 No theme found in profile, using default: dark');
          // Set default if no theme in Firestore
          setTheme('dark');
        }
      } else {
        console.log('❌ No profile found');
        setProfile(null);
      }
    } catch (err) {
      console.log('❌ Load profile error:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ REMOVE theme from dependencies

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👀 Profile screen focused, refreshing...');
      loadProfile();
    }, [loadProfile])
  );

  /* ---------------- TOGGLE THEME (IMMEDIATE RESPONSE) ---------------- */
  const toggleTheme = async () => {
    if (!user || themeLoading) return;

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('🔄 Toggling theme from', theme, 'to', newTheme);
    
    // ✅ IMMEDIATELY update local state for UI responsiveness
    setThemeLoading(true);
    setTheme(newTheme);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        theme: newTheme,
        updatedAt: new Date(),
      });
      console.log('✅ Theme saved to Firestore');
      
      // ✅ Update profile state directly without reloading entire profile
      setProfile((prev: any) => ({
        ...prev,
        theme: newTheme
      }));
      
    } catch (err) {
      console.log('❌ Theme update error:', err);
      // ✅ Revert on error - reload from Firestore to get correct state
      loadProfile();
    } finally {
      setThemeLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    console.log('⏳ Loading state...');
    return (
      <View style={[styles.center, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.accent} />
        <Text style={{ color: currentColors.text, marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '👤';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const InfoItem = ({ icon, label, value }: any) => (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconContainer, { backgroundColor: currentColors.inputBg }]}>
        <Ionicons name={icon} size={16} color={currentColors.accent} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: currentColors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: currentColors.text }]}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  console.log('📊 Profile state:', profile ? 'Has profile' : 'No profile');
  console.log('🎨 Current theme:', theme);

  if (!profile) {
    console.log('📱 Rendering empty state');
    return (
      <View style={[styles.container, styles.center, { backgroundColor: currentColors.background }]}>
        <Ionicons name="person-circle-outline" size={80} color={currentColors.accent} />
        <Text style={[styles.emptyTitle, { color: currentColors.text }]}>Welcome!</Text>
        <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>
          Let's set up your profile
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/profile/edit')}
          style={styles.createButton}
        >
          <LinearGradient
            colors={currentColors.buttonGradient}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createButtonText}>Create Profile</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('📱 Rendering profile with theme:', theme);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={currentColors.header} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.header }]}>
            Profile
          </Text>
        </View>

        <View style={styles.themeToggleContainer}>
          {themeLoading ? (
            <ActivityIndicator size="small" color={currentColors.icon} />
          ) : (
            <MaterialIcons
              name={theme === 'dark' ? 'dark-mode' : 'light-mode'}
              size={18}
              color={currentColors.icon}
            />
          )}
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: currentColors.toggleTrack, true: currentColors.toggleTrack }}
            thumbColor={themeLoading ? currentColors.textSecondary : currentColors.toggleThumb}
            ios_backgroundColor={currentColors.toggleTrack}
            disabled={themeLoading}
          />
        </View>
      </View>

      {/* PROFILE CONTENT */}
      <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: currentColors.accentLight }]}>
            <Text style={[styles.avatarText, { color: currentColors.accent }]}>
              {getInitials(profile.name)}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: currentColors.text }]}>
            {profile.name || 'User Name'}
          </Text>
          <Text style={[styles.profileEmail, { color: currentColors.textSecondary }]}>
            {profile.email || 'user@email.com'}
          </Text>
        </View>

        {/* DIVIDER */}
        <View style={[styles.divider, { backgroundColor: currentColors.border }]} />

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.label }]}>
            Personal Information
          </Text>
          
          <InfoItem icon="call" label="Phone Number" value={profile.phone} />
          <View style={[styles.infoDivider, { backgroundColor: currentColors.border }]} />
          <InfoItem icon="person" label="Gender" value={profile.gender} />
          <View style={[styles.infoDivider, { backgroundColor: currentColors.border }]} />
          <InfoItem icon="briefcase" label="Occupation" value={profile.occupation} />
          <View style={[styles.infoDivider, { backgroundColor: currentColors.border }]} />
          <InfoItem icon="calendar" label="Age" value={getAge(profile.dob)} />
        </View>

        {/* EDIT BUTTON */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/profile/edit')}
        >
          <LinearGradient
            colors={currentColors.buttonGradient}
            style={styles.editButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="create-outline" size={16} color="#000" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------------- STYLES (COMPACT VERSION) ---------------- */
const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 16 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  createButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  themeToggleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  card: { 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 20, 
    borderWidth: 1 
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 13,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    marginVertical: 6,
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});