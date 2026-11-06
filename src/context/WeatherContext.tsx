import React, { createContext, useContext, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'sunset';

export interface WeatherData {
  condition: WeatherCondition;
  title: string;
  temperatureC: number;
  feelsLikeC: number;
  rainProbabilityPercent: number;
  humidityPercent: number;
  windSpeedKmh: number;
  advisoryText: string;
  vehicleRecommendation: 'boda' | 'taxi' | 'any';
  theme: {
    gradientColors: [string, string, ...string[]];
    accentColor: string;
    cardBorderColor: string;
    iconColor: string;
    iconName: keyof typeof Ionicons.glyphMap;
  };
}

const WEATHER_PRESETS: Record<WeatherCondition, WeatherData> = {
  sunny: {
    condition: 'sunny',
    title: 'Sunny & Clear Skies',
    temperatureC: 26,
    feelsLikeC: 27,
    rainProbabilityPercent: 10,
    humidityPercent: 54,
    windSpeedKmh: 11,
    advisoryText: 'Clear roads on High Street & MUST. Optimal conditions for quick Boda Boda travel.',
    vehicleRecommendation: 'boda',
    theme: {
      gradientColors: ['#ECFDF5', '#D1FAE5', '#F8FAFC'],
      accentColor: '#059669',
      cardBorderColor: '#A7F3D0',
      iconColor: '#10B981',
      iconName: 'sunny',
    },
  },
  rainy: {
    condition: 'rainy',
    title: 'Afternoon Showers in Mbarara',
    temperatureC: 20,
    feelsLikeC: 19,
    rainProbabilityPercent: 85,
    humidityPercent: 88,
    windSpeedKmh: 18,
    advisoryText: 'Wet asphalt along Kakoba & Katete bridge. Covered Matatus / Taxis recommended for dry commute.',
    vehicleRecommendation: 'taxi',
    theme: {
      gradientColors: ['#EFF6FF', '#DBEAFE', '#F8FAFC'],
      accentColor: '#0284C7',
      cardBorderColor: '#BAE6FD',
      iconColor: '#0284C7',
      iconName: 'rainy',
    },
  },
  cloudy: {
    condition: 'cloudy',
    title: 'Mild & Overcast',
    temperatureC: 23,
    feelsLikeC: 23,
    rainProbabilityPercent: 25,
    humidityPercent: 65,
    windSpeedKmh: 9,
    advisoryText: 'Pleasant 23°C breeze along River Rwizi corridor. Standard municipal tariffs apply.',
    vehicleRecommendation: 'any',
    theme: {
      gradientColors: ['#F8FAFC', '#E2E8F0', '#F8FAFC'],
      accentColor: Colors.secondary,
      cardBorderColor: '#CBD5E1',
      iconColor: Colors.secondary,
      iconName: 'cloudy',
    },
  },
  sunset: {
    condition: 'sunset',
    title: 'Evening Golden Hour',
    temperatureC: 24,
    feelsLikeC: 25,
    rainProbabilityPercent: 15,
    humidityPercent: 58,
    windSpeedKmh: 8,
    advisoryText: 'Rush hour across Central Taxi Park & High Street. Expect high vehicle demand at stages.',
    vehicleRecommendation: 'boda',
    theme: {
      gradientColors: ['#FEF3C7', '#FFEDD5', '#FFF1F2'],
      accentColor: '#C2410C',
      cardBorderColor: '#FDBA74',
      iconColor: '#EA580C',
      iconName: 'partly-sunny',
    },
  },
};

interface WeatherContextType {
  weather: WeatherData;
  setCondition: (condition: WeatherCondition) => void;
  cycleWeather: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCondition, setCurrentCondition] = useState<WeatherCondition>('sunny');

  const cycleWeather = () => {
    const list: WeatherCondition[] = ['sunny', 'rainy', 'cloudy', 'sunset'];
    const nextIndex = (list.indexOf(currentCondition) + 1) % list.length;
    setCurrentCondition(list[nextIndex]);
  };

  return (
    <WeatherContext.Provider
      value={{
        weather: WEATHER_PRESETS[currentCondition],
        setCondition: setCurrentCondition,
        cycleWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
