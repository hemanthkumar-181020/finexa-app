import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../services/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function More() {
  const router = useRouter();
  const { userProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    Alert.alert('Logout', 'Sign out of Finexa?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          try { await signOut(); } catch { Alert.alert('Error', 'Failed to logout.'); }
        }
      },
    ]);
  };

  // Premium Link Component
  const MenuLink = ({ icon, title, route, color = '#10b981', isMCI = false, subtitle }: any) => (
    <Pressable
      onPress={() => route && router.push(route)}
      style={({ pressed }) => [styles.menuLink, pressed && styles.pressed]}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          {isMCI ? (
            <MaterialCommunityIcons name={icon} size={22} color={color} />
          ) : (
            <Ionicons name={icon} size={22} color={color} />
          )}
        </View>
        <View>
          <Text style={styles.menuText}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#475569" />
    </Pressable>
  );

  const displayName = userProfile?.username || 'User';
  const displayEmail = userProfile?.email || 'Premium Member';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* 1. PROFILE SECTION: Deep Emerald Gradient */}
        <LinearGradient
          colors={['#064e3b', '#020617']} 
          style={styles.profileHeader}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
            <Pressable onPress={() => router.push('/profile')} style={styles.editBtn}>
              <Ionicons name="settings-outline" size={20} color="#10b981" />
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          
          {/* 2. ANALYTICS SECTION */}
          <Text style={styles.sectionHeader}>Analytics & Insights</Text>
          <View style={styles.sectionGroup}>
            <MenuLink 
              icon="fire" 
              title="Expense Heat Map" 
              subtitle="Visualize spending density"
              route="/analytics/heatmap" 
              color="#f59e0b" 
              isMCI 
            />
            <View style={styles.separator} />
            <MenuLink 
              icon="grid-outline" 
              title="Category Manager" 
              subtitle="Edit icons and spending limits"
              route="/categories" 
              color="#10b981" 
            />
          </View>

          {/* 3. PLANNING SECTION */}
          <Text style={styles.sectionHeader}>Financial Planning</Text>
          <View style={styles.sectionGroup}>
            <MenuLink 
              icon="bullseye-arrow" 
              title="Saving Goals" 
              subtitle="Track targets like 'New Car' or 'Vacation'"
              route="/goals" 
              color="#f43f5e" 
              isMCI 
            />
          </View>

          {/* 4. DATA IMPORT SECTION */}
          <Text style={styles.sectionHeader}>Data & Automation</Text>
          <View style={styles.sectionGroup}>
            <MenuLink 
              icon="chatbubble-ellipses-outline" 
              title="SMS Parsing" 
              subtitle="Automatic expense logging from texts"
              route="/settings/sms" 
              color="#8b5cf6" 
            />
            <View style={styles.separator} />
            <MenuLink 
              icon="cloud-upload-outline" 
              title="Bank Statements" 
              subtitle="Import your monthly PDF history"
              route="/wallets/bank" 
              color="#3b82f6" 
            />
          </View>

          {/* 5. PREFERENCES */}
          <Text style={styles.sectionHeader}>App Preferences</Text>
          <View style={styles.sectionGroup}>
            <MenuLink 
              icon="notifications-outline" 
              title="Notifications" 
              subtitle="Smart alerts and daily reminders"
              route="/settings/notifications" 
              color="#0ea5e9" 
            />
            <View style={styles.separator} />
            <Pressable onPress={toggleTheme} style={styles.menuLink}>
               <View style={styles.menuLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#47556920' }]}>
                    <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color="#94a3b8" />
                  </View>
                  <View>
                    <Text style={styles.menuText}>Dark Appearance</Text>
                    <Text style={styles.menuSubtitle}>Current: {theme.toUpperCase()}</Text>
                  </View>
               </View>
               <View style={[styles.statusDot, { backgroundColor: isDark ? '#10b981' : '#334155' }]} />
            </Pressable>
          </View>

          {/* LOGOUT BUTTON */}
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
             <Ionicons name="log-out-outline" size={20} color="#ef4444" />
             <Text style={styles.logoutText}>Sign Out of Finexa</Text>
          </Pressable>

          <Text style={styles.footerText}>Finexa Premium v1.0.2</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#020617' 
  },
  profileHeader: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  profileRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 18 
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  avatarText: { 
    color: 'white', 
    fontSize: 26, 
    fontWeight: '800' 
  },
  profileName: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  profileEmail: { 
    color: '#94a3b8', 
    fontSize: 13, 
    marginTop: 2 
  },
  editBtn: { 
    padding: 12, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 15 
  },
  content: { 
    paddingHorizontal: 20 
  },
  sectionHeader: {
    color: '#475569',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 35,
    marginBottom: 12,
    fontWeight: '800',
  },
  sectionGroup: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14 
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { 
    color: '#f8fafc', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  menuSubtitle: { 
    color: '#64748b', 
    fontSize: 12, 
    marginTop: 2 
  },
  separator: { 
    height: 1, 
    backgroundColor: '#1e293b', 
    marginHorizontal: 16 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 45,
    padding: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  footerText: { 
    textAlign: 'center', 
    color: '#334155', 
    fontSize: 12, 
    marginTop: 30 
  },
  pressed: { 
    opacity: 0.7 
  },
});