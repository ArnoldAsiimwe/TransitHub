import React, { createContext, useContext, useEffect, useState } from 'react';
import { DriverApplicationData, DriverProfile, UserProfile, UserRole, VerificationStatus } from '../types';
import { MOCK_DRIVERS } from '../constants/mockData';
import { authService, driverService } from '../services';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  currentUser: UserProfile | DriverProfile;
  currentRole: UserRole;
  isAuthenticated: boolean;
  driversList: DriverProfile[];
  driverApplicationStatus: 'not_applied' | 'pending' | 'verified' | 'rejected';
  driverApplicationData: DriverApplicationData | null;
  switchRole: (role: UserRole) => void;
  login: (phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, phone: string, email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (identifierOrEmail: string) => Promise<{ success: boolean; message: string; error?: string }>;
  logout: () => void;
  submitDriverApplication: (data: DriverApplicationData) => void;
  updateDriverOnline: (isOnline: boolean) => void;
  updateDriverVerificationStatus: (driverId: string, status: VerificationStatus) => void;
}

const DEFAULT_USER: UserProfile = {
  id: '',
  name: 'Transit Commuter',
  phone: '',
  role: 'passenger',
  email: '',
  joinedDate: 'Today',
};

const createDriverFromUser = (user: UserProfile): DriverProfile => ({
  id: user.id || 'default',
  name: user.name || 'Transit Operator',
  phone: user.phone || '',
  role: 'driver',
  email: user.email,
  joinedDate: user.joinedDate || 'Today',
  vehicleType: 'boda',
  vehiclePlate: 'UEX 000A',
  vehicleModel: 'Bajaj Boxer BM150',
  stageId: 'stg_taxi_park',
  stageName: 'Mbarara Central Taxi Park',
  rating: 5.0,
  totalTrips: 0,
  isOnline: true,
  verificationStatus: 'verified',
  licenseNumber: 'DL-UG-000000',
  ninNumber: 'CM000000000000',
  psvBadgeNumber: 'MBR-REG',
  lastActive: 'Online now',
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [currentDriver, setCurrentDriver] = useState<DriverProfile>(() =>
    createDriverFromUser(DEFAULT_USER)
  );

  const refreshDriversList = async () => {
    if (isSupabaseConfigured()) {
      try {
        const fetched = await driverService.getAvailableDrivers();
        if (fetched) {
          setDrivers(fetched);
        }

        // If current user is authenticated, check if their role has been updated by admin in Supabase
        if (userProfile.id) {
          const rawId = userProfile.id.replace(/^drv_/, '');
          
          // 1. Sync role from profiles table (e.g. admin changed passenger -> driver or admin)
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('role, full_name, phone')
            .eq('id', rawId)
            .maybeSingle();

          if (profileRow && profileRow.role && profileRow.role !== currentRole) {
            setCurrentRole(profileRow.role as UserRole);
            setUserProfile((prev) => ({
              ...prev,
              role: profileRow.role as UserRole,
              name: profileRow.full_name || prev.name,
              phone: profileRow.phone || prev.phone,
            }));
            if (profileRow.role === 'driver') {
              setCurrentDriver((prev) => ({
                ...prev,
                id: rawId,
                name: profileRow.full_name || prev.name,
                phone: profileRow.phone || prev.phone,
                role: 'driver',
              }));
            }
          }

          // 2. Sync verification and driver online status
          const { data: myDriverRow } = await supabase
            .from('drivers')
            .select('verification_status, is_online')
            .eq('id', rawId)
            .maybeSingle();

          if (myDriverRow && myDriverRow.verification_status) {
            setDriverApplicationStatus(myDriverRow.verification_status);
            setCurrentDriver((prev) => ({
              ...prev,
              verificationStatus: myDriverRow.verification_status,
              isOnline: myDriverRow.is_online,
            }));
          }
        }
      } catch (err) {
        // silent fail
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    refreshDriversList();

    // Poll for newly registered drivers across all member devices every 4 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        refreshDriversList();
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Driver Application state for the current user
  const [driverApplicationStatus, setDriverApplicationStatus] = useState<
    'not_applied' | 'pending' | 'verified' | 'rejected'
  >('not_applied');
  const [driverApplicationData, setDriverApplicationData] = useState<DriverApplicationData | null>(null);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const login = async (usernameOrPhone: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.login(usernameOrPhone.trim(), password);
      if (res.error) {
        return { success: false, error: res.error };
      }

      if (res.profile) {
        setUserProfile(res.profile);
        setCurrentRole(res.profile.role || 'passenger');
        if (res.profile.role === 'driver') {
          setCurrentDriver(createDriverFromUser(res.profile));
        }
        setIsAuthenticated(true);
        return { success: true };
      }

      // Fallback
      setUserProfile({
        id: `usr_${Date.now()}`,
        name: usernameOrPhone.trim(),
        phone: '',
        role: 'passenger',
        email: '',
        joinedDate: 'Today',
      });
      setCurrentRole('passenger');
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUp = async (
    name: string,
    phone: string,
    email?: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.signUp(name, phone, email, password);
      if (res.error) {
        return { success: false, error: res.error };
      }

      const createdUser: UserProfile = res.profile || {
        id: `usr_${Date.now()}`,
        name: name,
        phone: phone || '',
        email: email || '',
        role: 'passenger',
        joinedDate: 'Today',
      };

      setUserProfile(createdUser);
      setCurrentRole('passenger');
      setDriverApplicationStatus('not_applied');
      setDriverApplicationData(null);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authService.signInWithGoogle();
      if (res.error) {
        return { success: false, error: res.error };
      }

      if (res.profile) {
        setUserProfile(res.profile);
        setCurrentRole(res.profile.role || 'passenger');
        if (res.profile.role === 'driver') {
          setCurrentDriver(createDriverFromUser(res.profile));
        }
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Google authentication did not return a profile.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign in failed.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(DEFAULT_USER);
    setCurrentDriver(createDriverFromUser(DEFAULT_USER));
    setDriverApplicationStatus('not_applied');
    setDriverApplicationData(null);
    setCurrentRole('passenger');
    authService.logout().catch(() => {});
  };

  const submitDriverApplication = (data: DriverApplicationData) => {
    // Create pending driver profile linked to current user awaiting admin approval
    const rawId = userProfile.id.replace(/^drv_/, '');
    const newDriver: DriverProfile = {
      id: rawId,
      name: userProfile.name,
      phone: userProfile.phone,
      email: userProfile.email,
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
      psvBadgeNumber: data.psvBadgeNumber || 'MBR-REG',
      lastActive: 'Just now',
    };

    setDriverApplicationData(data);
    setDriverApplicationStatus('pending'); // Marked as pending awaiting admin verification
    setCurrentRole('driver');
    setCurrentDriver(newDriver);

    // Sync with Supabase in background
    driverService
      .submitApplication(rawId, userProfile.name, userProfile.phone, data)
      .then(() => {
        // Refresh available drivers list from Supabase
        driverService.getAvailableDrivers().then((freshList) => {
          if (freshList) {
            setDrivers(freshList);
          }
        }).catch(() => {});
      })
      .catch((e) => {
        console.log('[Driver Application Sync]', e);
      });
  };

  const updateDriverOnline = (isOnline: boolean) => {
    setCurrentDriver((prev) => ({ ...prev, isOnline }));
    setDrivers((prev) =>
      prev.map((d) => (d.id === currentDriver.id ? { ...d, isOnline } : d))
    );
    driverService.updateOnlineStatus(currentDriver.id, isOnline).catch(() => {});
  };

  const updateDriverVerificationStatus = (driverId: string, status: VerificationStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: status } : d))
    );
    if (currentDriver.id === driverId) {
      setCurrentDriver((prev) => ({ ...prev, verificationStatus: status }));
      setDriverApplicationStatus(status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending');
    }
    driverService.updateVerificationStatus(driverId, status).catch(() => {});
  };

  const getCurrentUser = (): UserProfile | DriverProfile => {
    if (currentRole === 'driver') {
      return currentDriver;
    }
    return userProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: getCurrentUser(),
        currentRole,
        isAuthenticated,
        driversList: drivers,
        driverApplicationStatus,
        driverApplicationData,
        switchRole,
        login,
        signUp,
        loginWithGoogle,
        resetPassword: async (identifier: string) => {
          const res = await authService.resetPassword(identifier);
          return { success: res.success, message: res.message, error: res.error || undefined };
        },
        logout,
        submitDriverApplication,
        updateDriverOnline,
        updateDriverVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
