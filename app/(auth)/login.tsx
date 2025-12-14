import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimationConfig, BorderRadius, Colors, Gradients, Spacing, Typography } from '../../constants/theme';
import { auth } from '../../services/firebase';

export default function Login() {
  type FormErrors = {
    username?: string;
    password?: string;
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const usernameInputScale = useRef(new Animated.Value(1)).current;
  const passwordInputScale = useRef(new Animated.Value(1)).current;
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

  const validateForm = () => {
    let errors: FormErrors = {};
    if (username === '') errors.username = 'Username is required';
    if (password === '') errors.password = 'Password is required';
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Login successful');

      setUsername('');
      setPassword('');
      setErrors({});

      router.replace('/tabs/home');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', 'Invalid username or password');
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Know Your Habits. Master Your Money</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'username' && styles.inputWrapperFocused,
                    { transform: [{ scale: usernameInputScale }] },
                  ]}
                >
                  <TextInput
                    placeholder="john123"
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
                <Text style={styles.label}>Password</Text>
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
                    secureTextEntry={true}
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
                      {isLoading ? 'Logging in...' : 'Login'}
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
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/signup">
                <Text style={styles.linkText}>Sign up</Text>
              </Link>
            </View>
          </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
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
  button: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
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
});
