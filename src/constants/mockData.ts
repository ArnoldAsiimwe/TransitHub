import { DriverProfile, EmergencyContact, SafetyIncident, VehicleType } from '../types';
import { MBARARA_STAGES, TransitStage } from './mbararaStages';

export const MOCK_DRIVERS: DriverProfile[] = [];

export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'sos_police_cps',
    title: 'Mbarara Central Police Station (CPS)',
    subtitle: 'High Street / Police Road - 24/7 Operations Room',
    phoneNumber: '+256 485 420222',
    category: 'police',
    isTollFree: false,
  },
  {
    id: 'sos_police_tollfree',
    title: 'Uganda Police Emergency Helpline',
    subtitle: 'National Toll-Free Emergency Dispatch',
    phoneNumber: '999',
    category: 'police',
    isTollFree: true,
  },
  {
    id: 'sos_police_mobile',
    title: 'Police Rapid Response Mobile',
    subtitle: 'Toll-free mobile direct link',
    phoneNumber: '112',
    category: 'police',
    isTollFree: true,
  },
  {
    id: 'sos_mrrh_emergency',
    title: 'Mbarara Regional Referral Hospital',
    subtitle: 'Emergency Casualty & Trauma Unit',
    phoneNumber: '+256 485 420014',
    category: 'hospital',
    isTollFree: false,
  },
  {
    id: 'sos_boda_office',
    title: 'Mbarara City Boda Boda Association (MICBOBA)',
    subtitle: 'Disciplinary & Safety Stage Registry',
    phoneNumber: '+256 772 450 119',
    category: 'traffic',
    isTollFree: false,
  },
];

export const MOCK_INCIDENT_REPORTS: SafetyIncident[] = [
  {
    id: 'rep_001',
    reporterId: 'usr_pass_01',
    reporterName: 'Akampurira Patience',
    reporterRole: 'passenger',
    driverName: 'Tumukunde Alex',
    vehiclePlate: 'UFN 904C',
    category: 'overcharging',
    title: 'Dispute over night tariff at Mile 2',
    description: 'Driver demanded 5,000 UGX instead of the standard 2,500 UGX fare from High Street to Mile 2 after 9 PM.',
    status: 'pending_review',
    createdAt: 'Today, 07:45 AM',
    locationName: 'Mile 2 Kamukuzi',
  },
  {
    id: 'rep_002',
    reporterId: 'usr_pass_02',
    reporterName: 'Mwesigwa Davis',
    reporterRole: 'passenger',
    driverName: 'Unknown Rider',
    vehiclePlate: 'UFL 889X',
    category: 'reckless_driving',
    title: 'Riding against one-way flow on Buremba Road',
    description: 'High speed overtaking during morning rush near Central Market corner. Helmet was missing.',
    status: 'investigating',
    createdAt: 'Yesterday, 04:20 PM',
    locationName: 'Buremba Road',
  },
  {
    id: 'rep_003',
    reporterId: 'usr_pass_03',
    reporterName: 'Kyomugisha Sarah',
    reporterRole: 'passenger',
    driverName: 'Mugisha Dennis',
    vehiclePlate: 'UFM 842X',
    category: 'lost_property',
    title: 'Left student laptop bag on rear rack',
    description: 'MUST student ID card and blue Dell laptop left on bike. Resolved by stage chairman.',
    status: 'resolved',
    createdAt: '21 Oct 2026',
    locationName: 'MUST Main Gate',
  },
];

export function calculateTripEstimate(
  pickup: TransitStage,
  destination: TransitStage,
  vehicleType: VehicleType
): { fareUGX: number; distanceKm: number; durationMins: number } {
  // Haversine approximate distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = ((destination.latitude - pickup.latitude) * Math.PI) / 180;
  const dLon = ((destination.longitude - pickup.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickup.latitude * Math.PI) / 180) *
      Math.cos((destination.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distanceKm = parseFloat((R * c).toFixed(1));
  if (distanceKm < 0.8) distanceKm = 0.8;

  let baseFare = 1500;
  let perKmRate = 800;
  let avgSpeedKmh = 25;

  if (vehicleType === 'boda') {
    baseFare = 1500;
    perKmRate = 700;
    avgSpeedKmh = 28;
  } else if (vehicleType === 'taxi') {
    // Shared matatu has standardized stage fares
    baseFare = 1000;
    perKmRate = 400;
    avgSpeedKmh = 20;
  } else {
    // Special hire car
    baseFare = 5000;
    perKmRate = 1800;
    avgSpeedKmh = 24;
  }

  // Calculate raw fare and round to nearest 500 UGX (standard Ugandan currency convention)
  const rawFare = baseFare + distanceKm * perKmRate;
  const fareUGX = Math.round(rawFare / 500) * 500;
  const durationMins = Math.max(5, Math.round((distanceKm / avgSpeedKmh) * 60) + 3);

  return {
    fareUGX,
    distanceKm,
    durationMins,
  };
}
