import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { TransitHubLogo } from '../../components/common/TransitHubLogo';
import { useAuth } from '../../context/AuthContext';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onBackToWelcome: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onNavigateToLogin,
  onBackToWelcome,
  onSignUpSuccess,
}) => {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = () => {
    setErrorMessage('');
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Please enter a valid Ugandan phone number (e.g. 0772 123 456).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the Mbarara Municipal transit guidelines.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      signUp(cleanName, cleanPhone, email, password);
      onSignUpSuccess();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBackToWelcome} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.badgeMbarara}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.badgeMbararaText}>Mbarara Transit</Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <TransitHubLogo size="md" showTagline />
            <Text style={styles.screenTitle}>Create Account</Text>
            <Text style={styles.screenSubtitle}>
              One universal account for commuting and riding in Mbarara Municipality.
            </Text>
          </View>

          {/* Informational Callout: How driver registration works */}
          <View style={styles.driverInfoCard}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <View style={styles.driverInfoContent}>
              <Text style={styles.driverInfoTitle}>Want to drive or ride a boda?</Text>
              <Text style={styles.driverInfoText}>
                All accounts begin with standard commuter access. Once signed in, you can apply
                to become an official driver from your profile to be verified by Mbarara City Council.
              </Text>
            </View>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Akampurira Patience"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.ugandaFlag}>🇺🇬</Text>
                <Text style={styles.countryCodeText}>+256</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="772 123 456"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Email (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. name@must.ac.ug"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Minimum 6 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Terms Agreement Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Ionicons
              name={agreedToTerms ? 'checkbox' : 'square-outline'}
              size={20}
              color={agreedToTerms ? Colors.primary : Colors.textMuted}
            />
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>TransitHub Terms</Text> and Mbarara
              Municipal Transport Safety regulations.
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            title="Create Account"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleSignUp}
            style={styles.submitButton}
          />

          {/* Already have an account */}
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>Already registered?</Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.switchAuthLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  badgeMbarara: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeMbararaText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  headerSection: {
    marginBottom: Spacing.base,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  screenSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  driverInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  driverInfoContent: {
    flex: 1,
  },
  driverInfoTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 2,
  },
  driverInfoText: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    gap: 6,
  },
  errorBannerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    gap: 4,
  },
  ugandaFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  switchAuthText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  switchAuthLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
