
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { importBankStatement } from '../../services/bankImport';
import { useAuth } from '../../services/AuthContext';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.90;

interface PhonePeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PhonePeModal({ visible, onClose }: PhonePeModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    total: number;
    saved: number;
    skipped: number;
    message: string;
  }>(null);

  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const handleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(handleOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

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

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView 
        intensity={20} 
        tint="dark"
        style={styles.backdrop}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={1} 
          onPress={closeModal}
        />
      </BlurView>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.modalContent}
        >
          {/* Drag Handle */}
          <Animated.View style={[styles.handleContainer, { opacity: handleOpacity }]}>
            <View style={styles.handle} />
          </Animated.View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#8b5cf620', '#8b5cf640']}
                style={styles.iconGradient}
              >
                <Image 
                  source={require('../../assets/images/phonepe.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.title}>PhonePe Statement</Text>
            <Text style={styles.subtitle}>Import your UPI transactions securely</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { borderColor: '#8b5cf640', backgroundColor: '#8b5cf615' }]}>
              <Text style={[styles.tagText, { color: '#8b5cf6' }]}>UPI</Text>
            </View>
            <View style={[styles.tag, { borderColor: '#10b98140', backgroundColor: '#10b98115' }]}>
              <Text style={[styles.tagText, { color: '#10b981' }]}>INSTANT</Text>
            </View>
            <View style={[styles.tag, { borderColor: '#3b82f640', backgroundColor: '#3b82f615' }]}>
              <Text style={[styles.tagText, { color: '#3b82f6' }]}>SECURE</Text>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={pickAndUploadPDF}
            disabled={loading}
            style={styles.uploadButtonWrapper}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadButton}
            >
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>
                {loading ? 'Processing PDF...' : 'Upload Statement'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text style={styles.loadingText}>Analyzing your transactions...</Text>
            </View>
          )}

          {result && (
            <Animated.View
              style={[
                styles.resultBox,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Import Summary</Text>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
              </View>
              <ResultRow label="Total Transactions" value={result.total} />
              <ResultRow label="Successfully Saved" value={result.saved} success />
              <ResultRow label="Skipped (Duplicates)" value={result.skipped} />
            </Animated.View>
          )}

          {/* Info Section */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your bank statement will be processed securely. We only extract transaction data.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={closeModal}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function ResultRow({ 
  label, 
  value, 
  success 
}: { 
  label: string; 
  value: number; 
  success?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueContainer}>
        <Text style={[styles.rowValue, success && styles.rowValueSuccess]}>
          {value}
        </Text>
        {success && <Text style={styles.successDot}>●</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  modalContent: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748b',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  uploadButtonWrapper: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  resultBox: {
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#020817',
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  successIcon: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  rowValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  rowValueSuccess: {
    color: '#10b981',
  },
  successDot: {
    color: '#10b981',
    fontSize: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    flex: 1,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
});