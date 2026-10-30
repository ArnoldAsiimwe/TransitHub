import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { UserRole } from '../../types';
import { Button } from '../../components/common/Button';
import { TransitHubLogo } from '../../components/common/TransitHubLogo';

interface WelcomeScreenProps {
  onSelectRoleAndContinue: (role: UserRole) => void;
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectRoleAndContinue,
  onNavigateToLogin,
  onNavigateToSignUp,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('passenger');
  const insets = useSafeAreaInsets();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;
  const dynamicHeroTopPadding = Math.max(insets.top, statusBarHeight) + (Platform.OS === 'android' ? Spacing.xl : Spacing.md);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={[styles.heroSection, { paddingTop: dynamicHeroTopPadding }]}>
          <View style={styles.badgeRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={12} color={Colors.accent} />
              <Text style={styles.locationText}>Mbarara Municipality • Uganda</Text>
            </View>
          </View>

          <TransitHubLogo size="lg" lightText style={{ marginVertical: Spacing.xs }} />
          <Text style={styles.brandTagline}>
            Reliable, verified Boda Boda and Matatu transit coordination for Mbarara City.
          </Text>

          {/* Quick Pillars */}
          <View style={styles.pillarRow}>
            <View style={styles.pillarItem}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.accent} />
              <Text style={styles.pillarText}>Verified Riders</Text>
            </View>
            <View style={styles.pillarItem}>
              <Ionicons name="cash" size={16} color={Colors.accent} />
              <Text style={styles.pillarText}>Fair UGX Fares</Text>
            </View>
            <View style={styles.pillarItem}>
              <Ionicons name="flash" size={16} color={Colors.accent} />
              <Text style={styles.pillarText}>Low-Data Ready</Text>
            </View>
          </View>
        </View>

        {/* Body Card */}
        <View style={styles.bodyCard}>
          {/* Main Auth Actions */}
          <Text style={styles.mainAuthHeading}>Get Started with TransitHub</Text>
          <Text style={styles.mainAuthSub}>
            Join as a commuter or apply to operate your boda boda or taxi in Mbarara.
          </Text>

          <View style={styles.authButtonsStack}>
            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              iconName="person-add-outline"
              onPress={onNavigateToSignUp}
            />
            <Button
              title="Sign In"
              variant="outline"
              size="lg"
              iconName="log-in-outline"
              onPress={onNavigateToLogin}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or test in prototype demo mode</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Role Selector Card */}
          <Text style={styles.sectionTitle}>Explore Roles Directly</Text>
          <Text style={styles.sectionSubtitle}>
            Jump straight into passenger booking, driver dispatch, or municipal admin.
          </Text>

          <View style={styles.roleOptions}>
            {/* Passenger Role */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.roleCard,
                selectedRole === 'passenger' && styles.roleCardActive,
              ]}
              onPress={() => setSelectedRole('passenger')}
            >
              <View
                style={[
                  styles.roleIconCircle,
                  selectedRole === 'passenger' && styles.roleIconCircleActive,
                ]}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={selectedRole === 'passenger' ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={styles.roleContent}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleName}>Passenger</Text>
                  {selectedRole === 'passenger' && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </View>
                <Text style={styles.roleDesc}>
                  Select stages, compare UGX tariffs, book verified boda bodas or taxis.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Driver Role */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.roleCard,
                selectedRole === 'driver' && styles.roleCardActive,
              ]}
              onPress={() => setSelectedRole('driver')}
            >
              <View
                style={[
                  styles.roleIconCircle,
                  selectedRole === 'driver' && styles.roleIconCircleActive,
                ]}
              >
                <Ionicons
                  name="speedometer"
                  size={24}
                  color={selectedRole === 'driver' ? Colors.secondaryDark : Colors.textSecondary}
                />
              </View>
              <View style={styles.roleContent}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleName}>Driver / Rider</Text>
                  {selectedRole === 'driver' && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.secondaryDark} />
                  )}
                </View>
                <Text style={styles.roleDesc}>
                  Toggle availability, receive stage trip alerts, view earnings and verification.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Administrator Role */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.roleCard,
                selectedRole === 'admin' && styles.roleCardActive,
              ]}
              onPress={() => setSelectedRole('admin')}
            >
              <View
                style={[
                  styles.roleIconCircle,
                  selectedRole === 'admin' && styles.roleIconCircleActive,
                ]}
              >
                <Ionicons
                  name="shield"
                  size={24}
                  color={selectedRole === 'admin' ? '#1E293B' : Colors.textSecondary}
                />
              </View>
              <View style={styles.roleContent}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.roleName}>Municipality Admin</Text>
                  {selectedRole === 'admin' && (
                    <Ionicons name="checkmark-circle" size={18} color="#1E293B" />
                  )}
                </View>
                <Text style={styles.roleDesc}>
                  Approve driver permits, review safety incident reports, monitor transit activity.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <Button
            title={`Preview as ${
              selectedRole === 'passenger'
                ? 'Passenger'
                : selectedRole === 'driver'
                ? 'Driver'
                : 'Administrator'
            }`}
            variant="ghost"
            size="md"
            iconName="arrow-forward"
            iconPosition="right"
            onPress={() => onSelectRoleAndContinue(selectedRole)}
            style={styles.actionButton}
          />

          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.disclaimerText}>
              Phase 1 interactive prototype with local Mbarara stage datasets.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl + 8,
    paddingHorizontal: Spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  locationText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  brandTagline: {
    fontSize: Typography.fontSize.base,
    color: '#FED7AA',
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  pillarRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillarText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  bodyCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -20,
    padding: Spacing.lg,
    flex: 1,
  },
  mainAuthHeading: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mainAuthSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  authButtonsStack: {
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  roleOptions: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBF5',
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleIconCircleActive: {
    backgroundColor: Colors.primarySurface,
  },
  roleContent: {
    flex: 1,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  roleName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
});
