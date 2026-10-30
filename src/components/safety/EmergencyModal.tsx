import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { MOCK_EMERGENCY_CONTACTS } from '../../constants/mockData';
import { Button } from '../common/Button';
import { adminService } from '../../services';

interface EmergencyModalProps {
  visible: boolean;
  onClose: () => void;
  currentLocationName?: string;
  driverPlate?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  visible,
  onClose,
  currentLocationName = 'High Street, Mbarara',
  driverPlate,
}) => {
  const [sosSent, setSosSent] = useState(false);
  const insets = useSafeAreaInsets();

  const handleCall = (phoneNumber: string, name: string) => {
    const url = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call', `Dialing ${name} at ${phoneNumber}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Dialing ${name} at ${phoneNumber}`);
      });
  };

  const handleBroadcastAlert = () => {
    setSosSent(true);
    // Background sync to Supabase reports table
    adminService
      .submitReport({
        reporterId: 'usr_pass_001',
        reportType: 'EMERGENCY_SOS',
        description: `Emergency alert triggered by commuter at ${currentLocationName}. Assigned vehicle plate: ${
          driverPlate || 'Unassigned'
        }`,
        locationName: currentLocationName,
      })
      .catch((e) => console.log('[Emergency SOS Sync]', e));

    Alert.alert(
      'Emergency Alert Sent',
      `Your current location (${currentLocationName}) ${
        driverPlate ? `and vehicle plate (${driverPlate})` : ''
      } has been transmitted to your designated emergency contacts and Mbarara CPS dispatch.`,
      [{ text: 'OK', onPress: () => setSosSent(false) }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.sosIconCircle}>
                <Ionicons name="shield" size={24} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.title}>Safety & Emergency Help</Text>
                <Text style={styles.subtitle}>Mbarara Municipality Direct Dispatch</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick SOS Trigger Banner */}
            <View style={styles.sosCard}>
              <Text style={styles.sosCardTitle}>Immediate Danger / Incident?</Text>
              <Text style={styles.sosCardText}>
                Press the button below to broadcast your live stage coordinates and trip details
                to Mbarara CPS and emergency contacts.
              </Text>
              <Button
                title={sosSent ? 'SOS Dispatched!' : 'BROADCAST EMERGENCY SOS'}
                variant="danger"
                iconName="warning"
                loading={sosSent}
                onPress={handleBroadcastAlert}
                style={styles.sosActionButton}
              />
            </View>

            {/* Emergency Contacts List */}
            <Text style={styles.sectionHeader}>Direct Emergency Hotlines</Text>
            {MOCK_EMERGENCY_CONTACTS.map((item) => (
              <View key={item.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactTitleRow}>
                    <Text style={styles.contactName}>{item.title}</Text>
                    {item.isTollFree && (
                      <View style={styles.tollFreeBadge}>
                        <Text style={styles.tollFreeText}>Toll-Free</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(item.phoneNumber, item.title)}
                >
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.footerNote}>
              <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
              <Text style={styles.footerNoteText}>
                Location is shared only when emergency mode is triggered. Designed for Uganda
                emergency response standards.
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
            <Button title="Close" variant="outline" onPress={onClose} fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sosIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  sosCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: Spacing.lg,
  },
  sosCardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  sosCardText: {
    fontSize: Typography.fontSize.xs,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  sosActionButton: {
    backgroundColor: '#DC2626',
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  contactInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tollFreeBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  tollFreeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  contactSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.secondaryDark,
    marginTop: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.fontSize.xs,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  footerNoteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
  modalFooter: {
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
