// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { parseBankSms } from "../../utils/parseBankSms";

// export default function Messages() {
//   const [smsText, setSmsText] = useState("");

//   const handleExtract = () => {
//     if (!smsText.trim()) {
//       Alert.alert("Error", "Paste SMS message");
//       return;
//     }

//     const parsed = parseBankSms(smsText);

//     if (parsed.amount === null || parsed.amount === undefined) {
//       Alert.alert("Unable to extract", "Please edit manually");
//       return;
//     }

//     router.push({
//       pathname: "/banks/confirmsms",
//       params: {
//         amount: parsed.amount.toString(),
//         type: parsed.type,
//         category: parsed.category,
//         date: parsed.date.toISOString(),
//         note: parsed.note,
//         utr: parsed.utr ?? "",
//       },
//     });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Paste SMS</Text>

//       <TextInput
//         value={smsText}
//         onChangeText={setSmsText}
//         placeholder="Paste bank / UPI SMS here"
//         placeholderTextColor="#6B7280"
//         multiline
//         style={styles.textArea}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleExtract}>
//         <Text style={styles.buttonText}>Extract Transaction</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#020B06",
//     padding: 16,
//   },
//   title: {
//     color: "#E5F3E5",
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 12,
//   },
//   textArea: {
//     backgroundColor: "#132016",
//     color: "#E5F3E5",
//     borderRadius: 12,
//     padding: 14,
//     height: 180,
//     textAlignVertical: "top",
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: "#4ADE80",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#020B06",
//     fontWeight: "700",
//   },
// });

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { parseBankSms } from "../../utils/parseBankSms";

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.80 ;

interface MessagesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MessagesModal({ visible, onClose }: MessagesModalProps) {
  const [smsText, setSmsText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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

  const handleExtract = () => {
    if (!smsText.trim()) {
      Alert.alert("Error", "Please paste an SMS message");
      return;
    }

    const parsed = parseBankSms(smsText);

    if (parsed.amount === null || parsed.amount === undefined) {
      Alert.alert("Unable to extract", "Please edit manually");
      return;
    }

    closeModal();
    
    router.push({
      pathname: "/banks/confirmsms",
      params: {
        amount: parsed.amount.toString(),
        type: parsed.type,
        category: parsed.category,
        date: parsed.date.toISOString(),
        note: parsed.note,
        utr: parsed.utr ?? "",
      },
    });
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
          onPress={() => {
            Keyboard.dismiss();
            closeModal();
          }}
        />
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              marginBottom: keyboardHeight,
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
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Drag Handle */}
              <Animated.View style={[styles.handleContainer, { opacity: handleOpacity }]}>
                <View style={styles.handle} />
              </Animated.View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#3b82f620', '#3b82f640']}
                    style={styles.iconGradient}
                  >
                    <Image 
                      source={require('../../assets/images/message.png')} 
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>SMS Import</Text>
                <Text style={styles.subtitle}>Extract transaction from bank SMS</Text>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                <View style={[styles.tag, { borderColor: '#3b82f640', backgroundColor: '#3b82f615' }]}>
                  <Text style={[styles.tagText, { color: '#3b82f6' }]}>SMS</Text>
                </View>
                <View style={[styles.tag, { borderColor: '#10b98140', backgroundColor: '#10b98115' }]}>
                  <Text style={[styles.tagText, { color: '#10b981' }]}>AUTO</Text>
                </View>
                <View style={[styles.tag, { borderColor: '#8b5cf640', backgroundColor: '#8b5cf615' }]}>
                  <Text style={[styles.tagText, { color: '#8b5cf6' }]}>INSTANT</Text>
                </View>
              </View>

              {/* SMS Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Paste SMS Message</Text>
                <TextInput
                  value={smsText}
                  onChangeText={setSmsText}
                  placeholder="Paste your bank or UPI SMS here..."
                  placeholderTextColor="#64748b"
                  multiline
                  style={styles.textArea}
                  textAlignVertical="top"
                />
              </View>

              {/* Extract Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleExtract}
                disabled={!smsText.trim()}
                style={styles.extractButtonWrapper}
              >
                <LinearGradient
                  colors={!smsText.trim() ? ['#334155', '#1e293b'] : ['#3b82f6', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.extractButton}
                >
                  <Text style={styles.extractIcon}>💬</Text>
                  <Text style={[styles.extractText, !smsText.trim() && styles.extractTextDisabled]}>
                    Extract Transaction
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Section */}
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  Copy and paste transaction SMS from your bank or UPI app. We'll automatically extract the details.
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
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  modalContent: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3b82f640',
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
    borderColor: '#3b82f640',
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
    marginBottom: 24,
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
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  textArea: {
    backgroundColor: '#020817',
    color: '#fff',
    borderRadius: 14,
    padding: 16,
    height: 160,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#3b82f640',
  },
  extractButtonWrapper: {
    marginBottom: 20,
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  extractIcon: {
    fontSize: 20,
  },
  extractText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  extractTextDisabled: {
    color: '#64748b',
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