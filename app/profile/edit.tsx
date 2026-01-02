import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  useColorScheme,
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

export default function EditProfile() {
  const router = useRouter();
  const user = auth.currentUser;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isThemeEnabled, setIsThemeEnabled] = useState(false);

  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [dob, setDob] = useState<Date | null>(null);

  const [phoneError, setPhoneError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ---------------- THEME COLORS ---------------- */
  const colors = {
    dark: {
      background: '#000000',
      card: '#111827',
      inputBg: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#374151',
      accent: '#00FFF0',
      accentLight: 'rgba(0, 255, 240, 0.1)',
      buttonGradient: ['#00FFF0', '#10B981'],
      buttonDisabled: ['#4B5563', '#6B7280'],
      error: '#EF4444',
      header: '#00FFF0',
      label: '#00FFF0',
      toggleTrack: '#374151',
      toggleThumb: '#00FFF0',
      icon: '#00FFF0',
    },
    light: {
      background: '#F9FAFB',
      card: '#FFFFFF',
      inputBg: '#F3F4F6',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#D1D5DB',
      accent: '#10B981',
      accentLight: 'rgba(16, 185, 129, 0.1)',
      buttonGradient: ['#10B981', '#00FFF0'],
      buttonDisabled: ['#D1D5DB', '#9CA3AF'],
      error: '#EF4444',
      header: '#111827',
      label: '#10B981',
      toggleTrack: '#D1D5DB',
      toggleThumb: '#10B981',
      icon: '#10B981',
    }
  };

  const currentColors = colors[theme];

  /* ---------------- LOAD USER DATA & THEME ---------------- */

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        // First try to load user profile
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setPhone(d.phone || '');
          setGender(d.gender || '');
          setOccupation(d.occupation || '');
          setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);
          
          // Check if user has theme preference
          if (d.theme) {
            setTheme(d.theme);
            setIsThemeEnabled(true);
          } else {
            // Try to get theme from global settings
            try {
              const globalRef = doc(db, 'global', 'settings');
              const globalSnap = await getDoc(globalRef);
              if (globalSnap.exists() && globalSnap.data().theme) {
                const globalTheme = globalSnap.data().theme;
                setTheme(globalTheme);
                setIsThemeEnabled(true);
              } else {
                // Fallback to system or default dark
                setTheme(isDark ? 'dark' : 'light');
                setIsThemeEnabled(false);
              }
            } catch (globalError) {
              console.log('Global settings not found, using default theme');
              setTheme(isDark ? 'dark' : 'light');
              setIsThemeEnabled(false);
            }
          }
        }
      } catch (error) {
        console.log('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, isDark]);

  /* ---------------- TOGGLE THEME ---------------- */

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setIsThemeEnabled(!isThemeEnabled);
    
    // Save theme preference to user profile
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          theme: newTheme,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  /* ---------------- PHONE VALIDATION ---------------- */

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setPhone(cleaned);

    if (cleaned.length === 0) {
      setPhoneError('');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError('Enter valid 10-digit mobile number');
    } else {
      setPhoneError('');
    }
  };

  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSave = isPhoneValid && gender && dob;

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!user || !canSave) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        gender,
        occupation,
        dob,
        theme: isThemeEnabled ? theme : null,
        updatedAt: new Date().toISOString(),
      });
      router.back(); // ✅ GO BACK TO /profile
    } catch (err) {
      console.log('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentColors.background }]}>
        <ActivityIndicator size="large" color={currentColors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* HEADER WITH THEME TOGGLE */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color={currentColors.header} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.header }]}>Edit Profile</Text>
        </View>
        
        <View style={styles.themeToggleContainer}>
          <MaterialIcons 
            name={theme === 'dark' ? 'dark-mode' : 'light-mode'} 
            size={22} 
            color={currentColors.icon} 
          />
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: currentColors.toggleTrack, true: currentColors.toggleTrack }}
            thumbColor={currentColors.toggleThumb}
            ios_backgroundColor={currentColors.toggleTrack}
            style={styles.themeSwitch}
          />
          <Text style={[styles.themeLabel, { color: currentColors.textSecondary }]}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </Text>
        </View>
      </View>

      {/* FORM CARD */}
      <View style={[styles.card, { 
        backgroundColor: currentColors.card,
        borderColor: currentColors.border 
      }]}>
        {/* PHONE */}
        <Label text="Phone Number" color={currentColors.label} />
        <Input
          icon="call"
          value={phone}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handlePhoneChange}
          iconColor={currentColors.accent}
          inputColor={currentColors.text}
          placeholderColor={currentColors.textSecondary}
          backgroundColor={currentColors.inputBg}
          borderColor={currentColors.border}
        />
        {phoneError ? <Error text={phoneError} color={currentColors.error} /> : null}

        {/* GENDER */}
        <Label text="Gender" color={currentColors.label} />
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              activeOpacity={0.85}
              style={[
                styles.genderPill,
                { 
                  backgroundColor: currentColors.inputBg,
                  borderColor: currentColors.border 
                },
                gender === g && {
                  backgroundColor: currentColors.accentLight,
                  borderColor: currentColors.accent,
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  { color: currentColors.textSecondary },
                  gender === g && {
                    color: currentColors.accent,
                    fontWeight: '700',
                  },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OCCUPATION */}
        <Label text="Occupation" color={currentColors.label} />
        <Input
          icon="briefcase"
          value={occupation}
          onChangeText={setOccupation}
          iconColor={currentColors.accent}
          inputColor={currentColors.text}
          placeholderColor={currentColors.textSecondary}
          backgroundColor={currentColors.inputBg}
          borderColor={currentColors.border}
        />

        {/* DOB */}
        <Label text="Date of Birth" color={currentColors.label} />
        <TouchableOpacity
          style={[
            styles.dobInput,
            { 
              backgroundColor: currentColors.inputBg,
              borderColor: currentColors.border 
            }
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color={currentColors.accent} />
          <Text style={[styles.dobText, { color: currentColors.text }]}>
            {dob ? dob.toDateString() : 'Select date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date(2000, 0, 1)}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setDob(date);
            }}
          />
        )}
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={!canSave || saving}
        activeOpacity={0.9}
        style={{ opacity: canSave ? 1 : 0.6 }}
      >
        <LinearGradient
          colors={canSave ? currentColors.buttonGradient : currentColors.buttonDisabled}
          style={[
            styles.saveButton,
            { borderColor: canSave ? 'rgba(0, 255, 240, 0.3)' : currentColors.border }
          ]}
        >
          {saving ? (
            <ActivityIndicator color={theme === 'dark' ? '#000' : '#FFF'} />
          ) : (
            <>
              <Text style={[
                styles.saveText,
                { color: theme === 'dark' ? '#000' : '#FFF' }
              ]}>
                Save Changes
              </Text>
              <Ionicons 
                name="checkmark" 
                size={22} 
                color={theme === 'dark' ? '#000' : '#FFF'} 
              />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- SMALL UI COMPONENTS ---------------- */

const Label = ({ text, color }: any) => (
  <Text style={[styles.label, { color }]}>{text}</Text>
);

const Error = ({ text, color }: any) => (
  <Text style={[styles.error, { color }]}>{text}</Text>
);

interface InputProps {
  icon: string;
  iconColor: string;
  inputColor: string;
  placeholderColor: string;
  backgroundColor: string;
  borderColor: string;
  [key: string]: any;
}

const Input = ({ 
  icon, 
  iconColor, 
  inputColor, 
  placeholderColor, 
  backgroundColor, 
  borderColor, 
  ...props 
}: InputProps) => (
  <View style={[
    styles.inputWrapper, 
    { 
      backgroundColor, 
      borderColor 
    }
  ]}>
    <Ionicons name={icon} size={20} color={iconColor} />
    <TextInput
      style={[styles.input, { color: inputColor }]}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeSwitch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderPill: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dobInput: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    borderWidth: 1,
  },
  dobText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
  },
});