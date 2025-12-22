import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Helper to calculate age from timestamp
const getAge = (dob: any) => {
  if (!dob || !dob.seconds) return 'Not provided';
  const birthDate = new Date(dob.seconds * 1000);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.log('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00fff7" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No profile data available</Text>
      </View>
    );
  }

  const renderField = (icon: string, label: string, value: string | number) => (
    <View style={styles.fieldRow}>
      <Ionicons name={icon as any} size={22} color="#00fff7" />
      <View style={styles.fieldText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: profile.photoURL || 'https://i.pravatar.cc/150?img=12',
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>{profile.name || 'User Name'}</Text>
        <Text style={styles.email}>{profile.email || 'user@email.com'}</Text>

        <View style={styles.divider} />

        {renderField('call-outline', 'Phone', profile.phone)}
        {renderField('person-outline', 'Gender', profile.gender)}
        {renderField('briefcase-outline', 'Occupation', profile.occupation)}
        {renderField('calendar-outline', 'Age', getAge(profile.dob))}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/completeprofile')}
        >
          <Ionicons name="create-outline" size={20} color="#0f111a" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F111A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#00fff7',
    shadowOpacity: 0.8,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    width: '100%',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#00fff7',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00ff7f',
    textShadowColor: '#00fff7',
    textShadowRadius: 10,
    marginTop: 10,
  },
  email: {
    fontSize: 15,
    color: '#6EE7B7',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#00fff7',
    width: '80%',
    marginVertical: 20,
    opacity: 0.3,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  fieldText: {
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: '#6EE7B7',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#00ff7f',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00fff7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginTop: 25,
  },
  editButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F111A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: '#6EE7B7',
    fontSize: 16,
  },
});
