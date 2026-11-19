import React, { useEffect, useState } from 'react';
import { supabase, setAdminKey, clearAdminKey } from './supabase';
import {
  Users,
  ShieldCheck,
  Compass,
  FileWarning,
  Activity,
  CheckCircle2,
  Car,
  MapPin,
  RefreshCw,
  Search,
  AlertTriangle,
  PlusCircle,
  Trash2,
  KeyRound,
  Lock,
  AlertCircle,
  Eye,
  X,
  CreditCard,
  FileText,
  BadgeCheck
} from 'lucide-react';
import {
  UserProfile,
  DriverRecord,
  TripRecord,
  SafetyReportRecord,
  TransitStageRecord,
  VerificationStatus,
  UserRole
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'passengers' | 'trips' | 'stages' | 'reports'>('overview');

  // Database state
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [reports, setReports] = useState<SafetyReportRecord[]>([]);
  const [stages, setStages] = useState<TransitStageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Admin Service Key modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [serviceKeyInput, setServiceKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(Boolean(localStorage.getItem('transit_admin_key')));

  // Review Driver Modal state
  const [selectedDriverForReview, setSelectedDriverForReview] = useState<DriverRecord | null>(null);

  // Stage form modal state
  const [showStageModal, setShowStageModal] = useState(false);
  const [newStage, setNewStage] = useState({
    id: '',
    name: '',
    division: 'Kamukuzi',
    description: '',
    latitude: -0.6072,
    longitude: 30.6545,
  });

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 1. Fetch profiles
      const { data: profData, error: profErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profErr) {
        console.warn('Profiles fetch error:', profErr);
        setFetchError(profErr.message);
      }
      if (profData) setProfiles(profData);

      // 2. Fetch drivers
      const { data: drivData, error: drivErr } = await supabase
        .from('drivers')
        .select('*, profiles(id, full_name, phone, role, email)')
        .order('created_at', { ascending: false });
      if (drivErr) console.warn('Drivers fetch error:', drivErr);
      if (drivData) setDrivers(drivData);

      // 3. Fetch trips
      const { data: tripData } = await supabase
        .from('trips')
        .select('*, passenger:profiles!trips_passenger_id_fkey(full_name, phone), driver:drivers!trips_driver_id_fkey(vehicle_plate, profiles(full_name, phone))')
        .order('requested_at', { ascending: false });
      if (tripData) setTrips(tripData);

      // 4. Fetch reports
      const { data: repData } = await supabase
        .from('reports')
        .select('*, reporter:profiles!reports_reporter_id_fkey(full_name, phone)')
        .order('created_at', { ascending: false });
      if (repData) setReports(repData);

      // 5. Fetch stages
      const { data: stgData } = await supabase.from('stages').select('*').order('name', { ascending: true });
      if (stgData) setStages(stgData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setFetchError(err.message || 'Error communicating with Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServiceKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceKeyInput.trim()) {
      clearAdminKey();
      setHasCustomKey(false);
    } else {
      setAdminKey(serviceKeyInput.trim());
      setHasCustomKey(true);
    }
    setShowKeyModal(false);
    setServiceKeyInput('');
    window.location.reload();
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 6 seconds so admin sees newly registered passengers/drivers immediately
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleUpdateDriverStatus = async (driverId: string, status: VerificationStatus) => {
    try {
      const updatePayload: { verification_status: VerificationStatus; is_online?: boolean } = {
        verification_status: status,
      };
      if (status === 'verified') {
        updatePayload.is_online = true; // Auto-activate driver when approved
      } else if (status === 'rejected') {
        updatePayload.is_online = false;
      }

      const { error } = await supabase
        .from('drivers')
        .update(updatePayload)
        .eq('id', driverId);

      if (!error) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  verification_status: status,
                  is_online: status === 'verified' ? true : status === 'rejected' ? false : d.is_online,
                }
              : d
          )
        );
        if (selectedDriverForReview && selectedDriverForReview.id === driverId) {
          setSelectedDriverForReview((prev) =>
            prev
              ? {
                  ...prev,
                  verification_status: status,
                  is_online: status === 'verified' ? true : status === 'rejected' ? false : prev.is_online,
                }
              : null
          );
        }
      } else {
        alert('Failed to update driver status: ' + error.message);
      }
    } catch (err: any) {
      alert('Error updating driver: ' + err.message);
    }
  };

  const handleToggleOnline = async (driverId: string, currentOnline: boolean) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_online: !currentOnline })
        .eq('id', driverId);

      if (!error) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, is_online: !currentOnline } : d))
        );
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (!error) {
        setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
      } else {
        alert('Failed to update role: ' + error.message);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', reportId);

      if (!error) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, resolved: true } : r))
        );
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStage.id || !newStage.name) {
      alert('Please fill in Stage ID and Name');
      return;
    }

    try {
      const { error } = await supabase.from('stages').upsert({
        id: newStage.id.toLowerCase().replace(/\s+/g, '_'),
        name: newStage.name,
        division: newStage.division,
        description: newStage.description,
        latitude: Number(newStage.latitude),
        longitude: Number(newStage.longitude),
        is_active: true,
      });

      if (!error) {
        setShowStageModal(false);
        setNewStage({
          id: '',
          name: '',
          division: 'Kamukuzi',
          description: '',
          latitude: -0.6072,
          longitude: 30.6545,
        });
        fetchData();
      } else {
        alert('Failed to save stage: ' + error.message);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Are you sure you want to deactivate or remove this stage?')) return;
    try {
      const { error } = await supabase.from('stages').delete().eq('id', stageId);
      if (!error) {
        setStages((prev) => prev.filter((s) => s.id !== stageId));
      } else {
        alert('Could not delete stage: ' + error.message);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Filtered lists
  const filteredDrivers = drivers.filter((d) => {
    const nameMatch = (d.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const plateMatch = (d.vehicle_plate || '').toLowerCase().includes(searchQuery.toLowerCase());
    const stageMatch = (d.stage_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'all' || d.verification_status === statusFilter;
    return (nameMatch || plateMatch || stageMatch) && statusMatch;
  });

  const filteredProfiles = profiles.filter((p) => {
    const nameMatch = (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (p.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = statusFilter === 'all' || p.role === statusFilter;
    return (nameMatch || phoneMatch) && roleMatch;
  });

  const filteredTrips = trips.filter((t) => {
    const idMatch = t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const passMatch = (t.passenger?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const pickMatch = t.pickup_stage_name.toLowerCase().includes(searchQuery.toLowerCase());
    const destMatch = t.destination_stage_name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return (idMatch || passMatch || pickMatch || destMatch) && statusMatch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary-dark)', letterSpacing: '-0.3px' }}>
              TransitHUB
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Mbarara Admin Console
            </p>
          </div>
        </div>

        {/* Menu links */}
        <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button
            onClick={() => { setActiveTab('overview'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'overview' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <Activity size={18} />
            System Overview
          </button>

          <button
            onClick={() => { setActiveTab('drivers'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'drivers' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'drivers' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <ShieldCheck size={18} />
            Driver Fleet ({drivers.length})
          </button>

          <button
            onClick={() => { setActiveTab('passengers'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'passengers' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'passengers' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <Users size={18} />
            User Accounts ({profiles.length})
          </button>

          <button
            onClick={() => { setActiveTab('trips'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'trips' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'trips' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <Car size={18} />
            Live Trips & Orders ({trips.length})
          </button>

          <button
            onClick={() => { setActiveTab('stages'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'stages' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'stages' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <MapPin size={18} />
            Stages & Corridors ({stages.length})
          </button>

          <button
            onClick={() => { setActiveTab('reports'); setSearchQuery(''); setStatusFilter('all'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-sub)',
              backgroundColor: activeTab === 'reports' ? 'var(--primary-surface)' : 'transparent',
              textAlign: 'left',
            }}
          >
            <FileWarning size={18} />
            Safety Incidents ({reports.filter((r) => !r.resolved).length})
          </button>
        </nav>

        {/* Database Status & Authority Strip */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hasCustomKey ? '#8b5cf6' : 'var(--accent)' }} />
              <strong style={{ color: 'var(--text-main)' }}>{hasCustomKey ? 'Master Admin' : 'Public Anon'}</strong>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                background: 'transparent',
                color: hasCustomKey ? '#7c3aed' : 'var(--primary)',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {hasCustomKey ? <Lock size={12} /> : <KeyRound size={12} />}
              {hasCustomKey ? 'Key Set' : 'Add Key'}
            </button>
          </div>
          <p style={{ wordBreak: 'break-all', fontSize: '10px' }}>lhevzrmskzvablxbrxus.supabase.co</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Permission / Fetch Alert if profiles are blocked by RLS */}
        {fetchError && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#92400e' }}>
              <AlertCircle size={20} color="#d97706" />
              <span>
                <strong>Supabase RLS Alert:</strong> {fetchError}. To grant unrestricted master admin rights, enter your <code>service_role</code> secret key or disable RLS for profiles.
              </span>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#d97706',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
              }}
            >
              Enter Service Key
            </button>
          </div>
        )}

        {/* Top bar with Refresh & Quick Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {activeTab === 'overview' ? 'Mbarara Municipality Transit Control' : activeTab}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Absolute Administrative Authority over Drivers, Passengers, Stages & Live Orders
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Sync Now
            </button>

            {activeTab === 'stages' && (
              <button
                onClick={() => setShowStageModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <PlusCircle size={16} />
                Add Transit Stage
              </button>
            )}
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Total Drivers</span>
                  <ShieldCheck size={20} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', margin: '12px 0 4px' }}>
                  {drivers.length}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>
                  {drivers.filter((d) => d.is_online).length} currently online
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Total Passengers</span>
                  <Users size={20} color="var(--secondary)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', margin: '12px 0 4px' }}>
                  {profiles.filter((p) => p.role === 'passenger').length}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Registered across Mbarara
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Completed Trips</span>
                  <Car size={20} color="var(--primary-dark)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', margin: '12px 0 4px' }}>
                  {trips.filter((t) => t.status === 'completed').length}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                  {trips.filter((t) => t.status === 'requested' || t.status === 'accepted' || t.status === 'in_progress').length} active right now
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Open SOS / Reports</span>
                  <AlertTriangle size={20} color="var(--danger)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--danger)', margin: '12px 0 4px' }}>
                  {reports.filter((r) => !r.resolved).length}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Requires municipal action
                </span>
              </div>
            </div>

            {/* Quick Action Tables in Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              {/* Pending Driver Verifications */}
              <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Pending Driver Verifications</h3>
                  <button onClick={() => setActiveTab('drivers')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', background: 'none' }}>
                    View All Fleet →
                  </button>
                </div>

                {drivers.filter((d) => d.verification_status === 'pending').length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={36} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>All driver applications verified!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {drivers
                      .filter((d) => d.verification_status === 'pending')
                      .slice(0, 4)
                      .map((d) => (
                        <div
                          key={d.id}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: 'var(--bg)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{d.profiles?.full_name || 'Driver'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Plate: <strong>{d.vehicle_plate}</strong> • {d.vehicle_type ? d.vehicle_type.toUpperCase() : 'VEHICLE'} • {d.stage_name}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => setSelectedDriverForReview(d)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={13} />
                              Review
                            </button>
                            <button
                              onClick={() => handleUpdateDriverStatus(d.id, 'verified')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'var(--primary)',
                                color: '#ffffff',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: '700',
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateDriverStatus(d.id, 'rejected')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--danger)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Recent Safety Incidents */}
              <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Safety / SOS Reports</h3>
                  <button onClick={() => setActiveTab('reports')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', background: 'none' }}>
                    View All Reports →
                  </button>
                </div>

                {reports.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={36} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>No incidents reported.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reports.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: '12px',
                          borderLeft: r.resolved ? '4px solid var(--accent)' : '4px solid var(--danger)',
                          backgroundColor: 'var(--bg)',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>
                            {r.report_type.replace('_', ' ')}
                          </strong>
                          <span style={{ color: r.resolved ? 'var(--accent)' : 'var(--danger)', fontWeight: '700' }}>
                            {r.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                          {r.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. DRIVER FLEET TAB */}
        {activeTab === 'drivers' && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', width: '350px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search by driver name, plate, or stage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'verified', 'pending', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      backgroundColor: statusFilter === st ? 'var(--primary)' : 'var(--bg)',
                      color: statusFilter === st ? '#ffffff' : 'var(--text-sub)',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredDrivers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No drivers matching criteria.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Driver Name</th>
                    <th style={{ padding: '12px 16px' }}>Plate & Vehicle</th>
                    <th style={{ padding: '12px 16px' }}>Stage Base</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Online Dispatch</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700' }}>{d.profiles?.full_name || 'Driver'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.profiles?.phone}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', color: '#92400e' }}>
                          {d.vehicle_plate}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.vehicle_model}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{d.stage_name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            backgroundColor:
                              d.verification_status === 'verified'
                                ? 'var(--primary-surface)'
                                : d.verification_status === 'pending'
                                ? 'var(--warning-surface)'
                                : 'var(--danger-surface)',
                            color:
                              d.verification_status === 'verified'
                                ? 'var(--primary)'
                                : d.verification_status === 'pending'
                                ? 'var(--warning)'
                                : 'var(--danger)',
                          }}
                        >
                          {d.verification_status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleOnline(d.id, d.is_online)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: d.is_online ? 'var(--primary-surface)' : 'var(--bg)',
                            color: d.is_online ? 'var(--primary)' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: d.is_online ? 'var(--accent)' : '#94a3b8' }} />
                          {d.is_online ? 'Online' : 'Offline'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedDriverForReview(d)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--surface)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-main)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} />
                            Details
                          </button>
                          {d.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleUpdateDriverStatus(d.id, 'verified')}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '700' }}
                            >
                              Verify
                            </button>
                          )}
                          {d.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateDriverStatus(d.id, 'rejected')}
                              style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '700' }}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. USER ACCOUNTS TAB */}
        {activeTab === 'passengers' && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', width: '350px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search user by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'passenger', 'driver', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setStatusFilter(role)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      backgroundColor: statusFilter === role ? 'var(--primary)' : 'var(--bg)',
                      color: statusFilter === role ? '#ffffff' : 'var(--text-sub)',
                    }}
                  >
                    {role}s
                  </button>
                ))}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Full Name / Username</th>
                  <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                  <th style={{ padding: '12px 16px' }}>System Role</th>
                  <th style={{ padding: '12px 16px' }}>Member Since</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Role Modification</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{p.full_name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-sub)' }}>{p.phone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          backgroundColor: p.role === 'admin' ? '#f3e8ff' : p.role === 'driver' ? 'var(--secondary-surface)' : 'var(--primary-surface)',
                          color: p.role === 'admin' ? '#7e22ce' : p.role === 'driver' ? 'var(--secondary)' : 'var(--primary)',
                        }}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <select
                        value={p.role}
                        onChange={(e) => handleUpdateUserRole(p.id, e.target.value as UserRole)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: 'var(--bg)',
                        }}
                      >
                        <option value="passenger">Passenger</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. LIVE TRIPS & ORDERS TAB */}
        {activeTab === 'trips' && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', width: '350px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search orders, passenger, stages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'requested', 'accepted', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'capitalize',
                      backgroundColor: statusFilter === st ? 'var(--primary)' : 'var(--bg)',
                      color: statusFilter === st ? '#ffffff' : 'var(--text-sub)',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredTrips.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No trip orders recorded yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Trip ID</th>
                    <th style={{ padding: '12px 16px' }}>Passenger</th>
                    <th style={{ padding: '12px 16px' }}>Route (Pickup ➔ Dropoff)</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Driver</th>
                    <th style={{ padding: '12px 16px' }}>Fare (UGX)</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>
                        {t.id.slice(0, 8)}...
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600' }}>{t.passenger?.full_name || 'Passenger'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.passenger?.phone}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>{t.pickup_stage_name} ➔ <strong>{t.destination_stage_name}</strong></div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.distance_km} km • {t.vehicle_type}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {t.driver ? (
                          <div>
                            <div style={{ fontWeight: '700' }}>{t.driver.profiles?.full_name || 'Driver'}</div>
                            <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                              {t.driver.vehicle_plate}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Awaiting Operator</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                        {t.fare_ugx.toLocaleString()} UGX
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            backgroundColor:
                              t.status === 'completed'
                                ? 'var(--primary-surface)'
                                : t.status === 'cancelled'
                                ? 'var(--danger-surface)'
                                : 'var(--warning-surface)',
                            color:
                              t.status === 'completed'
                                ? 'var(--primary)'
                                : t.status === 'cancelled'
                                ? 'var(--danger)'
                                : 'var(--warning)',
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 5. STAGES & CORRIDORS TAB */}
        {activeTab === 'stages' && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Stage ID</th>
                  <th style={{ padding: '12px 16px' }}>Stage Name</th>
                  <th style={{ padding: '12px 16px' }}>Municipal Division</th>
                  <th style={{ padding: '12px 16px' }}>Coordinates</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>{s.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.name}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: 'var(--primary-surface)', color: 'var(--primary-dark)', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>
                        {s.division}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {s.latitude}, {s.longitude}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteStage(s.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--danger)',
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        title="Delete Stage"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. SAFETY & SOS INCIDENTS TAB */}
        {activeTab === 'reports' && (
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px' }}>
            {reports.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No safety incidents or emergency reports submitted.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reports.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: r.resolved ? '5px solid var(--accent)' : '5px solid var(--danger)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', textTransform: 'capitalize' }}>
                          {r.report_type.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '10px',
                            fontWeight: '800',
                            backgroundColor: r.resolved ? 'var(--primary-surface)' : 'var(--danger-surface)',
                            color: r.resolved ? 'var(--primary)' : 'var(--danger)',
                          }}
                        >
                          {r.resolved ? 'RESOLVED' : 'ACTION REQUIRED'}
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '8px' }}>
                        {r.description}
                      </p>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>Reporter: <strong>{r.reporter?.full_name || 'Passenger'}</strong> ({r.reporter?.phone})</span>
                        {r.location_name && <span>Location: <strong>{r.location_name}</strong></span>}
                        <span>Reported on: {new Date(r.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {!r.resolved && (
                      <button
                        onClick={() => handleResolveReport(r.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        Mark As Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Driver Application Verification & Approval */}
      {selectedDriverForReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              padding: '30px',
              borderRadius: 'var(--radius-lg)',
              width: '560px',
              maxWidth: '92vw',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BadgeCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Driver Credential Verification
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Verify applicant identity, vehicle, and stage endorsement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriverForReview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Status Banner */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  selectedDriverForReview.verification_status === 'verified'
                    ? '#EFF6FF'
                    : selectedDriverForReview.verification_status === 'pending'
                    ? '#FEF3C7'
                    : '#FEE2E2',
                border:
                  selectedDriverForReview.verification_status === 'verified'
                    ? '1px solid #BFDBFE'
                    : selectedDriverForReview.verification_status === 'pending'
                    ? '1px solid #FDE68A'
                    : '1px solid #FECACA',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color:
                      selectedDriverForReview.verification_status === 'verified'
                        ? '#2563EB'
                        : selectedDriverForReview.verification_status === 'pending'
                        ? '#D97706'
                        : '#DC2626',
                  }}
                >
                  Status: {selectedDriverForReview.verification_status}
                </span>
                {selectedDriverForReview.verification_status === 'verified' && (
                  <span
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: '700',
                    }}
                  >
                    ✓ Blue Badge Issued
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedDriverForReview.is_online ? '● Online & Dispatchable' : '○ Offline'}
              </span>
            </div>

            {/* Verification Detail Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
              {/* Full Name */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Applicant Full Name
                </span>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', margin: 0 }}>
                  {selectedDriverForReview.profiles?.full_name || 'Driver Applicant'}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                  Phone: {selectedDriverForReview.profiles?.phone || 'No phone'}
                </span>
              </div>

              {/* National Identification Number (NIN) */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} color="var(--primary)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    National ID (NIN)
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: '#1e293b', marginTop: '4px', margin: 0 }}>
                  {selectedDriverForReview.nin_number || 'NIN Not Provided'}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Republic of Uganda</span>
              </div>

              {/* Vehicle Type & Number Plate */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Vehicle Category & Plate
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: '800',
                      fontSize: '13px',
                      borderRadius: 'var(--radius-sm)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {selectedDriverForReview.vehicle_plate}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {selectedDriverForReview.vehicle_type || 'boda'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px' }}>
                  Model: {selectedDriverForReview.vehicle_model || 'Standard'}
                </div>
              </div>

              {/* Driving Permit / License */}
              <div style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="var(--primary)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    Driving Permit No.
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: '#1e293b', marginTop: '4px', margin: 0 }}>
                  {selectedDriverForReview.license_number || 'Not Submitted'}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  PSV Badge: {selectedDriverForReview.psv_badge_number || 'MBR-REG'}
                </span>
              </div>

              {/* Stage Base & Chairperson Recommendation */}
              <div style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Transit Stage Base & Chairperson Endorsement
                </span>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px', margin: 0 }}>
                  📍 {selectedDriverForReview.stage_name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '4px', margin: 0 }}>
                  Chairperson: <strong>{selectedDriverForReview.stage_chairperson_name || 'Stage Leadership Committee'}</strong>
                </p>
              </div>
            </div>

            {/* Admin Decision Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
              <button
                type="button"
                onClick={() => setSelectedDriverForReview(null)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-sub)',
                }}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateDriverStatus(selectedDriverForReview.id, 'rejected');
                  }}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateDriverStatus(selectedDriverForReview.id, 'verified');
                  }}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: '#2563EB',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}
                >
                  <BadgeCheck size={16} />
                  Approve & Issue Royal Blue Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Transit Stage */}
      {showStageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ backgroundColor: 'var(--surface)', padding: '28px', borderRadius: 'var(--radius-lg)', width: '480px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Add New Municipal Stage</h3>
            <form onSubmit={handleCreateStage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>Stage ID (e.g. stg_mile_4)</label>
                <input
                  type="text"
                  required
                  placeholder="stg_kakiika"
                  value={newStage.id}
                  onChange={(e) => setNewStage({ ...newStage, id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>Stage Name</label>
                <input
                  type="text"
                  required
                  placeholder="Kakiika Trading Centre Stage"
                  value={newStage.name}
                  onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>Division</label>
                <select
                  value={newStage.division}
                  onChange={(e) => setNewStage({ ...newStage, division: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                >
                  <option value="Kamukuzi">Kamukuzi</option>
                  <option value="Kakoba">Kakoba</option>
                  <option value="Nyamitanga">Nyamitanga</option>
                  <option value="Biharwe">Biharwe</option>
                  <option value="Kakiika">Kakiika</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newStage.latitude}
                    onChange={(e) => setNewStage({ ...newStage, latitude: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newStage.longitude}
                    onChange={(e) => setNewStage({ ...newStage, longitude: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '700' }}
                >
                  Save Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Service Key Authority */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ backgroundColor: 'var(--surface)', padding: '28px', borderRadius: 'var(--radius-lg)', width: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <KeyRound size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Master Admin Supabase Access</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              By default, Supabase Row-Level Security (RLS) restricts public access to registered profiles unless an account is signed in or accessed via the <strong>service_role</strong> key.
            </p>

            <form onSubmit={handleSaveServiceKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sub)' }}>
                  Supabase service_role Key (Secret)
                </label>
                <input
                  type="password"
                  placeholder="Paste your service_role key here..."
                  value={serviceKeyInput}
                  onChange={(e) => setServiceKeyInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginTop: '4px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Find this in your <strong>Supabase Dashboard ➔ Project Settings ➔ API ➔ service_role secret</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                {hasCustomKey ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearAdminKey();
                      setHasCustomKey(false);
                      setShowKeyModal(false);
                      window.location.reload();
                    }}
                    style={{ padding: '8px 14px', backgroundColor: 'transparent', color: 'var(--danger)', fontSize: '12px', fontWeight: '600' }}
                  >
                    Reset to Default Key
                  </button>
                ) : <span />}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '700' }}
                  >
                    Apply Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
