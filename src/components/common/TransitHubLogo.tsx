import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface TransitHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightText?: boolean;
  style?: ViewStyle;
}

export const TransitHubLogo: React.FC<TransitHubLogoProps> = ({
  size = 'md',
  showTagline = true,
  lightText = false,
  style,
}) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 54 : 40;
  const titleSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 19;
  const taglineSize = size === 'sm' ? 10 : size === 'lg' ? 12 : 11;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/logo.png')}
        style={[
          styles.logoImage,
          { width: iconSize, height: iconSize, borderRadius: iconSize / 4 },
        ]}
        resizeMode="contain"
      />
      <View style={styles.textColumn}>
        <View style={styles.brandRow}>
          <Text
            style={[
              styles.brandTransit,
              { fontSize: titleSize },
              lightText && styles.lightText,
            ]}
          >
            Transit
          </Text>
          <Text
            style={[
              styles.brandHub,
              { fontSize: titleSize },
              lightText ? styles.brandHubLight : styles.brandHubOrange,
            ]}
          >
            Hub
          </Text>
        </View>

        {showTagline && (
          <Text
            style={[
              styles.tagline,
              { fontSize: taglineSize },
              lightText ? styles.taglineLight : styles.taglineDark,
            ]}
          >
            Travel with Us
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImage: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(230, 81, 0, 0.15)',
  },
  textColumn: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTransit: {
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandHub: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandHubOrange: {
    color: Colors.primary,
  },
  brandHubLight: {
    color: '#FED7AA',
  },
  lightText: {
    color: '#FFFFFF',
  },
  tagline: {
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: -1,
  },
  taglineDark: {
    color: Colors.secondary,
  },
  taglineLight: {
    color: '#E0F2FE',
  },
});
