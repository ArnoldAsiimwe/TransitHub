export interface TransitStage {
  id: string;
  name: string;
  division: string;
  description: string;
  isMajorHub: boolean;
  latitude: number;
  longitude: number;
  typicalBodaFareUGX: number; // Base fare to town center in UGX
  typicalTaxiFareUGX: number;
}

export const MBARARA_STAGES: TransitStage[] = [
  {
    id: 'stg_taxi_park',
    name: 'Mbarara Central Taxi Park',
    division: 'Kamukuzi',
    description: 'Primary regional taxi terminus on Bananuka Drive',
    isMajorHub: true,
    latitude: -0.6072,
    longitude: 30.6545,
    typicalBodaFareUGX: 1000,
    typicalTaxiFareUGX: 1000,
  },
  {
    id: 'stg_high_street',
    name: 'High Street (Centenary Bank)',
    division: 'Kamukuzi',
    description: 'Central Commercial District banking corridor',
    isMajorHub: true,
    latitude: -0.6065,
    longitude: 30.6575,
    typicalBodaFareUGX: 1500,
    typicalTaxiFareUGX: 1000,
  },
  {
    id: 'stg_must_gate',
    name: 'MUST Main Gate Stage',
    division: 'Kamukuzi',
    description: 'Mbarara University of Science & Technology student hub',
    isMajorHub: true,
    latitude: -0.6148,
    longitude: 30.6582,
    typicalBodaFareUGX: 2000,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stg_boda_kakoba',
    name: 'Kakoba Boda Stage',
    division: 'Kakoba',
    description: 'High-density stage near Kakoba Market & Vocational Institute',
    isMajorHub: false,
    latitude: -0.6135,
    longitude: 30.6698,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stg_mile_2',
    name: 'Mile 2 (Kamukuzi Hill)',
    division: 'Kamukuzi',
    description: 'Masaka Road junction connecting Ruharo & administration block',
    isMajorHub: false,
    latitude: -0.5985,
    longitude: 30.6482,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stg_ruharo',
    name: 'Ruharo Cathedral Stage',
    division: 'Kamukuzi',
    description: 'Church & school transit access point on Bushenyi Road',
    isMajorHub: false,
    latitude: -0.6121,
    longitude: 30.6355,
    typicalBodaFareUGX: 3000,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stg_katete_bridge',
    name: 'Katete Bridge Stage',
    division: 'Nyamitanga',
    description: 'Key River Rwizi crossing link to Katete residential areas',
    isMajorHub: false,
    latitude: -0.6192,
    longitude: 30.6531,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stg_nyamitanga',
    name: 'Nyamitanga Junction',
    division: 'Nyamitanga',
    description: 'Kabale-Rwanda road transit junction near Cathedral',
    isMajorHub: false,
    latitude: -0.6275,
    longitude: 30.6468,
    typicalBodaFareUGX: 3000,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stg_rwebikoona',
    name: 'Rwebikoona Market Stage',
    division: 'Kamukuzi',
    description: 'Fresh produce market & evening commuter hub',
    isMajorHub: false,
    latitude: -0.6012,
    longitude: 30.6425,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stg_koranorya',
    name: 'Koranorya Trading Centre',
    division: 'Biharwe',
    description: 'Eastern municipal entry gate from Kampala-Masaka highway',
    isMajorHub: true,
    latitude: -0.5845,
    longitude: 30.6892,
    typicalBodaFareUGX: 5000,
    typicalTaxiFareUGX: 2500,
  },
];
