import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = false,
  highlighted = false,
  ...rest
}) => {
  const containerStyles: StyleProp<ViewStyle> = [
    styles.card,
    elevated ? styles.elevated : styles.flat,
    highlighted ? styles.highlighted : undefined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={containerStyles}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    ...Shadows.card,
  },
  elevated: {
    ...Shadows.elevated,
    borderColor: 'transparent',
  },
  highlighted: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFFDF9',
  },
});
