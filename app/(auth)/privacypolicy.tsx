import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function TermsAndPrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Terms & Conditions</Text>

      <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
      <Text style={styles.text}>
        By using this personalized budget planning app, you agree to follow these Terms & Conditions.
        If you do not agree, please stop using the app.
      </Text>

      <Text style={styles.sectionTitle}>2. Description of Service</Text>
      <Text style={styles.text}>
        The app provides tools for budgeting, expense tracking, goal setting, insights, and reminders.
        It is for personal use only and is not a financial advisory service.
      </Text>

      <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
      <Text style={styles.text}>
        You agree to provide accurate information and avoid misuse, hacking, or uploading harmful content.
      </Text>

      <Text style={styles.sectionTitle}>4. Financial Disclaimer</Text>
      <Text style={styles.text}>
        All recommendations are educational tools only and not professional financial advice.
      </Text>

      <Text style={styles.sectionTitle}>5. Account & Security</Text>
      <Text style={styles.text}>
        You are responsible for keeping your login credentials secure.
      </Text>

      <Text style={styles.sectionTitle}>6. Data Usage</Text>
      <Text style={styles.text}>
        We use your data to provide personalized budgeting features and improve app performance.
        We do not sell your data.
      </Text>

      <Text style={styles.sectionTitle}>7. Termination</Text>
      <Text style={styles.text}>
        We may suspend accounts that violate the Terms. You can delete your account anytime.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact</Text>
      <Text style={styles.text}>
        For questions, email us at support@example.com
      </Text>


      {/* Privacy Policy Section */}

      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.sectionTitle}>1. Information We Collect</Text>
      <Text style={styles.text}>
        We collect name, email, budgeting data, expenses, device info, and app usage details.
      </Text>

      <Text style={styles.sectionTitle}>2. How We Use Data</Text>
      <Text style={styles.text}>
        To personalize budgets, improve features, send reminders, and analyze performance.
      </Text>

      <Text style={styles.sectionTitle}>3. Data Security</Text>
      <Text style={styles.text}>
        We use industry-standard security but cannot guarantee 100% protection.
      </Text>

      <Text style={styles.sectionTitle}>4. Sharing Data</Text>
      <Text style={styles.text}>
        We only share data with trusted providers or if required legally. We never sell your data.
      </Text>

      <Text style={styles.sectionTitle}>5. Your Rights</Text>
      <Text style={styles.text}>
        You may request access, correction, deletion, or account removal anytime.
      </Text>

      <Text style={styles.sectionTitle}>6. Children’s Privacy</Text>
      <Text style={styles.text}>
        This app is not for children under 13, and we do not knowingly collect data from them.
      </Text>

      <Text style={styles.sectionTitle}>7. Changes to Policy</Text>
      <Text style={styles.text}>
        We may update this policy. Continued use means you accept the changes.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact</Text>
      <Text style={styles.text}>
        For privacy concerns, email privacy@example.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 15,
    color: "#000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
});
