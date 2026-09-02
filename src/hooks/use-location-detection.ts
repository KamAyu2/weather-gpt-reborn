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

  // Try IP geolocation using multiple free services (fallback chain)
  const tryIPGeolocation = useCallback(async (): Promise<boolean> => {
    const services = [
      // ipapi.co — free, 1000 req/day, no key needed
      {
        url: "https://ipapi.co/json/",
        parse: (d: Record<string, unknown>) => ({
          lat: d.latitude as number,
          lon: d.longitude as number,
          name: (d.city as string) || (d.region as string) || (d.country_name as string),
        }),
      },
      // ipwho.is — free, no key needed
      {
        url: "https://ipwho.is/",
        parse: (d: Record<string, unknown>) => ({
          lat: d.latitude as number,
          lon: d.longitude as number,
          name: (d.city as string) || (d.region as string) || (d.country as string),
        }),
      },
    ];

    for (const service of services) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timeout);
        if (!response.ok) continue;

        const data = await response.json();
        const parsed = service.parse(data);
        if (parsed.lat && parsed.lon && parsed.name) {
          setLocation({
            lat: parsed.lat,
            lon: parsed.lon,
            name: parsed.name,
          });
          setMethod("ip");
          setIsDetecting(false);
          return true;
        }
      } catch {
        // Try next service
        continue;
      }
    }
    return false;
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
