import React, { useState } from 'react';
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
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Target,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';

import { auth, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Full category list (second snippet)
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
  { id: 'goal_collection', name: 'Goal Contribution', icon: '🎯' },
];

export default function CompleteProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1–4 as in first UI
  const [name, setName] = useState('');
  const [income, setIncome] = useState(50000);
  const [spendingLimit, setSpendingLimit] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    Haptics.selectionAsync();
    setSelectedCats(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id],
    );
  };

  const suggestLimit = () => {
    Keyboard.dismiss();
    setSpendingLimit((income * 0.5).toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFinish = async () => {
    if (loading) return;
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
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      router.replace('/tabs/home');
    } catch (err) {
      console.error('Profile save failed:', err);
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map(s => (
        <View
          key={s}
          style={[
            styles.progressStep,
            step >= s
              ? styles.progressStepActive
              : styles.progressStepInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#0A0C0E']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ProgressBar />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* STEP 1: NAME & INCOME */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>Step 1 of 4</Text>
              <Text style={styles.stepTitle}>
                Let's get started
              </Text>

              <View style={styles.glassCard}>
                <Text style={styles.inputLabel}>YOUR NAME</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor="#4B5563"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View
                style={[styles.glassCard, { marginTop: 20 }]}
              >
                <Text style={styles.inputLabel}>
                  MONTHLY INCOME
                </Text>
                <Text style={styles.incomeDisplay}>
                  ₹{income.toLocaleString()}
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={500}
                  maximumValue={500000}
                  step={5000}
                  value={income}
                  minimumTrackTintColor="#34D399"
                  maximumTrackTintColor="#1F2937"
                  thumbTintColor="#FFF"
                  onValueChange={setIncome}
                  onSlidingComplete={() =>
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    )
                  }
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !name.trim() && styles.buttonDisabled,
                ]}
                onPress={() => setStep(2)}
                disabled={!name.trim()}
              >
                <Text style={styles.primaryButtonText}>
                  Continue
                </Text>
                <ChevronRight color="black" size={20} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: BUDGETING */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(1)}
              >
                <ArrowLeft
                  color="#34D399"
                  size={20}
                />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.stepLabel}>Step 2 of 4</Text>
              <Text style={styles.stepTitle}>
                Monthly Limit
              </Text>

              <View style={styles.glassCard}>
                <Text style={styles.inputLabel}>
                  SET YOUR BUDGET
                </Text>
                <View style={styles.currencyRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.bigInput}
                    keyboardType="numeric"
                    placeholder={(income * 0.5).toString()}
                    placeholderTextColor="#374151"
                    value={spendingLimit}
                    onChangeText={setSpendingLimit}
                  />
                </View>
                <TouchableOpacity
                  style={styles.magicLink}
                  onPress={suggestLimit}
                >
                  <Zap
                    size={14}
                    color="#34D399"
                    fill="#34D399"
                  />
                  <Text style={styles.magicText}>
                    Suggest 50% Rule
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setStep(3)}
              >
                <Text style={styles.primaryButtonText}>
                  Continue
                </Text>
                <ChevronRight color="black" size={20} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: CATEGORIES */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(2)}
              >
                <ArrowLeft
                  color="#34D399"
                  size={20}
                />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.stepLabel}>Step 3 of 4</Text>
              <Text style={styles.stepTitle}>
                Top Spending
              </Text>

              <View style={styles.gridContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      selectedCats.includes(cat.id) &&
                        styles.categoryCardActive,
                    ]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <Text style={{ fontSize: 24 }}>
                      {cat.icon}
                    </Text>
                    <Text
                      style={[
                        styles.catLabel,
                        selectedCats.includes(cat.id) &&
                          styles.catLabelActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  selectedCats.length === 0 &&
                    styles.buttonDisabled,
                ]}
                onPress={() => setStep(4)}
                disabled={selectedCats.length === 0}
              >
                <Text style={styles.primaryButtonText}>
                  Continue
                </Text>
                <ChevronRight color="black" size={20} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: MASTER YOUR MONEY */}
          {step === 4 && (
            <View style={styles.stepContent}>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(3)}
              >
                <ArrowLeft
                  color="#34D399"
                  size={20}
                />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.onboardingHeader}>
                <View style={styles.piggyBg}>
                  <Text style={{ fontSize: 50 }}>🐷</Text>
                </View>
                <Text style={styles.masterTitle}>
                  Master Your{' '}
                  <Text style={{ color: '#34D399' }}>
                    Money
                  </Text>
                </Text>
                <Text style={styles.masterSubtitle}>
                  We analyze your transactions to predict spending
                  limits and categorize expenses automatically.
                </Text>
              </View>

              <View style={styles.howItWorks}>
                <Text style={styles.howLabel}>
                  HOW IT WORKS
                </Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MessageSquare
                      size={20}
                      color="#34D399"
                    />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>
                      SMS Parsing
                    </Text>
                    <Text style={styles.infoDesc}>
                      We automatically categorize your expenses
                      directly from transaction texts.
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <ShieldCheck
                      size={20}
                      color="#34D399"
                    />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>
                      Local Storage
                    </Text>
                    <Text style={styles.infoDesc}>
                      Your financial data is processed on your
                      device and never sent to a cloud server.
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Target
                      size={20}
                      color="#34D399"
                    />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>
                      Smart Limits
                    </Text>
                    <Text style={styles.infoDesc}>
                      Get predictions on your future spending
                      habits based on history.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.disclaimerCard}>
                <View style={styles.disclaimerHeader}>
                  <AlertTriangle
                    size={16}
                    color="#FBBF24"
                  />
                  <Text style={styles.disclaimerLabel}>
                    DISCLAIMER
                  </Text>
                </View>
                <Text style={styles.disclaimerText}>
                  This is a learning project, not financial
                  advice. Always consult a professional for
                  decisions.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleFinish}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading
                    ? 'Finalizing...'
                    : 'I Accept & Continue'}
                </Text>
                {!loading && (
                  <ChevronRight
                    color="black"
                    size={20}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: Platform.OS === 'ios' ? 10 : 30,
    marginBottom: 20,
  },
  progressStep: { flex: 1, height: 4, borderRadius: 2 },
  progressStepActive: { backgroundColor: '#34D399' },
  progressStepInactive: { backgroundColor: '#1F2937' },

  stepContent: { 
    flex: 1,
    minHeight: height * 0.8, // Ensure enough height
  },
  stepLabel: {
    color: '#34D399',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  stepTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 20,
  },

  glassCard: {
    backgroundColor: '#16181D',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  incomeDisplay: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 10,
  },

  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: '#34D399',
    fontSize: 32,
    fontWeight: '800',
    marginRight: 10,
  },
  bigInput: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    flex: 1,
  },
  magicLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 6,
  },
  magicText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 14,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  categoryCard: {
    width: (width - 64) / 2,
    backgroundColor: '#16181D',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  categoryCardActive: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  catLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  catLabelActive: { color: '#FFF' },

  onboardingHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  piggyBg: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  masterTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  masterSubtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },

  howItWorks: { 
    marginVertical: 10,
    marginBottom: 30,
  },
  howLabel: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  infoDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },

  disclaimerCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    marginBottom: 30,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  disclaimerLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  disclaimerText: {
    color: '#FBBF24',
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.8,
  },

  primaryButton: {
    backgroundColor: '#34D399',
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: { 
    opacity: 0.3,
    backgroundColor: '#1F2937',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 25,
    paddingTop: 5,
  },
  backText: {
    color: '#34D399',
    fontWeight: '600',
    fontSize: 16,
  },
});