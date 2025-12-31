import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';

// 🔔 PUSH NOTIFICATIONS
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Firebase
import { auth, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// =======================
// CONSTANTS
// =======================
const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍕' },
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'fuel', name: 'Fuel', icon: '⛽' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'recharge', name: 'Recharge', icon: '📱' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'personal_care', name: 'Personal Care', icon: '💇' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
  { id: 'vehicle', name: 'Vehicle Maintenance', icon: '🚗' },
  { id: 'hobbies', name: 'Hobbies & Leisure', icon: '⚽' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁' },
  { id: 'business', name: 'Business Expenses', icon: '💼' },
  { id: 'tech', name: 'Technology & Software', icon: '💻' },
];

export default function CompleteProfile() {
  const router = useRouter();

  // =======================
  // STATE
  // =======================
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [income, setIncome] = useState(50000);
  const [spendingLimit, setSpendingLimit] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // =======================
  // PUSH TOKEN (ON START)
  // =======================
  useEffect(() => {
    const registerForPush = async () => {
      if (!Device.isDevice) return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const token = await Notifications.getExpoPushTokenAsync();
      setPushToken(token.data);

      const user = auth.currentUser;
      if (user) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            expoPushToken: token.data,
            pushEnabled: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    };

    registerForPush();
  }, []);

  // =======================
  // HELPERS
  // =======================
  const toggleCategory = (id: string) => {
    Haptics.selectionAsync();
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const suggestLimit = () => {
    Keyboard.dismiss();
    setSpendingLimit((income * 0.5).toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // =======================
  // SAVE PROFILE
  // =======================
  const handleFinish = async () => {
    if (selectedCats.length === 0 || loading) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const categoryNames = categories
        .filter(c => selectedCats.includes(c.id))
        .map(c => c.name);

      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: name.trim(),
          monthlyIncome: income,
          monthlySpendingLimit:
            parseFloat(spendingLimit) || income * 0.5,
          preferredCategories: selectedCats,
          preferredCategoryNames: categoryNames,
          emailNotificationsEnabled,
          expoPushToken: pushToken,
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.replace('/tabs/home');
    } catch (err) {
      console.error('Profile save failed:', err);
      setLoading(false);
    }
  };

  // =======================
  // UI
  // =======================
  return (
    <LinearGradient colors={['#1E1E2C', '#12121A']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >

          {/* STEP 0 */}
          {step === 0 && (
            <View>
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.heroCircle}
                >
                  <Zap color="white" size={40} />
                </LinearGradient>
              </View>

              <Text style={styles.heroTitle}>
                Understand Your Spending. Smarter.
              </Text>

              <Text style={styles.heroSubtitle}>
                Finexa securely analyzes your transactions (read-only) to
                help you track expenses and build smart budgets.
              </Text>

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.mainButtonText}>
                  I Agree & Continue
                </Text>
              </TouchableOpacity>

              <Text style={styles.disclaimerTextSmall}>
                We never modify or share your data.
              </Text>
            </View>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <View>
              <Text style={styles.welcomeText}>
                Let's set up your profile
              </Text>

              <View style={styles.card}>
                <Text style={styles.question}>
                  What should we call you?
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#777"
                  value={name}
                  onChangeText={setName}
                />

                <View style={{ marginTop: 40 }}>
                  <Text style={styles.question}>
                    What's your monthly income?
                  </Text>

                  <Text style={styles.incomeValue}>
                    ₹ {income.toLocaleString()}
                  </Text>

                  <Slider
                    minimumValue={10000}
                    maximumValue={500000}
                    step={1000}
                    value={income}
                    minimumTrackTintColor="#FF6B6B"
                    thumbTintColor="#FF6B6B"
                    onValueChange={setIncome}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.mainButton,
                  !name.trim() && styles.buttonDisabled,
                ]}
                disabled={!name.trim()}
                onPress={() => setStep(2)}
              >
                <Text style={styles.mainButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <View>
              <Text style={styles.welcomeText}>Budgeting</Text>

              <View style={styles.card}>
                <Text style={styles.question}>
                  Set a monthly spending limit
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.spendingInput}
                    keyboardType="numeric"
                    placeholder={`Suggested: ₹${(
                      income * 0.5
                    ).toLocaleString()}`}
                    placeholderTextColor="#555"
                    value={spendingLimit}
                    onChangeText={setSpendingLimit}
                  />
                </View>

                <TouchableOpacity
                  style={styles.suggestButton}
                  onPress={suggestLimit}
                >
                  <Text style={styles.suggestText}>
                    Auto-calculate limit
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                >
                  <Text style={{ color: '#aaa' }}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.mainButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <View>
              <Text style={styles.welcomeText}>Final Step</Text>

              <View style={styles.card}>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>
                    Get reminders & overspending alerts
                  </Text>
                  <Switch
                    value={emailNotificationsEnabled}
                    onValueChange={setEmailNotificationsEnabled}
                    trackColor={{ false: '#555', true: '#FF6B6B' }}
                    thumbColor="#fff"
                  />
                </View>

                <Text style={styles.question}>
                  Which categories do you spend on most?
                </Text>

                <View style={styles.categoryGrid}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catBox,
                        {
                          borderColor: selectedCats.includes(cat.id)
                            ? '#FF6B6B'
                            : '#3D3D5C',
                        },
                      ]}
                      onPress={() => toggleCategory(cat.id)}
                    >
                      <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                      <Text style={styles.catName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.mainButton,
                  (selectedCats.length === 0 || loading) &&
                    styles.buttonDisabled,
                ]}
                disabled={selectedCats.length === 0 || loading}
                onPress={handleFinish}
              >
                <Text style={styles.mainButtonText}>
                  {loading ? 'Finalizing...' : 'Finish'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// =======================
// STYLES
// =======================
const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: '#aaa',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  container: { padding: 25, paddingTop: 60, paddingBottom: 50 },
  heroIconContainer: { alignItems: 'center', marginBottom: 20 },
  heroCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 20,
  },
  disclaimerTextSmall: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#2D2D44',
    borderRadius: 28,
    padding: 25,
  },
  question: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    color: 'white',
    fontSize: 20,
  },
  incomeValue: {
    color: '#FF6B6B',
    fontSize: 28,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2C',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  currencyPrefix: { color: 'white', fontSize: 20, marginRight: 10 },
  spendingInput: {
    flex: 1,
    color: 'white',
    fontSize: 20,
    paddingVertical: 15,
  },
  suggestButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  suggestText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  catBox: {
    width: '47%',
    padding: 15,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1E1E2C',
  },
  catName: { color: 'white', marginTop: 5 },
  mainButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: { flexDirection: 'row', marginTop: 20 },
  backButton: { flex: 1, alignItems: 'center' },
  finishButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    alignItems: 'center',
    padding: 18,
  },
  buttonDisabled: { opacity: 0.5 },
});
