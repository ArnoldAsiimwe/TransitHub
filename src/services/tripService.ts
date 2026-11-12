import { supabase, isSupabaseConfigured } from './supabase';
import { DriverProfile, TripRequest, TripStatus, VehicleType } from '../types';
import { MBARARA_STAGES, TransitStage } from '../constants/mbararaStages';

export interface TripEstimateInput {
  fare: number;
  distanceKm: number;
  estimatedMinutes: number;
}

export const tripService = {
  /**
   * Create a trip booking record
   */
  async createTrip(
    passengerId: string,
    pickupStage: TransitStage,
    destinationStage: TransitStage,
    vehicleType: VehicleType,
    estimate: TripEstimateInput,
    driver?: DriverProfile,
    passengerInfo?: { name?: string; phone?: string }
  ): Promise<{ trip: TripRequest | null; error: string | null }> {
    const localTrip: TripRequest = {
      id: `trp_${Date.now().toString().slice(-6)}`,
      passengerId,
      passengerName: passengerInfo?.name || 'Transit Commuter',
      passengerPhone: passengerInfo?.phone || '+256 700 000 000',
      pickupStage,
      destinationStage,
      vehicleType,
      fareUGX: estimate.fare,
      distanceKm: estimate.distanceKm,
      estimatedDurationMins: estimate.estimatedMinutes,
      status: 'requested',
      driverId: driver?.id,
      driverName: driver?.name,
      driverPhone: driver?.phone,
      driverVehiclePlate: driver?.vehiclePlate,
      driverRating: driver?.rating,
      createdAt: 'Just now',
    };

    if (!isSupabaseConfigured()) {
      return { trip: localTrip, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          passenger_id: passengerId,
          driver_id: driver?.id || null,
          pickup_stage_id: pickupStage.id,
          pickup_stage_name: pickupStage.name,
          destination_stage_id: destinationStage.id,
          destination_stage_name: destinationStage.name,
          vehicle_type: vehicleType,
          fare_ugx: estimate.fare,
          status: 'requested',
          distance_km: estimate.distanceKm,
        })
        .select()
        .single();

      if (error) {
        return { trip: localTrip, error: error.message };
      }

      return {
        trip: {
          ...localTrip,
          id: data.id,
        },
        error: null,
      };
    } catch (err: any) {
      return { trip: localTrip, error: err.message };
    }
  },

  /**
   * Update trip status progression
   */
  async updateTripStatus(tripId: string, status: TripStatus): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const timestampField =
        status === 'accepted'
          ? 'accepted_at'
          : status === 'in_transit'
          ? 'started_at'
          : status === 'completed'
          ? 'completed_at'
          : status === 'cancelled'
          ? 'cancelled_at'
          : null;

      const updates: any = { status };
      if (timestampField) {
        updates[timestampField] = new Date().toISOString();
      }

      const { error } = await supabase.from('trips').update(updates).eq('id', tripId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Fetch trip history for user
   */
  async getTripHistory(userId: string): Promise<TripRequest[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
        .order('requested_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((t: any) => {
        const pickup =
          MBARARA_STAGES.find((s) => s.id === t.pickup_stage_id) || {
            ...MBARARA_STAGES[0],
            name: t.pickup_stage_name || MBARARA_STAGES[0].name,
          };
        const dest =
          MBARARA_STAGES.find((s) => s.id === t.destination_stage_id) || {
            ...MBARARA_STAGES[1],
            name: t.destination_stage_name || MBARARA_STAGES[1].name,
          };

        return {
          id: t.id,
          passengerId: t.passenger_id,
          passengerName: 'Commuter',
          passengerPhone: '+256 700 000 000',
          pickupStage: pickup,
          destinationStage: dest,
          fareUGX: t.fare_ugx,
          estimatedDurationMins: 10,
          distanceKm: Number(t.distance_km) || 2.0,
          vehicleType: t.vehicle_type as VehicleType,
          driverName: t.driver_name || 'Verified Rider',
          driverVehiclePlate: t.driver_vehicle_plate || 'UFM 842X',
          status: t.status as TripStatus,
          createdAt: new Date(t.requested_at).toLocaleDateString(),
        };
      });
    } catch {
      return [];
    }
  },
};
