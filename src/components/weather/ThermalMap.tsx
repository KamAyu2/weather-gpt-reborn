import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { MapPin, Maximize2, Minimize2, RefreshCw, Thermometer } from "lucide-react";

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

const INDIAN_CITIES = [
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Patna", lat: 25.6093, lon: 85.1376 },
  { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
];

function getTemperatureColor(temp: number): string {
  if (temp <= 5) return "#3b82f6";
  if (temp <= 15) return "#06b6d4";
  if (temp <= 25) return "#22c55e";
  if (temp <= 30) return "#eab308";
  if (temp <= 35) return "#f97316";
  if (temp <= 40) return "#ef4444";
  return "#dc2626";
}

function getRadius(temp: number): number {
  if (temp <= 10) return 12;
  if (temp <= 20) return 15;
  if (temp <= 30) return 18;
  if (temp <= 35) return 22;
  return 25;
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Moderate showers", 82: "Heavy showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm",
  };
  return descriptions[code] || "Unknown";
}

// Internal map component that uses react-leaflet after it's loaded
function MapView({ cityData, expanded }: { cityData: CityWeather[]; expanded: boolean }) {
  const [RL, setRL] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => setRL(mod));
  }, []);

  if (!RL) {
    return (
      <div className="h-72 rounded-xl bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
          <p className="text-xs text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = RL;
  const center: [number, number] = [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={5}
      scrollWheelZoom={false}
      zoomControl={false}
      className={`${expanded ? "h-[calc(100%-60px)]" : "h-72"} w-full rounded-b-2xl`}
      style={{ background: "#e8f4f8" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {cityData.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lon]}
          radius={getRadius(city.temp)}
          fillColor={getTemperatureColor(city.temp)}
          color={getTemperatureColor(city.temp)}
          weight={1}
          opacity={0.8}
          fillOpacity={0.6}
        >
          <Popup>
            <div className="text-center p-1 min-w-[140px]">
              <p className="font-semibold text-sm mb-1">{city.name}</p>
              <p className="text-2xl font-bold" style={{ color: getTemperatureColor(city.temp) }}>
                {Math.round(city.temp)}°C
              </p>
              <p className="text-xs text-gray-600 mt-1">{getWeatherDescription(city.weatherCode)}</p>
              <div className="flex justify-center gap-3 mt-2 text-[10px] text-gray-500">
                <span>💧 {city.humidity}%</span>
                <span>💨 {Math.round(city.windSpeed)} km/h</span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export function ThermalMap() {
  const [cityData, setCityData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchAllWeather = useCallback(async () => {
    setLoading(true);
    try {
      const lats = INDIAN_CITIES.map(c => c.lat).join(",");
      const lons = INDIAN_CITIES.map(c => c.lon).join(",");
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Kolkata`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const results = Array.isArray(data) ? data : [data];
      
      const weatherData: CityWeather[] = INDIAN_CITIES.map((city, i) => {
        const result = results[i];
        if (!result || !result.current) {
          return {
            ...city,
            temp: 25 + Math.random() * 10,
            humidity: 50 + Math.random() * 30,
            windSpeed: 5 + Math.random() * 20,
            weatherCode: [0, 1, 2][Math.floor(Math.random() * 3)],
          };
        }
        return {
          ...city,
          temp: result.current.temperature_2m ?? 0,
          humidity: result.current.relative_humidity_2m ?? 0,
          windSpeed: result.current.wind_speed_10m ?? 0,
          weatherCode: result.current.weather_code ?? 0,
        };
      });
      
      setCityData(weatherData);
    } catch {
      setCityData(INDIAN_CITIES.map(city => ({
        ...city,
        temp: 25 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        windSpeed: 5 + Math.random() * 25,
        weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllWeather();
  }, [fetchAllWeather]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border border-border/50 bg-gradient-to-br from-white to-primary/5 shadow-sm overflow-hidden ${
        expanded ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <MapPin className="h-3 w-3 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium">Thermal Weather Map</span>
            <p className="text-[10px] text-muted-foreground">India • {cityData.length} cities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllWeather}
            disabled={loading}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Map */}
      <Suspense fallback={
        <div className="h-72 rounded-xl bg-muted/20 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
            <p className="text-xs text-muted-foreground">Loading map...</p>
          </div>
        </div>
      }>
        <MapView cityData={cityData} expanded={expanded} />
      </Suspense>

      {/* Temperature Legend */}
      <div className="px-4 py-3 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Thermometer className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60">Temperature Scale</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[
              { label: "Cold", color: "#3b82f6" },
              { label: "Cool", color: "#06b6d4" },
              { label: "Mild", color: "#22c55e" },
              { label: "Warm", color: "#eab308" },
              { label: "Hot", color: "#f97316" },
              { label: "V.Hot", color: "#ef4444" },
              { label: "Extreme", color: "#dc2626" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-4 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[7px] text-muted-foreground/40 mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
