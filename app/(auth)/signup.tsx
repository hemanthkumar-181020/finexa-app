import Checkbox from 'expo-checkbox';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { Ionicons,FontAwesome } from '@expo/vector-icons';



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

export default function Signup() {
  type FormErrors = {
    username?: string;
    password?: string;
    cpassword?: string;
    email?:string;
    tos?: string;
    showpassword?:boolean;
    showcpassword?:boolean;
  };

  const [isChecked, setChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [showpassword,setShowpassword] = useState(false);
  const [showcpassword,setShowcpassword] = useState(false);
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const usernameInputScale = useRef(new Animated.Value(1)).current;
  const emailInputScale = useRef(new Animated.Value(1)).current;
  const passwordInputScale = useRef(new Animated.Value(1)).current;
  const cpasswordInputScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useState(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AnimationConfig.duration.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: AnimationConfig.duration.slow,
        useNativeDriver: true,
      }),
    ]).start();
  });

  const handleInputFocus = (inputName: string, scaleAnim: Animated.Value) => {
    setFocusedInput(inputName);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleInputBlur = (scaleAnim: Animated.Value) => {
    setFocusedInput(null);
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: AnimationConfig.buttonScale.pressed,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: AnimationConfig.buttonScale.normal,
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
    if (email === '') errors.email = 'email is required';
    else if (!emailRegex.test(email)){
      errors.email = 'Invalid email format';
    }
    if (cpassword === '') errors.cpassword = 'Please re-enter your password';
    if (password && cpassword && password !== cpassword) {
      errors.cpassword = 'Passwords do not match';
    }
    if (!isChecked) errors.tos = 'You must agree to the terms and conditions';
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
      const email = `${username}@finexa.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Account created successfully');

      setUsername('');
      setPassword('');
      setCpassword('');
      setErrors({});
      setChecked(false);

      router.replace("../signin");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={Gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Know Your Habits. Master Your Money</Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelcontainer}>
                    <Text style={styles.label}>Username</Text>
                    <FontAwesome name="user" size={20} color="gray" style={styles.icon} />
                  </View>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'username' && styles.inputWrapperFocused,
                      { transform: [{ scale: usernameInputScale }] },
                    ]}
                  >
                  
                    <TextInput
                      placeholder="John_123"
                      placeholderTextColor={Colors.placeholder}
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('username', usernameInputScale)}
                      onBlur={() => handleInputBlur(usernameInputScale)}
                    />
                  </Animated.View>
                  {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelcontainer}>
                    <Text style={styles.label}>Email</Text>
                    <FontAwesome name="envelope" size={20} color="gray" style={styles.icon} />
                  </View>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'email' && styles.inputWrapperFocused,
                      { transform: [{ scale: usernameInputScale }] },
                    ]}
                  >
                    

                    <TextInput
                      placeholder="abc123@gmail.com"
                      placeholderTextColor={Colors.placeholder}
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('email', emailInputScale)}
                      onBlur={() => handleInputBlur(emailInputScale)}
                    />
                  </Animated.View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <View style = {styles.labelcontainer}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity onPress={() => setShowpassword(!showpassword)} style = {{marginLeft:'auto',marginRight:5}}>
                      <Ionicons
                        name={showpassword ? 'eye' : 'eye-off'}
                        size={24}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                      { transform: [{ scale: passwordInputScale }] },
                    ]}
                  >
                    
                    <TextInput
                      placeholder="********"
                      placeholderTextColor={Colors.placeholder}
                      secureTextEntry={!showpassword}
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('password', passwordInputScale)}
                      onBlur={() => handleInputBlur(passwordInputScale)}
                    />
                  

                  </Animated.View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelcontainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TouchableOpacity onPress={() => setShowcpassword(!showcpassword)} style = {{marginLeft:'auto',marginRight:5}} >
                    <Ionicons
                        name={showcpassword ? 'eye' : 'eye-off'}
                        size={24}
                        color="gray"
                       
                      />
                    </TouchableOpacity>
                  </View>
                    <Animated.View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'cpassword' && styles.inputWrapperFocused,
                      { transform: [{ scale: cpasswordInputScale }] },
                    ]}
                  >
                    <TextInput
                      placeholder="********"
                      placeholderTextColor={Colors.placeholder}
                      secureTextEntry={!showcpassword}
                      style={styles.input}
                      value={cpassword}
                      onChangeText={setCpassword}
                      autoCapitalize="none"
                      onFocus={() => handleInputFocus('cpassword', cpasswordInputScale)}
                      onBlur={() => handleInputBlur(cpasswordInputScale)}
                    />
                    
                  </Animated.View>
                  {errors.cpassword && <Text style={styles.errorText}>{errors.cpassword}</Text>}
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleCheckboxChange(!isChecked)}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    value={isChecked}
                    onValueChange={handleCheckboxChange}
                    color={isChecked ? Colors.mint : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={styles.checkboxText}>
                    I agree to the{' '}
                    <Link href="/privacypolicy">
                      <Text style={styles.linkText}>Terms of Service and Privacy Policy</Text>
                    </Link>
                  </Text>
                </TouchableOpacity>
                {errors.tos && <Text style={styles.errorText}>{errors.tos}</Text>}

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <LinearGradient
                      colors={Gradients.button}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/login">
                  <Text style={styles.linkText}>Log in</Text>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.heading1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.glassBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  inputWrapperFocused: {
    borderColor: Colors.inputBorderFocused,
    backgroundColor: 'rgba(127, 219, 202, 0.05)',
  },
  input: {
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  checkbox: {
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  checkboxText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  button: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glassBorder,
  },
  dividerText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
  },
  socialButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  socialButtonText: {
    ...Typography.button,
    color: Colors.deepNavy.dark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  linkText: {
    ...Typography.bodySmall,
    color: Colors.mint,
    fontWeight: '600',
  },
  icon:{
    marginLeft:'auto',
  },
  labelcontainer :{
    flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  },
});
