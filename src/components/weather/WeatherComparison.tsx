import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, ArrowRight, Loader2, Plus, X } from "lucide-react";
import { WeatherCardCompact } from "@/components/weather/WeatherCard";
import type { WeatherData } from "@/convex/weather";

const QUICK_CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur"];

export function WeatherComparison() {
  const geocode = useAction(api.weather.geocodeLocation);
  const fetchWeather = useAction(api.weather.fetchWeather);
  
  const [cities, setCities] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const addCity = async (cityName: string) => {
    if (cities.length >= 4) return;
    if (cities.some(c => c.location.name.toLowerCase() === cityName.toLowerCase())) return;
    
    setLoading(true);
    try {
      const results = await geocode({ query: cityName });
      if (results && results.length > 0) {
        const best = results[0];
        const data = await fetchWeather({
          latitude: best.latitude,
          longitude: best.longitude,
          locationName: best.name,
          country: best.country,
          timezone: best.timezone || "auto",
        });
        setCities(prev => [...prev, data]);
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      setLoading(false);
      setInputValue("");
    }
  };

  const removeCity = (index: number) => {
    setCities(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (inputValue.trim()) {
      addCity(inputValue.trim());
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white to-primary/5 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <MapPin className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium">Compare Cities</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{cities.length}/4 cities</span>
      </div>

      {/* City input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a city..."
            className="flex-1 rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim() || loading || cities.length >= 4}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Quick city chips */}
      <div className="flex flex-wrap gap-1 mb-4">
        {QUICK_CITIES.filter(c => !cities.some(ci => ci.location.name.toLowerCase() === c.toLowerCase())).slice(0, 6).map(city => (
          <button
            key={city}
            onClick={() => addCity(city)}
            disabled={loading || cities.length >= 4}
            className="rounded-full border border-border/50 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-50"
          >
            + {city}
          </button>
        ))}
      </div>

      {/* Comparison grid */}
      {cities.length > 0 ? (
        <div className={`grid gap-3 ${cities.length === 1 ? "grid-cols-1" : cities.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {cities.map((data, i) => (
            <div key={i} className="relative">
              <button
                onClick={() => removeCity(i)}
                className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <WeatherCardCompact weatherData={data} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <MapPin className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Add cities to compare their weather side by side
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/50">
            Try Mumbai vs Delhi or any cities you like
          </p>
        </div>
      )}
    </div>
  );
}
