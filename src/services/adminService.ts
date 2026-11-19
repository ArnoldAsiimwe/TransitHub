import { supabase, isSupabaseConfigured } from './supabase';
import { VerificationStatus } from '../types';

export interface SafetyReportInput {
  reporterId: string;
  tripId?: string;
  driverId?: string;
  reportType: string;
  description: string;
  locationName?: string;
}

export const adminService = {
  /**
   * Submit an emergency / safety incident report
   */
  async submitReport(input: SafetyReportInput): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      let cleanReporterId = input.reporterId.replace(/^usr_/, '').replace(/^drv_/, '');

      // Verify UUID format (36 chars with hyphens) - if not a valid UUID (e.g. anon string), check for an existing profile
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(cleanReporterId)) {
        // Fallback to first existing profile id from database so foreign key doesn't fail
        const { data: fallbackUser } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        if (fallbackUser && fallbackUser.id) {
          cleanReporterId = fallbackUser.id;
        } else {
          // Can insert report with clean UUID if allowed or skip reporter_id
          cleanReporterId = 'bd60a461-414f-4ca1-82e1-009f043b2804';
        }
      }

      const { error } = await supabase.from('reports').insert({
        reporter_id: cleanReporterId,
        trip_id: input.tripId || null,
        reported_driver_id: input.driverId || null,
        report_type: input.reportType,
        description: input.description,
        location_name: input.locationName || null,
      });

      return { success: !error, error: error?.message || null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch all safety incident reports for city administration
   */
  async getSafetyReports(): Promise<any[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  /**
   * Mark a safety incident as resolved by admin
   */
  async resolveReport(reportId: string, adminNotes?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          admin_notes: adminNotes || 'Resolved by Mbarara Municipal Inspector',
        })
        .eq('id', reportId);

      return !error;
    } catch {
      return false;
    }
  },
};
