// import * as Haptics from 'expo-haptics';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Link, useRouter } from 'expo-router';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { useRef, useState } from 'react';
// import {
//   Alert,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AnimationConfig, BorderRadius, Colors, Gradients, Spacing, Typography } from '../../constants/theme';
// import { auth } from '../../services/firebase';

// export default function Login() {
//   type FormErrors = {
//     username?: string;
//     password?: string;
//   };
//   const[email,setEmail]=useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [focusedInput, setFocusedInput] = useState<string | null>(null);

//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const usernameInputScale = useRef(new Animated.Value(1)).current;
//   const passwordInputScale = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;

//   useState(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: AnimationConfig.duration.slow,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: AnimationConfig.duration.slow,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   });

//   const handleInputFocus = (inputName: string, scaleAnim: Animated.Value) => {
//     setFocusedInput(inputName);
//     Animated.spring(scaleAnim, {
//       toValue: 1.02,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   };

//   const handleInputBlur = (scaleAnim: Animated.Value) => {
//     setFocusedInput(null);
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressIn = () => {
//     Animated.spring(buttonScale, {
//       toValue: AnimationConfig.buttonScale.pressed,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(buttonScale, {
//       toValue: AnimationConfig.buttonScale.normal,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//   };

//   const validateForm = () => {
//     let errors: FormErrors = {};
//     if (username === '') errors.username = 'Username is required';
//     if (password === '') errors.password = 'Password is required';
//     setErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const router = useRouter();

//   const submit = async () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
//     if (!validateForm()) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const email = `${username}@finexa.com`;
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);

//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       Alert.alert('Success', 'Login successful');

//       setUsername('');
//       setPassword(''); 
//       setErrors({});

//       router.replace('/tabs/home');
//     } catch (error: any) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert('Login failed', 'Invalid username or password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <LinearGradient colors={Gradients.primary} style={styles.container}>
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.keyboardView}
//         >
//           <Animated.View
//             style={[
//               styles.content,
//               {
//                 opacity: fadeAnim,
//                 transform: [{ translateY: slideAnim }],
//               },
//             ]}
//           >
//             <View style={styles.header}>
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>Know Your Habits. Master Your Money</Text>
//             </View>

//             <View style={styles.formCard}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Username or Email</Text>
//                 <Animated.View
//                   style={[
//                     styles.inputWrapper,
//                     focusedInput === 'username' && styles.inputWrapperFocused,
//                     { transform: [{ scale: usernameInputScale }] },
//                   ]}
//                 >
//                   <TextInput
//                     placeholder="john_123"
//                     placeholderTextColor={Colors.placeholder}
//                     style={styles.input}
//                     value={username}
//                     onChangeText={setUsername}
//                     autoCapitalize="none"
//                     onFocus={() => handleInputFocus('username', usernameInputScale)}
//                     onBlur={() => handleInputBlur(usernameInputScale)}
//                   />
//                 </Animated.View>
//                 {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.label}>Password</Text>
//                 <Animated.View
//                   style={[
//                     styles.inputWrapper,
//                     focusedInput === 'password' && styles.inputWrapperFocused,
//                     { transform: [{ scale: passwordInputScale }] },
//                   ]}
//                 >
//                   <TextInput
//                     placeholder="********"
//                     placeholderTextColor={Colors.placeholder}
//                     secureTextEntry={true}
//                     style={styles.input}
//                     value={password}
//                     onChangeText={setPassword}
//                     autoCapitalize="none"
//                     onFocus={() => handleInputFocus('password', passwordInputScale)}
//                     onBlur={() => handleInputBlur(passwordInputScale)}
//                   />
//                 </Animated.View>
//                 {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//               </View>

//               <TouchableOpacity
//                 activeOpacity={0.9}
//                 onPressIn={handlePressIn}
//                 onPressOut={handlePressOut}
//                 onPress={submit}
//                 disabled={isLoading}
//               >
//                 <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
//                   <LinearGradient
//                     colors={Gradients.button}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.button}
//                   >
//                     <Text style={styles.buttonText}>
//                       {isLoading ? 'Logging in...' : 'Login'}
//                     </Text>
//                   </LinearGradient>
//                 </Animated.View>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.dividerContainer}>
//               <View style={styles.dividerLine} />
//               <Text style={styles.dividerText}>or continue with</Text>
//               <View style={styles.dividerLine} />
//             </View>

//             <TouchableOpacity style={styles.socialButton}>
//               <Text style={styles.socialButtonText}>Google</Text>
//             </TouchableOpacity>

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account? </Text>
//               <Link href="/signup">
//                 <Text style={styles.linkText}>Sign up</Text>
//               </Link>
//             </View>
//           </Animated.View>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: Spacing.lg,
//     justifyContent: 'center',
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: Spacing.xl,
//   },
//   title: {
//     ...Typography.heading1,
//     marginBottom: Spacing.sm,
//   },
//   subtitle: {
//     ...Typography.bodySmall,
//     textAlign: 'center',
//   },
//   formCard: {
//     backgroundColor: Colors.glassBackground,
//     borderRadius: BorderRadius.xl,
//     padding: Spacing.lg,
//     borderWidth: 1,
//     borderColor: Colors.glassBorder,
//   },
//   inputGroup: {
//     marginBottom: Spacing.md,
//   },
//   label: {
//     ...Typography.label,
//     marginBottom: Spacing.xs,
//   },
//   inputWrapper: {
//     backgroundColor: Colors.inputBackground,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.inputBorder,
//   },
//   inputWrapperFocused: {
//     borderColor: Colors.inputBorderFocused,
//     backgroundColor: 'rgba(127, 219, 202, 0.05)',
//   },
//   input: {
//     padding: Spacing.md,
//     ...Typography.body,
//     color: Colors.textPrimary,
//   },
//   errorText: {
//     color: Colors.error,
//     fontSize: 12,
//     marginTop: Spacing.xs,
//   },
//   button: {
//     borderRadius: BorderRadius.full,
//     paddingVertical: Spacing.md,
//     alignItems: 'center',
//     marginTop: Spacing.md,
//   },
//   buttonText: {
//     ...Typography.button,
//     color: Colors.white,
//   },
//   dividerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: Spacing.lg,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: Colors.glassBorder,
//   },
//   dividerText: {
//     ...Typography.bodySmall,
//     color: Colors.textMuted,
//     paddingHorizontal: Spacing.md,
//   },
//   socialButton: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.full,
//     paddingVertical: Spacing.md,
//     alignItems: 'center',
//   },
//   socialButtonText: {
//     ...Typography.button,
//     color: Colors.deepNavy.dark,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: Spacing.lg,
//   },
//   footerText: {
//     ...Typography.bodySmall,
//     color: Colors.textSecondary,
//   },
//   linkText: {
//     ...Typography.bodySmall,
//     color: Colors.mint,
//     fontWeight: '600',
//   },
// });


// previous verson..........................................................................................................................................................................................................................................................................


// import * as Haptics from 'expo-haptics';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Link, useRouter } from 'expo-router';
// import { useRef, useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
// import {
//   Alert,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AnimationConfig, BorderRadius, Colors, Gradients, Spacing, Typography } from '../../constants/theme';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { auth } from '../../services/firebase';
// import { signInWithEmailAndPassword } from 'firebase/auth';

// export default function Login() {
//   type FormErrors = {
//     email?: string;
//     password?: string;
//   };

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [focusedInput, setFocusedInput] = useState<string | null>(null);

//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useState(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   });

//   const handleInputFocus = (inputName: string) => {
//     setFocusedInput(inputName);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   };

//   const handleInputBlur = () => {
//     setFocusedInput(null);
//   };

//   const handlePressIn = () => {
//     Animated.spring(buttonScale, {
//       toValue: 0.96,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(buttonScale, {
//       toValue: 1,
//       ...AnimationConfig.spring,
//       useNativeDriver: true,
//     }).start();
//   };

//   const validateForm = () => {
//     let errors: FormErrors = {};
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   if (email.trim() === '') {
//     errors.email = 'Username or Email is required';
//   }

 
//   else if (email.includes('@')) {
//     if (!emailRegex.test(email)) {
//       errors.email = 'Invalid email format';
//     }
//   }

//   if (password.trim() === '') {
//     errors.password = 'Password is required';
//   }

//   setErrors(errors);
//   return Object.keys(errors).length === 0;
//   };

//   const router = useRouter();

//   const submit = async () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

//     if (!validateForm()) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return;
//     }

//     setIsLoading(true);

//     try {
//     let loginEmail = '';


//     if (email.includes('@')) {
     
//       loginEmail = email;
//     } else {
      
//       const q = query(
//         collection(db, 'users'),
//         where('username', '==', email)
//       );

//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         throw new Error('User not found');
//       }
//       loginEmail = querySnapshot.docs[0].data().email;
//       await signInWithEmailAndPassword(auth, loginEmail, password);
//      }
//      router.replace('/tabs/home');
//     }
//     catch (error: any) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert('Login failed', 'Invalid email or password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.keyboardView}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

//               <View style={styles.header}>
//                 <Text style={styles.title}>Welcome Back</Text>
//                 <Text style={styles.subtitle}>Your Habits. Master Your Money</Text>
//               </View>


//               <View style={styles.form}>
//                 <View style={styles.inputGroup}>
//                   <View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'email' && styles.inputWrapperFocused,
//                       errors.email && styles.inputWrapperError,
//                     ]}
//                   >
//                     <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
//                     <TextInput
//                       placeholder="Username or Email"
//                       placeholderTextColor="#94A3B8"
//                       style={styles.input}
//                       value={email}
//                       onChangeText={setEmail}
//                       autoCapitalize="none"
//                       keyboardType="email-address"
//                       onFocus={() => handleInputFocus('email')}
//                       onBlur={handleInputBlur}
//                     />
//                   </View>
//                   {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//                 </View>

//                 <View style={styles.inputGroup}>
//                   <View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'password' && styles.inputWrapperFocused,
//                       errors.password && styles.inputWrapperError,
//                     ]}
//                   >
//                     <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
//                     <TextInput
//                       placeholder="Password"
//                       placeholderTextColor="#94A3B8"
//                       secureTextEntry={!showPassword}
//                       style={styles.input}
//                       value={password}
//                       onChangeText={setPassword}
//                       autoCapitalize="none"
//                       onFocus={() => handleInputFocus('password')}
//                       onBlur={handleInputBlur}
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword(!showPassword)}
//                       style={styles.eyeIcon}
//                       hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                     >
//                       <Ionicons
//                         name={showPassword ? 'eye-outline' : 'eye-off-outline'}
//                         size={20}
//                         color="#64748B"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                   {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//                 </View>



//                 <TouchableOpacity
//                   activeOpacity={0.8}
//                   onPressIn={handlePressIn}
//                   onPressOut={handlePressOut}
//                   onPress={submit}
//                   disabled={isLoading}
//                 >
//                   <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
//                     <Text style={styles.buttonText}>
//                       {isLoading ? 'Logging in...' : 'Login'}
//                     </Text>
//                   </Animated.View>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.footer}>
//                 <Text style={styles.footerText}>Don't have an account? </Text>
//                 <Link href="/signup">
//                   <Text style={styles.footerLink}>Sign Up</Text>
//                 </Link>
//               </View>
//             </Animated.View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   content: {
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//   },
//   header: {
//     marginBottom: 32,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#0F172A',
//     marginBottom: 8,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 15,
//     color: '#64748B',
//     fontWeight: '400',
//   },
//   form: {
//     marginBottom: 20,
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#E2E8F0',
//     paddingHorizontal: 14,
//     height: 52,
//   },
//   inputWrapperFocused: {
//     borderColor: '#10B981',
//     backgroundColor: '#F0FDF4',
//   },
//   inputWrapperError: {
//     borderColor: '#EF4444',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     fontSize: 15,
//     color: '#0F172A',
//     fontWeight: '500',
//   },
//   eyeIcon: {
//     padding: 4,
//   },
//   errorText: {
//     color: '#EF4444',
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 20,
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//     color: '#10B981',
//     fontWeight: '600',
//   },
//   button: {
//     backgroundColor: '#10B981',
//     borderRadius: 12,
//     height: 52,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     letterSpacing: 0.3,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   footerText: {
//     fontSize: 14,
//     color: '#64748B',
//   },
//   footerLink: {
//     fontSize: 14,
//     color: '#10B981',
//     fontWeight: '600',
//   },
// });

import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimationConfig } from '../../constants/theme';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Svg, Path } from 'react-native-svg';

const GoogleLogo = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path
      d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761L24.48 19.6761L24.48 28.9181L37.4434 28.9181C36.9055 31.8988 35.177 34.5356 32.6461 36.2111L32.6461 42.2078L40.3801 42.2078C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
      fill="#4285F4"
    />
    <Path
      d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006L3.03296 28.6006L3.03296 34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
      fill="#34A853"
    />
    <Path
      d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115L11.0051 13.2296L3.03298 13.2296C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
      fill="#FBBC04"
    />
    <Path
      d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
      fill="#EA4335"
    />
  </Svg>
);

export default function Login() {
  type FormErrors = {
    email?: string;
    password?: string;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useState(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  });

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  };

  const validateForm = () => {
    let errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() === '') {
      errors.email = 'Username or Email is required';
    } else if (email.includes('@')) {
      if (!emailRegex.test(email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (password.trim() === '') {
      errors.password = 'Password is required';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const router = useRouter();

  const submit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    try {
      let loginEmail = '';

      if (email.includes('@')) {
        loginEmail = email;
      } else {
        const q = query(
          collection(db, 'users'),
          where('username', '==', email)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('User not found');
        }
        loginEmail = querySnapshot.docs[0].data().email;
        await signInWithEmailAndPassword(auth, loginEmail, password);
      }
      router.replace('/tabs/home');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              {/* Header Section */}
              <View style={styles.header}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>
                  Please log in to continue and get the{'\n'}best from our app
                </Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Login</Text>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                      errors.email && styles.inputWrapperError,
                    ]}
                  >
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

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                      errors.password && styles.inputWrapperError,
                    ]}
                  >
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
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Logging in...' : 'Continue'}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or, login with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                  <GoogleLogo />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/signup">
                    <Text style={styles.footerLink}>Sign up</Text>
                  </Link>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#6EE7B7',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#E5E7EB',
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6EE7B7',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6EE7B7',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4B5563',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    paddingHorizontal: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 16,
    height: 52,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: 14,
    color: '#6EE7B7',
    fontWeight: '600',
  },
});