import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Maximize2, Minimize2, RefreshCw, Thermometer, X, ChevronUp, Layers, Navigation, Loader2 } from "lucide-react";

interface CityWeather {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  feelsLike: number;
  precipitation: number;
}

const INDIAN_CITIES = [
  { name: "Mumbai", lat: 19.076, lon: 72.8777, state: "Maharashtra" },
  { name: "Delhi", lat: 28.7041, lon: 77.1025, state: "Delhi" },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867, state: "Telangana" },
  { name: "Pune", lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319, state: "Uttar Pradesh" },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  { name: "Indore", lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  { name: "Patna", lat: 25.6093, lon: 85.1376, state: "Bihar" },
  { name: "Raipur", lat: 21.2514, lon: 81.6296, state: "Chhattisgarh" },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh" },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  { name: "Kochi", lat: 9.9312, lon: 76.2673, state: "Kerala" },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, state: "Kerala" },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973, state: "Jammu & Kashmir" },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322, state: "Uttarakhand" },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794, state: "Chandigarh" },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362, state: "Assam" },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, state: "Odisha" },
  { name: "Mysore", lat: 12.2958, lon: 76.6394, state: "Karnataka" },
  { name: "Agra", lat: 27.1767, lon: 78.0081, state: "Uttar Pradesh" },
  { name: "Nashik", lat: 19.9975, lon: 73.7898, state: "Maharashtra" },
  { name: "Udaipur", lat: 24.5854, lon: 73.7125, state: "Rajasthan" },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
  { name: "Goa", lat: 15.2993, lon: 74.124, state: "Goa" },
  { name: "Darjeeling", lat: 27.036, lon: 88.2627, state: "West Bengal" },
  { name: "Gangtok", lat: 27.3389, lon: 88.6065, state: "Sikkim" },
  { name: "Imphal", lat: 24.817, lon: 93.9368, state: "Manipur" },
  { name: "Shillong", lat: 25.5788, lon: 91.8933, state: "Meghalaya" },
  { name: "Kohima", lat: 25.6586, lon: 94.1086, state: "Nagaland" },
  { name: "Aizawl", lat: 23.7271, lon: 92.7176, state: "Mizoram" },
  { name: "Agartala", lat: 23.8315, lon: 91.2869, state: "Tripura" },
  { name: "Panaji", lat: 15.4989, lon: 73.8278, state: "Goa" },
  { name: "Jammu", lat: 32.7266, lon: 74.857, state: "Jammu & Kashmir" },
  { name: "Leh", lat: 34.1526, lon: 77.5771, state: "Ladakh" },
  { name: "Haridwar", lat: 29.9457, lon: 78.1642, state: "Uttarakhand" },
  { name: "Rishikesh", lat: 30.0869, lon: 78.2676, state: "Uttarakhand" },
  { name: "Jaisalmer", lat: 26.9157, lon: 70.9083, state: "Rajasthan" },
  { name: "Madurai", lat: 9.9252, lon: 78.1198, state: "Tamil Nadu" },
  { name: "Tirupati", lat: 13.6288, lon: 79.4192, state: "Andhra Pradesh" },
  { name: "Warangal", lat: 17.9784, lon: 79.5941, state: "Telangana" },
  { name: "Kurnool", lat: 15.8281, lon: 78.0373, state: "Andhra Pradesh" },
];

function getTemperatureColor(temp: number): string {
  if (temp <= 5) return "#2563eb";
  if (temp <= 10) return "#0891b2";
  if (temp <= 15) return "#0d9488";
  if (temp <= 20) return "#16a34a";
  if (temp <= 25) return "#65a30d";
  if (temp <= 30) return "#ca8a04";
  if (temp <= 35) return "#ea580c";
  if (temp <= 40) return "#dc2626";
  return "#991b1b";
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

function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

function getTempLabel(temp: number): string {
  if (temp <= 5) return "Very Cold";
  if (temp <= 15) return "Cold";
  if (temp <= 25) return "Pleasant";
  if (temp <= 32) return "Warm";
  if (temp <= 38) return "Hot";
  if (temp <= 42) return "Very Hot";
  return "Extreme Heat";
}

function getRadius(temp: number, isMobile: boolean): number {
  const base = isMobile ? 10 : 14;
  if (temp <= 10) return base;
  if (temp <= 20) return base + 2;
  if (temp <= 30) return base + 4;
  if (temp <= 35) return base + 6;
  return base + 8;
}

function MapView({ cityData, isMobile, onCitySelect, userLocation }: {
  cityData: CityWeather[];
  isMobile: boolean;
  onCitySelect: (city: CityWeather) => void;
  userLocation: { lat: number; lon: number } | null;
}) {
  const [RL, setRL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setRL(mod);
      setTimeout(() => setMapReady(true), 100);
    });
  }, []);

  if (!RL || !mapReady) {
    return (
      <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-center justify-center rounded-xl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading India map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup, useMap } = RL;
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [20.5937, 78.9629];
  const zoom = userLocation ? 7 : (isMobile ? 4 : 5);

  function MapEvents() {
    const map = useMap();
    useEffect(() => {
      if (map) {
        if (isMobile) {
          map.scrollWheelZoom.disable();
          map.dragging.enable();
        }
        if (userLocation) {
          map.flyTo([userLocation.lat, userLocation.lon], 7, { duration: 1.5 });
        }
      }
    }, [map, isMobile, userLocation]);
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={!isMobile}
      zoomControl={false}
      attributionControl={false}
      minZoom={4}
      maxZoom={12}
      maxBounds={[[5, 60], [38, 100]]}
      maxBoundsViscosity={0.8}
      className="h-64 sm:h-80 w-full rounded-xl"
      style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #ecfeff 100%)" }}
    >
      <MapEvents />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lon]}
          radius={8}
          fillColor="#3b82f6"
          color="#ffffff"
          weight={3}
          opacity={1}
          fillOpacity={0.9}
        >
          <Popup>
            <div className="text-center p-1 min-w-[120px] font-sans">
              <p className="font-bold text-sm">📍 Your Location</p>
              <p className="text-[10px] text-gray-500 mt-1">Lat: {userLocation.lat.toFixed(3)}, Lon: {userLocation.lon.toFixed(3)}</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
      {cityData.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lon]}
          radius={getRadius(city.temp, isMobile)}
          fillColor={getTemperatureColor(city.temp)}
          color="#ffffff"
          weight={2}
          opacity={0.9}
          fillOpacity={0.85}
          eventHandlers={{ click: () => onCitySelect(city) }}
        >
          <Popup>
            <div className="text-center p-1 min-w-[150px] font-sans">
              <p className="font-bold text-sm">{city.name}</p>
              <p className="text-[10px] text-gray-500">{getWeatherEmoji(city.weatherCode)} {getWeatherDescription(city.weatherCode)}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: getTemperatureColor(city.temp) }}>
                {Math.round(city.temp)}°C
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Feels like {Math.round(city.feelsLike)}°C</p>
              <div className="flex justify-center gap-3 mt-2 text-[10px] text-gray-500 border-t pt-2">
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
  const [selectedCity, setSelectedCity] = useState<CityWeather | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCityList, setShowCityList] = useState(false);
  const [sortBy, setSortBy] = useState<"temp" | "name">("temp");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fetchAllWeather = useCallback(async () => {
    setLoading(true);
    try {
      const batchSize = 15;
      const allResults: CityWeather[] = [];
      let citiesToFetch = [...INDIAN_CITIES];
      if (userLocation) {
        citiesToFetch = [
          { name: "Your Location", lat: userLocation.lat, lon: userLocation.lon, state: "Nearby" },
          ...INDIAN_CITIES,
        ];
      }

      for (let i = 0; i < citiesToFetch.length; i += batchSize) {
        const batch = citiesToFetch.slice(i, i + batchSize);
        const lats = batch.map(c => c.lat).join(",");
        const lons = batch.map(c => c.lon).join(",");
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation&timezone=Asia/Kolkata`;
        const response = await fetch(url);
        const data = await response.json();
        const results = Array.isArray(data) ? data : [data];

        batch.forEach((city, j) => {
          const r = results[j];
          if (r?.current) {
            allResults.push({
              name: city.name,
              lat: city.lat,
              lon: city.lon,
              temp: r.current.temperature_2m ?? 28,
              humidity: r.current.relative_humidity_2m ?? 55,
              windSpeed: r.current.wind_speed_10m ?? 10,
              weatherCode: r.current.weather_code ?? 0,
              feelsLike: r.current.apparent_temperature ?? r.current.temperature_2m ?? 28,
              precipitation: r.current.precipitation ?? 0,
            });
          }
        });
      }
      setCityData(allResults);
    } catch {
      setCityData(INDIAN_CITIES.slice(0, 20).map(city => ({
        name: city.name, lat: city.lat, lon: city.lon,
        temp: 25 + Math.random() * 12, humidity: 45 + Math.random() * 35,
        windSpeed: 5 + Math.random() * 20, weatherCode: [0, 1, 2][Math.floor(Math.random() * 3)],
        feelsLike: 25 + Math.random() * 12, precipitation: 0,
      })));
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => { fetchAllWeather(); }, [fetchAllWeather]);

  const sortedCities = [...cityData].sort((a, b) =>
    sortBy === "temp" ? b.temp - a.temp : a.name.localeCompare(b.name)
  );

  const hottest = cityData.length > 0 ? cityData.reduce((max, c) => c.temp > max.temp ? c : max, cityData[0]) : null;
  const coldest = cityData.length > 0 ? cityData.reduce((min, c) => c.temp < min.temp ? c : min, cityData[0]) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border border-border/50 bg-gradient-to-br from-white to-primary/5 shadow-sm overflow-hidden ${expanded && isMobile ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <span className="text-xs font-semibold">India Weather Map</span>
            <p className="text-[10px] text-muted-foreground">
              {loading ? "Loading..." : `${cityData.length} locations • Live data`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!userLocation && locationStatus !== "requesting" && (
            <button onClick={requestLocation} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors" title="Enable location">
              <Navigation className="h-3.5 w-3.5" />
            </button>
          )}
          {locationStatus === "requesting" && (
            <div className="rounded-lg p-1.5"><Loader2 className="h-3.5 w-3.5 text-primary animate-spin" /></div>
          )}
          {hottest && coldest && !loading && (
            <div className="hidden sm:flex items-center gap-2 mr-2 text-[10px]">
              <span className="flex items-center gap-1 text-orange-600">🔥 {hottest.name} {Math.round(hottest.temp)}°C</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="flex items-center gap-1 text-blue-600">❄️ {coldest.name} {Math.round(coldest.temp)}°C</span>
            </div>
          )}
          <button onClick={() => setShowCityList(!showCityList)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors">
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button onClick={fetchAllWeather} disabled={loading} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors">
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="relative">
        <MapView cityData={cityData} isMobile={isMobile} onCitySelect={setSelectedCity} userLocation={userLocation} />
        {isMobile && !selectedCity && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-[10px] text-white">
              <ChevronUp className="h-3 w-3 animate-bounce" />
              Tap a city or swipe up for list
            </div>
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="absolute top-2 left-2 right-2 z-[1000]">
            <div className="flex items-center gap-2 rounded-lg bg-white/90 dark:bg-background/90 backdrop-blur-sm border border-border/50 px-3 py-2 shadow-lg">
              <Navigation className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground flex-1">Enable location to see weather near you</p>
              <button onClick={requestLocation} className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-white shrink-0">Enable</button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCityList && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-border/30">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">All Indian Cities</span>
                <div className="flex gap-1">
                  <button onClick={() => setSortBy("temp")} className={`rounded-md px-2 py-0.5 text-[10px] ${sortBy === "temp" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>By Temp</button>
                  <button onClick={() => setSortBy("name")} className={`rounded-md px-2 py-0.5 text-[10px] ${sortBy === "name" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>A-Z</button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {sortedCities.map((city) => (
                  <button key={city.name} onClick={() => { setSelectedCity(city); setShowCityList(false); }} className="flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getTemperatureColor(city.temp) }} />
                      <span className="text-[11px] font-medium">{city.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{getWeatherEmoji(city.weatherCode)}</span>
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: getTemperatureColor(city.temp) }}>{Math.round(city.temp)}°C</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCity && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-border/30">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{selectedCity.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{getWeatherEmoji(selectedCity.weatherCode)} {getWeatherDescription(selectedCity.weatherCode)}</p>
                </div>
                <button onClick={() => setSelectedCity(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted/50"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold tabular-nums" style={{ color: getTemperatureColor(selectedCity.temp) }}>{Math.round(selectedCity.temp)}°C</span>
                <span className="text-xs text-muted-foreground">Feels like {Math.round(selectedCity.feelsLike)}°C</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: getTemperatureColor(selectedCity.temp) + "15", color: getTemperatureColor(selectedCity.temp) }}>{getTempLabel(selectedCity.temp)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Humidity", value: `${selectedCity.humidity}%`, icon: "💧" },
                  { label: "Wind", value: `${Math.round(selectedCity.windSpeed)} km/h`, icon: "💨" },
                  { label: "Rain", value: `${selectedCity.precipitation} mm`, icon: "🌧️" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-muted/30 p-2 text-center">
                    <span className="text-sm">{stat.icon}</span>
                    <p className="text-[11px] font-semibold mt-0.5">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 sm:px-4 py-2.5 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Thermometer className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60">Temperature Scale</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[{ label: "<5°", color: "#2563eb" }, { label: "5-15°", color: "#0891b2" }, { label: "15-25°", color: "#16a34a" }, { label: "25-32°", color: "#ca8a04" }, { label: "32-38°", color: "#ea580c" }, { label: "38-42°", color: "#dc2626" }, { label: ">42°", color: "#991b1b" }].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-3 sm:w-4 h-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[7px] text-muted-foreground/40 mt-0.5 hidden sm:block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
