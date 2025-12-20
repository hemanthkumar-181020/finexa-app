// // app/tabs/more.tsx
// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';

// import { useAuth } from '../../services/AuthContext';
// import { useTheme } from '../../context/ThemeContext';

// export default function More() {
//   const router = useRouter();
//   const { userProfile, signOut } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const isDark = theme === 'dark';

//   type ItemProps = {
//     icon: keyof typeof Ionicons.glyphMap;
//     title: string;
//     value?: string;
//     route?: string;
//     danger?: boolean;
//     onPress?: () => void;
//   };

//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await signOut();
//           } catch {
//             Alert.alert('Error', 'Failed to logout. Please try again.');
//           }
//         },
//       },
//     ]);
//   };

//   const Item = ({
//     icon,
//     title,
//     value,
//     route,
//     danger = false,
//     onPress,
//   }: ItemProps) => (
//     <Pressable
//       onPress={() => {
//         if (onPress) onPress();
//         else if (route) router.push(route as any);
//       }}
//       style={({ pressed }) => [
//         styles.item,
//         pressed && styles.itemPressed,
//         danger && styles.dangerItem,
//       ]}
//     >
//       <View style={styles.itemLeft}>
//         <View style={[styles.iconChip, danger && styles.dangerIconChip]}>
//           <Ionicons
//             name={icon}
//             size={20}
//             color={danger ? '#fde2e2' : '#e0f2ff'}
//           />
//         </View>
//         <Text style={[styles.itemText, danger && { color: '#fecaca' }]}>
//           {title}
//         </Text>
//       </View>

//       {value ? (
//         <Text style={styles.value}>{value}</Text>
//       ) : (
//         !danger && (
//           <Ionicons name="chevron-forward" size={18} color="#cbd5f5" />
//         )
//       )}
//     </Pressable>
//   );

//   const displayName = userProfile?.username || 'User';
//   const displayEmail = userProfile?.email || '';
//   const avatarLetter = displayName.charAt(0).toUpperCase();

//   return (
//     <LinearGradient
//       colors={isDark ? ['#020b26', '#04738b'] : ['#f8fafc', '#e2e8f0']}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={styles.gradient}
//     >
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={{ paddingBottom: 40 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* top bar with title + top‑right theme toggle */}
//         <View style={styles.topBar}>
//           <Text
//             style={[
//               styles.header,
//               !isDark && { color: '#020617' },
//             ]}
//           >
//             More
//           </Text>

//           <Pressable onPress={toggleTheme} style={styles.themeToggle}>
//             <Ionicons
//               name={isDark ? 'sunny' : 'moon'}
//               size={22}
//               color={isDark ? '#e5e7eb' : '#020617'}
//             />
//           </Pressable>
//         </View>

//         {/* ACCOUNT */}
//         <Text style={styles.section}>Account</Text>

//         <Pressable
//           style={({ pressed }) => [
//             styles.profileCard,
//             pressed && styles.cardPressed,
//           ]}
//           onPress={() => router.push('/profile' as any)}
//         >
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{avatarLetter}</Text>
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text style={styles.name}>{displayName}</Text>
//             <Text style={styles.email}>{displayEmail}</Text>
//           </View>

//           <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
//         </Pressable>

//         {/* UPGRADE BANNER */}
//         <Pressable
//           style={({ pressed }) => [
//             styles.upgradeWrapper,
//             pressed && styles.cardPressed,
//           ]}
//           onPress={() => {}}
//         >
//           <LinearGradient
//             colors={['#0284c7', '#22c1c3']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={styles.upgrade}
//           >
//             <Ionicons name="rocket" size={20} color="#e0f2fe" />
//             <Text style={styles.upgradeText}>Upgrade Now</Text>
//           </LinearGradient>
//         </Pressable>

//         {/* FINANCE */}
//         <Text style={styles.section}>Finance</Text>
//         <Item icon="grid" title="Categories" route="/categories" />
//         <Item icon="pricetag" title="Labels" route="/labels" />
//         <Item
//           icon="time"
//           title="Scheduled Transactions"
//           route="/scheduled"
//         />
//         <Item icon="cash" title="Main Currency" value="INR" route="/currency" />

//         {/* ACCOUNTS & WALLETS */}
//         <Text style={styles.section}>Accounts & Wallets</Text>
//         <Item icon="wallet" title="Manual Wallets" route="/wallets/manual" />
//         <Item
//           icon="card"
//           title="Bank Accounts & E-Wallets"
//           route="/wallets/bank"
//         />
//         <Item
//           icon="logo-bitcoin"
//           title="Crypto Wallets"
//           route="/wallets/crypto"
//         />

//         {/* APP SETTINGS */}
//         <Text style={styles.section}>App Settings</Text>
//         <Item icon="notifications" title="Notifications" />
//         <Item icon="color-palette" title="Appearance" />
//         <Item icon="language" title="Language" />
//         <Item icon="settings" title="Advanced" route="/advanced" />

//         {/* SUPPORT */}
//         <Text style={styles.section}>Support</Text>
//         <Item icon="help-circle" title="Help Center" />
//         <Item icon="mail" title="Contact Support" />
//         <Item icon="document-text" title="Terms & Policies" />

//         {/* LOGOUT */}
//         <Item
//           icon="log-out"
//           title="Logout"
//           danger
//           onPress={handleLogout}
//         />

//         <Text style={styles.version}>Version 1.0.0</Text>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },

//   topBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: 16,   // distance from top
//     marginBottom: 12,
//   },

//   themeToggle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.18)',
//   },

//   header: {
//     fontSize: 30,
//     fontWeight: '800',
//     color: '#f9fafb',
//   },

//   section: {
//     fontSize: 13,
//     color: '#cbd5f5',
//     marginTop: 24,
//     marginBottom: 8,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   },

//   profileCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(9,16,40,0.92)',
//     borderRadius: 20,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(148,163,184,0.35)',
//   },

//   cardPressed: {
//     transform: [{ scale: 0.98 }],
//     opacity: 0.9,
//   },

//   avatar: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: '#0ea5e9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },

//   avatarText: {
//     color: '#e0f2fe',
//     fontWeight: '700',
//     fontSize: 18,
//   },

//   name: {
//     color: '#e5e7eb',
//     fontWeight: '600',
//     fontSize: 16,
//   },

//   email: {
//     color: '#9ca3af',
//     fontSize: 12,
//     marginTop: 2,
//   },

//   upgradeWrapper: {
//     marginTop: 14,
//   },

//   upgrade: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     shadowColor: '#22c1c3',
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 4,
//     gap: 8,
//   },

//   upgradeText: {
//     fontWeight: '700',
//     color: '#f9fafb',
//     fontSize: 15,
//   },

//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: 'rgba(9,16,40,0.9)',
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//     borderRadius: 18,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(30,64,175,0.6)',
//   },

//   itemPressed: {
//     transform: [{ scale: 0.97 }],
//     opacity: 0.9,
//   },

//   itemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },

//   iconChip: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(15,118,178,0.35)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   dangerIconChip: {
//     backgroundColor: 'rgba(239,68,68,0.25)',
//   },

//   itemText: {
//     color: '#e5e7eb',
//     fontSize: 15,
//   },

//   value: {
//     color: '#dbeafe',
//     fontSize: 14,
//   },

//   dangerItem: {
//     borderColor: 'rgba(248,113,113,0.7)',
//     backgroundColor: 'rgba(127,29,29,0.35)',
//   },

//   version: {
//     textAlign: 'center',
//     color: '#cbd5f5',
//     marginTop: 18,
//     fontSize: 12,
//     marginBottom: 8,
//   },
// });

// app/tabs/more.tsx.....................................................new version
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function More() {
  const router = useRouter();
  const { userProfile, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  type ItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    route?: string;
    danger?: boolean;
    onPress?: () => void;
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const Item = ({
    icon,
    title,
    value,
    route,
    danger = false,
    onPress,
  }: ItemProps) => (
    <Pressable
      onPress={() => {
        if (onPress) onPress();
        else if (route) router.push(route as any);
      }}
      style={({ pressed }) => [
        styles.item,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.7 },
        danger && { 
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(244, 67, 54, 0.05)',
          borderColor: colors.error 
        },
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[
          styles.iconChip, 
          { backgroundColor: danger ? 'rgba(239, 68, 68, 0.2)' : colors.primary + '20' }
        ]}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? colors.error : colors.primary}
          />
        </View>
        <Text style={[styles.itemText, { color: danger ? colors.error : colors.text }]}>
          {title}
        </Text>
      </View>

      {value ? (
        <Text style={[styles.value, { color: colors.textSecondary }]}>{value}</Text>
      ) : (
        !danger && (
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        )
      )}
    </Pressable>
  );

  const displayName = userProfile?.username || 'User';
  const displayEmail = userProfile?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header with title + theme toggle */}
        <View style={styles.topBar}>
          <Text style={[styles.header, { color: colors.text }]}>
            More
          </Text>

          <Pressable 
            onPress={toggleTheme} 
            style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* ACCOUNT */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>Account</Text>

        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.push('/profile' as any)}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.textInverse }]}>{avatarLetter}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{displayEmail}</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>

        {/* UPGRADE BANNER */}
        <Pressable
          style={({ pressed }) => [
            styles.upgradeWrapper,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.upgrade, { backgroundColor: colors.primary }]}>
            <Ionicons name="rocket" size={20} color={colors.textInverse} />
            <Text style={[styles.upgradeText, { color: colors.textInverse }]}>Upgrade Now</Text>
          </View>
        </Pressable>

        {/* FINANCE */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>Finance</Text>
        <Item icon="grid" title="Categories" route="/categories" />
        <Item icon="pricetag" title="Labels" route="/labels" />
        <Item icon="time" title="Scheduled Transactions" route="/scheduled" />
        <Item icon="cash" title="Main Currency" value="INR" route="/currency" />

        {/* ACCOUNTS & WALLETS */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>Accounts & Wallets</Text>
        <Item icon="wallet" title="Manual Wallets" route="/wallets/manual" />
        <Item icon="card" title="Bank Accounts & E-Wallets" route="/wallets/bank" />
        <Item icon="logo-bitcoin" title="Crypto Wallets" route="/wallets/crypto" />

        {/* APP SETTINGS */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>App Settings</Text>
        <Item icon="notifications" title="Notifications" />
        <Item icon="color-palette" title="Appearance" />
        <Item icon="language" title="Language" />
        <Item icon="settings" title="Advanced" route="/advanced" />

        {/* SUPPORT */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>Support</Text>
        <Item icon="help-circle" title="Help Center" />
        <Item icon="mail" title="Contact Support" />
        <Item icon="document-text" title="Terms & Policies" />

        {/* LOGOUT */}
        <Item icon="log-out" title="Logout" danger onPress={handleLogout} />

        <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    marginBottom: 20,
  },

  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  header: {
    fontSize: 32,
    fontWeight: '800',
  },

  section: {
    fontSize: 13,
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  avatarText: {
    fontWeight: '700',
    fontSize: 20,
  },

  name: {
    fontWeight: '600',
    fontSize: 17,
    marginBottom: 2,
  },

  email: {
    fontSize: 14,
  },

  upgradeWrapper: {
    marginBottom: 8,
  },

  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },

  upgradeText: {
    fontWeight: '700',
    fontSize: 16,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },

  value: {
    fontSize: 15,
  },

  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
});