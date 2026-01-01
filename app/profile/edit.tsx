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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [dob, setDob] = useState<Date | null>(null);

  const [phoneError, setPhoneError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ---------------- LOAD USER DATA ---------------- */

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setPhone(d.phone || '');
        setGender(d.gender || '');
        setOccupation(d.occupation || '');
        setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4FACFE" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* FORM CARD */}
      <View style={styles.card}>
        {/* PHONE */}
        <Label text="Phone Number" />
        <Input
          icon="call"
          value={phone}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handlePhoneChange}
        />
        {phoneError ? <Error text={phoneError} /> : null}

        {/* GENDER */}
        <Label text="Gender" />
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map(g => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              activeOpacity={0.85}
              style={[
                styles.genderPill,
                gender === g && styles.genderActive,
              ]}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.genderTextActive,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OCCUPATION */}
        <Label text="Occupation" />
        <Input
          icon="briefcase"
          value={occupation}
          onChangeText={setOccupation}
        />

        {/* DOB */}
        <Label text="Date of Birth" />
        <TouchableOpacity
          style={styles.dobInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#6B7280" />
          <Text style={styles.dobText}>
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
      >
        <LinearGradient
          colors={
            canSave
              ? ['#4FACFE', '#00F2FE']
              : ['#D1D5DB', '#D1D5DB']
          }
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveText}>Save Changes</Text>
              <Ionicons name="checkmark" size={22} color="#fff" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- SMALL UI COMPONENTS ---------------- */

const Label = ({ text }: any) => (
  <Text style={styles.label}>{text}</Text>
);

const Error = ({ text }: any) => (
  <Text style={styles.error}>{text}</Text>
);

const Input = ({ icon, ...props }: any) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={20} color="#6B7280" />
    <TextInput
      style={styles.input}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 14,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderPill: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#4FACFE',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  genderTextActive: {
    color: '#2563EB',
  },
  dobInput: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  dobText: {
    fontSize: 15,
    color: '#111827',
  },
  saveButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
