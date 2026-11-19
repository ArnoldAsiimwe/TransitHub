export type UserRole = 'passenger' | 'driver' | 'admin';
export type VehicleType = 'boda' | 'taxi' | 'special_hire';
export type VerificationStatus = 'not_applied' | 'pending' | 'verified' | 'rejected';
export type TripStatus = 'requested' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  phone: string;
  full_name: string;
  role: UserRole;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface DriverRecord {
  id: string;
  vehicle_type: VehicleType;
  vehicle_plate: string;
  vehicle_model: string;
  stage_id: string;
  stage_name: string;
  license_number: string;
  nin_number: string;
  psv_badge_number?: string;
  stage_chairperson_name?: string;
  rating: number;
  total_trips: number;
  is_online: boolean;
  verification_status: VerificationStatus;
  last_active?: string;
  created_at: string;
  profiles?: UserProfile;
}

export interface TripRecord {
  id: string;
  passenger_id: string;
  driver_id?: string;
  pickup_stage_id: string;
  pickup_stage_name: string;
  destination_stage_id: string;
  destination_stage_name: string;
  vehicle_type: VehicleType;
  fare_ugx: number;
  status: TripStatus;
  distance_km: number;
  requested_at: string;
  passenger?: { full_name: string; phone: string };
  driver?: { profiles?: { full_name: string; phone: string }; vehicle_plate?: string };
}

export interface SafetyReportRecord {
  id: string;
  reporter_id: string;
  trip_id?: string;
  reported_driver_id?: string;
  report_type: string;
  description: string;
  location_name?: string;
  resolved: boolean;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter?: { full_name: string; phone: string };
}

export interface TransitStageRecord {
  id: string;
  name: string;
  division: string;
  description?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
}
