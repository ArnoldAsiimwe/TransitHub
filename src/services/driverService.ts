import { supabase, isSupabaseConfigured } from './supabase';
import { DriverApplicationData, DriverProfile, VehicleType, VerificationStatus } from '../types';
import { MOCK_DRIVERS } from '../constants/mockData';

export const driverService = {
  /**
   * Submit driver/rider application to Supabase
   */
  async submitApplication(
    userId: string,
    userName: string,
    userPhone: string,
    data: DriverApplicationData
  ): Promise<{ success: boolean; driver: DriverProfile | null; error: string | null }> {
    const formattedDriver: DriverProfile = {
      id: `drv_${userId}`,
      name: userName,
      phone: userPhone,
      role: 'driver',
      joinedDate: 'Today',
      vehicleType: data.vehicleType,
      vehiclePlate: data.vehiclePlate.toUpperCase(),
      vehicleModel: data.vehicleModel,
      stageId: data.stageId,
      stageName: data.stageName,
      rating: 5.0,
      totalTrips: 0,
      isOnline: false,
      verificationStatus: 'pending',
      licenseNumber: data.licenseNumber,
      ninNumber: data.ninNumber,
      psvBadgeNumber: data.psvBadgeNumber || 'PENDING-REG',
      lastActive: 'Just now',
    };

    if (!isSupabaseConfigured()) {
      return { success: true, driver: formattedDriver, error: null };
    }

    try {
      const { error } = await supabase.from('drivers').upsert({
        id: userId,
        vehicle_type: data.vehicleType,
        vehicle_plate: data.vehiclePlate.toUpperCase(),
        vehicle_model: data.vehicleModel,
        stage_id: data.stageId,
        stage_name: data.stageName,
        license_number: data.licenseNumber,
        nin_number: data.ninNumber,
        psv_badge_number: data.psvBadgeNumber || null,
        stage_chairperson_name: data.stageChairpersonName || null,
        verification_status: 'pending',
        is_online: false,
      });

      if (error) {
        return { success: false, driver: null, error: error.message };
      }

      // Also ensure role is updated to driver in profiles
      await supabase.from('profiles').update({ role: 'driver' }).eq('id', userId);

      return { success: true, driver: formattedDriver, error: null };
    } catch (err: any) {
      return { success: false, driver: null, error: err.message || 'Failed to submit driver application.' };
    }
  },

  /**
   * Fetch online, verified drivers in Mbarara
   */
  async getAvailableDrivers(vehicleTypeFilter?: VehicleType): Promise<DriverProfile[]> {
    if (!isSupabaseConfigured()) {
      return vehicleTypeFilter
        ? MOCK_DRIVERS.filter((d) => d.vehicleType === vehicleTypeFilter)
        : MOCK_DRIVERS;
    }

    try {
      let query = supabase
        .from('drivers')
        .select('*, profiles!inner(full_name, phone, email)')
        .eq('is_online', true)
        .eq('verification_status', 'verified');

      if (vehicleTypeFilter) {
        query = query.eq('vehicle_type', vehicleTypeFilter);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        // Fallback to local mocks if remote returns empty in testing
        return MOCK_DRIVERS;
      }

      return data.map((d: any) => ({
        id: d.id,
        name: d.profiles?.full_name || 'Mbarara Rider',
        phone: d.profiles?.phone || '+256 700 000 000',
        email: d.profiles?.email,
        role: 'driver',
        joinedDate: new Date(d.created_at).toLocaleDateString(),
        vehicleType: d.vehicle_type as VehicleType,
        vehiclePlate: d.vehicle_plate,
        vehicleModel: d.vehicle_model,
        stageId: d.stage_id,
        stageName: d.stage_name,
        rating: Number(d.rating) || 5.0,
        totalTrips: d.total_trips || 0,
        isOnline: d.is_online,
        verificationStatus: d.verification_status as VerificationStatus,
        licenseNumber: d.license_number,
        ninNumber: d.nin_number,
        psvBadgeNumber: d.psv_badge_number,
        lastActive: 'Online now',
      }));
    } catch {
      return MOCK_DRIVERS;
    }
  },

  /**
   * Update driver online status
   */
  async updateOnlineStatus(driverId: string, isOnline: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_online: isOnline, last_active: new Date().toISOString() })
        .eq('id', driverId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Admin: Update driver verification status (approve / reject)
   */
  async updateVerificationStatus(
    driverId: string,
    status: VerificationStatus
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('drivers')
        .update({ verification_status: status })
        .eq('id', driverId);

      return !error;
    } catch {
      return false;
    }
  },
};
