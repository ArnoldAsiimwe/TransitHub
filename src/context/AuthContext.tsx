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
  login: (phone: string, password?: string) => boolean;
  signUp: (name: string, phone: string, email?: string, password?: string) => void;
  logout: () => void;
  submitDriverApplication: (data: DriverApplicationData) => void;
  updateDriverOnline: (isOnline: boolean) => void;
  updateDriverVerificationStatus: (driverId: string, status: VerificationStatus) => void;
}

const DEFAULT_PASSENGER: UserProfile = {
  id: 'usr_pass_001',
  name: 'Kiconco Brenda',
  phone: '+256 782 345 678',
  role: 'passenger',
  email: 'brenda.kiconco@must.ac.ug',
  joinedDate: 'Jan 2026',
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr_admin_001',
  name: 'Eng. Tumusiime Godfrey',
  phone: '+256 700 112 233',
  role: 'admin',
  email: 'transport.admin@mbararacity.go.ug',
  joinedDate: 'Oct 2024',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PASSENGER);
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

  const login = (phone: string, password?: string): boolean => {
    // Check if phone matches admin
    if (phone.includes('700112233') || phone.includes('admin')) {
      setCurrentRole('admin');
      setIsAuthenticated(true);
      return true;
    }
    // Check if phone matches verified driver demo
    if (phone.includes('772142890') || phone.includes('772 142 890') || phone.includes('driver')) {
      setCurrentRole('driver');
      setDriverApplicationStatus('verified');
      setIsAuthenticated(true);
      return true;
    }
    // Default passenger login
    const formattedPhone = phone.startsWith('+256') ? phone : `+256 ${phone.replace(/^0/, '')}`;
    setUserProfile((prev) => ({
      ...prev,
      phone: formattedPhone,
    }));
    setCurrentRole('passenger');
    setIsAuthenticated(true);

    // Sync with Supabase in background
    authService.login(formattedPhone, password).catch((e) => {
      console.log('[Auth Login Sync]', e);
    });

    return true;
  };

  const signUp = (name: string, phone: string, email?: string, password?: string) => {
    const formattedPhone = phone.startsWith('+256') ? phone : `+256 ${phone.replace(/^0/, '')}`;
    const newUser: UserProfile = {
      id: `usr_${Date.now().toString().slice(-5)}`,
      name: name || 'New Commuter',
      phone: formattedPhone,
      email: email || '',
      role: 'passenger', // All new accounts start as standard passenger/commuter
      joinedDate: 'Today',
    };
    setUserProfile(newUser);
    setCurrentRole('passenger');
    setDriverApplicationStatus('not_applied');
    setDriverApplicationData(null);
    setIsAuthenticated(true);

    // Sync with Supabase in background
    authService.signUp(name, formattedPhone, email, password).then((res) => {
      if (res.profile?.id) {
        setUserProfile((prev) => ({ ...prev, id: res.profile!.id }));
      }
    }).catch((e) => {
      console.log('[Auth SignUp Sync]', e);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    authService.logout().catch(() => {});
  };

  const submitDriverApplication = (data: DriverApplicationData) => {
    setDriverApplicationData(data);
    setDriverApplicationStatus('pending');

    // Create a new pending driver profile linked to current user
    const newPendingDriver: DriverProfile = {
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
      isOnline: false,
      verificationStatus: 'pending',
      licenseNumber: data.licenseNumber,
      ninNumber: data.ninNumber,
      psvBadgeNumber: data.psvBadgeNumber || 'PENDING-REG',
      lastActive: 'Just now',
    };

    setCurrentDriver(newPendingDriver);
    // Add to municipal driver list so Admin can inspect and approve it!
    setDrivers((prev) => [newPendingDriver, ...prev]);

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
    if (currentRole === 'admin') {
      return DEFAULT_ADMIN;
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
