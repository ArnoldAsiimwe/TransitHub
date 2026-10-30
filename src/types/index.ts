import { TransitStage } from '../constants/mbararaStages';

export type UserRole = 'passenger' | 'driver' | 'admin';

export type VehicleType = 'boda' | 'taxi' | 'special_hire';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type TripStatus =
  | 'idle'
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface DriverProfile extends UserProfile {
  vehicleType: VehicleType;
  vehiclePlate: string; // e.g. UFM 123A (Ugandan plate format)
  vehicleModel: string; // e.g. Bajaj Boxer 100 or Toyota HiAce Drone
  stageId: string;
  stageName: string;
  rating: number; // e.g. 4.8
  totalTrips: number;
  isOnline: boolean;
  verificationStatus: VerificationStatus;
  licenseNumber: string;
  ninNumber: string; // National Identification Number
  psvBadgeNumber?: string;
  lastActive: string;
  currentLat?: number;
  currentLng?: number;
}

export interface DriverApplicationData {
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  stageId: string;
  stageName: string;
  licenseNumber: string;
  ninNumber: string;
  psvBadgeNumber?: string;
  yearsOfExperience?: string;
  stageChairpersonName?: string;
}

export interface TripRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  pickupStage: TransitStage;
  destinationStage: TransitStage;
  vehicleType: VehicleType;
  fareUGX: number;
  estimatedDurationMins: number;
  distanceKm: number;
  status: TripStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehiclePlate?: string;
  driverRating?: number;
  createdAt: string;
  notes?: string;
}

export interface SafetyIncident {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  driverName?: string;
  vehiclePlate?: string;
  category: 'safety_hazard' | 'overcharging' | 'reckless_driving' | 'lost_property' | 'emergency';
  title: string;
  description: string;
  status: 'pending_review' | 'investigating' | 'resolved';
  createdAt: string;
  locationName: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  subtitle: string;
  phoneNumber: string;
  category: 'police' | 'hospital' | 'traffic' | 'helpline';
  isTollFree: boolean;
}
