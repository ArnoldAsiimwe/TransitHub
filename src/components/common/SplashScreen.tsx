import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: durationMs - 400,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Dismiss exactly at durationMs (3000ms)
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, durationMs - 350);

    return () => clearTimeout(timer);
  }, []);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Decorative background glows */}
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Brand Circular Logo with Emerald Halo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>TransitHub</Text>
        <Text style={styles.subtitle}>Mbarara Smart Transit</Text>

        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>Boda Boda &bull; Matatu &bull; Special Hire</Text>
        </View>

        {/* 3000ms loading bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressIndicator,
              { width: progressBarWidth },
            ]}
          />
        </View>

        <Text style={styles.footnote}>Connecting Mbarara Municipality</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B', // Deep Emerald Green theme
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCircle: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#047857',
    opacity: 0.35,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#059669',
    opacity: 0.25,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#34D399',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 20,
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A7F3D0',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  badgeRow: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  progressTrack: {
    width: 160,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 36,
    marginBottom: 16,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  footnote: {
    fontSize: 11,
    color: '#6EE7B7',
    opacity: 0.8,
  },
});
