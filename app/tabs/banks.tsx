import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function Banks() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Bank</Text>

      {/* PhonePe */}
      <Pressable
        style={styles.card}
        onPress={() => router.push("/banks/phonepe")}
      >
        <View style={styles.row}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/phonepe.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>PhonePe</Text>
            <Text style={styles.subtitle}>UPI • Wallet • Rewards</Text>
          </View>
        </View>
      </Pressable>

      {/* YONO SBI */}
      <Pressable style={styles.card} onPress={() => router.push("/banks/sbi")}>
        <View style={styles.row}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/yono.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>YONO SBI</Text>
            <Text style={styles.subtitle}>SBI Digital Banking</Text>
          </View>
        </View>
      </Pressable>

      {/* ICICI */}
      <Pressable
        style={styles.card}
        onPress={() => router.push("/banks/icici")}
      >
        <View style={styles.row}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/icici.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>ICICI Bank</Text>
            <Text style={styles.subtitle}>iMobile Pay</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    color: "#00E676",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#0E0E0E",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#00E676",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: "cover",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: "#00E676",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9CCC9C",
    marginTop: 4,
    fontSize: 13,
  },
});




const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background, // dark like Transactions
      padding: 20,
      justifyContent: "center",
    },
    heading: {
      color: theme.colors.accentGreen,          // same mint green
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 32,
    },
    card: {
      backgroundColor: theme.colors.cardBg ?? theme.colors.background,
      borderRadius: 20,
      paddingVertical: 18,
      paddingHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.accentGreen,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoWrapper: {
      marginRight: 12,
    },
    logo: {
      width: 32,
      height: 32,
      borderRadius: 16,
      resizeMode: "cover",
    },
    textBlock: {
      flex: 1,
    },
    title: {
      color: theme.colors.accentGreen,
      fontSize: 20,
      fontWeight: "700",
    },
    subtitle: {
      color: theme.colors.subtleText ?? "#C7EFC7",
      marginTop: 4,
      fontSize: 13,
    },
  });
