import React, { createContext, useContext, useEffect, useState } from 'react';
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
  refreshLiveWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCondition, setCurrentCondition] = useState<WeatherCondition>('sunny');
  const [liveWeather, setLiveWeather] = useState<WeatherData>(WEATHER_PRESETS.sunny);

  // Fetch real Google/Open-Meteo live weather for Mbarara (-0.6132, 30.6582)
  const refreshLiveWeather = async () => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-0.6132&longitude=30.6582&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
      );
      if (!response.ok) return;
      const data = await response.json();
      const current = data.current;
      if (!current) return;

      const temp = Math.round(current.temperature_2m);
      const feelsLike = Math.round(current.apparent_temperature ?? temp);
      const humidity = Math.round(current.relative_humidity_2m ?? 60);
      const wind = Math.round(current.wind_speed_10m ?? 10);
      const code = current.weather_code ?? 0;
      const precip = current.precipitation ?? 0;

      let determinedCondition: WeatherCondition = 'sunny';
      let title = 'Sunny & Clear Skies';
      let advisory = 'Clear roads on High Street & MUST. Optimal conditions for quick Boda Boda travel.';
      let vehicleRec: 'boda' | 'taxi' | 'any' = 'boda';

      if (precip > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) {
        determinedCondition = 'rainy';
        title = 'Live Showers in Mbarara';
        advisory = 'Wet asphalt along Kakoba & Katete bridge. Covered Taxis / Special Hires recommended.';
        vehicleRec = 'taxi';
      } else if ([1, 2, 3, 45, 48].includes(code)) {
        determinedCondition = 'cloudy';
        title = 'Live Overcast in Mbarara';
        advisory = 'Pleasant breeze along River Rwizi corridor. Standard municipal tariffs apply.';
        vehicleRec = 'any';
      } else {
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
          determinedCondition = 'sunset';
          title = 'Mbarara Night Transit';
          advisory = 'Evening commuter rush across Central Taxi Park & High Street. Regulated night tariffs in effect.';
          vehicleRec = 'boda';
        } else if (hour >= 16 && hour < 18) {
          determinedCondition = 'sunset';
          title = 'Evening Golden Hour';
          advisory = 'Rush hour across Central Taxi Park & High Street. High vehicle demand at stages.';
          vehicleRec = 'boda';
        }
      }

      setCurrentCondition(determinedCondition);
      setLiveWeather({
        ...WEATHER_PRESETS[determinedCondition],
        title,
        temperatureC: temp,
        feelsLikeC: feelsLike,
        humidityPercent: humidity,
        windSpeedKmh: wind,
        rainProbabilityPercent: precip > 0 ? 85 : determinedCondition === 'cloudy' ? 30 : 10,
        advisoryText: advisory,
        vehicleRecommendation: vehicleRec,
      });
    } catch (err) {
      // Fallback silently to presets
    }
  };

  useEffect(() => {
    refreshLiveWeather();
    // Update live weather every 5 minutes
    const interval = setInterval(refreshLiveWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const cycleWeather = () => {
    const list: WeatherCondition[] = ['sunny', 'rainy', 'cloudy', 'sunset'];
    const nextIndex = (list.indexOf(currentCondition) + 1) % list.length;
    const nextCond = list[nextIndex];
    setCurrentCondition(nextCond);
    setLiveWeather(WEATHER_PRESETS[nextCond]);
  };

  return (
    <WeatherContext.Provider
      value={{
        weather: liveWeather,
        setCondition: (c) => {
          setCurrentCondition(c);
          setLiveWeather(WEATHER_PRESETS[c]);
        },
        cycleWeather,
        refreshLiveWeather,
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
