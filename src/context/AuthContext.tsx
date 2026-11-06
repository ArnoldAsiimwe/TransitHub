import React, { createContext, useContext, useState } from 'react';
import { DriverApplicationData, DriverProfile, UserProfile, UserRole, VerificationStatus } from '../types';
import { MOCK_DRIVERS } from '../constants/mockData';
import { authService, driverService } from '../services';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [drivers, setDrivers] = useState<DriverProfile[]>(MOCK_DRIVERS);
  const [currentDriver, setCurrentDriver] = useState<DriverProfile>(MOCK_DRIVERS[0]);

  // Driver Application state for the current user
  const [driverApplicationStatus, setDriverApplicationStatus] = useState<
    'not_applied' | 'pending' | 'verified' | 'rejected'
  >('not_applied');
  const [driverApplicationData, setDriverApplicationData] = useState<DriverApplicationData | null>(null);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const login = async (phone: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const formattedPhone = phone.startsWith('+256') ? phone : `+256 ${phone.replace(/^0/, '')}`;
    
    try {
      const res = await authService.login(formattedPhone, password);
      if (res.error) {
        return { success: false, error: res.error };
      }

      if (res.profile) {
        setUserProfile(res.profile);
        setCurrentRole(res.profile.role || 'passenger');
        setIsAuthenticated(true);
        return { success: true };
      }

      // Fallback
      setUserProfile({
        id: `usr_${Date.now()}`,
        name: 'Transit Commuter',
        phone: formattedPhone,
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
    const formattedPhone = phone.startsWith('+256') ? phone : `+256 ${phone.replace(/^0/, '')}`;
    
    try {
      const res = await authService.signUp(name, formattedPhone, email, password);
      if (res.error) {
        return { success: false, error: res.error };
      }

      const createdUser: UserProfile = res.profile || {
        id: `usr_${Date.now()}`,
        name: name,
        phone: formattedPhone,
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

  const logout = () => {
    setIsAuthenticated(false);
    authService.logout().catch(() => {});
  };

  const submitDriverApplication = (data: DriverApplicationData) => {
    setDriverApplicationData(data);
    setDriverApplicationStatus('verified'); // Driver application approved & account upgraded
    setCurrentRole('driver'); // Automatically switch role to driver

    // Create accredited driver profile linked to current user
    const newDriver: DriverProfile = {
      id: `drv_${userProfile.id}`,
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
      isOnline: true,
      verificationStatus: 'verified',
      licenseNumber: data.licenseNumber,
      ninNumber: data.ninNumber,
      psvBadgeNumber: data.psvBadgeNumber || 'MBR-REG',
      lastActive: 'Just now',
    };

    setCurrentDriver(newDriver);
    setDrivers((prev) => [newDriver, ...prev]);

    // Sync with Supabase in background
    driverService.submitApplication(userProfile.id, userProfile.name, userProfile.phone, data).catch((e) => {
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
