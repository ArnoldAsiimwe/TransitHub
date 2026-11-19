import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';

export type TabKey = 'home' | 'map' | 'history' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  badgeCount?: number;
}

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  hasActiveTrip?: boolean;
  currentRole?: string;
}

const TabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0.9,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    // Quick tactile pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          isActive && styles.iconWrapperActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={21}
          color={isActive ? Colors.primary : Colors.textSecondary}
        />
        {tab.badgeCount !== undefined && <View style={styles.badgeDot} />}
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
  hasActiveTrip = false,
  currentRole = 'passenger',
}) => {
  const insets = useSafeAreaInsets();

  const tabs: TabItem[] = [
    {
      key: 'home',
      label: currentRole === 'driver' ? 'Terminal' : currentRole === 'admin' ? 'Console' : 'Home',
      icon: currentRole === 'driver' ? 'speedometer-outline' : currentRole === 'admin' ? 'shield-outline' : 'home-outline',
      activeIcon: currentRole === 'driver' ? 'speedometer' : currentRole === 'admin' ? 'shield' : 'home',
      badgeCount: hasActiveTrip ? 1 : undefined,
    },
    {
      key: 'map',
      label: 'Stages Map',
      icon: 'map-outline',
      activeIcon: 'map',
    },
    {
      key: 'history',
      label: currentRole === 'driver' ? 'Trip Log' : 'History',
      icon: 'time-outline',
      activeIcon: 'time',
    },
    {
      key: 'profile',
      label: currentRole === 'driver' ? 'Operator' : 'Profile',
      icon: currentRole === 'driver' ? 'bicycle-outline' : 'person-outline',
      activeIcon: currentRole === 'driver' ? 'bicycle' : 'person',
    },
  ];

  // Pinned flush to the absolute bottom of the screen with no floating gap
  // Internal padding gently positions icons above Android navigation pill if present
  const dynamicBottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 6 : 10);

  return (
    <View style={[styles.container, { paddingBottom: dynamicBottomPadding }]}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    // Ensure bar is solidly at the bottom without floating
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 30,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primarySurface,
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: Colors.textSecondary,
  },
});
