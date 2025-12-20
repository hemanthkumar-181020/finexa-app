// import { Tabs, Redirect } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { ActivityIndicator, View } from 'react-native';
// import { useAuth } from '../../services/AuthContext';


// export default function TabsLayout() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00082f' }}>
//         <ActivityIndicator size="large" color="#83cfcb" />
//       </View>
//     );
//   }

//   if (!user) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: '#0A1628',
//           borderTopColor: 'rgba(255,255,255,0.1)',
//         },
//         tabBarActiveTintColor: '#7C3AED',
//         tabBarInactiveTintColor: '#9CA3AF',
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="transactions"
//         options={{
//           title: 'Transactions',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="swap-horizontal" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="budgets"
//         options={{
//           title: 'Budgets',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="wallet" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="add"
//         options={{
//           title: 'Add',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="add-circle-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="more"
//         options={{
//           title: 'More',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="ellipsis-horizontal" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// app/tabs/_layout.tsx////////////////......................new version..........................................................
// app/tabs/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}