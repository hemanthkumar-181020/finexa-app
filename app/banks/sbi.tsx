import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { importSBIStatement } from '../../services/sbibankimport';
import { useAuth } from '../../services/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SBIImportScreen() {
  const { user } = useAuth();

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    total: number;
    saved: number;
    skipped: number;
    message: string;
  }>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets[0]) {
        setFile(res.assets[0]);
        setResult(null);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to select PDF file');
    }
  };

  const uploadAndImport = async () => {
    try {
      if (!file) {
        Alert.alert('Missing PDF', 'Please select SBI statement PDF file');
        return;
      }

      if (!password.trim()) {
        Alert.alert('Password Required', 'Enter SBI PDF password (usually your DOB in DDMMYYYY format)');
        return;
      }

      if (!user?.uid) {
        Alert.alert('Authentication Error', 'Please log in to import transactions');
        return;
      }

      setLoading(true);
      setResult(null);

      const response = await importSBIStatement(
        file,
        password,
        user.uid,
      );

      setResult(response);
      setFile(null);
      setPassword('');
      
      Alert.alert('Success', response.message);
    } catch (err: any) {
      console.error('Import error:', err);
      Alert.alert(
        'Import Failed',
        err.message || 'Failed to import SBI statement. Please check password and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPassword('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#10b981" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/yono.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>SBI Statement</Text>
              <Text style={styles.headerSubtitle}>Digital Banking Import</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={20} color="#10b981" />
            </View>
            <Text style={styles.infoText}>
              Upload password-protected SBI e-Statement PDF. Password is usually your date of birth.
            </Text>
          </View>

          {/* File Selection Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select PDF Statement</Text>
            <TouchableOpacity 
              style={[styles.fileBox, file && styles.fileBoxSelected]} 
              onPress={pickPDF}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.fileIconContainer}>
                <Ionicons 
                  name={file ? "document-text" : "cloud-upload-outline"} 
                  size={32} 
                  color={file ? "#10b981" : "#64748b"} 
                />
              </View>
              <View style={styles.fileTextContainer}>
                <Text style={[styles.fileTitle, file && styles.fileTitleSelected]}>
                  {file ? file.name : 'Choose PDF File'}
                </Text>
                <Text style={styles.fileSubtitle}>
                  {file ? 'Tap to change file' : 'SBI e-Statement PDF'}
                </Text>
              </View>
              {file && (
                <TouchableOpacity 
                  onPress={clearAll} 
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Password Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PDF Password</Text>
            <View style={styles.passwordBox}>
              <View style={styles.passwordIconContainer}>
                <Ionicons name="lock-closed" size={20} color="#10b981" />
              </View>
              <TextInput
                placeholder="Enter password (DDMMYYYY)"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.passwordHint}>
              💡 Usually your date of birth in DDMMYYYY format
            </Text>
          </View>

          {/* Import Button */}
          <TouchableOpacity
            disabled={loading || !file || !password.trim()}
            onPress={uploadAndImport}
            style={[
              styles.importButton,
              (loading || !file || !password.trim()) && styles.importButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.importButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#000" />
                <Text style={styles.importButtonText}>Import Transactions</Text>
              </>
            )}
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Parsing your statement...</Text>
              <Text style={styles.loadingSubtext}>This may take a few moments</Text>
            </View>
          )}

          {/* Results Card */}
          {result && (
            <Animated.View 
              style={[
                styles.resultCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.resultTitle}>Import Complete</Text>
              </View>

              <View style={styles.resultStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{result.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, styles.statValueSuccess]}>
                    {result.saved}
                  </Text>
                  <Text style={styles.statLabel}>Saved</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, styles.statValueSkipped]}>
                    {result.skipped}
                  </Text>
                  <Text style={styles.statLabel}>Skipped</Text>
                </View>
              </View>

              <View style={styles.resultMessage}>
                <Text style={styles.resultMessageText}>{result.message}</Text>
              </View>
            </Animated.View>
          )}

          {/* Instructions Card */}
          {!file && !result && (
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Ionicons name="help-circle-outline" size={22} color="#10b981" />
                <Text style={styles.instructionsTitle}>How to Download</Text>
              </View>

              <View style={styles.instructionsList}>
                <InstructionStep number="1" text="Login to SBI Net Banking" />
                <InstructionStep number="2" text="Navigate to Accounts → e-Statements" />
                <InstructionStep number="3" text="Select your account and date range" />
                <InstructionStep number="4" text="Download the password-protected PDF" />
                <InstructionStep number="5" text="Use your DOB (DDMMYYYY) as password" />
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function InstructionStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.instructionStep}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    backgroundColor: '#000',
  },
  fileBoxSelected: {
    borderColor: '#10b981',
    borderStyle: 'solid',
    backgroundColor: '#0f172a',
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#10b98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  fileTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  fileTitleSelected: {
    color: '#fff',
  },
  fileSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  removeButton: {
    padding: 4,
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  passwordIconContainer: {
    paddingLeft: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  passwordHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 10,
    fontStyle: 'italic',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  importButtonDisabled: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
  },
  importButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 32,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
  },
  resultCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#000',
    borderRadius: 16,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statValueSuccess: {
    color: '#10b981',
  },
  statValueSkipped: {
    color: '#f59e0b',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1e293b',
  },
  resultMessage: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  resultMessageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  instructionsList: {
    gap: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});