import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { MBARARA_STAGES, TransitStage } from '../../constants/mbararaStages';
import { OpenStreetMap } from '../../components/maps/OpenStreetMap';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { OfflineBanner } from '../../components/common/OfflineBanner';
import { WeatherCard } from '../../components/weather/WeatherCard';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useWeather } from '../../context/WeatherContext';
import { VehicleType } from '../../types';

interface PassengerHomeScreenProps {
  onNavigateToDrivers: () => void;
  onNavigateToTracking: () => void;
}

export const PassengerHomeScreen: React.FC<PassengerHomeScreenProps> = ({
  onNavigateToDrivers,
  onNavigateToTracking,
}) => {
  const {
    pickupStage,
    destinationStage,
    vehicleType,
    estimate,
    setPickupStage,
    setDestinationStage,
    setVehicleType,
    requestRide,
  } = useTrip();

  const { driversList } = useAuth();
  const { weather } = useWeather();
  const [stagePickerTarget, setStagePickerTarget] = useState<'pickup' | 'destination' | null>(null);

  // Quick stages for quick one-tap commuting
  const quickStages = MBARARA_STAGES.slice(0, 5);

  const handleQuickRequest = () => {
    requestRide();
    onNavigateToTracking();
  };

  return (
    <LinearGradient colors={weather.theme.gradientColors} style={styles.gradientContainer}>
      <OfflineBanner lowDataMode />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Mbarara Weather Card */}
        <WeatherCard />

        {/* Stage Selection Card */}
        <View style={styles.tripCard}>
          <Text style={styles.cardHeaderTitle}>Where in Mbarara are you headed?</Text>

          {/* Pickup Selector */}
          <TouchableOpacity
            style={styles.stageInputRow}
            activeOpacity={0.7}
            onPress={() => setStagePickerTarget('pickup')}
          >
            <View style={[styles.stageDot, styles.pickupDot]} />
            <View style={styles.stageTextContainer}>
              <Text style={styles.stageLabel}>PICKUP STAGE</Text>
              <Text style={styles.stageName} numberOfLines={1}>
                {pickupStage.name}
              </Text>
              <Text style={styles.stageDivision}>{pickupStage.division} Division</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.inputDivider}>
            <View style={styles.dashedLine} />
            <TouchableOpacity
              style={styles.swapButton}
              onPress={() => {
                const temp = pickupStage;
                setPickupStage(destinationStage);
                setDestinationStage(temp);
              }}
            >
              <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Destination Selector */}
          <TouchableOpacity
            style={styles.stageInputRow}
            activeOpacity={0.7}
            onPress={() => setStagePickerTarget('destination')}
          >
            <View style={[styles.stageDot, styles.destDot]} />
            <View style={styles.stageTextContainer}>
              <Text style={styles.stageLabel}>DESTINATION STAGE</Text>
              <Text style={styles.stageName} numberOfLines={1}>
                {destinationStage.name}
              </Text>
              <Text style={styles.stageDivision}>{destinationStage.division} Division</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Popular Stage Quick Chips */}
          <Text style={styles.quickChipsTitle}>Frequent Mbarara Hubs:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsScroll}>
            {quickStages.map((stage) => {
              const isSelected =
                stage.id === pickupStage.id || stage.id === destinationStage.id;
              return (
                <TouchableOpacity
                  key={stage.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => {
                    if (stage.id !== pickupStage.id) {
                      setDestinationStage(stage);
                    }
                  }}
                >
                  <Text
                    style={[styles.chipText, isSelected && styles.chipTextSelected]}
                  >
                    {stage.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Vehicle Type Switcher */}
        <View style={styles.vehicleSwitcher}>
          <TouchableOpacity
            style={[
              styles.vehicleOption,
              vehicleType === 'boda' && styles.vehicleOptionActive,
            ]}
            onPress={() => setVehicleType('boda')}
          >
            <Ionicons
              name="bicycle"
              size={22}
              color={vehicleType === 'boda' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleTitle,
                vehicleType === 'boda' && styles.vehicleTitleActive,
              ]}
            >
              Boda Boda
            </Text>
            <Text style={styles.vehicleSub}>Fast • 1 Rider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.vehicleOption,
              vehicleType === 'taxi' && styles.vehicleOptionActive,
            ]}
            onPress={() => setVehicleType('taxi')}
          >
            <Ionicons
              name="car"
              size={22}
              color={vehicleType === 'taxi' ? Colors.secondaryDark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleTitle,
                vehicleType === 'taxi' && styles.vehicleTitleActive,
              ]}
            >
              Shared Taxi
            </Text>
            <Text style={styles.vehicleSub}>Park Stage Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.vehicleOption,
              vehicleType === 'special_hire' && styles.vehicleOptionActive,
            ]}
            onPress={() => setVehicleType('special_hire')}
          >
            <Ionicons
              name="car-sport"
              size={22}
              color={vehicleType === 'special_hire' ? Colors.primaryDark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.vehicleTitle,
                vehicleType === 'special_hire' && styles.vehicleTitleActive,
              ]}
            >
              Special Hire
            </Text>
            <Text style={styles.vehicleSub}>Private Saloon</Text>
          </TouchableOpacity>
        </View>

        {/* Real Interactive OpenStreetMap Route View */}
        <View style={styles.mapContainer}>
          <OpenStreetMap
            pickupStage={pickupStage}
            destinationStage={destinationStage}
            height={220}
            showAllStages={false}
          />
        </View>

        {/* Tariff & Fare Estimation Card */}
        <View style={styles.fareCard}>
          <View style={styles.fareRow}>
            <View>
              <Text style={styles.fareSub}>Regulated Tariff</Text>
              <Text style={styles.fareAmount}>
                {estimate.fareUGX.toLocaleString()} UGX
              </Text>
            </View>
            <View style={styles.fareBreakdown}>
              <Badge
                label={`${estimate.distanceKm} km`}
                variant="secondary"
                size="sm"
              />
              <Text style={styles.fareEta}>~{estimate.durationMins} mins travel</Text>
            </View>
          </View>
          <View style={styles.fareNoticeRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
            <Text style={styles.fareNoticeText}>
              Standard municipal tariff agreed with Mbarara Boda & Taxi operators.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="View Nearby Drivers"
            variant="outline"
            iconName="list"
            onPress={onNavigateToDrivers}
            style={styles.outlineActionBtn}
          />
          <Button
            title="Book Ride"
            variant="primary"
            iconName="flash"
            onPress={handleQuickRequest}
            style={styles.primaryActionBtn}
          />
        </View>

        {/* Nearby Drivers Teaser */}
        <View style={styles.nearbySection}>
          <View style={styles.nearbyHeader}>
            <Text style={styles.nearbyTitle}>Verified Drivers At / Near Stage</Text>
            <TouchableOpacity onPress={onNavigateToDrivers}>
              <Text style={styles.seeAllText}>See all ({driversList.length})</Text>
            </TouchableOpacity>
          </View>

          {driversList.slice(0, 2).map((driver) => (
            <TouchableOpacity
              key={driver.id}
              style={styles.driverMiniCard}
              onPress={() => {
                requestRide(driver);
                onNavigateToTracking();
              }}
            >
              <View style={styles.driverAvatar}>
                <Ionicons
                  name={driver.vehicleType === 'boda' ? 'bicycle' : 'car'}
                  size={20}
                  color={Colors.primaryDark}
                />
              </View>
              <View style={styles.driverMiniInfo}>
                <View style={styles.driverNameRow}>
                  <Text style={styles.driverMiniName}>{driver.name}</Text>
                  <Badge label={driver.verificationStatus} variant="verified" size="sm" />
                </View>
                <Text style={styles.driverMiniVehicle}>
                  {driver.vehicleModel} • {driver.vehiclePlate}
                </Text>
                <Text style={styles.driverMiniStage}>Stage: {driver.stageName}</Text>
              </View>
              <View style={styles.driverMiniAction}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#D97706" />
                  <Text style={styles.ratingText}>{driver.rating}</Text>
                </View>
                <Text style={styles.tapToBook}>Tap to book</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Stage Picker Modal */}
      <Modal visible={stagePickerTarget !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {stagePickerTarget === 'pickup' ? 'Pickup' : 'Destination'} Stage
              </Text>
              <TouchableOpacity onPress={() => setStagePickerTarget(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.stageListScroll}>
              {MBARARA_STAGES.map((stage) => {
                const isSelected =
                  stagePickerTarget === 'pickup'
                    ? stage.id === pickupStage.id
                    : stage.id === destinationStage.id;

                return (
                  <TouchableOpacity
                    key={stage.id}
                    style={[
                      styles.stageItem,
                      isSelected && styles.stageItemSelected,
                    ]}
                    onPress={() => {
                      if (stagePickerTarget === 'pickup') {
                        setPickupStage(stage);
                      } else {
                        setDestinationStage(stage);
                      }
                      setStagePickerTarget(null);
                    }}
                  >
                    <View style={styles.stageItemIcon}>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={isSelected ? Colors.primary : Colors.secondary}
                      />
                    </View>
                    <View style={styles.stageItemDetails}>
                      <View style={styles.stageItemHeader}>
                        <Text
                          style={[
                            styles.stageItemTitle,
                            isSelected && styles.stageItemTitleSelected,
                          ]}
                        >
                          {stage.name}
                        </Text>
                        {stage.isMajorHub && (
                          <Badge label="Major Hub" variant="primary" size="sm" />
                        )}
                      </View>
                      <Text style={styles.stageItemDescription}>
                        {stage.description}
                      </Text>
                      <Text style={styles.stageItemDivision}>
                        {stage.division} Division • Base boda fare: ~
                        {stage.typicalBodaFareUGX} UGX
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  cardHeaderTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  stageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  pickupDot: {
    backgroundColor: Colors.secondary,
  },
  destDot: {
    backgroundColor: Colors.primary,
  },
  stageTextContainer: {
    flex: 1,
  },
  stageLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  stageName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  stageDivision: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  inputDivider: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    marginVertical: 2,
  },
  dashedLine: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  swapButton: {
    position: 'absolute',
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  quickChipsScroll: {
    flexDirection: 'row',
    marginTop: 2,
  },
  chip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipSelected: {
    backgroundColor: Colors.primarySurface,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primaryDark,
  },
  vehicleSwitcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  vehicleOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  vehicleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBF5',
  },
  vehicleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  vehicleTitleActive: {
    color: Colors.primaryDark,
  },
  vehicleSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mapContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  fareCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  fareSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  fareAmount: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  fareBreakdown: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fareEta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  fareNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  fareNoticeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  outlineActionBtn: {
    flex: 1,
  },
  primaryActionBtn: {
    flex: 1.2,
  },
  nearbySection: {
    marginBottom: Spacing.xl,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nearbyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  driverMiniCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  driverMiniInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverMiniName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  driverMiniVehicle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  driverMiniStage: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  driverMiniAction: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
    gap: 2,
  },
  ratingText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#92400E',
  },
  tapToBook: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    padding: Spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stageListScroll: {
    marginTop: Spacing.md,
  },
  stageItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stageItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  stageItemIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stageItemDetails: {
    flex: 1,
  },
  stageItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageItemTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stageItemTitleSelected: {
    color: Colors.primaryDark,
  },
  stageItemDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stageItemDivision: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
