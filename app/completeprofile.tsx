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
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Zap } from 'lucide-react-native';

// Firebase Imports
import { auth, db } from '../services/firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const categories = [
  { id: '1', name: 'Food', icon: '🍔' },
  { id: '2', name: 'Transport', icon: '🚆' },
  { id: '3', name: 'Rent', icon: '🏠' },
  { id: '4', name: 'Shopping', icon: '🛍️' },
  { id: '5', name: 'Bills', icon: '💡' },
  { id: '6', name: 'Entertainment', icon: '🎬' },
];

export default function CompleteProfile() {
  const router = useRouter();
  
  const [step, setStep] = useState(0); 
  const [name, setName] = useState('');
  const [income, setIncome] = useState(50000);
  const [spendingLimit, setSpendingLimit] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    Haptics.selectionAsync();
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const suggestLimit = () => {
    Keyboard.dismiss();
    const suggested = (income * 0.5).toString();
    setSpendingLimit(suggested);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFinish = async () => {
    if (selectedCats.length === 0 || loading) return; // Prevent double-tap
    setLoading(true);
    
    try {
      const user = auth.currentUser;
      if (user) {
        const categoryNames = categories
          .filter(c => selectedCats.includes(c.id))
          .map(c => c.name);

        await setDoc(doc(db, 'users', user.uid), {
          username: name.trim(),
          monthlyIncome: income,
          monthlySpendingLimit: parseFloat(spendingLimit) || (income * 0.5),
          preferredCategories: selectedCats,
          preferredCategoryNames: categoryNames,
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
          setupVersion: '1.0.2'
        }, { merge: true });
        
        router.replace('/tabs/home'); 
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E1E2C', '#12121A']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled" // Improved Keyboard UX
        >
          
          {/* STEP 0: Introduction */}
          {step === 0 && (
            <View>
              <View style={styles.heroIconContainer}>
                <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.heroCircle}>
                   <Zap color="white" size={40} />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>Understand Your Spending. Smarter.</Text>
              <Text style={styles.heroSubtitle}>
                Finexa analyzes your bank statements and transaction SMS (read-only) to help you track expenses and estimate monthly spending limits.
              </Text>
              <TouchableOpacity style={styles.mainButton} onPress={() => setStep(1)}>
                <Text style={styles.mainButtonText}>I Agree & Continue</Text>
              </TouchableOpacity>
              <Text style={styles.disclaimerTextSmall}>
                By continuing, you allow Finexa to securely analyze your transaction data. We never modify or share your data.
              </Text>
            </View>
          )}

          {/* STEP 1: Profile Setup */}
          {step === 1 && (
            <View>
              <Text style={styles.welcomeText}>Let's set up your profile</Text>
              <View style={styles.card}>
                <Text style={styles.question}>What should we call you?</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Your name" 
                  placeholderTextColor="#777" 
                  value={name} 
                  onChangeText={setName} 
                  autoFocus
                  returnKeyType="done"
                />
                <View style={{ marginTop: 40 }}>
                  <Text style={styles.question}>What's your monthly income?</Text>
                  <View style={styles.incomeRow}>
                    <Text style={styles.incomeValue}>₹ {income.toLocaleString()}</Text>
                  </View>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={10000} maximumValue={500000} step={1000}
                    minimumTrackTintColor="#FF6B6B" thumbTintColor="#FF6B6B"
                    value={income}
                    onValueChange={(val) => setIncome(val)} // Live update UI
                    onSlidingComplete={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  />
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.mainButton, !name.trim() && styles.buttonDisabled]} 
                onPress={() => {
                  Keyboard.dismiss();
                  if(name.trim()) setStep(2);
                }}
                disabled={!name.trim()}
              >
                <Text style={styles.mainButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Spending Limit */}
          {step === 2 && (
            <View>
              <Text style={styles.welcomeText}>Budgeting</Text>
              <View style={styles.card}>
                <Text style={styles.question}>Set a monthly spending limit</Text>
                <Text style={styles.subLabel}>Finexa uses your income and past transactions to suggest a reasonable budget.</Text>
                
                <View style={styles.inputContainer}>
                   <Text style={styles.currencyPrefix}>₹</Text>
                   <TextInput 
                    style={styles.spendingInput}
                    keyboardType="numeric"
                    placeholder={`Suggested: ₹${(income * 0.5).toLocaleString()}`}
                    placeholderTextColor="#555"
                    value={spendingLimit}
                    onChangeText={setSpendingLimit}
                    returnKeyType="done"
                   />
                </View>
                <Text style={styles.hintText}>Leave empty to use the suggested limit.</Text>

                <TouchableOpacity style={styles.suggestButton} onPress={suggestLimit}>
                   <Text style={styles.suggestText}>Auto-calculate limit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                  <Text style={{ color: '#aaa' }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishButton} onPress={() => setStep(3)}>
                  <Text style={styles.mainButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Categories */}
          {step === 3 && (
            <View>
              <Text style={styles.welcomeText}>Final Step</Text>
              <View style={styles.card}>
                <Text style={styles.question}>Which categories do you spend on most?</Text>
                <Text style={styles.subLabel}>Pick at least one to continue.</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity 
                      key={cat.id} 
                      onPress={() => toggleCategory(cat.id)}
                      style={[styles.catBox, { borderColor: selectedCats.includes(cat.id) ? '#FF6B6B' : '#3D3D5C' }]}
                    >
                      <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                      <Text style={styles.catName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.mainButton, (selectedCats.length === 0 || loading) && styles.buttonDisabled]} 
                onPress={handleFinish} 
                disabled={selectedCats.length === 0 || loading}
              >
                <Text style={styles.mainButtonText}>{loading ? 'Finalizing...' : 'Finish'}</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 60, paddingBottom: 50 },
  heroIconContainer: { alignItems: 'center', marginBottom: 20 },
  heroCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, lineHeight: 32 },
  heroSubtitle: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  disclaimerTextSmall: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 15, lineHeight: 16 },
  welcomeText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 25 },
  card: { backgroundColor: '#2D2D44', borderRadius: 28, padding: 25 },
  question: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  subLabel: { color: '#aaa', fontSize: 13, marginBottom: 15, lineHeight: 18 },
  hintText: { color: '#666', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  input: { borderBottomWidth: 1, borderBottomColor: '#444', color: 'white', fontSize: 20, paddingVertical: 10 },
  incomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  incomeValue: { color: '#FF6B6B', fontSize: 28, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2C', borderRadius: 15, paddingHorizontal: 15, marginTop: 10 },
  currencyPrefix: { color: 'white', fontSize: 20, marginRight: 10 },
  spendingInput: { flex: 1, color: 'white', fontSize: 20, paddingVertical: 15 },
  suggestButton: { backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: 15, borderRadius: 15, marginTop: 15, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.3)' },
  suggestText: { color: '#FF6B6B', textAlign: 'center', fontWeight: 'bold' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  catBox: { padding: 15, borderRadius: 18, borderWidth: 2, backgroundColor: '#1E1E2C', width: '47%', alignItems: 'center' },
  catName: { color: 'white', fontSize: 14, marginTop: 5 },
  mainButton: { backgroundColor: '#FF6B6B', padding: 20, borderRadius: 20, marginTop: 20, alignItems: 'center' },
  mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  backButton: { flex: 1, padding: 18, alignItems: 'center' },
  finishButton: { flex: 2, backgroundColor: '#FF6B6B', padding: 18, borderRadius: 20, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5, backgroundColor: '#444' }
});