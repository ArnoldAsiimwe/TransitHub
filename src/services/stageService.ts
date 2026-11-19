import { supabase, isSupabaseConfigured } from './supabase';
import { MBARARA_STAGES, TransitStage } from '../constants/mbararaStages';

export const stageService = {
  /**
   * Fetch all active transit stages from Supabase, falling back to local list
   * and merging newly added municipal stages dynamically.
   */
  async getStages(): Promise<TransitStage[]> {
    if (!isSupabaseConfigured()) {
      return MBARARA_STAGES;
    }

    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return MBARARA_STAGES;
      }

      // Convert DB rows to TransitStage
      const dbStages: TransitStage[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        division: (row.division as any) || 'Kamukuzi',
        description: row.description || `${row.name} transit terminal`,
        isMajorHub: Boolean(row.is_major_hub ?? row.isMajorHub ?? false),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        typicalBodaFareUGX: Number(row.typical_boda_fare_ugx || row.typicalBodaFareUGX || 2000),
        typicalTaxiFareUGX: Number(row.typical_taxi_fare_ugx || row.typicalTaxiFareUGX || 1500),
      }));

      // Merge with default stages so standard stages are always available
      const stageMap = new Map<string, TransitStage>();
      MBARARA_STAGES.forEach((s) => stageMap.set(s.id, s));
      dbStages.forEach((s) => stageMap.set(s.id, s));

      return Array.from(stageMap.values());
    } catch (err) {
      console.warn('[Stage Service Error]', err);
      return MBARARA_STAGES;
    }
  },
};
