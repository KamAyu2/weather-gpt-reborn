import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { Cloud, MapPin, Star, Thermometer, ArrowRight, RefreshCw, Sprout, AlertTriangle, Globe, Navigation, Search } from "lucide-react";
import { motion } from "framer-motion";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { WeatherCardCompact } from "@/components/weather/WeatherCard";
import { ThermalMap } from "@/components/weather/ThermalMap";
import { SevereWeatherMap } from "@/components/weather/SevereWeatherMap";
import { AdvancedAgriAdvisory } from "@/components/weather/AdvancedAgriAdvisory";
import { useLanguage } from "@/lib/i18n";
import { useLocationDetection } from "@/hooks/use-location-detection";
import { CitySearchBar } from "@/components/ui/CitySearchBar";
import type { WeatherData } from "@/convex/weather";

interface DashboardHomeProps {
  onSelectConversation: (id: string) => void;
  onAskQuestion: (text: string) => void;
}

const DEFAULT_LOCATIONS = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];

export function DashboardHome({ onSelectConversation, onAskQuestion }: DashboardHomeProps) {
  const { translate } = useLanguage();
  const starredMessages = useQuery(api.chat.getStarredMessages);
  const conversations = useQuery(api.chat.getConversations);
  const geocode = useAction(api.weather.geocodeLocation);
  const fetchWeather = useAction(api.weather.fetchWeather);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState("Mumbai");

  // Location detection with fallback chain: Geolocation → IP → Manual Search
  const {
    location: detectedLocation,
    method: detectionMethod,
    isDetecting,
    error: locationError,
    setManualLocation,
  } = useLocationDetection();

  // Load weather by coordinates (for user's location)
  const loadWeatherByCoords = useCallback(async (lat: number, lon: number, name?: string) => {
    setWeatherLoading(true);
    setWeatherLocation(name || "My Location");
    try {
      let placeName = name || "Your Location";
      if (!name || name === "My Location" || name === "Your Location") {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`, {
            headers: { "User-Agent": "WeatherGPT/1.0" },
          });
          if (res.ok) {
            const data = await res.json();
            placeName = data.address?.city || data.address?.town || data.address?.village || data.address?.state || name || "Your Location";
          }
        } catch { /* use default */ }
      }

      const data = await fetchWeather({
        latitude: lat, longitude: lon,
        locationName: placeName, country: "India", timezone: "auto",
      });
      setWeatherData(data);
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  }, [fetchWeather]);

  // Auto-load weather when location is detected
  useEffect(() => {
    if (detectedLocation && !weatherData) {
      loadWeatherByCoords(detectedLocation.lat, detectedLocation.lon, detectedLocation.name);
    }
  }, [detectedLocation, weatherData, loadWeatherByCoords]);

  // Handle manual city search selection
  const handleCitySearch = useCallback((name: string, lat: number, lon: number) => {
    setManualLocation(name, lat, lon);
    loadWeatherByCoords(lat, lon, name);
  }, [setManualLocation, loadWeatherByCoords]);

  const loadWeather = async (city: string) => {
    setWeatherLoading(true);
    setWeatherLocation(city);
    try {
      const results = await geocode({ query: city });
      if (results && results.length > 0) {
        const best = results[0];
        const data = await fetchWeather({
          latitude: best.latitude, longitude: best.longitude,
          locationName: best.name, country: best.country, timezone: best.timezone || "auto",
        });
        setWeatherData(data);
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{translate("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {translate("dashboard.subtitle")}
          </p>
        </motion.div>

        {/* ─── Live Weather Widget ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {translate("dashboard.liveWeather")}
            </h2>
            <div className="flex items-center gap-1">
              {detectedLocation && (
                <button
                  onClick={() => loadWeatherByCoords(detectedLocation.lat, detectedLocation.lon, detectedLocation.name)}
                  className={`rounded-full px-2.5 py-1 text-[10px] transition-colors flex items-center gap-1 ${
                    weatherLocation === detectedLocation.name && weatherData
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Navigation className="h-2.5 w-2.5" />
                  {detectedLocation.name === "My Location" ? translate("dashboard.myLocation") : detectedLocation.name}
                </button>
              )}
              {DEFAULT_LOCATIONS.map((city) => (
                <button
                  key={city}
                  onClick={() => loadWeather(city)}
                  className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${
                    weatherLocation === city && weatherData
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {city}
                </button>
              ))}
              <button
                onClick={() => loadWeather(weatherLocation)}
                disabled={weatherLoading}
                className="ml-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-3 w-3 ${weatherLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {weatherData ? (
            <div className="space-y-3">
              <WeatherCardCompact weatherData={weatherData} />
              
              {/* Advanced Agriculture Advisory */}
              <AdvancedAgriAdvisory weatherData={weatherData} />

              {/* Disaster Alert Status */}
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium">{translate("disaster.title")}</span>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground leading-relaxed">
                  {weatherData.current.temperature >= 42 && (
                    <p>• ⛔ {translate("disaster.extremeHeat")}</p>
                  )}
                  {weatherData.current.temperature >= 38 && weatherData.current.temperature < 42 && (
                    <p>• ⚠️ {translate("disaster.heatAdvisory")}</p>
                  )}
                  {weatherData.current.temperature <= 2 && (
                    <p>• ⛔ {translate("disaster.severeCold")}</p>
                  )}
                  {weatherData.current.weatherCode >= 95 && (
                    <p>• ⛔ {translate("disaster.thunderstorm")}</p>
                  )}
                  {weatherData.current.windSpeed >= 60 && (
                    <p>• ⛔ {translate("disaster.severeWind")}</p>
                  )}
                  {weatherData.current.temperature >= 10 && weatherData.current.temperature <= 38 && weatherData.current.weatherCode < 95 && weatherData.current.windSpeed < 60 && (
                    <p>• ✅ {translate("disaster.allClear")}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-border/50 bg-muted/10 p-6 text-center">
              {weatherLoading || isDetecting ? (
                <>
                  <RefreshCw className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {translate("dashboard.loadingWeather")}
                  </p>
                </>
              ) : (
                <>
                  <MapPin className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {locationError || translate("dashboard.clickToLoad")}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mb-4">
                    Search for your city or use a quick link below
                  </p>
                  {/* City Search Bar */}
                  <div className="max-w-sm mx-auto mb-4">
                    <CitySearchBar
                      onSelect={handleCitySearch}
                      placeholder="Search for your city..."
                      compact
                    />
                  </div>
                  {/* Quick city buttons */}
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {DEFAULT_LOCATIONS.map((city) => (
                      <button
                        key={city}
                        onClick={() => loadWeather(city)}
                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* ─── Severe Weather Monitor ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10"
        >
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {translate('dashboard.severeWeather')}
          </h2>
          <SevereWeatherMap />
        </motion.div>

        {/* ─── Thermal Map ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mt-10"
        >
          <ThermalMap />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10"
        >            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {translate("dashboard.askQuestion")}
          </h2>
          <SuggestionChips onSelect={onAskQuestion} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: Cloud, label: translate("dashboard.conversations"), value: conversations?.length ?? 0 },
            { icon: Star, label: translate("dashboard.savedMessages"), value: starredMessages?.length ?? 0 },
            { icon: MapPin, label: translate("dashboard.locationsQueried"), value: starredMessages ? new Set(starredMessages.map((m) => m.metadata?.location).filter(Boolean)).size : 0 },
            { icon: Thermometer, label: translate("dashboard.dataPoints"), value: "Live" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-muted/20 p-4"
            >
              <stat.icon className="h-4 w-4 text-muted-foreground/60 mb-2" />
              <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Starred Messages */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {translate("dashboard.savedMessages")}
          </h2>
          {starredMessages && starredMessages.length > 0 ? (
            <div className="space-y-2">
              {starredMessages.slice(0, 5).map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => onSelectConversation(msg.conversationId)}
                  className="w-full rounded-xl border border-border/50 bg-muted/20 p-4 text-left transition-all hover:border-border hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <Star className="h-3.5 w-3.5 mt-0.5 fill-amber-500 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {msg.metadata?.location
                          ? `Weather in ${msg.metadata.location}${msg.metadata.country ? `, ${msg.metadata.country}` : ""}`
                          : msg.conversationTitle}
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/80 line-clamp-2">
                        {msg.content.replace(/\*\*/g, "").slice(0, 200)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
              <Star className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {translate("dashboard.noSavedMessages")} {translate("common.starToSave")}
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Conversations */}
        {conversations && conversations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-10 pb-10"
          >
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {translate("dashboard.recentConversations")}
            </h2>
            <div className="space-y-1">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => onSelectConversation(conv._id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted/40"
                >
                  <span className="truncate text-foreground/80">{conv.title || translate("nav.newChat")}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
