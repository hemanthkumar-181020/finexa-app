import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { importBankStatement } from '../../services/bankImport';
import { useAuth } from '../../services/AuthContext';

export default function ImportStatementScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    total: number;
    saved: number;
    skipped: number;
    message: string;
  }>(null);

  const pickAndUploadPDF = async () => {
    try {
      setResult(null);

      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (res.canceled) return;

      if (!user?.uid) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setLoading(true);
      const response = await importBankStatement(res.assets[0], user.uid);
      setResult(response);
      Alert.alert('Success', response.message);
    } catch (err: any) {
      Alert.alert('Import Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#02140B']}
        style={styles.card}
      >
        <Text style={styles.title}>Import Bank Statement</Text>
        <Text style={styles.subtitle}>Secure PDF Transaction Import</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickAndUploadPDF}
          disabled={loading}
        >
          <LinearGradient
            colors={['#00ff88', '#00c6ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.uploadButton}
          >
            <Text style={styles.uploadText}>
              {loading ? 'Processing...' : 'Upload PDF'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#00c6ff"
            style={{ marginTop: 25 }}
          />
        )}

        {result && (
          <View style={styles.resultBox}>
            <ResultRow label="Total" value={result.total} />
            <ResultRow label="Saved" value={result.saved} />
            <ResultRow label="Skipped" value={result.skipped} />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

function ResultRow({ label, value }: { label: string; value: number }) {
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
    padding: 16,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#00ff8844',
    shadowColor: '#00c6ff',
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 6,
  },
  subtitle: {
    color: '#00c6ff',
    marginBottom: 30,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#00c6ff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  uploadText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#02140B',
    borderWidth: 1,
    borderColor: '#00ff8844',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    color: '#00c6ff',
    fontSize: 15,
  },
  rowValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
  },
});
