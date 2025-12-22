import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Banks() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Bank</Text>

      <Pressable style={styles.card} onPress={() => router.push('/banks/phonepe')}>
        <Text style={styles.title}>PhonePe</Text>
        <Text style={styles.subtitle}>UPI • Wallet • Rewards</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/banks/sbi')}>
        <Text style={styles.title}>YONO SBI</Text>
        <Text style={styles.subtitle}>SBI Digital Banking</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/banks/icici')}>
        <Text style={styles.title}>ICICI Bank</Text>
        <Text style={styles.subtitle}>iMobile Pay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    color: '#00E676',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#0E0E0E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  title: {
    color: '#00E676',
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    color: '#9CCC9C',
    marginTop: 6,
    fontSize: 14,
  },
});
