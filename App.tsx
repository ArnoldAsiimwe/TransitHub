import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TripProvider } from './src/context/TripContext';
import { WeatherProvider } from './src/context/WeatherContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/components/common/SplashScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  if (isSplashVisible) {
    return <SplashScreen durationMs={3000} onFinish={() => setIsSplashVisible(false)} />;
  }

  return (
    <SafeAreaProvider>
      <WeatherProvider>
        <AuthProvider>
          <TripProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </TripProvider>
        </AuthProvider>
      </WeatherProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
