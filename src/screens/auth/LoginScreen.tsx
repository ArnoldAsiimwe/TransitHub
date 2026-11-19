import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onBackToWelcome: () => void;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignUp,
  onBackToWelcome,
  onLoginSuccess,
}) => {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleForgotPassword = async () => {
    if (!forgotInput.trim()) {
      setForgotMsg({ type: 'error', text: 'Please enter your username, email, or phone number.' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await resetPassword(forgotInput.trim());
      setForgotLoading(false);
      if (res.success) {
        setForgotMsg({ type: 'success', text: res.message });
      } else {
        setForgotMsg({ type: 'error', text: res.error || 'Password reset request failed.' });
      }
    } catch (e: any) {
      setForgotLoading(false);
      setForgotMsg({ type: 'error', text: e.message || 'Error sending reset request.' });
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMessage('Please enter your username (or email/phone).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanUsername, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Failed to sign in. Please check your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Login error occurred.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      setIsGoogleLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Google Sign In was not completed.');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage(err.message || 'Failed to connect to Google.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBackToWelcome} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.badgeMbarara}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.badgeMbararaText}>Mbarara Transit</Text>
            </View>
          </View>

          {/* Logo & Welcome Header */}
          <View style={styles.headerSection}>
            <TransitHubLogo size="md" showTagline />
            <Text style={styles.screenTitle}>Welcome Back</Text>
            <Text style={styles.screenSubtitle}>
              Sign in to book rides, view stages, or manage your driver terminal.
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username or Phone / Email</Text>
            <View style={styles.usernameInputContainer}>
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.textMuted}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                style={styles.usernameInput}
                placeholder="Enter your username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => {
                  setForgotInput(username);
                  setForgotMsg(null);
                  setShowForgotModal(true);
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={Colors.textMuted}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <Button
            title="Sign In"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleLogin}
            style={styles.submitButton}
          />

          {/* Google Sign In Divider */}
          <View style={styles.googleDividerRow}>
            <View style={styles.googleDividerLine} />
            <Text style={styles.googleDividerText}>OR CONTINUE WITH</Text>
            <View style={styles.googleDividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? 'Connecting to Google...' : 'Sign In with Google'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>Don't have an account yet?</Text>
            <TouchableOpacity onPress={onNavigateToSignUp}>
              <Text style={styles.switchAuthLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={Colors.secondary} />
            <Text style={styles.securityNoteText}>
              Protected under Mbarara Municipality Public Transport Guidelines.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.forgotModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="key-outline" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Password Recovery</Text>
              </View>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.forgotSub}>
              Enter your username, registered email, or phone number to locate your account and initiate password reset.
            </Text>

            {forgotMsg && (
              <View
                style={[
                  styles.forgotMsgBanner,
                  forgotMsg.type === 'success' ? styles.forgotSuccessBanner : styles.forgotErrorBanner,
                ]}
              >
                <Ionicons
                  name={forgotMsg.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={forgotMsg.type === 'success' ? Colors.success : Colors.error}
                />
                <Text
                  style={[
                    styles.forgotMsgText,
                    forgotMsg.type === 'success' ? styles.forgotSuccessText : styles.forgotErrorText,
                  ]}
                >
                  {forgotMsg.text}
                </Text>
              </View>
            )}

            <View style={styles.forgotInputContainer}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputLeadingIcon} />
              <TextInput
                style={styles.usernameInput}
                placeholder="Username, email, or phone..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                value={forgotInput}
                onChangeText={setForgotInput}
              />
            </View>

            <View style={styles.forgotActionRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowForgotModal(false)}
                style={styles.forgotCancelBtn}
              />
              <Button
                title="Send Recovery"
                variant="primary"
                size="md"
                loading={forgotLoading}
                onPress={handleForgotPassword}
                style={styles.forgotSubmitBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  usernameInput: {
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
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputLeadingIcon: {
    marginRight: Spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  googleDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  googleDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  googleDividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    gap: 10,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  googleButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  securityNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  forgotModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  forgotSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  forgotMsgBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 8,
    marginBottom: Spacing.md,
  },
  forgotSuccessBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  forgotErrorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  forgotMsgText: {
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  forgotSuccessText: {
    color: Colors.success,
    fontWeight: '600',
  },
  forgotErrorText: {
    color: Colors.error,
    fontWeight: '600',
  },
  forgotInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  forgotActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  forgotCancelBtn: {
    flex: 1,
  },
  forgotSubmitBtn: {
    flex: 1.4,
  },
});
