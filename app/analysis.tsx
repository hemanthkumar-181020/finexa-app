import { StyleSheet,Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../context/TransactionContext';
import { useTheme } from '../context/ThemeContext';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { useRouter } from 'expo-router'; // Import useRouter
import { Ionicons } from '@expo/vector-icons'; 

export default function BudgetsScreen() {
  const { state } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter(); 

  return (
    <SafeAreaView
     edges={['top']}  
      style={[
        styles.container,
        { backgroundColor: isDark ? '#020617' : '#f9fafb' },
      ]}
    >

      <View style={styles.backButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => router.replace('/tabs/home')} 
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? '#ffffff' : '#000000'} 
          />
        </Pressable>
      </View>
      <ExpensePieChart transactions={state.transactions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
   
    top: 60,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent background
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
