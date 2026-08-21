import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Cloud, MapPin, Star, Thermometer, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { WeatherCardCompact } from "@/components/weather/WeatherCard";
import type { WeatherData } from "@/convex/weather";

interface DashboardHomeProps {
  onSelectConversation: (id: string) => void;
  onAskQuestion: (text: string) => void;
}

const DEFAULT_LOCATIONS = ["Mumbai", "New York", "London", "Tokyo", "Delhi"];

export function DashboardHome({ onSelectConversation, onAskQuestion }: DashboardHomeProps) {
  const starredMessages = useQuery(api.chat.getStarredMessages);
  const conversations = useQuery(api.chat.getConversations);
  const geocode = useAction(api.weather.geocodeLocation);
  const fetchWeather = useAction(api.weather.fetchWeather);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState("Mumbai");

  const loadWeather = async (city: string) => {
    setWeatherLoading(true);
    setWeatherLocation(city);
    try {
      const results = await geocode({ query: city });
      if (results && results.length > 0) {
        const best = results[0];
        const data = await fetchWeather({
          latitude: best.latitude,
          longitude: best.longitude,
          locationName: best.name,
          country: best.country,
          timezone: best.timezone || "auto",
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
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weather overview and your saved insights.
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
              Live Weather
            </h2>
            <div className="flex items-center gap-1">
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
            <WeatherCardCompact weatherData={weatherData} />
          ) : (
            <button
              onClick={() => loadWeather("Mumbai")}
              className="w-full rounded-2xl border border-dashed border-border/50 bg-muted/10 p-8 text-center transition-colors hover:bg-muted/20"
            >
              <Cloud className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {weatherLoading ? "Loading weather data..." : "Click to load live weather"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">
                Real-time conditions from Open-Meteo
              </p>
            </button>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10"
        >
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ask a question
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
            { icon: Cloud, label: "Conversations", value: conversations?.length ?? 0 },
            { icon: Star, label: "Saved Messages", value: starredMessages?.length ?? 0 },
            { icon: MapPin, label: "Locations Queried", value: starredMessages ? new Set(starredMessages.map((m) => m.metadata?.location).filter(Boolean)).size : 0 },
            { icon: Thermometer, label: "Data Points", value: "Live" },
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
            Saved Messages
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
                No saved messages yet. Star any weather response to save it here.
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
              Recent Conversations
            </h2>
            <div className="space-y-1">
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => onSelectConversation(conv._id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted/40"
                >
                  <span className="truncate text-foreground/80">{conv.title || "New conversation"}</span>
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
