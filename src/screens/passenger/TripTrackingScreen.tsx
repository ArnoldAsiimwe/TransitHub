import React from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useTrip } from '../../context/TripContext';
import { TripStatus } from '../../types';

interface TripTrackingScreenProps {
  onBackToHome: () => void;
  onOpenSos: () => void;
}

export const TripTrackingScreen: React.FC<TripTrackingScreenProps> = ({
  onBackToHome,
  onOpenSos,
}) => {
  const { activeTrip, updateTripStatus, cancelRide, resetTrip } = useTrip();

  if (!activeTrip) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Active Trip</Text>
          <Text style={styles.emptySub}>
            You haven't requested any boda or taxi trip yet.
          </Text>
          <Button
            title="Book a Ride"
            variant="primary"
            onPress={onBackToHome}
            style={styles.bookBtn}
          />
        </View>
      </View>
    );
  }

  const steps: { key: TripStatus; label: string; desc: string }[] = [
    { key: 'requested', label: 'Requested', desc: 'Dispatched to nearby operators' },
    { key: 'accepted', label: 'Accepted', desc: 'Driver confirmed your ride' },
    { key: 'arriving', label: 'Arriving', desc: 'Driver is reaching your stage' },
    { key: 'in_transit', label: 'In Transit', desc: 'Heading towards destination' },
    { key: 'completed', label: 'Completed', desc: 'Arrived safely at destination' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === activeTrip.status);
  const effectiveIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  const handleNextSimulationStep = () => {
    if (activeTrip.status === 'requested') updateTripStatus('accepted');
    else if (activeTrip.status === 'accepted') updateTripStatus('arriving');
    else if (activeTrip.status === 'arriving') updateTripStatus('in_transit');
    else if (activeTrip.status === 'in_transit') updateTripStatus('completed');
    else if (activeTrip.status === 'completed') resetTrip();
  };

  const handleCallDriver = () => {
    const phone = activeTrip.driverPhone || '+256772142890';
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
      Alert.alert('Calling Driver', `Dialing ${activeTrip.driverName} at ${phone}`);
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride?',
      'Are you sure you want to cancel this trip request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelRide();
            onBackToHome();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Highlight Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.statusStepTitle}>
                {steps[effectiveIndex]?.label || 'Trip Status'}
              </Text>
              <Text style={styles.statusStepDesc}>
                {steps[effectiveIndex]?.desc}
              </Text>
            </View>
            <Badge
              label={activeTrip.status}
              variant={activeTrip.status === 'completed' ? 'verified' : 'primary'}
            />
          </View>

          {/* Stepper Dots */}
          <View style={styles.stepperContainer}>
            {steps.map((step, index) => {
              const isPastOrCurrent = index <= effectiveIndex;
              const isCurrent = index === effectiveIndex;
              return (
                <View key={step.key} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isPastOrCurrent && styles.stepCircleActive,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    <Ionicons
                      name={
                        isPastOrCurrent
                          ? index === effectiveIndex
                            ? 'radio-button-on'
                            : 'checkmark'
                          : 'ellipse-outline'
                      }
                      size={12}
                      color={isPastOrCurrent ? '#FFFFFF' : Colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isPastOrCurrent && styles.stepLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Prototype simulation control */}
          <TouchableOpacity
            style={styles.simulationPill}
            onPress={handleNextSimulationStep}
          >
            <Ionicons name="play-forward-circle" size={16} color={Colors.primary} />
            <Text style={styles.simulationText}>
              {activeTrip.status === 'completed'
                ? 'Reset & Start New Trip'
                : 'Simulate Next Trip Milestone ➔'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Driver Identification Card */}
        <View style={styles.driverSection}>
          <Text style={styles.sectionHeading}>Assigned Operator</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverTopRow}>
              <View style={styles.driverAvatar}>
                <Ionicons
                  name={activeTrip.vehicleType === 'boda' ? 'bicycle' : 'car'}
                  size={26}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.driverInfo}>
                <View style={styles.nameVerifiedRow}>
                  <Text style={styles.driverName}>{activeTrip.driverName}</Text>
                  <Badge label="Verified" variant="verified" size="sm" />
                </View>
                <View style={styles.plateContainer}>
                  <Text style={styles.plateText}>
                    {activeTrip.driverVehiclePlate || 'UFM 842X'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callIconBtn} onPress={handleCallDriver}>
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.phoneRow}>
              <Ionicons name="phone-portrait-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.phoneText}>{activeTrip.driverPhone}</Text>
            </View>
          </View>
        </View>

        {/* Trip Route Summary */}
        <View style={styles.routeCard}>
          <Text style={styles.sectionHeading}>Trip Route & Tariff</Text>

          <View style={styles.stageRow}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <View style={styles.stageText}>
              <Text style={styles.stageLabel}>Pickup</Text>
              <Text style={styles.stageValue}>{activeTrip.pickupStage.name}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.stageRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <View style={styles.stageText}>
              <Text style={styles.stageLabel}>Destination</Text>
              <Text style={styles.stageValue}>{activeTrip.destinationStage.name}</Text>
            </View>
          </View>

          <View style={styles.fareBreakdownBox}>
            <View style={styles.fareItem}>
              <Text style={styles.fareItemLabel}>Regulated Fare</Text>
              <Text style={styles.fareItemValue}>
                {activeTrip.fareUGX.toLocaleString()} UGX
              </Text>
            </View>
            <View style={styles.fareItem}>
              <Text style={styles.fareItemLabel}>Distance</Text>
              <Text style={styles.fareItemValue}>{activeTrip.distanceKm} km</Text>
            </View>
            <View style={styles.fareItem}>
              <Text style={styles.fareItemLabel}>Payment</Text>
              <Text style={styles.fareItemValue}>Cash / MoMo</Text>
            </View>
          </View>
        </View>

        {/* Safety & Cancellation Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Safety & Emergency (SOS)"
            variant="danger"
            iconName="shield"
            onPress={onOpenSos}
            style={styles.sosBtn}
          />

          {activeTrip.status !== 'completed' ? (
            <Button
              title="Cancel Ride Request"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelBtn}
            />
          ) : (
            <Button
              title="Back to Home Screen"
              variant="primary"
              onPress={() => {
                resetTrip();
                onBackToHome();
              }}
              style={styles.cancelBtn}
            />
          )}
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  bookBtn: {
    width: 200,
  },
  statusBanner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusStepTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusStepDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.textPrimary,
  },
  simulationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySurface,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginTop: Spacing.sm,
  },
  simulationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  driverSection: {
    marginBottom: Spacing.base,
  },
  driverCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  driverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  plateContainer: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  plateText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: '#78350F',
    letterSpacing: 0.5,
  },
  callIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  phoneText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  stageText: {
    flex: 1,
  },
  stageLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stageValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 4,
  },
  fareBreakdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  fareItem: {
    alignItems: 'center',
  },
  fareItemLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  fareItemValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bottomActions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  sosBtn: {
    backgroundColor: '#DC2626',
  },
  cancelBtn: {
    marginBottom: Spacing.lg,
  },
});
