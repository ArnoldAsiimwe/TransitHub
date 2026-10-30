import React, { useState } from 'react';
import {
  Modal,
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
import { MBARARA_STAGES } from '../../constants/mbararaStages';
import { useTrip } from '../../context/TripContext';
import { VehicleType } from '../../types';

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  pickupStage: string;
  destStage: string;
  vehicleType: VehicleType;
  fareUGX: number;
  driverName: string;
  driverPlate: string;
  driverRating: number;
  status: 'completed' | 'cancelled';
}

const MOCK_PAST_TRIPS: HistoryItem[] = [
  {
    id: 'trip_hist_01',
    date: 'Today',
    time: '08:15 AM',
    pickupStage: 'MUST Main Gate (University)',
    destStage: 'Mbarara Central Taxi Park',
    vehicleType: 'boda',
    fareUGX: 2000,
    driverName: 'Mugisha Dennis',
    driverPlate: 'UFM 842X',
    driverRating: 4.9,
    status: 'completed',
  },
  {
    id: 'trip_hist_02',
    date: 'Yesterday',
    time: '05:40 PM',
    pickupStage: 'High Street (Town Centre)',
    destStage: 'Mile 2 (Kamukuzi Hill)',
    vehicleType: 'boda',
    fareUGX: 2500,
    driverName: 'Asiimwe Brian',
    driverPlate: 'UFL 319B',
    driverRating: 4.8,
    status: 'completed',
  },
  {
    id: 'trip_hist_03',
    date: '21 Oct 2026',
    time: '01:10 PM',
    pickupStage: 'Kakoba Central Market',
    destStage: 'Mbarara Regional Referral Hospital',
    vehicleType: 'taxi',
    fareUGX: 1500,
    driverName: 'Katusiime Innocent',
    driverPlate: 'UBJ 512K',
    driverRating: 4.7,
    status: 'completed',
  },
  {
    id: 'trip_hist_04',
    date: '19 Oct 2026',
    time: '09:20 PM',
    pickupStage: 'High Street (Town Centre)',
    destStage: 'Katete Bridge Stage',
    vehicleType: 'boda',
    fareUGX: 2500,
    driverName: 'Tumukunde Alex',
    driverPlate: 'UFN 904C',
    driverRating: 4.6,
    status: 'completed',
  },
];

interface TripHistoryScreenProps {
  onRebookTrip?: () => void;
}

export const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({ onRebookTrip }) => {
  const { setPickupStage, setDestinationStage, setVehicleType } = useTrip();
  const [filter, setFilter] = useState<'all' | 'boda' | 'taxi'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<HistoryItem | null>(null);

  const filteredTrips = MOCK_PAST_TRIPS.filter((t) => {
    if (filter === 'all') return true;
    return t.vehicleType === filter;
  });

  const totalSpentUGX = MOCK_PAST_TRIPS.reduce((sum, item) => sum + item.fareUGX, 0);

  const handleRebook = (item: HistoryItem) => {
    const pickup = MBARARA_STAGES.find((s) => s.name === item.pickupStage) || MBARARA_STAGES[0];
    const dest = MBARARA_STAGES.find((s) => s.name === item.destStage) || MBARARA_STAGES[1];
    setPickupStage(pickup);
    setDestinationStage(dest);
    setVehicleType(item.vehicleType);
    if (onRebookTrip) {
      onRebookTrip();
    }
  };

  return (
    <View style={styles.container}>
      {/* Monthly Summary Strip */}
      <View style={styles.summaryStrip}>
        <View>
          <Text style={styles.summaryLabel}>This Month's Transit</Text>
          <Text style={styles.summaryAmount}>{totalSpentUGX.toLocaleString()} UGX</Text>
        </View>
        <View style={styles.summaryBadge}>
          <Ionicons name="receipt-outline" size={16} color={Colors.secondaryDark} />
          <Text style={styles.summaryBadgeText}>{MOCK_PAST_TRIPS.length} Trips Completed</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'boda', 'taxi'] as const).map((type) => {
          const isActive = filter === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
            >
              <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                {type === 'all' ? 'All Rides' : type === 'boda' ? 'Boda Bodas' : 'Shared Taxis'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredTrips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.cardHeader}>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.dateText}>
                  {trip.date} • {trip.time}
                </Text>
              </View>
              <Badge label={trip.status} variant="verified" size="sm" />
            </View>

            {/* Route */}
            <View style={styles.routeContainer}>
              <View style={styles.stagePoint}>
                <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
                <Text style={styles.stageName} numberOfLines={1}>
                  {trip.pickupStage}
                </Text>
              </View>

              <View style={styles.routeConnectorLine} />

              <View style={styles.stagePoint}>
                <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.stageName} numberOfLines={1}>
                  {trip.destStage}
                </Text>
              </View>
            </View>

            {/* Operator & Fare Row */}
            <View style={styles.cardFooter}>
              <View style={styles.driverSnippet}>
                <Ionicons
                  name={trip.vehicleType === 'boda' ? 'bicycle' : 'car'}
                  size={16}
                  color={Colors.primary}
                />
                <View>
                  <Text style={styles.driverSnippetName}>{trip.driverName}</Text>
                  <Text style={styles.driverSnippetPlate}>{trip.driverPlate}</Text>
                </View>
              </View>

              <Text style={styles.fareValue}>{trip.fareUGX.toLocaleString()} UGX</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.receiptAction}
                onPress={() => setSelectedReceipt(trip)}
              >
                <Ionicons name="document-text-outline" size={14} color={Colors.secondary} />
                <Text style={styles.receiptActionText}>View Receipt</Text>
              </TouchableOpacity>

              <Button
                title="Re-Book Route"
                variant="outline"
                size="sm"
                iconName="repeat"
                onPress={() => handleRebook(trip)}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.receiptBox}>
              <View style={styles.receiptTop}>
                <View style={styles.receiptBadgeCircle}>
                  <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                </View>
                <Text style={styles.receiptTitle}>TransitHub Mbarara</Text>
                <Text style={styles.receiptSub}>Official Municipal Transit Receipt</Text>
                <Text style={styles.receiptFare}>
                  {selectedReceipt.fareUGX.toLocaleString()} UGX
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptBody}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Trip ID:</Text>
                  <Text style={styles.receiptVal}>{selectedReceipt.id}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date & Time:</Text>
                  <Text style={styles.receiptVal}>
                    {selectedReceipt.date}, {selectedReceipt.time}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Pickup:</Text>
                  <Text style={styles.receiptVal} numberOfLines={1}>
                    {selectedReceipt.pickupStage}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Destination:</Text>
                  <Text style={styles.receiptVal} numberOfLines={1}>
                    {selectedReceipt.destStage}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Operator:</Text>
                  <Text style={styles.receiptVal}>
                    {selectedReceipt.driverName} ({selectedReceipt.driverPlate})
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment:</Text>
                  <Text style={styles.receiptVal}>Cash / Mobile Money</Text>
                </View>
              </View>

              <Button
                title="Close Receipt"
                variant="primary"
                onPress={() => setSelectedReceipt(null)}
                style={styles.closeReceiptBtn}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  summaryAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondarySurface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  summaryBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondaryDark,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.primarySurface,
  },
  filterBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  routeContainer: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  stagePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  routeConnectorLine: {
    width: 2,
    height: 10,
    backgroundColor: Colors.border,
    marginLeft: 3,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  driverSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverSnippetName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  driverSnippetPlate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  fareValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  receiptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptActionText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.elevated,
  },
  receiptTop: {
    alignItems: 'center',
  },
  receiptBadgeCircle: {
    marginBottom: Spacing.xs,
  },
  receiptTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  receiptSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  receiptFare: {
    fontSize: Typography.fontSize.hero,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginVertical: Spacing.sm,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  receiptBody: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  receiptVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    maxWidth: 180,
    textAlign: 'right',
  },
  closeReceiptBtn: {
    marginTop: Spacing.sm,
  },
});
