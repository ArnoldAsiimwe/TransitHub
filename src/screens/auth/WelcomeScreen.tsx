import React from 'react';
import {
  Image,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onNavigateToLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onNavigateToLogin,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;
  const topPadding = Math.max(insets.top, statusBarHeight) + Spacing.lg;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar style="light" />

      {/* Background Decor Shapes */}
      <View style={styles.decorCircleTop} />
      <View style={styles.decorCircleBottom} />

      <View style={[styles.container, { paddingTop: topPadding }]}>
        {/* Top Municipal Badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.locationBadge}>
            <Ionicons name="location-sharp" size={14} color="#A7F3D0" />
            <Text style={styles.locationText}>Mbarara City • Uganda</Text>
          </View>
        </View>

        {/* Center: Large Logo & Brand Identity */}
        <View style={styles.centerHero}>
          <View style={styles.logoHalo}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.largeLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandTitle}>TransitHub</Text>
          <Text style={styles.brandSubtitle}>Smart Public Transit & Stage Network</Text>
          <Text style={styles.tagline}>
            Connecting passengers, verified boda boda riders, and matatu operators across Mbarara municipality.
          </Text>

          {/* Core Feature Highlights */}
          <View style={styles.featurePillsContainer}>
            <View style={styles.featurePill}>
              <Ionicons name="shield-checkmark" size={15} color="#34D399" />
              <Text style={styles.featurePillText}>Verified Stages</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="cash-outline" size={15} color="#34D399" />
              <Text style={styles.featurePillText}>Regulated UGX Fares</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="map-outline" size={15} color="#34D399" />
              <Text style={styles.featurePillText}>Real-Time Maps</Text>
            </View>
          </View>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.getStartedButton}
            activeOpacity={0.85}
            onPress={onGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#064E3B" />
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.alreadyHaveText}>Already have an account?</Text>
            <TouchableOpacity onPress={onNavigateToLogin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.signInLinkText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#064E3B', // Deep, rich emerald transit green
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  /* Abstract Greenish Background Visuals */
  decorCircleTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#047857',
    opacity: 0.35,
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#059669',
    opacity: 0.25,
  },
  badgeWrapper: {
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.3)',
    gap: 6,
  },
  locationText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  /* Center Hero Branding */
  centerHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  logoHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.modal,
    borderWidth: 4,
    borderColor: '#34D399',
  },
  largeLogo: {
    width: 95,
    height: 95,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A7F3D0',
    marginTop: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: '#E6F4EA',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.md,
    maxWidth: 300,
    opacity: 0.9,
  },
  featurePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    gap: 6,
  },
  featurePillText: {
    color: '#ECFDF5',
    fontSize: 12,
    fontWeight: '600',
  },
  /* Bottom Call to Action */
  bottomActions: {
    gap: Spacing.md,
  },
  getStartedButton: {
    backgroundColor: '#10B981', // Radiant emerald green
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    gap: 8,
    ...Shadows.card,
  },
  getStartedButtonText: {
    color: '#064E3B',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  alreadyHaveText: {
    color: '#D1FAE5',
    fontSize: 14,
  },
  signInLinkText: {
    color: '#6EE7B7',
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
