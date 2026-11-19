import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { DriverProfile } from '../../types';

export const DriverDashboardScreen: React.FC = () => {
  const { currentUser, updateDriverOnline } = useAuth();
  const driver = currentUser as DriverProfile;
  const {
    incomingDriverRequest,
    activeTrip,
    driverAcceptRide,
    driverRejectRide,
    updateTripStatus,
    resetTrip,
    requestRide,
  } = useTrip();

  const [todayEarnings, setTodayEarnings] = useState(48500);
  const [completedCount, setCompletedCount] = useState(9);

  const handleToggleOnline = (value: boolean) => {
    updateDriverOnline(value);
  };

  const handleAccept = () => {
    driverAcceptRide();
    Alert.alert('Ride Accepted', 'Proceed to the passenger pickup stage.');
  };

  const handleDecline = () => {
    driverRejectRide();
  };

  const handleSimulatePassengerBooking = () => {
    requestRide(driver);
    Alert.alert(
      'New Ride Dispatched!',
      'A passenger at MUST Main Gate has requested a ride to Central Taxi Park.'
    );
  };

  const handleAdvanceActiveTrip = () => {
    if (!activeTrip) return;
    if (activeTrip.status === 'accepted') {
      updateTripStatus('arriving');
    } else if (activeTrip.status === 'arriving') {
      updateTripStatus('in_transit');
    } else if (activeTrip.status === 'in_transit') {
      updateTripStatus('completed');
      setTodayEarnings((prev) => prev + activeTrip.fareUGX);
      setCompletedCount((prev) => prev + 1);
      Alert.alert(
        'Trip Completed!',
        `Collected ${activeTrip.fareUGX.toLocaleString()} UGX. Added to today's earnings.`
      );
    } else if (activeTrip.status === 'completed') {
      resetTrip();
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card & Online Switch */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.driverAvatar}>
              <Ionicons
                name={driver.vehicleType === 'boda' ? 'bicycle' : 'car'}
                size={26}
                color={Colors.primary}
              />
            </View>

            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{driver.name || 'Transit Driver'}</Text>
                <Badge
                  label={driver.verificationStatus || 'verified'}
                  variant={driver.verificationStatus === 'verified' ? 'verified' : 'pending'}
                  size="sm"
                />
              </View>
              <Text style={styles.driverSub}>
                {driver.vehiclePlate || 'PENDING'} • {driver.vehicleModel || 'Registered Vehicle'}
              </Text>
              <Text style={styles.driverStage}>
                Stage: {driver.stageName || 'Mbarara Central Taxi Park'}
              </Text>
            </View>
          </View>

          {/* Online Toggle Bar */}
          <View style={styles.toggleBar}>
            <View style={styles.toggleStatusRow}>
              <View
                style={[
                  styles.statusIndicatorDot,
                  driver.isOnline ? styles.dotOnline : styles.dotOffline,
                ]}
              />
              <Text style={styles.statusLabel}>
                {driver.isOnline ? 'ONLINE • Receiving Trips' : 'OFFLINE • Not Dispatched'}
              </Text>
            </View>
            <Switch
              value={driver.isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Verification Status Banner if pending */}
        {driver.verificationStatus === 'pending' && (
          <View style={styles.pendingVerificationAlert}>
            <Ionicons name="time" size={20} color={Colors.warning} />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Verification Under Review</Text>
              <Text style={styles.alertSub}>
                Your Driving License and Stage Permit have been submitted to Mbarara Municipality.
              </Text>
            </View>
          </View>
        )}

        {/* Daily Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>{todayEarnings.toLocaleString()} UGX</Text>
            <Text style={styles.statSub}>9 Trips completed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rating & Safety</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#D97706" />
              <Text style={styles.statValue}>{driver.rating || 4.9}</Text>
            </View>
            <Text style={styles.statSub}>PSV Registered</Text>
          </View>
        </View>

        {/* Incoming Ride Alert Modal/Card */}
        {incomingDriverRequest && driver.isOnline && (
          <View style={styles.incomingRequestCard}>
            <View style={styles.incomingHeader}>
              <View style={styles.pulseBadge}>
                <Ionicons name="notifications" size={14} color="#DC2626" />
                <Text style={styles.pulseText}>INCOMING RIDE REQUEST</Text>
              </View>
              <Text style={styles.fareHighlight}>
                {incomingDriverRequest.fareUGX.toLocaleString()} UGX
              </Text>
            </View>

            <View style={styles.incomingPassengerRow}>
              <Ionicons name="person-circle" size={32} color={Colors.primary} />
              <View>
                <Text style={styles.passengerName}>
                  {incomingDriverRequest.passengerName}
                </Text>
                <Text style={styles.passengerPhone}>
                  {incomingDriverRequest.passengerPhone}
                </Text>
              </View>
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeItem}>
                <Ionicons name="location" size={14} color={Colors.secondary} />
                <Text style={styles.routeText} numberOfLines={1}>
                  Pickup: {incomingDriverRequest.pickupStage.name}
                </Text>
              </View>
              <View style={styles.routeItem}>
                <Ionicons name="flag" size={14} color={Colors.primary} />
                <Text style={styles.routeText} numberOfLines={1}>
                  Drop-off: {incomingDriverRequest.destinationStage.name}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Decline"
                variant="outline"
                size="sm"
                onPress={handleDecline}
                style={styles.actionBtn}
              />
              <Button
                title="Accept Ride"
                variant="primary"
                size="sm"
                iconName="checkmark"
                onPress={handleAccept}
                style={[styles.actionBtn, styles.acceptBtn]}
              />
            </View>
          </View>
        )}

        {/* Active Trip Execution Card */}
        {activeTrip && activeTrip.status !== 'requested' && (
          <View style={styles.activeTripCard}>
            <View style={styles.activeTripHeader}>
              <Text style={styles.activeTripTitle}>Current Trip In Progress</Text>
              <Badge label={activeTrip.status} variant="primary" />
            </View>

            <Text style={styles.activePassengerName}>
              Passenger: {activeTrip.passengerName} ({activeTrip.passengerPhone})
            </Text>

            <View style={styles.activeRouteLine}>
              <Text style={styles.activeStageText}>
                {activeTrip.pickupStage.name.split(' ')[0]} ➔ {activeTrip.destinationStage.name.split(' ')[0]}
              </Text>
              <Text style={styles.activeFareText}>
                {activeTrip.fareUGX.toLocaleString()} UGX
              </Text>
            </View>

            <Button
              title={
                activeTrip.status === 'accepted'
                  ? 'Confirm Arrived at Pickup Stage'
                  : activeTrip.status === 'arriving'
                  ? 'Start Trip (Passenger Onboard)'
                  : activeTrip.status === 'in_transit'
                  ? 'Complete Trip & Collect Fare'
                  : 'Dismiss Completed Trip'
              }
              variant={activeTrip.status === 'in_transit' ? 'secondary' : 'primary'}
              onPress={handleAdvanceActiveTrip}
              style={styles.advanceTripBtn}
            />
          </View>
        )}

        {/* Test Simulator Trigger */}
        {!incomingDriverRequest && (!activeTrip || activeTrip.status === 'completed') && (
          <View style={styles.simulatorCard}>
            <Text style={styles.simulatorTitle}>Driver Dispatch Testing Tool</Text>
            <Text style={styles.simulatorSub}>
              Simulate an incoming passenger ride request to test how alerts and fares appear on the driver terminal.
            </Text>
            <Button
              title="Simulate Incoming Passenger Request"
              variant="outline"
              iconName="flash-outline"
              onPress={handleSimulatePassengerBooking}
            />
          </View>
        )}
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  driverSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  driverStage: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  toggleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOnline: {
    backgroundColor: Colors.success,
  },
  dotOffline: {
    backgroundColor: Colors.textMuted,
  },
  statusLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pendingVerificationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningSurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: Spacing.sm,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: '#92400E',
  },
  alertSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incomingRequestCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#F87171',
    marginBottom: Spacing.base,
    ...Shadows.elevated,
  },
  incomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  pulseText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  fareHighlight: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: '#991B1B',
  },
  incomingPassengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  passengerName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  passengerPhone: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  routeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.md,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: Colors.secondary,
  },
  activeTripCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activeTripTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activePassengerName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  activeRouteLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondarySurface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  activeStageText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.secondaryDark,
  },
  activeFareText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.secondaryDark,
  },
  advanceTripBtn: {
    marginTop: Spacing.xs,
  },
  simulatorCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  simulatorTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  simulatorSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
});
