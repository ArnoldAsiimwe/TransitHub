export interface TransitStage {
  id: string;
  name: string;
  division: 'Kakoba' | 'Kamukuzi' | 'Nyamitanga' | 'Biharwe' | 'Kakiika';
  description: string;
  isMajorHub: boolean;
  latitude: number;
  longitude: number;
  typicalBodaFareUGX: number; // Base fare to town center in UGX
  typicalTaxiFareUGX: number;
}

export const MBARARA_STAGES: TransitStage[] = [
  {
    id: 'stage_taxi_park',
    name: 'Mbarara Central Taxi Park',
    division: 'Kakoba',
    description: 'Main municipal matatu terminal & regional hub on Buremba Rd',
    isMajorHub: true,
    latitude: -0.6072,
    longitude: 30.6585,
    typicalBodaFareUGX: 1000,
    typicalTaxiFareUGX: 1000,
  },
  {
    id: 'stage_high_street',
    name: 'High Street (Town Centre)',
    division: 'Kamukuzi',
    description: 'Commercial bank strip, supermarkets & town administration',
    isMajorHub: true,
    latitude: -0.6055,
    longitude: 30.6542,
    typicalBodaFareUGX: 1500,
    typicalTaxiFareUGX: 1000,
  },
  {
    id: 'stage_must_gate',
    name: 'MUST Main Gate (University)',
    division: 'Kamukuzi',
    description: 'Mbarara University of Science & Technology campus entrance',
    isMajorHub: true,
    latitude: -0.6128,
    longitude: 30.6567,
    typicalBodaFareUGX: 2000,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stage_mrrh',
    name: 'Mbarara Regional Referral Hospital',
    division: 'Kamukuzi',
    description: 'Emergency ward, hospital main road entrance',
    isMajorHub: true,
    latitude: -0.6142,
    longitude: 30.6591,
    typicalBodaFareUGX: 2000,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stage_kakoba_market',
    name: 'Kakoba Central Market',
    division: 'Kakoba',
    description: 'Bustling produce market & residential transit stage',
    isMajorHub: false,
    latitude: -0.6012,
    longitude: 30.6698,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stage_mile_2',
    name: 'Mile 2 (Kamukuzi Hill)',
    division: 'Kamukuzi',
    description: 'District headquarters junction & residential corridor',
    isMajorHub: false,
    latitude: -0.5985,
    longitude: 30.6415,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stage_ruharo',
    name: 'Ruharo Cathedral Stage',
    division: 'Kamukuzi',
    description: 'St. James Cathedral, Ruharo Mission Hospital road',
    isMajorHub: false,
    latitude: -0.6195,
    longitude: 30.6358,
    typicalBodaFareUGX: 3000,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stage_nyamitanga',
    name: 'Nyamitanga Hill (Cathedral/University)',
    division: 'Nyamitanga',
    description: 'Uganda Martyrs University campus & Cathedral stage',
    isMajorHub: false,
    latitude: -0.6278,
    longitude: 30.6512,
    typicalBodaFareUGX: 3000,
    typicalTaxiFareUGX: 2000,
  },
  {
    id: 'stage_katete_bridge',
    name: 'Katete Bridge Stage',
    division: 'Nyamitanga',
    description: 'Crossing River Rwizi into Katete residential trading centre',
    isMajorHub: false,
    latitude: -0.6214,
    longitude: 30.6651,
    typicalBodaFareUGX: 2500,
    typicalTaxiFareUGX: 1500,
  },
  {
    id: 'stage_biharwe',
    name: 'Biharwe Eclipse Monument Stage',
    division: 'Biharwe',
    description: 'Kampala-Mbarara Highway junction & 1520 AD Eclipse Monument',
    isMajorHub: true,
    latitude: -0.5482,
    longitude: 30.7321,
    typicalBodaFareUGX: 6000,
    typicalTaxiFareUGX: 3000,
  },
];
