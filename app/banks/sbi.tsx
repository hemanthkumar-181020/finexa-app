import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { importSBIStatement } from '../../services/sbibankimport';
import { useAuth } from '../../services/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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

  const pickPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets[0]) {
        setFile(res.assets[0]);
        setResult(null); // Clear previous results
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
      
      // Clear form after successful import
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient 
          colors={['#000', '#02140B']} 
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
           
            <Text style={styles.title}>SBI Statement Import</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Upload your SBI bank statement PDF (password protected)
          </Text>

          {/* File Selection */}
          <TouchableOpacity 
            style={[styles.pickBox, file && styles.pickedBox]} 
            onPress={pickPDF}
            disabled={loading}
          >
            <Ionicons 
              name={file ? "document-text" : "document-outline"} 
              size={24} 
              color={file ? "#00ff88" : "#00c6ff"} 
            />
            <Text style={styles.pickText}>
              {file ? file.name : 'Select SBI PDF Statement'}
            </Text>
            {file && (
              <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={20} color="#ff4444" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.passwordIcon} />
            <TextInput
              placeholder="PDF Password (DOB: DDMMYYYY)"
              placeholderTextColor="#666"
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
            Usually your date of birth in DDMMYYYY format
          </Text>

          {/* Upload Button */}
          <TouchableOpacity
            disabled={loading || !file || !password.trim()}
            onPress={uploadAndImport}
            style={styles.uploadButton}
          >
            <LinearGradient
              colors={loading ? ['#666', '#666'] : ['#00ff88', '#00c6ff']}
              style={styles.uploadBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons 
                name={loading ? "cloud-upload" : "cloud-upload-outline"} 
                size={22} 
                color="#000" 
              />
              <Text style={styles.uploadText}>
                {loading ? 'Processing...' : 'Upload & Import'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00c6ff" />
              <Text style={styles.loadingText}>Parsing PDF statement...</Text>
            </View>
          )}

          {/* Results */}
          {result && (
            <LinearGradient 
              colors={['#02140B', '#000']}
              style={styles.resultBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.resultTitle}>Import Results</Text>
              <ResultRow label="Total Transactions" value={result.total} />
              <ResultRow label="Successfully Saved" value={result.saved} />
              <ResultRow label="Duplicates Skipped" value={result.skipped} />
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{result.message}</Text>
              </View>
            </LinearGradient>
          )}

          {/* Instructions */}
          {!file && !result && (
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to export SBI statement:</Text>
              <Text style={styles.instruction}>1. Login to SBI Net Banking</Text>
              <Text style={styles.instruction}>2. Go to Accounts → e-Statements</Text>
              <Text style={styles.instruction}>3. Select account and date range</Text>
              <Text style={styles.instruction}>4. Download PDF (password protected)</Text>
              <Text style={styles.instruction}>5. Password is usually your DOB (DDMMYYYY)</Text>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#00ff8844',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#00ff88',
    marginLeft: 12,
  },
  subtitle: {
    color: '#00c6ff',
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 20,
  },
  pickBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00c6ff',
    backgroundColor: '#02140B',
    marginBottom: 20,
  },
  pickedBox: {
    borderColor: '#00ff88',
    backgroundColor: '#02140B99',
  },
  pickText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  clearBtn: {
    padding: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ff88',
    backgroundColor: '#02140B',
    borderRadius: 12,
    marginBottom: 8,
  },
  passwordIcon: {
    marginLeft: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  passwordHint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 25,
    fontStyle: 'italic',
  },
  uploadButton: {
    marginTop: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#00c6ff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  uploadText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    color: '#00c6ff',
    marginTop: 10,
    fontSize: 14,
  },
  resultBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00ff8844',
  },
  resultTitle: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8811',
  },
  rowLabel: {
    color: '#00c6ff',
    fontSize: 16,
  },
  rowValue: {
    color: '#00ff88',
    fontWeight: '700',
    fontSize: 16,
  },
  messageBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#00ff8810',
    borderRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  instructions: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#02140B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8822',
  },
  instructionsTitle: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    color: '#00c6ff',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});