// original
// import Checkbox from 'expo-checkbox';
// import * as Haptics from 'expo-haptics';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Link, useRouter } from 'expo-router';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
// import { useRef, useState } from 'react';
// import { Ionicons,FontAwesome } from '@expo/vector-icons';



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
// import { auth, db } from '../../services/firebase';

// export default function Signup() {
//   type FormErrors = {
//     username?: string;
//     password?: string;
//     cpassword?: string;
//     email?:string;
//     tos?: string;
//     showpassword?:boolean;
//     showcpassword?:boolean;
//   };

//   const [isChecked, setChecked] = useState(false);
//   const [username, setUsername] = useState('');
//   const [email,setEmail] = useState('');
//   const [showpassword,setShowpassword] = useState(false);
//   const [showcpassword,setShowcpassword] = useState(false);
//   const [password, setPassword] = useState('');
//   const [cpassword, setCpassword] = useState('');
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [focusedInput, setFocusedInput] = useState<string | null>(null);

//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const usernameInputScale = useRef(new Animated.Value(1)).current;
//   const emailInputScale = useRef(new Animated.Value(1)).current;
//   const passwordInputScale = useRef(new Animated.Value(1)).current;
//   const cpasswordInputScale = useRef(new Animated.Value(1)).current;
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

//   const handleCheckboxChange = (value: boolean) => {
//     setChecked(value);
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   };

//   const validateForm = () => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     let errors: FormErrors = {};
//     if (username === '') errors.username = 'Username is required';
//     if (password === '') errors.password = 'Password is required';
//     if (email === '') errors.email = 'email is required';
//     else if (!emailRegex.test(email)){
//       errors.email = 'Invalid email format';
//     }
//     if (cpassword === '') errors.cpassword = 'Please re-enter your password';
//     if (password && cpassword && password !== cpassword) {
//       errors.cpassword = 'Passwords do not match';
//     }
//     if (!isChecked) errors.tos = 'You must agree to the terms and conditions';
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
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       await setDoc(doc(db, 'users', user.uid), {
//         username: username,
//         email: email,
//         createdAt: serverTimestamp(),
//       });

//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       Alert.alert('Success', 'Account created successfully');

//       setUsername('');
//       setPassword('');
//       setCpassword('');
//       setErrors({});
//       setChecked(false);

//       router.replace("../signin");
//     } catch (error: any) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert('Signup failed', error.message);
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
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//           >
//             <Animated.View
//               style={[
//                 styles.content,
//                 {
//                   opacity: fadeAnim,
//                   transform: [{ translateY: slideAnim }],
//                 },
//               ]}
//             >
//               <View style={styles.header}>
//                 <Text style={styles.title}>Create Account</Text>
//                 <Text style={styles.subtitle}>Know Your Habits. Master Your Money</Text>
//               </View>

//               <View style={styles.formCard}>
//                 <View style={styles.inputGroup}>
//                   <View style={styles.labelcontainer}>
//                     <Text style={styles.label}>Username</Text>
//                     <FontAwesome name="user" size={20} color="gray" style={styles.icon} />
//                   </View>
//                   <Animated.View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'username' && styles.inputWrapperFocused,
//                       { transform: [{ scale: usernameInputScale }] },
//                     ]}
//                   >
                  
//                     <TextInput
//                       placeholder="John_123"
//                       placeholderTextColor={Colors.placeholder}
//                       style={styles.input}
//                       value={username}
//                       onChangeText={setUsername}
//                       autoCapitalize="none"
//                       onFocus={() => handleInputFocus('username', usernameInputScale)}
//                       onBlur={() => handleInputBlur(usernameInputScale)}
//                     />
//                   </Animated.View>
//                   {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
//                 </View>

//                 <View style={styles.inputGroup}>
//                   <View style={styles.labelcontainer}>
//                     <Text style={styles.label}>Email</Text>
//                     <FontAwesome name="envelope" size={20} color="gray" style={styles.icon} />
//                   </View>
//                   <Animated.View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'email' && styles.inputWrapperFocused,
//                       { transform: [{ scale: usernameInputScale }] },
//                     ]}
//                   >
                    

//                     <TextInput
//                       placeholder="abc123@gmail.com"
//                       placeholderTextColor={Colors.placeholder}
//                       style={styles.input}
//                       value={email}
//                       onChangeText={setEmail}
//                       autoCapitalize="none"
//                       onFocus={() => handleInputFocus('email', emailInputScale)}
//                       onBlur={() => handleInputBlur(emailInputScale)}
//                     />
//                   </Animated.View>
//                   {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//                 </View>

//                 <View style={styles.inputGroup}>
//                   <View style = {styles.labelcontainer}>
//                     <Text style={styles.label}>Password</Text>
//                     <TouchableOpacity onPress={() => setShowpassword(!showpassword)} style = {{marginLeft:'auto',marginRight:5}}>
//                       <Ionicons
//                         name={showpassword ? 'eye' : 'eye-off'}
//                         size={24}
//                         color="gray"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                   <Animated.View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'password' && styles.inputWrapperFocused,
//                       { transform: [{ scale: passwordInputScale }] },
//                     ]}
//                   >
                    
//                     <TextInput
//                       placeholder="********"
//                       placeholderTextColor={Colors.placeholder}
//                       secureTextEntry={!showpassword}
//                       style={styles.input}
//                       value={password}
//                       onChangeText={setPassword}
//                       autoCapitalize="none"
//                       onFocus={() => handleInputFocus('password', passwordInputScale)}
//                       onBlur={() => handleInputBlur(passwordInputScale)}
//                     />
                  

//                   </Animated.View>
//                   {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
//                 </View>

//                 <View style={styles.inputGroup}>
//                   <View style={styles.labelcontainer}>
//                     <Text style={styles.label}>Confirm Password</Text>
//                     <TouchableOpacity onPress={() => setShowcpassword(!showcpassword)} style = {{marginLeft:'auto',marginRight:5}} >
//                     <Ionicons
//                         name={showcpassword ? 'eye' : 'eye-off'}
//                         size={24}
//                         color="gray"
                       
//                       />
//                     </TouchableOpacity>
//                   </View>
//                     <Animated.View
//                     style={[
//                       styles.inputWrapper,
//                       focusedInput === 'cpassword' && styles.inputWrapperFocused,
//                       { transform: [{ scale: cpasswordInputScale }] },
//                     ]}
//                   >
//                     <TextInput
//                       placeholder="********"
//                       placeholderTextColor={Colors.placeholder}
//                       secureTextEntry={!showcpassword}
//                       style={styles.input}
//                       value={cpassword}
//                       onChangeText={setCpassword}
//                       autoCapitalize="none"
//                       onFocus={() => handleInputFocus('cpassword', cpasswordInputScale)}
//                       onBlur={() => handleInputBlur(cpasswordInputScale)}
//                     />
                    
//                   </Animated.View>
//                   {errors.cpassword && <Text style={styles.errorText}>{errors.cpassword}</Text>}
//                 </View>

//                 <TouchableOpacity
//                   style={styles.checkboxContainer}
//                   onPress={() => handleCheckboxChange(!isChecked)}
//                   activeOpacity={0.7}
//                 >
//                   <Checkbox
//                     value={isChecked}
//                     onValueChange={handleCheckboxChange}
//                     color={isChecked ? Colors.mint : undefined}
//                     style={styles.checkbox}
//                   />
//                   <Text style={styles.checkboxText}>
//                     I agree to the{' '}
//                     <Link href="/privacypolicy">
//                       <Text style={styles.linkText}>Terms of Service and Privacy Policy</Text>
//                     </Link>
//                   </Text>
//                 </TouchableOpacity>
//                 {errors.tos && <Text style={styles.errorText}>{errors.tos}</Text>}

//                 <TouchableOpacity
//                   activeOpacity={0.9}
//                   onPressIn={handlePressIn}
//                   onPressOut={handlePressOut}
//                   onPress={submit}
//                   disabled={isLoading}
//                 >
//                   <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
//                     <LinearGradient
//                       colors={Gradients.button}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 0 }}
//                       style={styles.button}
//                     >
//                       <Text style={styles.buttonText}>
//                         {isLoading ? 'Creating account...' : 'Sign Up'}
//                       </Text>
//                     </LinearGradient>
//                   </Animated.View>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.dividerContainer}>
//                 <View style={styles.dividerLine} />
//                 <Text style={styles.dividerText}>or continue with</Text>
//                 <View style={styles.dividerLine} />
//               </View>

//               <TouchableOpacity style={styles.socialButton}>
//                 <Text style={styles.socialButtonText}>Google</Text>
//               </TouchableOpacity>

//               <View style={styles.footer}>
//                 <Text style={styles.footerText}>Already have an account? </Text>
//                 <Link href="/login">
//                   <Text style={styles.linkText}>Log in</Text>
//                 </Link>
//               </View>
//             </Animated.View>
//           </ScrollView>
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
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   content: {
//     paddingHorizontal: Spacing.lg,
//     paddingVertical: Spacing.xl,
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
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: Spacing.md,
//   },
//   checkbox: {
//     marginRight: Spacing.sm,
//     borderRadius: BorderRadius.sm,
//   },
//   checkboxText: {
//     ...Typography.bodySmall,
//     color: Colors.textSecondary,
//     flex: 1,
//   },
//   button: {
//     borderRadius: BorderRadius.full,
//     paddingVertical: Spacing.md,
//     alignItems: 'center',
//     marginTop: Spacing.sm,
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
//   icon:{
//     marginLeft:'auto',
//   },
//   labelcontainer :{
//     flexDirection: 'row',
//   alignItems: 'center',
//   marginBottom: 8,
//   },
// });

// green white ui
import Checkbox from 'expo-checkbox';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { Ionicons,FontAwesome } from '@expo/vector-icons';
import { Svg, Path } from 'react-native-svg';


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
import { AnimationConfig, BorderRadius, Colors, Gradients, Spacing, Typography } from '../../constants/theme';
import { auth, db } from '../../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
export default function Signup() {
  type FormErrors = {
    username?: string;
    password?: string;
    cpassword?: string;
    email?: string;
    tos?: string;
  };
  const [isPressed, setIsPressed] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showpassword, setShowpassword] = useState(false);
  const [showcpassword, setShowcpassword] = useState(false);
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
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

  const handleCheckboxChange = (value: boolean) => {
    setChecked(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errors: FormErrors = {};
    if (username === '') errors.username = 'Username is required';
    if (password === '') errors.password = 'Password is required';
    if (email === '') errors.email = 'Email is required';
    else if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (cpassword === '') errors.cpassword = 'Please re-enter your password';
    if (password && cpassword && password !== cpassword) {
      errors.cpassword = 'Passwords do not match';
    }
    if (!isChecked) errors.tos = 'You must agree to continue';
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
        const q = query(
        collection(db, 'users'),
        where('username', '==', username)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
        Alert.alert('Username already taken');
        setIsLoading(false);
        return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: user.email,
            createdAt: serverTimestamp(),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Account created successfully');

        setUsername('');
        setEmail('');
        setPassword('');
        setCpassword('');
        setErrors({});
        setChecked(false);

         router.replace('../signin');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup failed', error.message);
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
              
              <View style={styles.headerIcon}>
                <FontAwesome name="user-plus" size={50} color='#00A36C' />
              </View>
              <View style={styles.header}>  
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join us to master your finances</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                      errors.email && styles.inputWrapperError,
                    ]}
                  >
                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                      placeholder="Email"
                      placeholderTextColor="#94A3B8"
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
                      focusedInput === 'username' && styles.inputWrapperFocused,
                      errors.username && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Username"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('username')}
                      onBlur={handleInputBlur}
                    />
                  </View>
                  {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                </View>
                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                      errors.password && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showpassword}
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('password')}
                      onBlur={handleInputBlur}
                    />
                    <TouchableOpacity
                      onPress={() => setShowpassword(!showpassword)}
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showpassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'cpassword' && styles.inputWrapperFocused,
                      errors.cpassword && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showcpassword}
                      style={styles.input}
                      value={cpassword}
                      onChangeText={setCpassword}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('cpassword')}
                      onBlur={handleInputBlur}
                    />
                    <TouchableOpacity
                      onPress={() => setShowcpassword(!showcpassword)}
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showcpassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.cpassword && <Text style={styles.errorText}>{errors.cpassword}</Text>}
                </View>

                {/* Terms Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleCheckboxChange(!isChecked)}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    value={isChecked}
                    onValueChange={handleCheckboxChange}
                    color={isChecked ? '#10B981' : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxText}>
                    I agree to the{' '}
                    <Link href="/privacypolicy">
                      <Text style={styles.linkText}>Terms & Privacy Policy</Text>
                    </Link>
                  </Text>
                </TouchableOpacity>
                {errors.tos && <Text style={styles.errorText}>{errors.tos}</Text>}

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                  </Animated.View>
                    </TouchableOpacity>
                    
                        
                    </View>

                <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/login">
                  <Text style={styles.footerLink}>Sign In</Text>
                </Link>
              </View>    
                
                
              <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                </View> 

               <Animated.View >
                        <TouchableOpacity
                            style={styles.google_button}
                            activeOpacity={0.9}
                        >
                            <GoogleLogo />
                            <Text style={styles.google_buttonText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </Animated.View>
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
    backgroundColor: '#F8FAFC',
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
    flexDirection: 'column',
    alignItems: 'center',
  },
   headerIcon: {
    alignItems:'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 12,
    borderRadius: 6,
  },
  checkboxText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: '#10B981',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:32,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  google_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  google_buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c4043',
  },
  google_container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  google_card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginTop:52,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
   },
   dividerContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     marginVertical: Spacing.lg,
   },
   dividerLine: {
     flex: 1,
     height: 1,
     backgroundColor:'grey',
   },
   dividerText: {
    ...Typography.bodySmall,
    color: 'grey',
    paddingHorizontal: Spacing.md,
  },
});


