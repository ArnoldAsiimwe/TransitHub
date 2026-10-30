import React, { createContext, useContext, useMemo, useState } from 'react';
import { MBARARA_STAGES, TransitStage } from '../constants/mbararaStages';
import { calculateTripEstimate, MOCK_DRIVERS } from '../constants/mockData';
import { DriverProfile, TripRequest, TripStatus, VehicleType } from '../types';
import { tripService } from '../services';

interface TripContextType {
  pickupStage: TransitStage;
  destinationStage: TransitStage;
  vehicleType: VehicleType;
  activeTrip: TripRequest | null;
  incomingDriverRequest: TripRequest | null;
  estimate: { fareUGX: number; distanceKm: number; durationMins: number };
  setPickupStage: (stage: TransitStage) => void;
  setDestinationStage: (stage: TransitStage) => void;
  setVehicleType: (type: VehicleType) => void;
  requestRide: (selectedDriver?: DriverProfile) => TripRequest;
  driverAcceptRide: () => void;
  driverRejectRide: () => void;
  updateTripStatus: (status: TripStatus) => void;
  cancelRide: (reason?: string) => void;
  resetTrip: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pickupStage, setPickupStage] = useState<TransitStage>(MBARARA_STAGES[2]); // MUST Main Gate
  const [destinationStage, setDestinationStage] = useState<TransitStage>(MBARARA_STAGES[0]); // Central Taxi Park
  const [vehicleType, setVehicleType] = useState<VehicleType>('boda');
  const [activeTrip, setActiveTrip] = useState<TripRequest | null>(null);
  const [incomingDriverRequest, setIncomingDriverRequest] = useState<TripRequest | null>(null);

  const estimate = useMemo(() => {
    return calculateTripEstimate(pickupStage, destinationStage, vehicleType);
  }, [pickupStage, destinationStage, vehicleType]);

  const requestRide = (selectedDriver?: DriverProfile): TripRequest => {
    const defaultDriver = selectedDriver || MOCK_DRIVERS[0];
    const newTrip: TripRequest = {
      id: `trp_${Date.now().toString().slice(-6)}`,
      passengerId: 'usr_pass_001',
      passengerName: 'Kiconco Brenda',
      passengerPhone: '+256 782 345 678',
      pickupStage,
      destinationStage,
      vehicleType,
      fareUGX: estimate.fareUGX,
      estimatedDurationMins: estimate.durationMins,
      distanceKm: estimate.distanceKm,
      status: 'requested',
      driverId: defaultDriver.id,
      driverName: defaultDriver.name,
      driverPhone: defaultDriver.phone,
      driverVehiclePlate: defaultDriver.vehiclePlate,
      driverRating: defaultDriver.rating,
      createdAt: 'Just now',
    };

    setActiveTrip(newTrip);
    setIncomingDriverRequest(newTrip); // Dispatched to driver queue

    // Background sync with Supabase trips table
    tripService
      .createTrip(
        newTrip.passengerId,
        pickupStage,
        destinationStage,
        vehicleType,
        {
          fare: estimate.fareUGX,
          distanceKm: estimate.distanceKm,
          estimatedMinutes: estimate.durationMins,
        },
        defaultDriver
      )
      .catch((e) => {
        console.log('[Trip Creation Sync]', e);
      });

    return newTrip;
  };

  const driverAcceptRide = () => {
    if (incomingDriverRequest) {
      const updated: TripRequest = {
        ...incomingDriverRequest,
        status: 'accepted',
      };
      setActiveTrip(updated);
      setIncomingDriverRequest(null);

      tripService.updateTripStatus(updated.id, 'accepted').catch(() => {});
    }
  };

  const driverRejectRide = () => {
    setIncomingDriverRequest(null);
  };

  const updateTripStatus = (status: TripStatus) => {
    if (activeTrip) {
      setActiveTrip({ ...activeTrip, status });
      tripService.updateTripStatus(activeTrip.id, status).catch(() => {});
    }
  };

  const cancelRide = (reason?: string) => {
    if (activeTrip) {
      setActiveTrip({
        ...activeTrip,
        status: 'cancelled',
        notes: reason || 'Cancelled by passenger',
      });
      tripService.updateTripStatus(activeTrip.id, 'cancelled').catch(() => {});
    }
    setIncomingDriverRequest(null);
  };

  const resetTrip = () => {
    setActiveTrip(null);
    setIncomingDriverRequest(null);
  };

  return (
    <TripContext.Provider
      value={{
        pickupStage,
        destinationStage,
        vehicleType,
        activeTrip,
        incomingDriverRequest,
        estimate,
        setPickupStage,
        setDestinationStage,
        setVehicleType,
        requestRide,
        driverAcceptRide,
        driverRejectRide,
        updateTripStatus,
        cancelRide,
        resetTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
