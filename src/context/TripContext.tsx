import React, { createContext, useContext, useState, useEffect } from 'react';

export type Persona = 'New Traveler' | 'Experienced Traveler' | 'Solo Female Traveler' | 'Minor/Under 18' | 'Family';

export interface Destination {
  cityName: string;
  country?: string;
  daysAllocated: number;
}

export interface TripData {
  persona?: Persona;
  passportCountry?: { code: string; label: string };
  activityPreferences: string[];
  startDate?: string;
  endDate?: string;
  destinations: Destination[];
  groupSize?: number;
  ages?: string;
  budget?: 'Low' | 'Mid-range' | 'Luxury';
  uploads: File[];
  uploadKeys?: string[];
  parsedBookingData?: any[];
}

interface TripContextType {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
  clearTripData: () => void;
  isValid: boolean;
  tripDuration: number;
  allocatedDays: number;
  pendingSessionId?: string;
  setPendingSessionId: (id: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const STORAGE_KEY = 'travel-pack-trip-data';

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [pendingSessionId, setPendingSessionId] = useState<string>('');
  const [tripData, setTripData] = useState<TripData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, uploads: [], activityPreferences: parsed.activityPreferences || [] }; // Don't persist files
      } catch {
        return { destinations: [], uploads: [], activityPreferences: [] };
      }
    }
    return { destinations: [], uploads: [], activityPreferences: [] };
  });

  const updateTripData = (data: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...data }));
  };

  const clearTripData = () => {
    setTripData({ destinations: [], uploads: [], activityPreferences: [] });
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculate trip duration
  const tripDuration = React.useMemo(() => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [tripData.startDate, tripData.endDate]);

  // Calculate allocated days
  const allocatedDays = React.useMemo(() => {
    return tripData.destinations.reduce((sum, dest) => sum + dest.daysAllocated, 0);
  }, [tripData.destinations]);

  // Validation
  const isValid = React.useMemo(() => {
    return !!(
      tripData.persona &&
      tripData.passportCountry &&
      tripData.startDate &&
      tripData.endDate &&
      tripData.destinations.length > 0 &&
      tripDuration > 0 &&
      allocatedDays === tripDuration
    );
  }, [tripData, tripDuration, allocatedDays]);

  // Persist to localStorage
  useEffect(() => {
    const dataToStore = { ...tripData, uploads: [] }; // Don't persist files
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [tripData]);

  return (
    <TripContext.Provider value={{
      tripData,
      updateTripData,
      clearTripData,
      isValid,
      tripDuration,
      allocatedDays,
      pendingSessionId,
      setPendingSessionId
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
}