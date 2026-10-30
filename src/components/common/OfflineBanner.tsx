import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface OfflineBannerProps {
  lowDataMode?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ lowDataMode = true }) => {
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={14} color={Colors.secondaryDark} />
      <Text style={styles.text}>
        {lowDataMode
          ? 'Mbarara Local Stage Cache Active • Low Mobile Data Mode'
          : 'Offline Mode: Actions will queue and sync when network reconnects'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.secondarySurface,
    paddingVertical: 5,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#B2DFDB',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryDark,
    fontWeight: '500',
  },
});
