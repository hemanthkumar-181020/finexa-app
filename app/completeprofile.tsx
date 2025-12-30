import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimationConfig } from '../constants/theme';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CompleteProfile() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [photoURI, setPhotoURI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;

    const d = snap.data();
    setName(d.name || '');
    setOccupation(d.occupation || '');
    setPhone(d.phone || '');
    setGender(d.gender || '');
    setPhotoURI(d.photoURL || null);

    if (d.dob) {
      const date = d.dob.toDate();
      setDobDate(date);
      setDob(date.toISOString().split('T')[0]);
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!occupation.trim()) return 'Occupation is required';
    if (!phone.trim()) return 'Phone is required';
    if (!dob.trim()) return 'Date of birth is required';
    return null;
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

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoURI(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string, uid: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `users/${uid}/profile.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    setDobDate(selectedDate);
    setDob(selectedDate.toISOString().split('T')[0]);
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error);
      return;
    }

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      let uploadedPhotoURL = photoURI;
      if (photoURI && !photoURI.startsWith('https')) {
        uploadedPhotoURL = await uploadPhoto(photoURI, user.uid);
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          name,
          occupation,
          phone,
          gender,
          dob: new Date(dob),
          photoURL: uploadedPhotoURL || null,
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/tabs/home');
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not save profile');
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.header}>
                <Text style={styles.title}>Complete Profile</Text>
                <Text style={styles.subtitle}>Tell us a bit more about you</Text>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Your Details</Text>

                <TouchableOpacity style={styles.photoWrapper} onPress={pickImage}>
                  {photoURI ? (
                    <Image source={{ uri: photoURI }} style={styles.photo} />
                  ) : (
                    <Text style={styles.photoText}>Upload Photo (Optional)</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Occupation"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={occupation}
                    onChangeText={setOccupation}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Phone"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* DOB FIELD */}
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dobRow}>
                    <Text style={[styles.input, !dob && { color: '#9CA3AF' }]}>
                      {dob || 'Date of Birth'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#0EA5E9" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.genderLabel}>Gender (Optional)</Text>

                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map((item) => {
                    const selected = gender === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        onPress={() => setGender(selected ? '' : item)}
                        style={[
                          styles.genderChip,
                          selected && styles.genderChipActive,
                        ]}
                      >
                        <View style={styles.genderChipContent}>
                          <Ionicons
                            name={
                              item === 'Male'
                                ? 'male'
                                : item === 'Female'
                                ? 'female'
                                : 'transgender'
                            }
                            size={16}
                            color={selected ? '#000' : '#6EE7B7'}
                          />
                          <Text
                            style={[
                              styles.genderText,
                              selected && styles.genderTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dobDate || new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    maximumDate={new Date()}
                    onChange={onDateChange}
                  />
                )}

                <TouchableOpacity
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Animated.View
                    style={[
                      styles.button,
                      { transform: [{ scale: buttonScale }] },
                    ]}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Saving...' : 'Continue'}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 40, marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', color: '#6EE7B7', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#0EA5E9' },
  formCard: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6EE7B7',
    marginBottom: 20,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 14,
  },
  input: { color: '#6EE7B7', fontSize: 15 },
  dobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#000' },
  photoWrapper: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#0EA5E9',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoText: { color: '#6EE7B7', fontSize: 14 },
  genderLabel: { color: '#9CA3AF', fontSize: 13, marginBottom: 8 },
  genderRow: { flexDirection: 'row', marginBottom: 18 },
  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderChipActive: { backgroundColor: '#0EA5E9' },
  genderText: { color: '#6EE7B7', fontSize: 14 },
  genderTextActive: { color: '#000', fontWeight: '600' },
  genderChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
