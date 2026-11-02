import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { MBARARA_STAGES, TransitStage } from '../../constants/mbararaStages';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useTrip } from '../../context/TripContext';
import { OpenStreetMap } from '../../components/maps/OpenStreetMap';

interface MbararaMapScreenProps {
  onStageSelectedForBooking?: () => void;
}

export const MbararaMapScreen: React.FC<MbararaMapScreenProps> = ({
  onStageSelectedForBooking,
}) => {
  const { setPickupStage, setDestinationStage } = useTrip();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<TransitStage>(MBARARA_STAGES[0]);
  const [filterDivision, setFilterDivision] = useState<string>('All');

  const divisions = ['All', 'Kamukuzi', 'Kakoba', 'Nyamitanga', 'Biharwe'];

  const filteredStages = MBARARA_STAGES.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.division.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision =
      filterDivision === 'All' || s.division.toLowerCase() === filterDivision.toLowerCase();
    return matchesSearch && matchesDivision;
  });

  const handleSetAsPickup = (stage: TransitStage) => {
    setPickupStage(stage);
    Alert.alert(
      'Pickup Set',
      `"${stage.name}" selected as your pickup stage.`,
      [
        {
          text: 'Go to Booking',
          onPress: () => onStageSelectedForBooking && onStageSelectedForBooking(),
        },
        { text: 'Keep Exploring', style: 'cancel' },
      ]
    );
  };

  const handleSetAsDestination = (stage: TransitStage) => {
    setDestinationStage(stage);
    Alert.alert(
      'Destination Set',
      `"${stage.name}" selected as your destination stage.`,
      [
        {
          text: 'Go to Booking',
          onPress: () => onStageSelectedForBooking && onStageSelectedForBooking(),
        },
        { text: 'Keep Exploring', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search Mbarara stages, landmarks (e.g. MUST, Taxi Park)..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Division Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.divisionScroll}
        >
          {divisions.map((div) => {
            const isActive = filterDivision === div;
            return (
              <TouchableOpacity
                key={div}
                onPress={() => setFilterDivision(div)}
                style={[styles.divisionPill, isActive && styles.divisionPillActive]}
              >
                <Text
                  style={[
                    styles.divisionPillText,
                    isActive && styles.divisionPillTextActive,
                  ]}
                >
                  {div}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Real Interactive OpenStreetMap Component */}
        <View style={styles.mapCardWrapper}>
          <OpenStreetMap
            stages={filteredStages}
            selectedStage={selectedStage}
            onSelectStage={(stage) => setSelectedStage(stage)}
            height={280}
            showAllStages={true}
          />
          <View style={styles.mapDisclaimer}>
            <Ionicons name="map" size={13} color={Colors.primary} />
            <Text style={styles.mapDisclaimerText}>
              Live OpenStreetMap • Pan, zoom & tap stage markers across Mbarara
            </Text>
          </View>
        </View>

        {/* Selected Stage Detail Card */}
        <View style={styles.selectedDetailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleBox}>
              <View style={styles.titleRow}>
                <Text style={styles.selectedStageName}>{selectedStage.name}</Text>
                {selectedStage.isMajorHub && (
                  <Badge label="Major Hub" variant="primary" size="sm" />
                )}
              </View>
              <Text style={styles.selectedStageDesc}>{selectedStage.description}</Text>
              <Text style={styles.selectedStageDiv}>
                Division: {selectedStage.division} • Municipal Transport Registry
              </Text>
            </View>
          </View>

          {/* Tariffs from this stage */}
          <View style={styles.tariffPillsRow}>
            <View style={styles.tariffPill}>
              <Ionicons name="bicycle" size={14} color={Colors.primary} />
              <Text style={styles.tariffPillText}>
                Base Boda: ~{selectedStage.typicalBodaFareUGX.toLocaleString()} UGX
              </Text>
            </View>
            <View style={styles.tariffPill}>
              <Ionicons name="car" size={14} color={Colors.secondary} />
              <Text style={styles.tariffPillText}>
                Base Taxi: ~{selectedStage.typicalTaxiFareUGX.toLocaleString()} UGX
              </Text>
            </View>
          </View>

          {/* Quick Routing Action Buttons */}
          <View style={styles.detailActionsRow}>
            <Button
              title="Set as Pickup"
              variant="outline"
              size="sm"
              iconName="location"
              onPress={() => handleSetAsPickup(selectedStage)}
              style={styles.detailBtn}
            />
            <Button
              title="Set as Destination"
              variant="primary"
              size="sm"
              iconName="flag"
              onPress={() => handleSetAsDestination(selectedStage)}
              style={styles.detailBtn}
            />
          </View>
        </View>

        {/* All Stages Directory */}
        <Text style={styles.directoryHeading}>
          All Transit Stages ({filteredStages.length})
        </Text>

        {filteredStages.map((stage) => {
          const isSelected = selectedStage.id === stage.id;
          return (
            <TouchableOpacity
              key={stage.id}
              activeOpacity={0.7}
              onPress={() => setSelectedStage(stage)}
              style={[
                styles.stageListItem,
                isSelected && styles.stageListItemSelected,
              ]}
            >
              <View style={styles.stageListIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color={isSelected ? Colors.primary : Colors.secondary}
                />
              </View>
              <View style={styles.stageListInfo}>
                <View style={styles.stageListTopRow}>
                  <Text
                    style={[
                      styles.stageListTitle,
                      isSelected && styles.stageListTitleSelected,
                    ]}
                  >
                    {stage.name}
                  </Text>
                  <Text style={styles.stageDivisionTag}>{stage.division}</Text>
                </View>
                <Text style={styles.stageListSub} numberOfLines={1}>
                  {stage.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isSelected ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  divisionScroll: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  divisionPill: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  divisionPillActive: {
    backgroundColor: Colors.primarySurface,
    borderColor: Colors.primary,
  },
  divisionPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  divisionPillTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + 20,
  },
  mapVisualContainer: {
    height: 220,
    backgroundColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  riverGraphic: {
    position: 'absolute',
    bottom: 55,
    left: -40,
    right: -40,
    height: 22,
    backgroundColor: '#93C5FD',
    transform: [{ rotate: '-7deg' }],
    opacity: 0.85,
  },
  riverGraphicLabel: {
    position: 'absolute',
    bottom: 42,
    right: 20,
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    opacity: 0.7,
  },
  mainCorridorHighSt: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '5deg' }],
  },
  mainCorridorBuremba: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 10,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '15deg' }],
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 3,
    ...Shadows.card,
    zIndex: 10,
  },
  mapPinSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: Colors.primary,
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
    zIndex: 20,
  },
  pinMapLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pinMapLabelSelected: {
    color: Colors.primaryDark,
  },
  mapCardWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  mapDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  mapDisclaimerText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  selectedDetailCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  detailHeader: {
    marginBottom: Spacing.xs,
  },
  detailTitleBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  selectedStageName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectedStageDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedStageDiv: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tariffPillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  tariffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tariffPillText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  detailBtn: {
    flex: 1,
  },
  directoryHeading: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  stageListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stageListItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBF5',
  },
  stageListIcon: {
    marginRight: Spacing.md,
  },
  stageListInfo: {
    flex: 1,
  },
  stageListTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageListTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stageListTitleSelected: {
    color: Colors.primaryDark,
  },
  stageDivisionTag: {
    fontSize: 10,
    color: Colors.secondaryDark,
    backgroundColor: Colors.secondarySurface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    fontWeight: '600',
  },
  stageListSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
