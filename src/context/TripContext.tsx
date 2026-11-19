import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MBARARA_STAGES, TransitStage } from '../constants/mbararaStages';
import { calculateTripEstimate } from '../constants/mockData';
import { DriverProfile, TripRequest, TripStatus, VehicleType } from '../types';
import { tripService, stageService } from '../services';
import { useAuth } from './AuthContext';

interface TripContextType {
  stages: TransitStage[];
  pickupStage: TransitStage;
  destinationStage: TransitStage;
  vehicleType: VehicleType;
  activeTrip: TripRequest | null;
  incomingDriverRequest: TripRequest | null;
  estimate: { fareUGX: number; distanceKm: number; durationMins: number };
  refreshStages: () => Promise<void>;
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
  const { currentUser, currentRole, driversList } = useAuth();
  const [stages, setStages] = useState<TransitStage[]>(MBARARA_STAGES);
  const [pickupStage, setPickupStage] = useState<TransitStage>(MBARARA_STAGES[2]); // MUST Main Gate
  const [destinationStage, setDestinationStage] = useState<TransitStage>(MBARARA_STAGES[0]); // Central Taxi Park
  const [vehicleType, setVehicleType] = useState<VehicleType>('boda');
  const [activeTrip, setActiveTrip] = useState<TripRequest | null>(null);
  const [incomingDriverRequest, setIncomingDriverRequest] = useState<TripRequest | null>(null);

  const refreshStages = async () => {
    try {
      const fetchedStages = await stageService.getStages();
      if (fetchedStages && fetchedStages.length > 0) {
        setStages(fetchedStages);
      }
    } catch {
      // Keep existing stages on error
    }
  };

  useEffect(() => {
    refreshStages();
    // Poll for new stages added by admin every 10 seconds
    const interval = setInterval(refreshStages, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync incoming requests and active trips across multiple devices via polling / Supabase
  useEffect(() => {
    let isMounted = true;

    const syncTripsAcrossDevices = async () => {
      try {
        if (currentRole === 'driver') {
          // Driver device: poll for incoming requested trips
          if (!activeTrip || activeTrip.status === 'requested' || activeTrip.status === 'completed') {
            const incoming = await tripService.getIncomingDriverRequest(currentUser.id);
            if (isMounted && incoming && (!incomingDriverRequest || incomingDriverRequest.id !== incoming.id)) {
              setIncomingDriverRequest(incoming);
            }
          }
        } else {
          // Passenger device: poll for active trip updates (e.g. driver accepted or advanced status)
          if (currentUser.id && activeTrip && activeTrip.status !== 'completed' && activeTrip.status !== 'cancelled') {
            const updated = await tripService.getActiveTrip(currentUser.id);
            if (isMounted && updated) {
              setActiveTrip((prev) => {
                if (!prev) return updated;
                // Update if driver info or status changed
                if (prev.status !== updated.status || prev.driverName !== updated.driverName) {
                  return {
                    ...prev,
                    ...updated,
                    driverName: updated.driverName || prev.driverName,
                    driverPhone: updated.driverPhone || prev.driverPhone,
                    driverVehiclePlate: updated.driverVehiclePlate || prev.driverVehiclePlate,
                    status: updated.status,
                  };
                }
                return prev;
              });
            }
          }
        }
      } catch (err) {
        // Silent fail on network fluctuations
      }
    };

    syncTripsAcrossDevices();
    const interval = setInterval(syncTripsAcrossDevices, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser.id, currentRole, activeTrip?.status, incomingDriverRequest?.id]);

  const estimate = useMemo(() => {
    return calculateTripEstimate(pickupStage, destinationStage, vehicleType);
  }, [pickupStage, destinationStage, vehicleType]);

  const requestRide = (selectedDriver?: DriverProfile): TripRequest => {
    // Pick the chosen driver or the first verified driver from database/driversList
    const assignedDriver = selectedDriver || (driversList && driversList.length > 0 ? driversList[0] : undefined);
    const newTrip: TripRequest = {
      id: `trp_${Date.now().toString().slice(-6)}`,
      passengerId: currentUser.id || `usr_${Date.now()}`,
      passengerName: currentUser.name || 'Transit Commuter',
      passengerPhone: currentUser.phone || '+256 700 000 000',
      pickupStage,
      destinationStage,
      vehicleType,
      fareUGX: estimate.fareUGX,
      estimatedDurationMins: estimate.durationMins,
      distanceKm: estimate.distanceKm,
      status: 'requested',
      driverId: assignedDriver?.id,
      driverName: assignedDriver?.name,
      driverPhone: assignedDriver?.phone,
      driverVehiclePlate: assignedDriver?.vehiclePlate,
      driverRating: assignedDriver?.rating,
      createdAt: 'Just now',
    };

    setActiveTrip(newTrip);
    setIncomingDriverRequest(newTrip); // Dispatched locally if testing on same device

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
        assignedDriver,
        { name: newTrip.passengerName, phone: newTrip.passengerPhone }
      )
      .then((res) => {
        if (res.trip && res.trip.id) {
          setActiveTrip((prev) => (prev ? { ...prev, id: res.trip!.id } : null));
        }
      })
      .catch((e) => {
        console.log('[Trip Creation Sync]', e);
      });

    return newTrip;
  };

  const driverAcceptRide = () => {
    if (incomingDriverRequest) {
      const currentDriver = currentUser as DriverProfile;
      const updated: TripRequest = {
        ...incomingDriverRequest,
        status: 'accepted',
        driverId: currentDriver.id || incomingDriverRequest.driverId,
        driverName: currentDriver.name || incomingDriverRequest.driverName,
        driverPhone: currentDriver.phone || incomingDriverRequest.driverPhone,
        driverVehiclePlate: currentDriver.vehiclePlate || incomingDriverRequest.driverVehiclePlate,
      };
      setActiveTrip(updated);
      setIncomingDriverRequest(null);

      tripService.updateTripStatus(updated.id, 'accepted', currentDriver).catch(() => {});
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
        stages,
        pickupStage,
        destinationStage,
        vehicleType,
        activeTrip,
        incomingDriverRequest,
        estimate,
        refreshStages,
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
