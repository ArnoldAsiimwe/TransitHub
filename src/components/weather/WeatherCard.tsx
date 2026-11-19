import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useWeather } from '../../context/WeatherContext';

export const WeatherCard: React.FC = () => {
  const { weather, cycleWeather } = useWeather();

  return (
    <View style={[styles.card, { borderColor: weather.theme.cardBorderColor }]}>
      <View style={styles.topRow}>
        <View style={styles.mainInfo}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={weather.theme.iconName}
              size={26}
              color={weather.theme.iconColor}
            />
          </View>
          <View>
            <View style={styles.tempLocationRow}>
              <Text style={styles.temperature}>{weather.temperatureC}°C</Text>
              <Text style={styles.location}>Mbarara Municipality</Text>
            </View>
            <Text style={[styles.conditionTitle, { color: weather.theme.accentColor }]}>
              {weather.title}
            </Text>
          </View>
        </View>

        {/* Live Weather Indicator */}
        <TouchableOpacity
          style={[styles.cycleBtn, { backgroundColor: weather.theme.gradientColors[0] }]}
          onPress={cycleWeather}
          accessibilityLabel="Live weather status"
        >
          <Ionicons name="cloud-done" size={13} color={weather.theme.accentColor} />
          <Text style={[styles.cycleBtnText, { color: weather.theme.accentColor }]}>
            Live Weather
          </Text>
        </TouchableOpacity>
      </View>

      {/* Advisory & Commute Impact */}
      <View style={styles.advisoryContainer}>
        <Ionicons name="information-circle-outline" size={15} color={weather.theme.accentColor} />
        <Text style={styles.advisoryText}>{weather.advisoryText}</Text>
      </View>

      {/* Metric Chips */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="water-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.metricText}>Rain: {weather.rainProbabilityPercent}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="speedometer-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.metricText}>Wind: {weather.windSpeedKmh} km/h</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="thermometer-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.metricText}>Feels {weather.feelsLikeC}°C</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  tempLocationRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  temperature: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  location: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  conditionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    marginTop: 1,
  },
  cycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  cycleBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  advisoryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    gap: 6,
  },
  advisoryText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textPrimary,
    lineHeight: 16,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
