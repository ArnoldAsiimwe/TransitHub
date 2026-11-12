import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { useAuth } from '../../context/AuthContext';
import { SafetyIncident } from '../../types';
import { adminService } from '../../services';

export const AdminDashboardScreen: React.FC = () => {
  const { driversList, updateDriverVerificationStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'verification' | 'reports'>('verification');
  const [reports, setReports] = useState<SafetyIncident[]>([]);

  useEffect(() => {
    let isMounted = true;
    adminService
      .getSafetyReports()
      .then((fetched) => {
        if (isMounted && fetched && fetched.length > 0) {
          setReports(
            fetched.map((r: any) => ({
              id: r.id,
              reporterId: r.reporter_id || 'usr_unknown',
              reporterName: r.reporter_name || 'Passenger',
              reporterRole: 'passenger' as const,
              driverName: r.driver_name,
              vehiclePlate: r.vehicle_plate,
              category: (r.report_type as any) || 'reckless_driving',
              title: r.report_type ? r.report_type.replace('_', ' ') : 'Safety Notice',
              description: r.description || '',
              status: (r.resolved ? 'resolved' : 'pending_review') as 'resolved' | 'pending_review',
              createdAt: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              locationName: r.location_name || 'Mbarara',
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingDrivers = driversList.filter((d) => d.verificationStatus === 'pending');
  const verifiedDriversCount = driversList.filter((d) => d.verificationStatus === 'verified').length;

  const handleApprove = (driverId: string, driverName: string) => {
    updateDriverVerificationStatus(driverId, 'verified');
    Alert.alert(
      'Driver Approved',
      `${driverName} has been officially approved to operate in Mbarara Municipality.`
    );
  };

  const handleReject = (driverId: string, driverName: string) => {
    updateDriverVerificationStatus(driverId, 'rejected');
    Alert.alert('Driver Rejected', `${driverName}'s application has been rejected.`);
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
    adminService.resolveReport(reportId).catch(() => {});
    Alert.alert('Report Updated', 'Incident marked as resolved.');
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Municipality Overview Header */}
        <View style={styles.municipalHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.cityPill}>
              <Ionicons name="business" size={13} color={Colors.primary} />
              <Text style={styles.cityText}>Mbarara City Transport Authority</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Municipal Oversight & Safety</Text>
          <Text style={styles.headerSub}>
            Stage verification, driver permits, and commuter incident management.
          </Text>
        </View>

        {/* Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{verifiedDriversCount + 138}</Text>
            <Text style={styles.metricLabel}>Verified Operators</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{pendingDrivers.length}</Text>
            <Text style={styles.metricLabel}>Pending Permits</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>
              {reports.filter((r) => r.status !== 'resolved').length}
            </Text>
            <Text style={styles.metricLabel}>Active Reports</Text>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'verification' && styles.tabActive]}
            onPress={() => setActiveTab('verification')}
          >
            <Ionicons
              name="id-card"
              size={16}
              color={activeTab === 'verification' ? Colors.primaryDark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'verification' && styles.tabTextActive,
              ]}
            >
              Driver Approvals ({pendingDrivers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
            onPress={() => setActiveTab('reports')}
          >
            <Ionicons
              name="warning"
              size={16}
              color={activeTab === 'reports' ? Colors.primaryDark : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'reports' && styles.tabTextActive,
              ]}
            >
              Safety Reports ({reports.filter((r) => r.status !== 'resolved').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Verification Queue */}
        {activeTab === 'verification' && (
          <View style={styles.section}>
            {pendingDrivers.length === 0 ? (
              <EmptyState
                icon="checkmark-done-circle"
                title="All Verifications Cleared"
                description="There are no pending driver permits requiring municipal inspection at this time."
              />
            ) : (
              pendingDrivers.map((driver) => (
                <View key={driver.id} style={styles.approvalCard}>
                  <View style={styles.approvalTop}>
                    <View style={styles.avatarCircle}>
                      <Ionicons
                        name={driver.vehicleType === 'boda' ? 'bicycle' : 'car'}
                        size={22}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.driverDetails}>
                      <View style={styles.titleRow}>
                        <Text style={styles.driverName}>{driver.name}</Text>
                        <Badge label="Pending Review" variant="pending" size="sm" />
                      </View>
                      <Text style={styles.phoneText}>{driver.phone}</Text>
                      <Text style={styles.stageText}>Base Stage: {driver.stageName}</Text>
                    </View>
                  </View>

                  <View style={styles.docDetailsBox}>
                    <View style={styles.docRow}>
                      <Text style={styles.docLabel}>Vehicle Plate:</Text>
                      <Text style={styles.docValue}>{driver.vehiclePlate}</Text>
                    </View>
                    <View style={styles.docRow}>
                      <Text style={styles.docLabel}>Model:</Text>
                      <Text style={styles.docValue}>{driver.vehicleModel}</Text>
                    </View>
                    <View style={styles.docRow}>
                      <Text style={styles.docLabel}>Driving Permit No:</Text>
                      <Text style={styles.docValue}>{driver.licenseNumber}</Text>
                    </View>
                    <View style={styles.docRow}>
                      <Text style={styles.docLabel}>National ID (NIN):</Text>
                      <Text style={styles.docValue}>{driver.ninNumber}</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <Button
                      title="Reject"
                      variant="outline"
                      size="sm"
                      onPress={() => handleReject(driver.id, driver.name)}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Approve Permit"
                      variant="primary"
                      size="sm"
                      iconName="checkmark"
                      onPress={() => handleApprove(driver.id, driver.name)}
                      style={[styles.actionBtn, styles.approveBtn]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 2: Incident Reports */}
        {activeTab === 'reports' && (
          <View style={styles.section}>
            {reports.length === 0 ? (
              <EmptyState
                icon="shield-checkmark-outline"
                title="No Safety Reports"
                description="All passenger and driver safety reports have been resolved or none are pending."
              />
            ) : (
              reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportTitleRow}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Badge
                        label={report.status.replace('_', ' ')}
                        variant={report.status === 'resolved' ? 'verified' : 'pending'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.reportMeta}>
                      Reported by {report.reporterName} • {report.createdAt}
                    </Text>
                  </View>

                  <Text style={styles.reportDescription}>{report.description}</Text>

                  <View style={styles.reportFooter}>
                    <View style={styles.reportLocation}>
                      <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.locationText}>{report.locationName}</Text>
                    </View>

                    {report.status !== 'resolved' && (
                      <Button
                        title="Mark Resolved"
                        variant="outline"
                        size="sm"
                        iconName="checkmark-done"
                        onPress={() => handleResolveReport(report.id)}
                      />
                    )}
                  </View>
                </View>
              ))
            )}
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
  municipalHeader: {
    marginBottom: Spacing.base,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  cityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  metricNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primarySurface,
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.md,
  },
  approvalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  approvalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  driverDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stageText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  docDetailsBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 4,
    marginBottom: Spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  docLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  docValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  approveBtn: {
    backgroundColor: Colors.secondary,
  },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  reportHeader: {
    marginBottom: Spacing.xs,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  reportTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  reportMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  reportDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginVertical: Spacing.xs,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
