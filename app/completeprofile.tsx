import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
  const [gender, setGender] = useState('');
  const [photoURI, setPhotoURI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setDob(d.dob ? d.dob.toDate().toISOString().split('T')[0] : '');
    setPhotoURI(d.photoURL || null);
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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setPhotoURI(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string, userId: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `users/${userId}/profile.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const submit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

      // Upload photo only if user selected one
      let uploadedPhotoURL = photoURI;
      if (photoURI && !photoURI.startsWith('https://')) {
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
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Complete Profile</Text>
                <Text style={styles.subtitle}>Tell us a bit more about you</Text>
              </View>

              {/* Card */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Your Details</Text>

                {/* Optional Photo */}
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

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="DOB (YYYY-MM-DD)"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Gender (Optional)"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={gender}
                    onChangeText={setGender}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={submit}
                  disabled={isLoading}
                >
                  <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
                    <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Continue'}</Text>
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
    flex: 1,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formTitle: { fontSize: 22, fontWeight: '600', color: '#6EE7B7', marginBottom: 20 },
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
  button: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6EE7B7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
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
});
