import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsAndPrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
          <Text style={styles.headerSubtitle}>
            Please review our terms of service and privacy policy
          </Text>
        </View>

        <View style={styles.card}>
          {/* Terms & Conditions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>📄</Text>
              </View>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            </View>

            <View style={styles.contentBlock}>
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>1</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Acceptance of Terms</Text>
                  <Text style={styles.termText}>
                    By using this personalized budget planning app, you agree to follow these Terms & Conditions.
                    If you do not agree, please stop using the app.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>2</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Description of Service</Text>
                  <Text style={styles.termText}>
                    The app provides tools for budgeting, expense tracking, goal setting, insights, and reminders.
                    It is for personal use only and is not a financial advisory service.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>3</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>User Responsibilities</Text>
                  <Text style={styles.termText}>
                    You agree to provide accurate information and avoid misuse, hacking, or uploading harmful content.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>4</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Financial Disclaimer</Text>
                  <Text style={styles.termText}>
                    All recommendations are educational tools only and not professional financial advice.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>5</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Account & Security</Text>
                  <Text style={styles.termText}>
                    You are responsible for keeping your login credentials secure.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>6</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Data Usage</Text>
                  <Text style={styles.termText}>
                    We use your data to provide personalized budgeting features and improve app performance.
                    We do not sell your data.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>7</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Termination</Text>
                  <Text style={styles.termText}>
                    We may suspend accounts that violate the Terms. You can delete your account anytime.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={styles.termNumber}>8</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Contact</Text>
                  <Text style={styles.termText}>
                    For questions, email us at support@example.com
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Privacy Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, styles.privacyIcon]}>
                <Text style={styles.sectionIconText}>🔒</Text>
              </View>
              <Text style={styles.sectionTitle}>Privacy Policy</Text>
            </View>

            <View style={styles.contentBlock}>
              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>1</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Information We Collect</Text>
                  <Text style={styles.termText}>
                    We collect name, email, budgeting data, expenses, device info, and app usage details.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>2</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>How We Use Data</Text>
                  <Text style={styles.termText}>
                    To personalize budgets, improve features, send reminders, and analyze performance.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>3</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Data Security</Text>
                  <Text style={styles.termText}>
                    We use industry-standard security but cannot guarantee 100% protection.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>4</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Sharing Data</Text>
                  <Text style={styles.termText}>
                    We only share data with trusted providers or if required legally. We never sell your data.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>5</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Your Rights</Text>
                  <Text style={styles.termText}>
                    You may request access, correction, deletion, or account removal anytime.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>6</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Children's Privacy</Text>
                  <Text style={styles.termText}>
                    This app is not for children under 13, and we do not knowingly collect data from them.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>7</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Changes to Policy</Text>
                  <Text style={styles.termText}>
                    We may update this policy. Continued use means you accept the changes.
                  </Text>
                </View>
              </View>

              <View style={styles.termItem}>
                <Text style={[styles.termNumber, styles.privacyNumber]}>8</Text>
                <View style={styles.termContent}>
                  <Text style={styles.termTitle}>Contact</Text>
                  <Text style={styles.termText}>
                    For privacy concerns, email privacy@example.com
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Acknowledgment Section */}
          <View style={styles.acknowledgment}>
            <View style={styles.acknowledgmentIcon}>
              <Text style={styles.acknowledgmentIconText}>✅</Text>
            </View>
            <Text style={styles.acknowledgmentText}>
              By continuing to use our app, you acknowledge that you have read and agree to our Terms & Conditions and Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: 16,
    minHeight: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyIcon: {
    backgroundColor: '#3B82F6',
  },
  sectionIconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentBlock: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  termNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
    marginTop: 2,
  },
  privacyNumber: {
    backgroundColor: '#3B82F6',
  },
  termContent: {
    flex: 1,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 6,
  },
  termText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  acknowledgment: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  acknowledgmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  acknowledgmentIconText: {
    fontSize: 20,
  },
  acknowledgmentText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});