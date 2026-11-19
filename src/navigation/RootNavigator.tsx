import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';
import { Header } from '../components/common/Header';
import { BottomTabBar, TabKey } from '../components/common/BottomTabBar';
import { EmergencyModal } from '../components/safety/EmergencyModal';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { DriverApplicationScreen } from '../screens/driver/DriverApplicationScreen';
import { PassengerHomeScreen } from '../screens/passenger/PassengerHomeScreen';
import { DriverListScreen } from '../screens/passenger/DriverListScreen';
import { TripTrackingScreen } from '../screens/passenger/TripTrackingScreen';
import { MbararaMapScreen } from '../screens/passenger/MbararaMapScreen';
import { TripHistoryScreen } from '../screens/passenger/TripHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DriverDashboardScreen } from '../screens/driver/DriverDashboardScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { DriverProfile, UserRole } from '../types';

type AuthScreenState = 'welcome' | 'login' | 'signup' | 'main';

export const RootNavigator: React.FC = () => {
  const { currentRole, switchRole } = useAuth();
  const { activeTrip, requestRide } = useTrip();

  // Navigation states
  const [authScreen, setAuthScreen] = useState<AuthScreenState>('welcome');
  const [isDriverApplicationOpen, setIsDriverApplicationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [passengerSubScreen, setPassengerSubScreen] = useState<'home' | 'drivers' | 'tracking'>('home');
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Tab transition animations
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const tabTranslateYAnim = useRef(new Animated.Value(0)).current;

  const animateTabSwitch = (newTab: TabKey) => {
    tabFadeAnim.setValue(0.65);
    tabTranslateYAnim.setValue(8);
    setActiveTab(newTab);

    Animated.parallel([
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(tabTranslateYAnim, {
        toValue: 0,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectRoleFromWelcome = (role: UserRole) => {
    switchRole(role);
    setAuthScreen('main');
    setActiveTab('home');
  };

  const handleLoginSuccess = () => {
    setAuthScreen('main');
    setActiveTab('home');
  };

  const handleSignUpSuccess = () => {
    // When a user signs up, they enter the app as passenger
    setAuthScreen('main');
    setActiveTab('home');
  };

  const handleSelectDriverAndBook = (driver: DriverProfile) => {
    requestRide(driver);
    setPassengerSubScreen('tracking');
    setActiveTab('home');
  };

  const handleStageSelectedOnMap = () => {
    setActiveTab('home');
    setPassengerSubScreen('home');
  };

  const handleRebookFromHistory = () => {
    setActiveTab('home');
    setPassengerSubScreen('home');
  };

  // 1. Auth Flow: Welcome Screen
  if (authScreen === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setAuthScreen('signup')}
        onNavigateToLogin={() => setAuthScreen('login')}
      />
    );
  }

  // 2. Auth Flow: Universal Login Screen
  if (authScreen === 'login') {
    return (
      <LoginScreen
        onNavigateToSignUp={() => setAuthScreen('signup')}
        onBackToWelcome={() => setAuthScreen('welcome')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. Auth Flow: Universal Sign Up Screen
  if (authScreen === 'signup') {
    return (
      <SignUpScreen
        onNavigateToLogin={() => setAuthScreen('login')}
        onBackToWelcome={() => setAuthScreen('welcome')}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  // 4. In-App: Driver Accreditation / Application Screen
  if (isDriverApplicationOpen) {
    return (
      <DriverApplicationScreen
        onBack={() => setIsDriverApplicationOpen(false)}
        onApplicationSubmitted={() => setIsDriverApplicationOpen(false)}
      />
    );
  }

  // Header Title & Subtitle based on active tab and role
  let headerTitle = 'TransitHub Mbarara';
  let headerSubtitle = 'Municipal Transit System';
  let showBackButton = false;
  let onBackAction: (() => void) | undefined = undefined;

  if (activeTab === 'home') {
    if (currentRole === 'passenger') {
      if (passengerSubScreen === 'home') {
        headerTitle = 'Book Transit';
        headerSubtitle = 'Mbarara Stages & Regulated Tariffs';
      } else if (passengerSubScreen === 'drivers') {
        headerTitle = 'Available Operators';
        headerSubtitle = 'Select verified boda or taxi rider';
        showBackButton = true;
        onBackAction = () => setPassengerSubScreen('home');
      } else if (passengerSubScreen === 'tracking') {
        headerTitle = 'Trip In Progress';
        headerSubtitle = 'Live stage progress tracking';
        showBackButton = true;
        onBackAction = () => setPassengerSubScreen('home');
      }
    } else if (currentRole === 'driver') {
      headerTitle = 'Driver Terminal';
      headerSubtitle = 'Availability, Dispatches & Earnings';
    } else if (currentRole === 'admin') {
      headerTitle = 'Municipal Admin';
      headerSubtitle = 'Permit Approvals & Safety Oversight';
    }
  } else if (activeTab === 'map') {
    headerTitle = 'My Map';
    headerSubtitle = 'Mbarara Municipal Stages & Corridors';
  } else if (activeTab === 'history') {
    headerTitle = 'Trip History';
    headerSubtitle = 'Recent Rides & Official Receipts';
  } else if (activeTab === 'profile') {
    headerTitle = 'My Profile';
    headerSubtitle = 'Account, Roles & Preferences';
  }

  return (
    // Note: edges={['left', 'right']} ensures the bottom tab bar is flush at the real physical bottom without floating whitespace
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Notch-Safe Header */}
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        showLogo={activeTab === 'home' && passengerSubScreen === 'home'}
        currentRole={currentRole}
        onBack={showBackButton ? onBackAction : undefined}
        onOpenSos={() => setIsSosOpen(true)}
      />

      {/* Screen Body Content with Smooth Tab Transitions */}
      <Animated.View
        style={[
          styles.screenBody,
          {
            opacity: tabFadeAnim,
            transform: [{ translateY: tabTranslateYAnim }],
          },
        ]}
      >
        {activeTab === 'home' && (
          <>
            {currentRole === 'passenger' && (
              <>
                {passengerSubScreen === 'home' && (
                  <PassengerHomeScreen
                    onNavigateToDrivers={() => setPassengerSubScreen('drivers')}
                    onNavigateToTracking={() => setPassengerSubScreen('tracking')}
                  />
                )}
                {passengerSubScreen === 'drivers' && (
                  <DriverListScreen
                    onBack={() => setPassengerSubScreen('home')}
                    onSelectDriver={handleSelectDriverAndBook}
                  />
                )}
                {passengerSubScreen === 'tracking' && (
                  <TripTrackingScreen
                    onBackToHome={() => setPassengerSubScreen('home')}
                    onOpenSos={() => setIsSosOpen(true)}
                  />
                )}
              </>
            )}

            {currentRole === 'driver' && <DriverDashboardScreen />}

            {currentRole === 'admin' && <AdminDashboardScreen />}
          </>
        )}

        {activeTab === 'map' && (
          <MbararaMapScreen onStageSelectedForBooking={handleStageSelectedOnMap} />
        )}

        {activeTab === 'history' && (
          <TripHistoryScreen onRebookTrip={handleRebookFromHistory} />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            onOpenSos={() => setIsSosOpen(true)}
            onNavigateToDriverApplication={() => setIsDriverApplicationOpen(true)}
            onLogout={() => {
              setAuthScreen('welcome');
            }}
          />
        )}
      </Animated.View>

      {/* Modern Bottom Navigation Bar (pinned flush to bottom edge) */}
      <BottomTabBar
        activeTab={activeTab}
        currentRole={currentRole}
        onTabPress={(tab) => {
          animateTabSwitch(tab);
          if (tab === 'home' && currentRole === 'passenger' && activeTrip && activeTrip.status !== 'completed') {
            // preserve tracking context
          }
        }}
        hasActiveTrip={Boolean(activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'cancelled')}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        visible={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentLocationName={activeTrip?.pickupStage.name || 'High Street, Mbarara'}
        driverPlate={activeTrip?.driverVehiclePlate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenBody: {
    flex: 1,
  },
});
