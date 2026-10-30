import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { TransitStage } from '../../constants/mbararaStages';
import { VehicleType } from '../../types';

interface MbararaMapMockProps {
  pickupStage: TransitStage;
  destinationStage: TransitStage;
  vehicleType: VehicleType;
  distanceKm: number;
  durationMins: number;
  onSelectStage?: (stage: TransitStage) => void;
}

export const MbararaMapMock: React.FC<MbararaMapMockProps> = ({
  pickupStage,
  destinationStage,
  vehicleType,
  distanceKm,
  durationMins,
}) => {
  return (
    <View style={styles.container}>
      {/* Background stylized municipal map grid */}
      <View style={styles.mapCanvas}>
        {/* River Rwizi stylized curve */}
        <View style={styles.river} />
        <Text style={styles.riverLabel}>~ ~ River Rwizi ~ ~</Text>

        {/* Major Road network lines */}
        <View style={styles.roadBuremba} />
        <View style={styles.roadHighStreet} />
        <View style={styles.roadKateteBypass} />

        {/* Landmarks */}
        <View style={[styles.landmark, { top: 22, left: 24 }]}>
          <Text style={styles.landmarkText}>Kamukuzi / Mile 2</Text>
        </View>
        <View style={[styles.landmark, { top: 35, right: 30 }]}>
          <Text style={styles.landmarkText}>Kakoba Market</Text>
        </View>
        <View style={[styles.landmark, { bottom: 25, left: 30 }]}>
          <Text style={styles.landmarkText}>Nyamitanga Hill</Text>
        </View>

        {/* Pickup Pin */}
        <View style={[styles.pinContainer, styles.pickupPin]}>
          <View style={styles.pinBubble}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text style={styles.pinText} numberOfLines={1}>
              {pickupStage.name.split(' ')[0]}
            </Text>
          </View>
          <View style={styles.pinStemPickup} />
        </View>

        {/* Route Line */}
        <View style={styles.routeConnector} />

        {/* Destination Pin */}
        <View style={[styles.pinContainer, styles.destPin]}>
          <View style={[styles.pinBubble, styles.destBubble]}>
            <Ionicons name="flag" size={14} color="#FFFFFF" />
            <Text style={styles.pinText} numberOfLines={1}>
              {destinationStage.name.split(' ')[0]}
            </Text>
          </View>
          <View style={styles.pinStemDest} />
        </View>

        {/* Active Driver position indicator on route */}
        <View style={styles.driverIndicator}>
          <Ionicons
            name={vehicleType === 'boda' ? 'bicycle' : 'car'}
            size={16}
            color={Colors.primaryDark}
          />
        </View>

        {/* Route Info Badge (Distance & ETA) */}
        <View style={styles.routeInfoPill}>
          <View style={styles.infoSegment}>
            <Ionicons name="navigate-outline" size={14} color={Colors.textInverse} />
            <Text style={styles.infoValue}>{distanceKm} km</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoSegment}>
            <Ionicons name="time-outline" size={14} color={Colors.textInverse} />
            <Text style={styles.infoValue}>~{durationMins} mins</Text>
          </View>
        </View>
      </View>

      {/* Transparency / Non-GPS Notice */}
      <View style={styles.disclaimerBar}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Simulated Mbarara Stage Map (Phase 1 Preview) • Live GPS via Google Maps in Phase 3
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  mapCanvas: {
    height: 190,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  river: {
    position: 'absolute',
    bottom: 50,
    left: -40,
    right: -40,
    height: 18,
    backgroundColor: '#BAE6FD',
    transform: [{ rotate: '-8deg' }],
    opacity: 0.8,
  },
  riverLabel: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    fontSize: 9,
    fontWeight: '600',
    color: '#0284C7',
    opacity: 0.7,
  },
  roadHighStreet: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '4deg' }],
  },
  roadBuremba: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '52%',
    width: 9,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '12deg' }],
  },
  roadKateteBypass: {
    position: 'absolute',
    top: 95,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#E2E8F0',
  },
  landmark: {
    position: 'absolute',
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  landmarkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pickupPin: {
    top: 40,
    left: 45,
  },
  destPin: {
    bottom: 45,
    right: 60,
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
    elevation: 4,
  },
  destBubble: {
    backgroundColor: Colors.primary,
  },
  pinText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    maxWidth: 80,
  },
  pinStemPickup: {
    width: 2,
    height: 8,
    backgroundColor: Colors.secondaryDark,
  },
  pinStemDest: {
    width: 2,
    height: 8,
    backgroundColor: Colors.primaryDark,
  },
  routeConnector: {
    position: 'absolute',
    top: 62,
    left: 80,
    width: 170,
    height: 2,
    backgroundColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 1,
    transform: [{ rotate: '24deg' }],
    zIndex: 5,
  },
  driverIndicator: {
    position: 'absolute',
    top: 86,
    left: 155,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
    elevation: 5,
  },
  routeInfoPill: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 8,
    zIndex: 15,
  },
  infoSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  infoDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#64748B',
  },
  disclaimerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
});
