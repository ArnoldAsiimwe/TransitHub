import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { MBARARA_STAGES, TransitStage } from '../../constants/mbararaStages';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { DriverApplicationData, VehicleType } from '../../types';

interface DriverApplicationScreenProps {
  onBack: () => void;
  onApplicationSubmitted: () => void;
}

export const DriverApplicationScreen: React.FC<DriverApplicationScreenProps> = ({
  onBack,
  onApplicationSubmitted,
}) => {
  const { currentUser, submitDriverApplication, driverApplicationStatus } = useAuth();
  const insets = useSafeAreaInsets();

  const [vehicleType, setVehicleType] = useState<VehicleType>('boda');
  const [selectedStage, setSelectedStage] = useState<TransitStage>(MBARARA_STAGES[0]);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [psvBadgeNumber, setPsvBadgeNumber] = useState('');
  const [chairpersonName, setChairpersonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    setErrorMessage('');

    if (!vehiclePlate.trim()) {
      setErrorMessage('Please enter your vehicle registration plate (e.g. UFM 842X).');
      return;
    }

    if (!vehicleModel.trim()) {
      setErrorMessage('Please enter your vehicle model (e.g. Bajaj Boxer 100 or TVS Star).');
      return;
    }

    if (!licenseNumber.trim()) {
      setErrorMessage('Please provide your Uganda Driving Permit number.');
      return;
    }

    if (!ninNumber.trim()) {
      setErrorMessage('Please provide your National Identification Number (NIN).');
      return;
    }

    setIsLoading(true);

    const applicationData: DriverApplicationData = {
      vehicleType,
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vehicleModel: vehicleModel.trim(),
      stageId: selectedStage.id,
      stageName: selectedStage.name,
      licenseNumber: licenseNumber.trim().toUpperCase(),
      ninNumber: ninNumber.trim().toUpperCase(),
      psvBadgeNumber: psvBadgeNumber.trim().toUpperCase(),
      stageChairpersonName: chairpersonName.trim(),
    };

    setTimeout(() => {
      setIsLoading(false);
      submitDriverApplication(applicationData);
      Alert.alert(
        'Application Submitted!',
        `Your permit for ${applicationData.vehiclePlate} has been queued for verification by the Mbarara City Council Transport Inspector.`,
        [{ text: 'OK', onPress: onApplicationSubmitted }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Driver Registration</Text>
            <Text style={styles.headerSubtitle}>Mbarara Municipality Transport Board</Text>
          </View>
          <View style={styles.badgeCity}>
            <Text style={styles.badgeCityText}>Uganda</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status Alert if already submitted */}
          {driverApplicationStatus === 'pending' ? (
            <View style={styles.pendingBanner}>
              <Ionicons name="time" size={22} color={Colors.warning} />
              <View style={styles.pendingTextContainer}>
                <Text style={styles.pendingTitle}>Permit Verification Pending</Text>
                <Text style={styles.pendingSub}>
                  Your application is currently being reviewed by municipal authorities. You can test
                  approval in the Admin portal.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Official Rider Accreditation</Text>
                <Text style={styles.infoSub}>
                  Register your boda boda or taxi to accept ride requests, receive regulated UGX
                  tariffs, and get recognized as an accredited operator in Mbarara.
                </Text>
              </View>
            </View>
          )}

          {/* Applicant Info Summary */}
          <View style={styles.applicantSummaryCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={18} color={Colors.primary} />
            </View>
            <View style={styles.applicantText}>
              <Text style={styles.applicantName}>{currentUser.name}</Text>
              <Text style={styles.applicantPhone}>{currentUser.phone}</Text>
            </View>
            <Badge label="Applicant" variant="secondary" size="sm" />
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Vehicle Category Selector */}
          <Text style={styles.sectionHeading}>1. Vehicle Category</Text>
          <View style={styles.vehicleCategoryRow}>
            <TouchableOpacity
              style={[
                styles.categoryOption,
                vehicleType === 'boda' && styles.categoryOptionActive,
              ]}
              onPress={() => setVehicleType('boda')}
            >
              <Ionicons
                name="bicycle"
                size={24}
                color={vehicleType === 'boda' ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryTitle,
                  vehicleType === 'boda' && styles.categoryTitleActive,
                ]}
              >
                Boda Boda
              </Text>
              <Text style={styles.categorySub}>Motorcycle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryOption,
                vehicleType === 'taxi' && styles.categoryOptionActive,
              ]}
              onPress={() => setVehicleType('taxi')}
            >
              <Ionicons
                name="car"
                size={24}
                color={vehicleType === 'taxi' ? Colors.secondaryDark : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryTitle,
                  vehicleType === 'taxi' && styles.categoryTitleActive,
                ]}
              >
                Shared Taxi
              </Text>
              <Text style={styles.categorySub}>Matatu 14-Str</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryOption,
                vehicleType === 'special_hire' && styles.categoryOptionActive,
              ]}
              onPress={() => setVehicleType('special_hire')}
            >
              <Ionicons
                name="car-sport"
                size={24}
                color={vehicleType === 'special_hire' ? Colors.primaryDark : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryTitle,
                  vehicleType === 'special_hire' && styles.categoryTitleActive,
                ]}
              >
                Special Hire
              </Text>
              <Text style={styles.categorySub}>Saloon Car</Text>
            </TouchableOpacity>
          </View>

          {/* Operating Base Stage */}
          <Text style={styles.sectionHeading}>2. Operating Base Stage</Text>
          <TouchableOpacity
            style={styles.stageSelector}
            activeOpacity={0.8}
            onPress={() => setIsStageModalOpen(true)}
          >
            <View style={styles.stageSelectorLeft}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.stageSelectorName}>{selectedStage.name}</Text>
                <Text style={styles.stageSelectorDiv}>
                  {selectedStage.division} Division • Municipal Stage
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Vehicle Information */}
          <Text style={styles.sectionHeading}>3. Vehicle Information</Text>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Plate Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="UFM 842X"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                value={vehiclePlate}
                onChangeText={setVehiclePlate}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Model & Make *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Bajaj Boxer 100"
                placeholderTextColor={Colors.textMuted}
                value={vehicleModel}
                onChangeText={setVehicleModel}
              />
            </View>
          </View>

          {/* Legal Credentials */}
          <Text style={styles.sectionHeading}>4. Legal Credentials & Identification</Text>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>Uganda Driving Permit Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. DL-MBR-882190"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>National ID Number (NIN) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. CM840291048KPL"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              value={ninNumber}
              onChangeText={setNinNumber}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>PSV Badge / Union ID</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MBR-BODA-0441"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                value={psvBadgeNumber}
                onChangeText={setPsvBadgeNumber}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.fieldLabel}>Stage Chairperson</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Chairman Name"
                placeholderTextColor={Colors.textMuted}
                value={chairpersonName}
                onChangeText={setChairpersonName}
              />
            </View>
          </View>

          {/* Checklist reminder */}
          <View style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Required for Municipal Physical Inspection:</Text>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.checklistText}>Valid Uganda Revenue Authority (URA) Road Logbook</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.checklistText}>Two Passenger Helmets (for Boda Boda operators)</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.checklistText}>Third-party insurance certificate</Text>
            </View>
          </View>

          {/* Action Button */}
          <Button
            title="Submit Rider Application"
            variant="primary"
            size="lg"
            iconName="document-text"
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Stage Picker Modal */}
      <Modal visible={isStageModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operating Stage</Text>
              <TouchableOpacity onPress={() => setIsStageModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.stageModalList}>
              {MBARARA_STAGES.map((stage) => {
                const isSelected = selectedStage.id === stage.id;
                return (
                  <TouchableOpacity
                    key={stage.id}
                    style={[
                      styles.stageModalItem,
                      isSelected && styles.stageModalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedStage(stage);
                      setIsStageModalOpen(false);
                    }}
                  >
                    <View style={styles.stageModalInfo}>
                      <Text
                        style={[
                          styles.stageModalName,
                          isSelected && styles.stageModalNameSelected,
                        ]}
                      >
                        {stage.name}
                      </Text>
                      <Text style={styles.stageModalDiv}>
                        {stage.division} Division • {stage.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  badgeCity: {
    backgroundColor: Colors.primarySurface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  badgeCityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.secondarySurface,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.secondaryDark,
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 11,
    color: Colors.secondaryDark,
    lineHeight: 16,
  },
  pendingBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  pendingTextContainer: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  pendingSub: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  applicantSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  applicantText: {
    flex: 1,
  },
  applicantName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  applicantPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    gap: 6,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: '600',
    flex: 1,
  },
  sectionHeading: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vehicleCategoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  categoryOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFBF5',
  },
  categoryTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  categoryTitleActive: {
    color: Colors.primaryDark,
  },
  categorySub: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  stageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  stageSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  stageSelectorName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stageSelectorDiv: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  formCol: {
    flex: 1,
  },
  inputField: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  checklistCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
    gap: Spacing.xs + 2,
    ...Shadows.card,
  },
  checklistTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
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
  stageModalList: {
    marginTop: Spacing.sm,
  },
  stageModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stageModalItemSelected: {
    backgroundColor: Colors.primarySurface,
    borderColor: Colors.primary,
  },
  stageModalInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  stageModalName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stageModalNameSelected: {
    color: Colors.primaryDark,
  },
  stageModalDiv: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
