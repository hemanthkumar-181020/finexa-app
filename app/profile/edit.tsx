// // import React, { useEffect, useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TextInput,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   ScrollView,
// //   Platform,
// //   Switch,
// // } from 'react-native';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { useRouter } from 'expo-router';
// // import { auth, db } from '../../services/firebase';
// // import { doc, getDoc, updateDoc } from 'firebase/firestore';

// // export default function EditProfile() {
// //   const router = useRouter();
// //   const user = auth.currentUser;

// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(false);

// //   // 🎨 THEME (Firestore only)
// //   const [theme, setTheme] = useState<'dark' | 'light'>('dark');

// //   const [phone, setPhone] = useState('');
// //   const [gender, setGender] = useState('');
// //   const [occupation, setOccupation] = useState('');
// //   const [dob, setDob] = useState<Date | null>(null);

// //   const [phoneError, setPhoneError] = useState('');
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   /* ---------------- THEME COLORS ---------------- */
// //   const colors = {
// //     dark: {
// //       background: '#000000',
// //       card: '#111827',
// //       inputBg: '#1F2937',
// //       text: '#F9FAFB',
// //       textSecondary: '#9CA3AF',
// //       border: '#374151',
// //       accent: '#00FFF0',
// //       accentLight: 'rgba(0, 255, 240, 0.1)',
// //       buttonGradient: ['#00FFF0', '#10B981'],
// //       buttonDisabled: ['#4B5563', '#6B7280'],
// //       error: '#EF4444',
// //       header: '#00FFF0',
// //       label: '#00FFF0',
// //       toggleTrack: '#374151',
// //       toggleThumb: '#00FFF0',
// //       icon: '#00FFF0',
// //     },
// //     light: {
// //       background: '#F9FAFB',
// //       card: '#FFFFFF',
// //       inputBg: '#F3F4F6',
// //       text: '#111827',
// //       textSecondary: '#6B7280',
// //       border: '#D1D5DB',
// //       accent: '#10B981',
// //       accentLight: 'rgba(16, 185, 129, 0.1)',
// //       buttonGradient: ['#10B981', '#00FFF0'],
// //       buttonDisabled: ['#D1D5DB', '#9CA3AF'],
// //       error: '#EF4444',
// //       header: '#111827',
// //       label: '#10B981',
// //       toggleTrack: '#D1D5DB',
// //       toggleThumb: '#10B981',
// //       icon: '#10B981',
// //     }
// //   };

// //   const currentColors = colors[theme];

// //   /* ---------------- LOAD PROFILE + THEME ---------------- */
// //   useEffect(() => {
// //     const loadProfile = async () => {
// //       if (!user) return;

// //       try {
// //         const snap = await getDoc(doc(db, 'users', user.uid));

// //         if (snap.exists()) {
// //           const d = snap.data();

// //           setPhone(d.phone || '');
// //           setGender(d.gender || '');
// //           setOccupation(d.occupation || '');
// //           setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);

// //           // ✅ FETCH THEME FROM FIRESTORE ON RELOAD
// //           if (d.theme === 'dark' || d.theme === 'light') {
// //             setTheme(d.theme);
// //           }
// //         }
// //       } catch (err) {
// //         console.log('Load profile error:', err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadProfile();
// //   }, [user]);

// //   /* ---------------- TOGGLE THEME (BACKEND UPDATE ONLY) ---------------- */
// //   const toggleTheme = async () => {
// //     if (!user) return;

// //     const newTheme = theme === 'dark' ? 'light' : 'dark';
// //     setTheme(newTheme);

// //     try {
// //       await updateDoc(doc(db, 'users', user.uid), {
// //         theme: newTheme, // ✅ BACKEND CHANGE
// //         updatedAt: new Date(),
// //       });
// //     } catch (err) {
// //       console.log('Theme update error:', err);
// //     }
// //   };

// //   /* ---------------- PHONE VALIDATION ---------------- */
// //   const handlePhoneChange = (value: string) => {
// //     const cleaned = value.replace(/\D/g, '');
// //     setPhone(cleaned);

// //     if (cleaned.length === 0) {
// //       setPhoneError('');
// //       return;
// //     }

// //     if (!/^[6-9]\d{9}$/.test(cleaned)) {
// //       setPhoneError('Enter valid 10-digit mobile number');
// //     } else {
// //       setPhoneError('');
// //     }
// //   };

// //   const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
// //   const canSave = isPhoneValid && gender && dob;

// //   /* ---------------- SAVE PROFILE ---------------- */
// //   const handleSave = async () => {
// //     if (!user || !canSave) return;

// //     try {
// //       setSaving(true);
// //       await updateDoc(doc(db, 'users', user.uid), {
// //         phone,
// //         gender,
// //         occupation,
// //         dob,
// //         updatedAt: new Date(),
// //       });
// //       router.back();
// //     } catch (err) {
// //       console.log('Profile update error:', err);
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   /* ---------------- LOADING ---------------- */
// //   if (loading) {
// //     return (
// //       <View style={[styles.center, { backgroundColor: currentColors.background }]}>
// //         <ActivityIndicator size="large" color={currentColors.accent} />
// //       </View>
// //     );
// //   }

// //   return (
// //     <ScrollView contentContainerStyle={[styles.container, { backgroundColor: currentColors.background }]}>
// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <View style={styles.headerLeft}>
// //           <TouchableOpacity onPress={() => router.back()}>
// //             <Ionicons name="arrow-back" size={26} color={currentColors.header} />
// //           </TouchableOpacity>
// //           <Text style={[styles.headerTitle, { color: currentColors.header }]}>
// //             Edit Profile
// //           </Text>
// //         </View>

// //         <View style={styles.themeToggleContainer}>
// //           <MaterialIcons
// //             name={theme === 'dark' ? 'dark-mode' : 'light-mode'}
// //             size={22}
// //             color={currentColors.icon}
// //           />
// //           <Switch
// //             value={theme === 'dark'}
// //             onValueChange={toggleTheme}
// //             trackColor={{ false: currentColors.toggleTrack, true: currentColors.toggleTrack }}
// //             thumbColor={currentColors.toggleThumb}
// //             ios_backgroundColor={currentColors.toggleTrack}
// //           />
// //         </View>
// //       </View>

// //       {/* FORM */}
// //       <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
// //         <Label text="Phone Number" color={currentColors.label} />
// //         <Input
// //           icon="call"
// //           value={phone}
// //           keyboardType="number-pad"
// //           maxLength={10}
// //           onChangeText={handlePhoneChange}
// //           iconColor={currentColors.accent}
// //           inputColor={currentColors.text}
// //           placeholderColor={currentColors.textSecondary}
// //           backgroundColor={currentColors.inputBg}
// //           borderColor={currentColors.border}
// //         />
// //         {phoneError ? <Error text={phoneError} color={currentColors.error} /> : null}

// //         <Label text="Gender" color={currentColors.label} />
// //         <View style={styles.genderRow}>
// //           {['Male', 'Female', 'Other'].map(g => (
// //             <TouchableOpacity
// //               key={g}
// //               onPress={() => setGender(g)}
// //               style={[
// //                 styles.genderPill,
// //                 { backgroundColor: currentColors.inputBg, borderColor: currentColors.border },
// //                 gender === g && {
// //                   backgroundColor: currentColors.accentLight,
// //                   borderColor: currentColors.accent,
// //                 },
// //               ]}
// //             >
// //               <Text
// //                 style={[
// //                   styles.genderText,
// //                   { color: currentColors.textSecondary },
// //                   gender === g && { color: currentColors.accent },
// //                 ]}
// //               >
// //                 {g}
// //               </Text>
// //             </TouchableOpacity>
// //           ))}
// //         </View>

// //         <Label text="Occupation" color={currentColors.label} />
// //         <Input
// //           icon="briefcase"
// //           value={occupation}
// //           onChangeText={setOccupation}
// //           iconColor={currentColors.accent}
// //           inputColor={currentColors.text}
// //           placeholderColor={currentColors.textSecondary}
// //           backgroundColor={currentColors.inputBg}
// //           borderColor={currentColors.border}
// //         />

// //         <Label text="Date of Birth" color={currentColors.label} />
// //         <TouchableOpacity
// //           style={[styles.dobInput, { backgroundColor: currentColors.inputBg, borderColor: currentColors.border }]}
// //           onPress={() => setShowDatePicker(true)}
// //         >
// //           <Ionicons name="calendar" size={20} color={currentColors.accent} />
// //           <Text style={[styles.dobText, { color: currentColors.text }]}>
// //             {dob ? dob.toDateString() : 'Select date'}
// //           </Text>
// //         </TouchableOpacity>

// //         {showDatePicker && (
// //           <DateTimePicker
// //             value={dob || new Date(2000, 0, 1)}
// //             mode="date"
// //             maximumDate={new Date()}
// //             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
// //             onChange={(_, date) => {
// //               setShowDatePicker(false);
// //               if (date) setDob(date);
// //             }}
// //           />
// //         )}
// //       </View>

// //       {/* SAVE BUTTON */}
// //       <TouchableOpacity onPress={handleSave} disabled={!canSave || saving}>
// //         <LinearGradient
// //           colors={canSave ? currentColors.buttonGradient : currentColors.buttonDisabled}
// //           style={styles.saveButton}
// //         >
// //           {saving ? (
// //             <ActivityIndicator color="#000" />
// //           ) : (
// //             <Text style={styles.saveText}>Save Changes</Text>
// //           )}
// //         </LinearGradient>
// //       </TouchableOpacity>
// //     </ScrollView>
// //   );
// // }

// // /* ---------------- SMALL COMPONENTS ---------------- */
// // const Label = ({ text, color }: any) => <Text style={[styles.label, { color }]}>{text}</Text>;
// // const Error = ({ text, color }: any) => <Text style={[styles.error, { color }]}>{text}</Text>;

// // const Input = ({ icon, iconColor, inputColor, placeholderColor, backgroundColor, borderColor, ...props }: any) => (
// //   <View style={[styles.inputWrapper, { backgroundColor, borderColor }]}>
// //     <Ionicons name={icon} size={20} color={iconColor} />
// //     <TextInput style={[styles.input, { color: inputColor }]} placeholderTextColor={placeholderColor} {...props} />
// //   </View>
// // );

// // /* ---------------- STYLES ---------------- */
// // const styles = StyleSheet.create({
// //   container: { flexGrow: 1, padding: 20 },
// //   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //   header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
// //   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// //   headerTitle: { fontSize: 24, fontWeight: '700' },
// //   themeToggleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   card: { borderRadius: 22, padding: 20, marginBottom: 28, borderWidth: 1 },
// //   label: { fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
// //   inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 14, paddingHorizontal: 14, gap: 12, borderWidth: 1 },
// //   input: { flex: 1, fontSize: 16 },
// //   error: { fontSize: 12, marginTop: 6 },
// //   genderRow: { flexDirection: 'row', gap: 12 },
// //   genderPill: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
// //   genderText: { fontSize: 15, fontWeight: '600' },
// //   dobInput: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12, borderWidth: 1 },
// //   dobText: { fontSize: 16, fontWeight: '500' },
// //   saveButton: { height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
// //   saveText: { fontSize: 17, fontWeight: '700', color: '#000' },
// // });

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   Platform,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useRouter } from 'expo-router';
// import { auth, db } from '../../services/firebase';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';

// export default function EditProfile() {
//   const router = useRouter();
//   const user = auth.currentUser;

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [phone, setPhone] = useState('');
//   const [gender, setGender] = useState('');
//   const [occupation, setOccupation] = useState('');
//   const [dob, setDob] = useState<Date | null>(null);

//   const [phoneError, setPhoneError] = useState('');
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   /* ---------------- LOAD PROFILE ---------------- */
//   useEffect(() => {
//     const loadProfile = async () => {
//       if (!user) return;

//       try {
//         const snap = await getDoc(doc(db, 'users', user.uid));

//         if (snap.exists()) {
//           const d = snap.data();

//           setPhone(d.phone || '');
//           setGender(d.gender || '');
//           setOccupation(d.occupation || '');
//           setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);
//         }
//       } catch (err) {
//         console.log('Load profile error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, [user]);

//   /* ---------------- PHONE VALIDATION ---------------- */
//   const handlePhoneChange = (value: string) => {
//     const cleaned = value.replace(/\D/g, '');
//     setPhone(cleaned);

//     if (cleaned.length === 0) {
//       setPhoneError('');
//       return;
//     }

//     if (!/^[6-9]\d{9}$/.test(cleaned)) {
//       setPhoneError('Enter valid 10-digit mobile number');
//     } else {
//       setPhoneError('');
//     }
//   };

//   const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
//   const canSave = isPhoneValid && gender && dob;

//   /* ---------------- SAVE PROFILE ---------------- */
//   const handleSave = async () => {
//     if (!user || !canSave) return;

//     try {
//       setSaving(true);
//       await updateDoc(doc(db, 'users', user.uid), {
//         phone,
//         gender,
//         occupation,
//         dob,
//         updatedAt: new Date(),
//       });
//       router.back();
//     } catch (err) {
//       console.log('Profile update error:', err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ---------------- LOADING ---------------- */
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#10b981" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="light-content" backgroundColor="#000" />
//       <View style={styles.container}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <TouchableOpacity 
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Edit Profile</Text>
//           <View style={styles.headerSpacer} />
//         </View>

//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* FORM CARD */}
//           <View style={styles.card}>
//             {/* Phone Number */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Phone Number</Text>
//               <View style={[styles.inputWrapper, phoneError && styles.inputError]}>
//                 <View style={styles.iconBox}>
//                   <Ionicons name="call-outline" size={16} color="#10b981" />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   value={phone}
//                   keyboardType="number-pad"
//                   maxLength={10}
//                   onChangeText={handlePhoneChange}
//                   placeholder="10-digit mobile number"
//                   placeholderTextColor="#475569"
//                 />
//               </View>
//               {phoneError ? (
//                 <View style={styles.errorRow}>
//                   <Ionicons name="alert-circle" size={12} color="#ef4444" />
//                   <Text style={styles.errorText}>{phoneError}</Text>
//                 </View>
//               ) : null}
//             </View>

//             {/* Gender */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Gender</Text>
//               <View style={styles.genderRow}>
//                 {['Male', 'Female', 'Other'].map(g => (
//                   <TouchableOpacity
//                     key={g}
//                     onPress={() => setGender(g)}
//                     activeOpacity={0.7}
//                     style={[
//                       styles.genderPill,
//                       gender === g && styles.genderPillActive,
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         styles.genderText,
//                         gender === g && styles.genderTextActive,
//                       ]}
//                     >
//                       {g}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             {/* Occupation */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Occupation</Text>
//               <View style={styles.inputWrapper}>
//                 <View style={styles.iconBox}>
//                   <Ionicons name="briefcase-outline" size={16} color="#10b981" />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   value={occupation}
//                   onChangeText={setOccupation}
//                   placeholder="Your profession"
//                   placeholderTextColor="#475569"
//                 />
//               </View>
//             </View>

//             {/* Date of Birth */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Date of Birth</Text>
//               <TouchableOpacity
//                 style={styles.dobButton}
//                 onPress={() => setShowDatePicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.iconBox}>
//                   <Ionicons name="calendar-outline" size={16} color="#10b981" />
//                 </View>
//                 <Text style={[styles.dobText, !dob && styles.dobPlaceholder]}>
//                   {dob ? dob.toLocaleDateString('en-GB', { 
//                     day: '2-digit', 
//                     month: 'short', 
//                     year: 'numeric' 
//                   }) : 'Select your birth date'}
//                 </Text>
//                 <Ionicons name="chevron-down" size={16} color="#64748b" />
//               </TouchableOpacity>
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={dob || new Date(2000, 0, 1)}
//                 mode="date"
//                 maximumDate={new Date()}
//                 display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                 onChange={(_, date) => {
//                   setShowDatePicker(false);
//                   if (date) setDob(date);
//                 }}
//               />
//             )}
//           </View>

//           {/* Stats Cards */}
//           <View style={styles.statsRow}>
//             <View style={styles.statCard}>
//               <View style={styles.statIconBox}>
//                 <Ionicons name="shield-checkmark" size={18} color="#10b981" />
//               </View>
//               <Text style={styles.statLabel}>Verified</Text>
//             </View>
//             <View style={styles.statCard}>
//               <View style={styles.statIconBox}>
//                 <Ionicons name="lock-closed" size={18} color="#10b981" />
//               </View>
//               <Text style={styles.statLabel}>Secure</Text>
//             </View>
//           </View>

//           {/* Info Box */}
//           <View style={styles.infoBox}>
//             <Ionicons name="information-circle-outline" size={18} color="#10b981" />
//             <Text style={styles.infoText}>
//               Your data is encrypted and secure. We never share your personal information.
//             </Text>
//           </View>
//         </ScrollView>

//         {/* SAVE BUTTON */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity 
//             onPress={handleSave} 
//             disabled={!canSave || saving}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={canSave ? ['#10b981', '#059669'] : ['#334155', '#475569']}
//               style={styles.saveButton}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//             >
//               {saving ? (
//                 <ActivityIndicator color="#000" size="small" />
//               ) : (
//                 <>
//                   <Text style={styles.saveText}>Save Changes</Text>
//                   <Ionicons name="checkmark-circle" size={20} color="#000" />
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: '#64748b',
//     fontSize: 13,
//     marginTop: 10,
//     fontWeight: '600',
//   },

//   // Header
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
//     paddingBottom: 16,
//   },
//   backButton: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#0f172a',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#1e293b',
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '800',
//     letterSpacing: -0.5,
//   },
//   headerSpacer: {
//     width: 36,
//   },

//   // Scroll View
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 24,
//   },

//   // Card
//   card: {
//     backgroundColor: '#0f172a',
//     borderRadius: 24,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#1e293b',
//     marginBottom: 12,
//   },

//   // Field Container
//   fieldContainer: {
//     marginBottom: 18,
//   },
//   label: {
//     color: '#94a3b8',
//     fontSize: 11,
//     fontWeight: '800',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 10,
//   },

//   // Input
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1e293b',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   inputError: {
//     borderColor: '#ef4444',
//   },
//   iconBox: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     backgroundColor: '#10b98115',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     color: '#f8fafc',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   errorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     marginLeft: 2,
//   },
//   errorText: {
//     color: '#ef4444',
//     fontSize: 11,
//     marginLeft: 4,
//     fontWeight: '600',
//   },

//   // Gender
//   genderRow: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   genderPill: {
//     flex: 1,
//     height: 48,
//     backgroundColor: '#1e293b',
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   genderPillActive: {
//     backgroundColor: '#10b98115',
//     borderColor: '#10b981',
//     borderWidth: 1.5,
//   },
//   genderText: {
//     color: '#64748b',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   genderTextActive: {
//     color: '#10b981',
//   },

//   // Date of Birth
//   dobButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1e293b',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#334155',
//   },
//   dobText: {
//     flex: 1,
//     color: '#f8fafc',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   dobPlaceholder: {
//     color: '#475569',
//   },

//   // Stats Row
//   statsRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 12,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#0f172a',
//     borderRadius: 18,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#1e293b',
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 10,
//   },
//   statIconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: '#10b98115',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statLabel: {
//     color: '#94a3b8',
//     fontSize: 13,
//     fontWeight: '700',
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#0f172a',
//     borderRadius: 14,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#1e293b',
//   },
//   infoText: {
//     color: '#94a3b8',
//     fontSize: 12,
//     marginLeft: 10,
//     flex: 1,
//     lineHeight: 17,
//     fontWeight: '500',
//   },

//   // Button Container
//   buttonContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: Platform.OS === 'ios' ? 24 : 16,
//     paddingTop: 12,
//     backgroundColor: '#000',
//     borderTopWidth: 1,
//     borderTopColor: '#0f172a',
//   },
//   saveButton: {
//     height: 54,
//     borderRadius: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//     shadowColor: '#10b981',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 8,
//   },
//   saveText: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#000',
//     letterSpacing: -0.3,
//   },
// });
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
  SafeAreaView,
  StatusBar,
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
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [dob, setDob] = useState<Date | null>(null);

  const [phoneError, setPhoneError] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ---------------- LOAD PROFILE ---------------- */
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
          setMonthlyIncome(d.monthlyIncome ? String(d.monthlyIncome) : '');
          setDob(d.dob?.seconds ? new Date(d.dob.seconds * 1000) : null);
        }
      } catch (err) {
        console.log('Load profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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

  /* ---------------- INCOME VALIDATION ---------------- */
  const handleIncomeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setMonthlyIncome(cleaned);

    if (cleaned.length === 0) {
      setIncomeError('');
      return;
    }

    const amount = parseInt(cleaned);
    if (amount < 0) {
      setIncomeError('Income cannot be negative');
    } else if (amount > 10000000) {
      setIncomeError('Income seems too high');
    } else {
      setIncomeError('');
    }
  };

  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
  const isIncomeValid = monthlyIncome.length > 0 && !incomeError;
  const canSave = isPhoneValid && gender && dob && isIncomeValid;

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    if (!user || !canSave) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        phone,
        gender,
        occupation,
        monthlyIncome: parseInt(monthlyIncome),
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FORM CARD */}
          <View style={styles.card}>
            {/* Phone Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrapper, phoneError && styles.inputError]}>
                <View style={styles.iconBox}>
                  <Ionicons name="call-outline" size={16} color="#10b981" />
                </View>
                <TextInput
                  style={styles.input}
                  value={phone}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={handlePhoneChange}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#475569"
                />
              </View>
              {phoneError ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    activeOpacity={0.7}
                    style={[
                      styles.genderPill,
                      gender === g && styles.genderPillActive,
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
            </View>

            {/* Occupation */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Occupation</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons name="briefcase-outline" size={16} color="#10b981" />
                </View>
                <TextInput
                  style={styles.input}
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholder="Your profession"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {/* Monthly Income */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Monthly Income</Text>
              <View style={[styles.inputWrapper, incomeError && styles.inputError]}>
                <View style={styles.iconBox}>
                  <Ionicons name="cash-outline" size={16} color="#10b981" />
                </View>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyIncome}
                  keyboardType="number-pad"
                  onChangeText={handleIncomeChange}
                  placeholder="Enter monthly income"
                  placeholderTextColor="#475569"
                />
              </View>
              {incomeError ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{incomeError}</Text>
                </View>
              ) : monthlyIncome && !incomeError ? (
                <Text style={styles.helperText}>
                  {parseInt(monthlyIncome).toLocaleString('en-IN')} per month
                </Text>
              ) : null}
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dobButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={16} color="#10b981" />
                </View>
                <Text style={[styles.dobText, !dob && styles.dobPlaceholder]}>
                  {dob ? dob.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  }) : 'Select your birth date'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

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

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Ionicons name="shield-checkmark" size={18} color="#10b981" />
              </View>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Ionicons name="lock-closed" size={18} color="#10b981" />
              </View>
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#10b981" />
            <Text style={styles.infoText}>
              Your financial data is encrypted. Monthly income helps us provide personalized budget recommendations.
            </Text>
          </View>
        </ScrollView>

        {/* SAVE BUTTON */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!canSave || saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSave ? ['#10b981', '#059669'] : ['#334155', '#475569']}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Text style={styles.saveText}>Save Changes</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#000" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 36,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Card
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },

  // Field Container
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#10b98115',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  currencySymbol: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  helperText: {
    color: '#10b981',
    fontSize: 11,
    marginTop: 6,
    marginLeft: 2,
    fontWeight: '600',
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  genderPillActive: {
    backgroundColor: '#10b98115',
    borderColor: '#10b981',
    borderWidth: 1.5,
  },
  genderText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  genderTextActive: {
    color: '#10b981',
  },

  // Date of Birth
  dobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dobText: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  dobPlaceholder: {
    color: '#475569',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#10b98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10b981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.3,
  },
});