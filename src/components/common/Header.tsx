import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { UserRole } from '../../types';
import { TransitHubLogo } from './TransitHubLogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  currentRole?: UserRole;
  onRoleSwitch?: (role: UserRole) => void;
  onBack?: () => void;
  onOpenSos?: () => void;
  showEmergencyButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  currentRole,
  onRoleSwitch,
  onBack,
  onOpenSos,
  showEmergencyButton = true,
}) => {
  const insets = useSafeAreaInsets();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  // Dynamic notch & status bar padding calculation
  // Ensures hardware teardrop/punch-hole notches (e.g. Samsung Galaxy A16) have ample clearance
  const dynamicTopPadding = Math.max(insets.top, statusBarHeight) + (Platform.OS === 'android' ? Spacing.md : Spacing.sm);

  return (
    <View style={[styles.container, { paddingTop: dynamicTopPadding }]}>
      <View style={styles.topRow}>
        <View style={styles.titleSection}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}

          {showLogo ? (
            <TransitHubLogo size="sm" showTagline />
          ) : (
            <View style={styles.titleTextWrapper}>
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {showEmergencyButton && onOpenSos && (
            <TouchableOpacity
              onPress={onOpenSos}
              style={styles.sosButton}
              accessibilityLabel="Emergency SOS"
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Ionicons name="shield-checkmark" size={15} color="#DC2626" />
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  titleTextWrapper: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 3,
  },
  sosText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: Typography.fontSize.xs,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondarySurface,
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  roleText: {
    color: Colors.secondaryDark,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
});
