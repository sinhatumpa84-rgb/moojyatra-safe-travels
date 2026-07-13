import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";

export interface SearchLocation {
  name: string; // City/area name
  lat: number;
  lng: number;
  isSearched: boolean; // true if user explicitly searched for it
}

interface LocationContextType {
  searchedLocation: SearchLocation | null;
  isSearching: boolean;
  searchError: string | null;
  setSearchedLocation: (location: SearchLocation) => void;
  searchLocation: (query: string) => Promise<SearchLocation | null>;
  clearError: () => void;
  resetLocation: () => void;
}

export const DEFAULT_LOCATION: SearchLocation = {
  name: "Delhi",
  lat: 28.6139,
  lng: 77.2090,
  isSearched: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [searchedLocation, setSearchedLocation] = useState<SearchLocation | null>(DEFAULT_LOCATION);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setSearchError(null);
  }, []);

  const resetLocation = useCallback(() => {
    setSearchedLocation(DEFAULT_LOCATION);
    setSearchError(null);
  }, []);

  // Centralized mount-time geolocation discovery
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const { latitude: lat, longitude: lng } = p.coords;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (r.ok) {
            const d = await r.json();
            const a = d?.address || {};
            const cityName = a.city || a.town || a.village || a.state || "this area";
            setSearchedLocation({
              name: cityName,
              lat,
              lng,
              isSearched: false,
            });
          } else {
            setSearchedLocation({
              name: "Delhi",
              lat,
              lng,
              isSearched: false,
            });
          }
        } catch {
          setSearchedLocation({
            name: "Delhi",
            lat,
            lng,
            isSearched: false,
          });
        }
      },
      () => {
        // Geolocation denied or unavailable: keep DEFAULT_LOCATION
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const searchLocation = useCallback(async (query: string): Promise<SearchLocation | null> => {
    if (!query.trim()) {
      setSearchError("Please enter a location");
      toast.error("Please enter a location");
      return null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", India"
        )}&limit=1`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();

      if (!data?.[0]) {
        const notFoundMsg = `Location "${query}" not found`;
        setSearchError(notFoundMsg);
        setSearchedLocation(null); // Clear search location to prevent silently keeping previous city
        setIsSearching(false);
        toast.error(notFoundMsg);
        return null;
      }

      const location: SearchLocation = {
        name: data[0].display_name.split(",")[0].trim(),
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
        isSearched: true,
      };

      setSearchedLocation(location);
      setIsSearching(false);
      return location;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return null;
      }
      const errorMsg = error instanceof Error ? error.message : "Search failed";
      setSearchError(errorMsg);
      setSearchedLocation(null); // Clear search location on hard failure
      setIsSearching(false);
      toast.error(errorMsg);
      return null;
    }
  }, []);

  const value: LocationContextType = {
    searchedLocation,
    isSearching,
    searchError,
    setSearchedLocation,
    searchLocation,
    clearError,
    resetLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}

