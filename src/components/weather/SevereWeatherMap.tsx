import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { AlertTriangle, RefreshCw, Shield, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SevereWeatherSpot } from "@/convex/weather";

const SEVERITY_CONFIG = {
  red: { color: "#ef4444", fillColor: "#ef4444", label: "RED ALERT", bgClass: "bg-red-500/10 border-red-500/30 text-red-600" },
  orange: { color: "#f97316", fillColor: "#f97316", label: "ORANGE ALERT", bgClass: "bg-orange-500/10 border-orange-500/30 text-orange-600" },
  yellow: { color: "#eab308", fillColor: "#eab308", label: "YELLOW ALERT", bgClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" },
  green: { color: "#22c55e", fillColor: "#22c55e", label: "ALL CLEAR", bgClass: "bg-green-500/10 border-green-500/30 text-green-600" },
};

export function SevereWeatherMap() {
  const fetchCriticalSpots = useAction(api.weather.fetchCriticalWeatherSpots);
  const [spots, setSpots] = useState<SevereWeatherSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadSpots = async () => {
    setLoading(true);
    try {
      const data = await fetchCriticalSpots();
      setSpots(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch critical spots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpots();
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadSpots, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const redSpots = spots.filter((s) => s.severity === "red");
  const orangeSpots = spots.filter((s) => s.severity === "orange");
  const yellowSpots = spots.filter((s) => s.severity === "yellow");
  const hasAlerts = spots.length > 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${hasAlerts ? "bg-red-500/10 animate-pulse" : "bg-green-500/10"}`}>
            {hasAlerts ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold">Severe Weather Monitor</h3>
            <p className="text-[10px] text-muted-foreground">
              {loading ? "Scanning..." : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Real-time alerts across India"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAlerts && (
            <div className="flex items-center gap-1.5">
              {redSpots.length > 0 && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-600">{redSpots.length} RED</span>}
              {orangeSpots.length > 0 && <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-bold text-orange-600">{orangeSpots.length} ORANGE</span>}
              {yellowSpots.length > 0 && <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[9px] font-bold text-yellow-600">{yellowSpots.length} YELLOW</span>}
            </div>
          )}
          <button
            onClick={loadSpots}
            disabled={loading}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[300px] sm:h-[400px]">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {spots.map((spot, i) => {
            const config = SEVERITY_CONFIG[spot.severity];
            return (
              <CircleMarker
                key={`${spot.name}-${i}`}
                center={[spot.latitude, spot.longitude]}
                radius={spot.severity === "red" ? 12 : spot.severity === "orange" ? 9 : 7}
                pathOptions={{
                  color: config.color,
                  fillColor: config.fillColor,
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-xs font-bold" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{spot.name}, {spot.state}</p>
                    <p className="text-xs text-gray-600 mt-1">{spot.warning}</p>
                    {spot.temperature && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {Math.round(spot.temperature)}°C | {Math.round(spot.windSpeed || 0)} km/h wind
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Loading overlay */}
        {loading && spots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Scanning weather across India...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 border-t border-border/30 bg-muted/10">
        {Object.entries(SEVERITY_CONFIG).filter(([k]) => k !== "green").map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-[9px] font-medium text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Alert List (expandable) */}
      {hasAlerts && (
        <div className="border-t border-border/30">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
          >
            <span>{spots.length} active alert{spots.length !== 1 ? "s" : ""} — Tap for details</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto px-4 pb-3 space-y-2">
                  {spots.map((spot, i) => {
                    const config = SEVERITY_CONFIG[spot.severity];
                    return (
                      <div
                        key={`${spot.name}-${i}`}
                        className={`flex items-start gap-3 rounded-xl p-3 border ${config.bgClass}`}
                      >
                        <span
                          className="mt-0.5 h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold">{spot.name}, {spot.state}</h4>
                            <span className="text-[9px] font-medium opacity-70">{spot.type}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed opacity-80">{spot.warning}</p>
                          {spot.temperature && (
                            <p className="mt-1 text-[10px] opacity-60">
                              {Math.round(spot.temperature)}°C | {Math.round(spot.windSpeed || 0)} km/h
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
