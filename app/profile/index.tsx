// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { auth, db } from '../../services/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// // import { useAuth } from "../../services/AuthContext";
// // Helper to calculate age from timestamp
// const getAge = (dob: any) => {
//   if (!dob || !dob.seconds) return 'Not provided';
//   const birthDate = new Date(dob.seconds * 1000);
//   const ageDifMs = Date.now() - birthDate.getTime();
//   const ageDate = new Date(ageDifMs);
//   return Math.abs(ageDate.getUTCFullYear() - 1970);
// };






// export default function Profile() {
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) {
//           setProfile(null);
//           setLoading(false);
//           return;
//         }

//         const userRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           setProfile(userSnap.data());
//         } else {
//           setProfile(null);
//         }
//       } catch (error) {
//         console.log('Error fetching profile:', error);
//         setProfile(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#00fff7" />
//       </View>
//     );
//   }

//   if (!profile) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.empty}>No profile data available</Text>
//       </View>
//     );
//   }

//   const renderField = (icon: string, label: string, value: string | number) => (
//     <View style={styles.fieldRow}>
//       <Ionicons name={icon as any} size={22} color="#00fff7" />
//       <View style={styles.fieldText}>
//         <Text style={styles.label}>{label}</Text>
//         <Text style={styles.value}>{value || 'Not provided'}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <Text style={styles.name}>{profile.name || 'User Name'}</Text>
//         <Text style={styles.email}>{profile.email || 'user@email.com'}</Text>

//         <View style={styles.divider} />

//         {renderField('call-outline', 'Phone', profile.phone)}
//         {renderField('person-outline', 'Gender', profile.gender)}
//         {renderField('briefcase-outline', 'Occupation', profile.occupation)}
//         {renderField('calendar-outline', 'Age', getAge(profile.dob))}

//         <TouchableOpacity
//           style={styles.editButton}
//           onPress={() => router.push('/completeprofile')}
//         >
//           <Ionicons name="create-outline" size={20} color="#0f111a" />
//           <Text style={styles.editButtonText}>Edit Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0F111A',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   card: {
//     backgroundColor: '#111827',
//     borderRadius: 25,
//     padding: 30,
//     alignItems: 'center',
//     shadowColor: '#00fff7',
//     shadowOpacity: 0.8,
//     shadowRadius: 25,
//     shadowOffset: { width: 0, height: 10 },
//     elevation: 15,
//     width: '100%',
//   },

//   avatar: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     borderWidth: 3,
//     borderColor: '#00fff7',
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#00ff7f',
//     textShadowColor: '#00fff7',
//     textShadowRadius: 10,
//     marginTop: 10,
//   },
//   email: {
//     fontSize: 15,
//     color: '#6EE7B7',
//     marginBottom: 20,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#00fff7',
//     width: '80%',
//     marginVertical: 20,
//     opacity: 0.3,
//   },
//   fieldRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//     width: '100%',
//   },
//   fieldText: {
//     marginLeft: 12,
//   },
//   label: {
//     fontSize: 12,
//     color: '#6EE7B7',
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#00ff7f',
//   },
//   editButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#00fff7',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 15,
//     marginTop: 25,
//   },
//   editButtonText: {
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F111A',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   empty: {
//     color: '#6EE7B7',
//     fontSize: 16,
//   },
// });




//................................................................................................................................................................................new vers
// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
// import { auth, db } from '../../services/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';


// const { width } = Dimensions.get('window');

// const getAge = (dob: any) => {
//   if (!dob || !dob.seconds) return 'Not provided';
//   const birthDate = new Date(dob.seconds * 1000);
//   const ageDifMs = Date.now() - birthDate.getTime();
//   const ageDate = new Date(ageDifMs);
//   return Math.abs(ageDate.getUTCFullYear() - 1970);
// };

// export default function Profile() {
//   const [profile, setProfile] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const fadeAnim = new Animated.Value(0);
//   const slideAnim = new Animated.Value(50);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) {
//           setProfile(null);
//           setLoading(false);
//           return;
//         }

//         const userRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           setProfile(userSnap.data());
//         } else {
//           setProfile(null);
//         }
//       } catch (error) {
//         console.log('Error fetching profile:', error);
//         setProfile(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     if (!loading && profile) {
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 50,
//           friction: 8,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [loading, profile]);

//   if (loading) {
//     return (
//       <LinearGradient colors={['#0a0e27', '#1a1f3a', '#0a0e27']} style={styles.center}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#00fff7" />
//           <Text style={styles.loadingText}>Loading your profile...</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (!profile) {
//     return (
//       <LinearGradient colors={['#0a0e27', '#1a1f3a', '#0a0e27']} style={styles.center}>
//         <Ionicons name="person-circle-outline" size={100} color="#00fff740" />
//         <Text style={styles.empty}>No profile data available</Text>
//         <TouchableOpacity style={styles.createButton} onPress={() => router.push('/completeprofile')}>
//           <Text style={styles.createButtonText}>Create Profile</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     );
//   }

//   const getInitials = (name: string) => {
//     if (!name) return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const InfoCard = ({ icon, label, value, gradient }: any) => (
//     <LinearGradient colors={gradient} style={styles.infoCard}>
//       <View style={styles.iconCircle}>
//         <Ionicons name={icon} size={24} color="#ffffff" />
//       </View>
//       <View style={styles.infoContent}>
//         <Text style={styles.infoLabel}>{label}</Text>
//         <Text style={styles.infoValue}>{value || 'Not set'}</Text>
//       </View>
//     </LinearGradient>
//   );

//   return (
//     <LinearGradient colors={['#0a0e27', '#1a1f3a', '#0a0e27']} style={styles.container}>
//       <ScrollView 
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Animated.View 
//           style={[
//             styles.content,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }]
//             }
//           ]}
//         >
//           {/* Header with Avatar */}
//           <View style={styles.header}>
//             <View style={styles.avatarContainer}>
//               <LinearGradient
//                 colors={['#00fff7', '#00ff7f', '#7c3aed']}
//                 style={styles.avatarGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               >
//                 <View style={styles.avatarInner}>
//                   <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
//                 </View>
//               </LinearGradient>
//             </View>
            
//             <Text style={styles.name}>{profile.name || 'User Name'}</Text>
//             <Text style={styles.email}>{profile.email || 'user@email.com'}</Text>
            
//             {/* Quick Stats */}
//           </View>

//           {/* Info Grid */}
//           <View style={styles.infoGrid}>
//             <InfoCard 
//               icon="call" 
//               label="Phone Number" 
//               value={profile.phone}
//               gradient={['#1e293b80', '#0f172a80']}
//             />
//             <InfoCard 
//               icon="person" 
//               label="Gender" 
//               value={profile.gender}
//               gradient={['#1e293b80', '#0f172a80']}
//             />
//             <InfoCard 
//               icon="briefcase" 
//               label="Occupation" 
//               value={profile.occupation}
//               gradient={['#1e293b80', '#0f172a80']}
//             />
//             <InfoCard 
//               icon="calendar" 
//               label="Age" 
//               value={getAge(profile.dob)}
//               gradient={['#1e293b80', '#0f172a80']}
//             />
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionContainer}>
//             <TouchableOpacity
//               style={styles.editButton}
//               onPress={() => router.push('/completeprofile')}
//               activeOpacity={0.8}
//             >
//               <LinearGradient
//                 colors={['#00fff7', '#00ff7f']}
//                 style={styles.buttonGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 <Ionicons name="create" size={22} color="#0a0e27" />
//                 <Text style={styles.editButtonText}>Edit Profile</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>

         
//         </Animated.View>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop:7,
//   },
//   scrollContent: {
//     paddingVertical: 40,
//   },
//   content: {
//     paddingHorizontal: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: '#6EE7B7',
//     fontSize: 16,
//     marginTop: 16,
//     fontWeight: '500',
//   },
//   empty: {
//     color: '#6EE7B7',
//     fontSize: 18,
//     marginTop: 20,
//     fontWeight: '500',
//   },
//   createButton: {
//     backgroundColor: '#00fff7',
//     paddingHorizontal: 32,
//     paddingVertical: 14,
//     borderRadius: 16,
//     marginTop: 24,
//   },
//   createButtonText: {
//     color: '#0a0e27',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   avatarGradient: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     padding: 4,
//     shadowColor: '#00fff7',
//     shadowOpacity: 0.6,
//     shadowRadius: 20,
//     shadowOffset: { width: 0, height: 10 },
//     elevation: 15,
//   },
//   avatarInner: {
//     flex: 1,
//     backgroundColor: '#0a0e27',
//     borderRadius: 66,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontSize: 48,
//     fontWeight: '800',
//     color: '#00fff7',
//     textShadowColor: '#00fff7',
//     textShadowRadius: 10,
//   },
//   statusBadge: {
//     position: 'absolute',
//     bottom: 8,
//     right: 8,
//     backgroundColor: '#0a0e27',
//     borderRadius: 20,
//     padding: 4,
//     borderWidth: 3,
//     borderColor: '#00ff7f',
//   },
//   statusDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#00ff7f',
//   },
//   name: {
//     fontSize: 32,
//     fontWeight: '800',
//     color: '#ffffff',
//     textShadowColor: '#00fff7',
//     textShadowRadius: 15,
//     marginBottom: 6,
//     letterSpacing: 0.5,
//   },
//   email: {
//     fontSize: 16,
//     color: '#6EE7B7',
//     marginBottom: 24,
//     opacity: 0.9,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#1e293b50',
//     borderRadius: 20,
//     padding: 20,
//     width: '100%',
//     justifyContent: 'space-around',
//     borderWidth: 1,
//     borderColor: '#00fff720',
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#00fff7',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#6EE7B7',
//     opacity: 0.8,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: '#00fff730',
//     marginHorizontal: 12,
//   },
//   infoGrid: {
//     gap: 12,
//     marginBottom: 24,
//   },
//   infoCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#00fff720',
//     shadowColor: '#00fff7',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   iconCircle: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#00fff720',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   infoContent: {
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 13,
//     color: '#6EE7B7',
//     marginBottom: 4,
//     opacity: 0.8,
//     fontWeight: '500',
//   },
//   infoValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#ffffff',
//     letterSpacing: 0.3,
//   },
//   actionContainer: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 32,
//   },
//   editButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#00fff7',
//     shadowOpacity: 0.5,
//     shadowRadius: 15,
//     shadowOffset: { width: 0, height: 8 },
//     elevation: 10,
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     gap: 10,
//   },
//   editButtonText: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#0a0e27',
//     letterSpacing: 0.5,
//   },
//   secondaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     borderRadius: 16,
//     backgroundColor: '#1e293b50',
//     borderWidth: 2,
//     borderColor: '#00fff7',
//     gap: 10,
//   },
//   secondaryButtonText: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#00fff7',
//     letterSpacing: 0.5,
//   },
//   settingsSection: {
//     backgroundColor: '#1e293b30',
//     borderRadius: 20,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#00fff715',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#ffffff',
//     marginBottom: 16,
//     letterSpacing: 0.5,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#00fff710',
//   },
//   settingLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   settingText: {
//     fontSize: 16,
//     color: '#ffffff',
//     fontWeight: '500',
//   },
// });

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import { auth, db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const getAge = (dob: any) => {
  if (!dob || !dob.seconds) return 'Not provided';
  const birthDate = new Date(dob.seconds * 1000);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Vibrant color palette for avatar 
const AVATAR_COLORS = [
  ['#FF6B9D', '#C44569'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#A8EDEA', '#FED6E3'],
  ['#FFD89B', '#19547B'],
] as const;

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
 
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

  useEffect(() => {
    if (!loading && profile) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, profile]);

  const getInitials = (name: string) => {
    if (!name) return '👤';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return AVATAR_COLORS[index];
  };

  const InfoItem = ({ icon, label, value }: any) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={20} color="#6B7280" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4FACFE" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="person-circle-outline" size={120} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>Welcome!</Text>
        <Text style={styles.emptySubtitle}>Let's set up your profile</Text>
        <TouchableOpacity 
          style={styles.createButton} 
         onPress={() => router.replace('/profile/edit')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4FACFE', '#00F2FE']}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createButtonText}>Create Profile</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Avatar Section - Centered and Prominent */}
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={getAvatarColor(profile.name)}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
            </LinearGradient>
          </View>

          {/* Hero Card with Name and Email */}
          <View style={styles.heroCard}>
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{profile.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{profile.email || 'user@email.com'}</Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButtonTop}
               onPress={() => router.replace('/profile/edit')}
              activeOpacity={0.9}
            >
              <Ionicons name="create-outline" size={20} color="#4FACFE" />
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <InfoItem icon="call" label="Phone Number" value={profile.phone} />
              <View style={styles.infoDivider} />
              <InfoItem icon="person" label="Gender" value={profile.gender} />
              <View style={styles.infoDivider} />
              <InfoItem icon="briefcase" label="Occupation" value={profile.occupation} />
              <View style={styles.infoDivider} />
              <InfoItem icon="calendar" label="Age" value={getAge(profile.dob)} />
            </View>
          </View>

          {/* Quick Actions */}
         
         

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  createButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4FACFE',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: 'relative',
    alignItems: 'center',
  },
  nameSection: {
    alignItems: 'center',
    paddingRight: 50,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  editButtonTop: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4FACFE',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  premiumCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFD89B',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 20,
  },
  premiumGradient: {
    padding: 24,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
});