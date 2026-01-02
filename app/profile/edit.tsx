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
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditProfile() {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🎨 THEME (Firestore only)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

  /* ---------------- LOAD PROFILE + THEME ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (snap.exists()) {
          const d = snap.data();

          setPhone(d.phone || '');
          setGender(d.gender || '');
          setOccupation(d.occupation || '');
          setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);

          // ✅ FETCH THEME FROM FIRESTORE ON RELOAD
          if (d.theme === 'dark' || d.theme === 'light') {
            setTheme(d.theme);
          }
        }
      } catch (err) {
        console.log('Load profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  /* ---------------- TOGGLE THEME (BACKEND UPDATE ONLY) ---------------- */
  const toggleTheme = async () => {
    if (!user) return;

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        theme: newTheme, // ✅ BACKEND CHANGE
        updatedAt: new Date(),
      });
    } catch (err) {
      console.log('Theme update error:', err);
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

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    if (!user || !canSave) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        gender,
        occupation,
        dob,
        updatedAt: new Date(),
      });
      router.back();
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color={currentColors.header} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.header }]}>
            Edit Profile
          </Text>
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
          />
        </View>
      </View>

      {/* FORM */}
      <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
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

        <Label text="Gender" color={currentColors.label} />
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              style={[
                styles.genderPill,
                { backgroundColor: currentColors.inputBg, borderColor: currentColors.border },
                gender === g && {
                  backgroundColor: currentColors.accentLight,
                  borderColor: currentColors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  { color: currentColors.textSecondary },
                  gender === g && { color: currentColors.accent },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <Label text="Date of Birth" color={currentColors.label} />
        <TouchableOpacity
          style={[styles.dobInput, { backgroundColor: currentColors.inputBg, borderColor: currentColors.border }]}
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
      <TouchableOpacity onPress={handleSave} disabled={!canSave || saving}>
        <LinearGradient
          colors={canSave ? currentColors.buttonGradient : currentColors.buttonDisabled}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */
const Label = ({ text, color }: any) => <Text style={[styles.label, { color }]}>{text}</Text>;
const Error = ({ text, color }: any) => <Text style={[styles.error, { color }]}>{text}</Text>;

const Input = ({ icon, iconColor, inputColor, placeholderColor, backgroundColor, borderColor, ...props }: any) => (
  <View style={[styles.inputWrapper, { backgroundColor, borderColor }]}>
    <Ionicons name={icon} size={20} color={iconColor} />
    <TextInput style={[styles.input, { color: inputColor }]} placeholderTextColor={placeholderColor} {...props} />
  </View>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  themeToggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { borderRadius: 22, padding: 20, marginBottom: 28, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 14, paddingHorizontal: 14, gap: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: 16 },
  error: { fontSize: 12, marginTop: 6 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderPill: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  genderText: { fontSize: 15, fontWeight: '600' },
  dobInput: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12, borderWidth: 1 },
  dobText: { fontSize: 16, fontWeight: '500' },
  saveButton: { height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 17, fontWeight: '700', color: '#000' },
});
