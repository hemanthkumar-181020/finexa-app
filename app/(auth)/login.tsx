import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimationConfig } from '../../constants/theme';
import { db, auth } from '../../services/firebase';
import { Svg, Path } from 'react-native-svg';
import { sendPasswordResetEmail } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const GoogleLogo = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761L24.48 19.6761L24.48 28.9181L37.4434 28.9181C36.9055 31.8988 35.177 34.5356 32.6461 36.2111L32.6461 42.2078L40.3801 42.2078C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
    <Path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006L3.03296 28.6006L3.03296 34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
    <Path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115L11.0051 13.2296L3.03298 13.2296C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
    <Path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
  </Svg>
);

export default function Login() {
  type FormErrors = { email?: string; password?: string; };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  // Google Auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '898226239130-flo9kagl8vtuv5bg4g8g7igegnk8ua18.apps.googleusercontent.com',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    // expoClientId: '898226239130-v26hhs3onrsafhbg59035bc0jfqj50d2.apps.googleusercontent.com',
    webClientId: '<YOUR_WEB_CLIENT_ID>',
    responseType: 'code', // ✅ Authorization code flow
  usePKCE: true, // ✅ PKCE enabled
  scopes: ['profile', 'email'],     // required for secure flow
  });

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Google Sign-In handler
  const handleForgotPassword = async () => {
  if (!email || !email.includes('@')) {
    Alert.alert(
      'Enter your email',
      'Please enter a valid email address to reset your password.'
    );
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    Alert.alert(
      'Reset email sent',
      'Check your inbox to reset your password.'
    );
  } catch (error: any) {
    let message = 'Failed to send reset email';

    if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }

    Alert.alert('Error', message);
  }
};

  
// CHANGE TO THIS:
useEffect(() => {
  if (response?.type === 'success') {
    const { authentication } = response;
    
    if (authentication?.idToken) {
      // For id_token flow (backward compatibility)
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      signInWithCredential(auth, credential)
        .then(async () => {
          const user = auth.currentUser;
          if (!user) return;
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists() || !userSnap.data().isProfileComplete) {
            router.replace('/completeprofile');
          } else {
            router.replace('/tabs/home');
          }
        })
        .catch(err => Alert.alert('Google Sign-In failed', err.message));
    } else if (response.params?.code) {
      // For authorization code flow
      // You need to exchange the code for tokens
      Alert.alert('Authorization code received', 'Implement token exchange');
      // Add token exchange logic here
    }
  }
}, [response, router]);

  // Input focus and blur
  const handleInputFocus = (inputName: string) => { setFocusedInput(inputName); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const handleInputBlur = () => setFocusedInput(null);

  // Button animation
  const handlePressIn = () => Animated.spring(buttonScale, { toValue: 0.96, ...AnimationConfig.spring, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(buttonScale, { toValue: 1, ...AnimationConfig.spring, useNativeDriver: true }).start();

  // Form validation
  const validateForm = () => {
    let errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errors.email = 'Username or Email is required';
    else if (email.includes('@') && !emailRegex.test(email)) errors.email = 'Invalid email format';
    if (!password.trim()) errors.password = 'Password is required';

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit email/password login
  const submit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateForm()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }

    setIsLoading(true);
    try {
      let loginEmail = password;
      if (email.includes('@')) {
        loginEmail = email;
        await signInWithEmailAndPassword(auth, loginEmail, password);
      } else {
        const q = query(collection(db, 'users'), where('username', '==', email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error('User not found');
        loginEmail = querySnapshot.docs[0].data().email;
        await signInWithEmailAndPassword(auth, loginEmail, password);
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      // 🔐 BLOCK UNVERIFIED EMAIL USERS
      if (!user.emailVerified) {
        await auth.signOut();

        Alert.alert(
          'Email not verified',
          'Please verify your email before logging in. Check your inbox.'
        );

        setIsLoading(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists() || !userSnap.data().isProfileComplete) router.replace('/completeprofile');
      else router.replace('/tabs/home');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error?.message || 'Login failed';
      Alert.alert('Login failed', errorMessage);
    } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Please log in to continue and get the{'\n'}best from our app</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Login</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused, errors.email && styles.inputWrapperError]}>
                    <TextInput
                      placeholder="Email or Username"
                      placeholderTextColor="#6B7280"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onFocus={() => handleInputFocus('email')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused, errors.password && styles.inputWrapperError]}>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('password')}
                      onBlur={handleInputBlur}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF"/>
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>


                {/* Continue Button */}
                <TouchableOpacity activeOpacity={0.8} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={submit} disabled={isLoading}>
                  <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Continue'}</Text>
                  </Animated.View>
                </TouchableOpacity>


                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/signup"><Text style={styles.footerLink}>Sign up</Text></Link>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ✅ Your original styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
  header: { marginBottom: 32, paddingHorizontal: 20, paddingTop: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  formCard: { flex: 1, backgroundColor: '#1F2937', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  formTitle: { fontSize: 24, fontWeight: '600', color: '#FFFFFF', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1, borderColor: '#4B5563', paddingHorizontal: 16, height: 52 },
  inputWrapperFocused: { borderColor: '#6EE7B7' },
  inputWrapperError: { borderColor: '#EF4444' },
  input: { flex: 1, fontSize: 15, color: '#E5E7EB', fontWeight: '400' },
  eyeIcon: { padding: 4 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { fontSize: 14, color: '#6EE7B7', fontWeight: '500' },
  button: { backgroundColor: '#6EE7B7', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#4B5563' },
  dividerText: { fontSize: 13, color: '#9CA3AF', paddingHorizontal: 12 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4B5563', borderRadius: 16, height: 52, gap: 12 },
  googleButtonText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, paddingBottom: 20 },
  footerText: { fontSize: 14, color: '#9CA3AF' },
  footerLink: { fontSize: 14, color: '#6EE7B7', fontWeight: '600' },
});
