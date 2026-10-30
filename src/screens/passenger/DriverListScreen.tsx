import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { DriverProfile, VehicleType } from '../../types';

interface DriverListScreenProps {
  onBack: () => void;
  onSelectDriver: (driver: DriverProfile) => void;
}

export const DriverListScreen: React.FC<DriverListScreenProps> = ({
  onBack,
  onSelectDriver,
}) => {
  const { pickupStage, destinationStage, vehicleType, setVehicleType, estimate } = useTrip();
  const { driversList } = useAuth();
  const [filterType, setFilterType] = useState<VehicleType | 'all'>(vehicleType);

  const filteredDrivers = driversList.filter((d) => {
    if (filterType === 'all') return true;
    return d.vehicleType === filterType;
  });

  return (
    <View style={styles.safeArea}>
      {/* Route Context Banner */}
      <View style={styles.routeHeader}>
        <View style={styles.routePills}>
          <View style={styles.routePill}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.routePillText} numberOfLines={1}>
              {pickupStage.name.split(' ')[0]}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={Colors.textSecondary} />
          <View style={styles.routePill}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.routePillText} numberOfLines={1}>
              {destinationStage.name.split(' ')[0]}
            </Text>
          </View>
        </View>

        <Text style={styles.fareTag}>
          Est. {estimate.fareUGX.toLocaleString()} UGX ({estimate.distanceKm} km)
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'boda', 'taxi', 'special_hire'] as const).map((type) => {
          const isActive = filterType === type;
          const label =
            type === 'all'
              ? 'All'
              : type === 'boda'
              ? 'Boda'
              : type === 'taxi'
              ? 'Taxi'
              : 'Special Hire';
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => {
                setFilterType(type);
                if (type !== 'all') {
                  setVehicleType(type);
                }
              }}
            >
              <Text
                style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listHeaderTitle}>
          Available Operators ({filteredDrivers.length})
        </Text>

        {filteredDrivers.length === 0 ? (
          <EmptyState
            icon="bicycle"
            title="No Operators at this Stage"
            description="There are currently no active drivers for this category at your selected stage. Try switching vehicle types."
            actionTitle="Show All Operators"
            onAction={() => setFilterType('all')}
          />
        ) : (
          filteredDrivers.map((driver) => (
            <View key={driver.id} style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={styles.avatarContainer}>
                  <Ionicons
                    name={driver.vehicleType === 'boda' ? 'bicycle' : 'car'}
                    size={24}
                    color={Colors.primary}
                  />
                  {driver.isOnline && <View style={styles.onlineBadgeDot} />}
                </View>

                <View style={styles.driverMainInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Badge
                      label={driver.verificationStatus}
                      variant={driver.verificationStatus === 'verified' ? 'verified' : 'pending'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.plateInfo}>
                    {driver.vehiclePlate} • {driver.vehicleModel}
                  </Text>
                  <Text style={styles.stageLocation}>
                    Base: {driver.stageName}
                  </Text>
                </View>

                <View style={styles.ratingBox}>
                  <View style={styles.starRow}>
                    <Ionicons name="star" size={13} color="#D97706" />
                    <Text style={styles.ratingNumber}>{driver.rating}</Text>
                  </View>
                  <Text style={styles.tripCount}>{driver.totalTrips} trips</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.etaInfo}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.etaText}>~3-5 mins away</Text>
                </View>

                <Button
                  title="Request This Driver"
                  variant="primary"
                  size="sm"
                  iconName="paper-plane"
                  onPress={() => onSelectDriver(driver)}
                  style={styles.selectBtn}
                />
              </View>
            </View>
          ))
        )}

        {/* Local Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.secondary} />
          <Text style={styles.disclaimerText}>
            All drivers on TransitHub are registered under Mbarara City transport regulations.
            Report any tariff disputes directly via the SOS / Safety menu.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  routeHeader: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routePills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routePillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: 90,
  },
  fareTag: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
  },
  filterTabActive: {
    backgroundColor: Colors.primarySurface,
  },
  filterTabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.primaryDark,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  listHeaderTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  driverCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: Spacing.md,
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  plateInfo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  stageLocation: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  ratingNumber: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#92400E',
  },
  tripCount: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  selectBtn: {
    paddingHorizontal: Spacing.md,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: Colors.secondarySurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryDark,
    flex: 1,
    lineHeight: 18,
  },
});
