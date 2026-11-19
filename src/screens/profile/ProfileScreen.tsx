import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { isSupabaseConfigured } from '../../services';

interface ProfileScreenProps {
  onOpenSos: () => void;
  onNavigateToDriverApplication: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenSos,
  onNavigateToDriverApplication,
  onLogout,
}) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    driverApplicationStatus,
    driverApplicationData,
    logout,
  } = useAuth();
  const [lowDataActive, setLowDataActive] = React.useState(true);

  const roles: { role: UserRole; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      role: 'passenger',
      label: 'Passenger',
      desc: 'Book verified boda bodas & taxis in Mbarara',
      icon: 'person',
    },
    {
      role: 'driver',
      label: 'Driver / Rider',
      desc: 'Availability, trip requests, stage queue',
      icon: 'speedometer',
    },
    {
      role: 'admin',
      label: 'Administrator',
      desc: 'Municipal permits & safety dispute resolution',
      icon: 'shield',
    },
  ];

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile updating will be synced with Supabase in Phase 2.');
  };

  const handleLogoutPress = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of TransitHub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Profile Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Badge label={currentRole} variant="primary" size="sm" />
          </View>
          <Text style={styles.userPhone}>{currentUser.phone}</Text>
          <Text style={styles.userCity}>Mbarara Municipality • Commuter</Text>
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Driver Application Status Section */}
      {driverApplicationStatus === 'not_applied' && currentRole === 'passenger' && (
        <View style={styles.applyDriverCard}>
          <View style={styles.applyDriverHeader}>
            <View style={styles.applyIconCircle}>
              <Ionicons name="bicycle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.applyDriverInfo}>
              <Text style={styles.applyDriverTitle}>Want to Ride or Drive?</Text>
              <Text style={styles.applyDriverSub}>
                Apply to become an accredited Mbarara Boda Boda or Taxi operator.
              </Text>
            </View>
          </View>
          <Button
            title="Apply to Become a Driver"
            variant="primary"
            size="sm"
            iconName="arrow-forward"
            iconPosition="right"
            onPress={onNavigateToDriverApplication}
            style={styles.applyDriverBtn}
          />
        </View>
      )}

      {driverApplicationStatus === 'verified' && (
        <View style={styles.verifiedDriverCard}>
          <View style={styles.verifiedHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.verifiedTitle}>Accredited Municipal Operator</Text>
            <Badge label="Verified" variant="verified" size="sm" />
          </View>
          <Text style={styles.verifiedSub}>
            Your driver permit is active. You are registered as an official transit operator. Role changes must be requested through municipal transport administration.
          </Text>
          <Button
            title="Contact Admin to Revert to Passenger"
            variant="outline"
            size="sm"
            iconName="call-outline"
            onPress={() => {
              Alert.alert(
                'Municipal Transport Authority',
                'Registered operators cannot unilaterally demote their accreditation. Please contact Mbarara City Transit Administration or support line (+256 700 000 000).'
              );
            }}
            style={styles.switchDriverBtn}
          />
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Trips Taken</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>4.9 ★</Text>
          <Text style={styles.statLabel}>Commuter Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>Verified</Text>
          <Text style={styles.statLabel}>Account Status</Text>
        </View>
      </View>

      {/* Favorite Mbarara Stages */}
      <Text style={styles.sectionTitle}>Favorite Mbarara Stages</Text>
      <View style={styles.favoritesGroup}>
        <View style={styles.favoriteItem}>
          <Ionicons name="school" size={18} color={Colors.primary} />
          <View style={styles.favoriteText}>
            <Text style={styles.favName}>Campus: MUST Main Gate</Text>
            <Text style={styles.favDiv}>Kamukuzi Division</Text>
          </View>
        </View>
        <View style={styles.favoriteItem}>
          <Ionicons name="business" size={18} color={Colors.secondary} />
          <View style={styles.favoriteText}>
            <Text style={styles.favName}>Town: High Street (Centenary Bank)</Text>
            <Text style={styles.favDiv}>Town Centre</Text>
          </View>
        </View>
        <View style={styles.favoriteItem}>
          <Ionicons name="home" size={18} color={Colors.accent} />
          <View style={styles.favoriteText}>
            <Text style={styles.favName}>Residence: Mile 2 Kamukuzi</Text>
            <Text style={styles.favDiv}>Kamukuzi Hill</Text>
          </View>
        </View>
      </View>

      {/* Connectivity & Safety Settings */}
      <Text style={styles.sectionTitle}>Connectivity & Security</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Low Mobile Data Mode</Text>
            <Text style={styles.settingSub}>
              Caches Mbarara stage maps and tariffs locally to save data.
            </Text>
          </View>
          <Switch
            value={lowDataActive}
            onValueChange={setLowDataActive}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Cloud Database (Supabase)</Text>
            <Text style={styles.settingSub}>
              {isSupabaseConfigured()
                ? 'Connected to live Supabase PostgreSQL backend.'
                : 'Offline-first fallback active (ready for .env keys).'}
            </Text>
          </View>
          <Badge
            label={isSupabaseConfigured() ? 'Connected' : 'Offline Mode'}
            variant={isSupabaseConfigured() ? 'verified' : 'pending'}
            size="sm"
          />
        </View>

        <TouchableOpacity style={styles.settingActionRow} onPress={onOpenSos}>
          <View style={styles.settingActionText}>
            <Ionicons name="shield-checkmark" size={18} color="#DC2626" />
            <Text style={styles.settingActionTitle}>Emergency SOS & Hotlines</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <Button
        title="Sign Out of Account"
        variant="outline"
        size="md"
        iconName="log-out-outline"
        onPress={handleLogoutPress}
        style={styles.signOutBtn}
      />

      {/* Footer Info */}
      <View style={styles.footerNote}>
        <Text style={styles.footerVersion}>TransitHub Mbarara • v1.0.0</Text>
        <Text style={styles.footerSub}>
          Mobile computing project for public transport coordination in Mbarara Municipality, Uganda.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarInitials: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userCity: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  editBtn: {
    padding: Spacing.xs,
  },
  applyDriverCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  applyDriverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  applyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  applyDriverInfo: {
    flex: 1,
  },
  applyDriverTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#9A3412',
  },
  applyDriverSub: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
    lineHeight: 16,
  },
  applyDriverBtn: {
    marginTop: Spacing.xs,
  },
  pendingApplicationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  pendingAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  pendingAppTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
    marginLeft: 6,
  },
  pendingAppText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
  },
  pendingAppNote: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 6,
    fontStyle: 'italic',
  },
  verifiedDriverCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  verifiedSub: {
    fontSize: 11,
    color: '#047857',
    marginBottom: Spacing.sm,
  },
  switchDriverBtn: {
    backgroundColor: Colors.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  statNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs + 2,
    marginTop: Spacing.sm,
  },
  roleCardGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  roleItemActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBF5',
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleIconCircleActive: {
    backgroundColor: Colors.primarySurface,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleTitleActive: {
    color: Colors.primaryDark,
  },
  roleDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  favoritesGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 2,
  },
  favoriteText: {
    flex: 1,
  },
  favName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  favDiv: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingActionText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingActionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signOutBtn: {
    marginBottom: Spacing.lg,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerVersion: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  footerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
