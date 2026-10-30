import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

export type BadgeVariant =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'online'
  | 'offline'
  | 'boda'
  | 'taxi'
  | 'primary'
  | 'secondary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  let bgColor = Colors.primarySurface;
  let textColor = Colors.primaryDark;
  let iconName: keyof typeof Ionicons.glyphMap | undefined;

  switch (variant) {
    case 'verified':
      bgColor = Colors.successSurface;
      textColor = Colors.success;
      iconName = 'checkmark-circle';
      break;
    case 'pending':
      bgColor = Colors.warningSurface;
      textColor = Colors.warning;
      iconName = 'time';
      break;
    case 'rejected':
      bgColor = Colors.errorSurface;
      textColor = Colors.error;
      iconName = 'close-circle';
      break;
    case 'online':
      bgColor = Colors.successSurface;
      textColor = Colors.success;
      iconName = 'radio-button-on';
      break;
    case 'offline':
      bgColor = Colors.surfaceSubtle;
      textColor = Colors.textMuted;
      iconName = 'radio-button-off';
      break;
    case 'boda':
      bgColor = Colors.accentLight;
      textColor = '#854D0E';
      iconName = 'bicycle';
      break;
    case 'taxi':
      bgColor = Colors.secondarySurface;
      textColor = Colors.secondaryDark;
      iconName = 'car';
      break;
    case 'secondary':
      bgColor = Colors.secondarySurface;
      textColor = Colors.secondaryDark;
      break;
    default:
      bgColor = Colors.primarySurface;
      textColor = Colors.primaryDark;
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSmall ? styles.containerSm : styles.containerMd,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={isSmall ? 11 : 13}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          isSmall ? styles.textSm : styles.textMd,
          { color: textColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
  },
  containerSm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  containerMd: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: Typography.fontSize.xs,
  },
  textMd: {
    fontSize: Typography.fontSize.sm,
  },
});
