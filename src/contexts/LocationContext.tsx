import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { updateUser } from '@/lib/db';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  enableLocationSharing: () => Promise<void>;
  disableLocationSharing: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (!user?.settings.locationSharing) {
      setIsLoading(false);
      return;
    }

    let watchId: number;

    const startWatching = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(newLocation);
            setError(null);
            setIsLoading(false);

            // Update user's location in the database
            if (user) {
              updateUser(user.id, {
                location: {
                  ...newLocation,
                  lastUpdated: Date.now(),
                },
              });
            }
          },
          (error) => {
            setError(getLocationErrorMessage(error));
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setIsLoading(false);
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user?.settings.locationSharing]);

  const enableLocationSharing = async () => {
    try {
      await updateProfile({
        settings: {
          ...user!.settings,
          locationSharing: true,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable location sharing');
    }
  };

  const disableLocationSharing = async () => {
    try {
      await updateProfile({
        settings: {
          ...user!.settings,
          locationSharing: false,
        },
      });
      setLocation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable location sharing');
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        error,
        isLoading,
        enableLocationSharing,
        disableLocationSharing,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable';
    case error.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'An unknown error occurred';
  }
}
