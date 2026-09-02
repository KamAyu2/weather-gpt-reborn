import { useState, useEffect, useCallback, useRef } from "react";

export interface DetectedLocation {
  lat: number;
  lon: number;
  name: string;
}

export type DetectionMethod = "geolocation" | "ip" | "manual" | "none";

interface UseLocationDetectionResult {
  location: DetectedLocation | null;
  method: DetectionMethod;
  isDetecting: boolean;
  error: string | null;
  requestGeolocation: () => void;
  setManualLocation: (name: string, lat: number, lon: number) => void;
}

/**
 * Attempts to detect the user's location through a fallback chain:
 * 1. Browser Geolocation API
 * 2. IP Geolocation (ip-api.com, free)
 * 3. Manual city search (user provides)
 */
export function useLocationDetection(): UseLocationDetectionResult {
  const [location, setLocation] = useState<DetectedLocation | null>(null);
  const [method, setMethod] = useState<DetectionMethod>("none");
  const [isDetecting, setIsDetecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAttempted = useRef(false);

  // Try browser geolocation
  const tryBrowserGeolocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) return false;

    return new Promise<boolean>((resolve) => {
      // Check if permission is already denied
      if (navigator.permissions) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          if (result.state === "denied") {
            resolve(false);
            return;
          }
        }).catch(() => {
          // proceed with attempt
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: "My Location",
          });
          setMethod("geolocation");
          setIsDetecting(false);
          resolve(true);
        },
        () => {
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });
  }, []);

  // Try IP geolocation using ip-api.com (free, no key required)
  const tryIPGeolocation = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        "https://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone",
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) return false;

      const data = await response.json();
      if (data.status !== "success" || !data.lat || !data.lon) return false;

      setLocation({
        lat: data.lat,
        lon: data.lon,
        name: data.city || data.regionName || data.country || "Your Area",
      });
      setMethod("ip");
      setIsDetecting(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Manual location from search
  const setManualLocation = useCallback(
    (name: string, lat: number, lon: number) => {
      setLocation({ lat, lon, name });
      setMethod("manual");
      setIsDetecting(false);
      setError(null);
    },
    []
  );

  // Explicitly re-request browser geolocation (e.g., after user grants permission)
  const requestGeolocation = useCallback(async () => {
    setIsDetecting(true);
    setError(null);
    const success = await tryBrowserGeolocation();
    if (!success) {
      // Fall through to IP
      const ipSuccess = await tryIPGeolocation();
      if (!ipSuccess) {
        setIsDetecting(false);
        setError("Could not detect your location. Please search for your city.");
      }
    }
  }, [tryBrowserGeolocation, tryIPGeolocation]);

  // Auto-detect on mount
  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const run = async () => {
      // Step 1: Try browser geolocation
      const geoSuccess = await tryBrowserGeolocation();
      if (geoSuccess) return;

      // Step 2: Try IP geolocation
      const ipSuccess = await tryIPGeolocation();
      if (ipSuccess) return;

      // Step 3: Both failed — let user search manually
      setIsDetecting(false);
      setError("Could not detect your location. Please search for your city.");
    };

    run();
  }, [tryBrowserGeolocation, tryIPGeolocation]);

  return {
    location,
    method,
    isDetecting,
    error,
    requestGeolocation,
    setManualLocation,
  };
}
