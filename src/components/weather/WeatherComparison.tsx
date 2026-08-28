import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  MapPin,
  Loader2,
  Plus,
  X,
  Search,
  ChevronDown,
  Globe,
} from "lucide-react";
import { WeatherCardCompact } from "@/components/weather/WeatherCard";
import type { WeatherData } from "@/convex/weather";

// Comprehensive city list grouped by region
const CITY_DATABASE = [
  // ─── North India ───
  { name: "Delhi", region: "North India", state: "Delhi" },
  { name: "New Delhi", region: "North India", state: "Delhi" },
  { name: "Chandigarh", region: "North India", state: "Chandigarh" },
  { name: "Jaipur", region: "North India", state: "Rajasthan" },
  { name: "Jodhpur", region: "North India", state: "Rajasthan" },
  { name: "Udaipur", region: "North India", state: "Rajasthan" },
  { name: "Lucknow", region: "North India", state: "Uttar Pradesh" },
  { name: "Agra", region: "North India", state: "Uttar Pradesh" },
  { name: "Varanasi", region: "North India", state: "Uttar Pradesh" },
  { name: "Kanpur", region: "North India", state: "Uttar Pradesh" },
  { name: "Noida", region: "North India", state: "Uttar Pradesh" },
  { name: "Ghaziabad", region: "North India", state: "Uttar Pradesh" },
  { name: "Agra", region: "North India", state: "Uttar Pradesh" },
  { name: "Dehradun", region: "North India", state: "Uttarakhand" },
  { name: "Mussoorie", region: "North India", state: "Uttarakhand" },
  { name: "Haridwar", region: "North India", state: "Uttarakhand" },
  { name: "Shimla", region: "North India", state: "Himachal Pradesh" },
  { name: "Manali", region: "North India", state: "Himachal Pradesh" },
  { name: "Dharamshala", region: "North India", state: "Himachal Pradesh" },
  { name: "Amritsar", region: "North India", state: "Punjab" },
  { name: "Ludhiana", region: "North India", state: "Punjab" },
  { name: "Jammu", region: "North India", state: "Jammu & Kashmir" },
  { name: "Srinagar", region: "North India", state: "Jammu & Kashmir" },
  { name: "Gulmarg", region: "North India", state: "Jammu & Kashmir" },
  { name: "Leh", region: "North India", state: "Ladakh" },
  { name: "Patiala", region: "North India", state: "Punjab" },

  // ─── West India ───
  { name: "Mumbai", region: "West India", state: "Maharashtra" },
  { name: "Pune", region: "West India", state: "Maharashtra" },
  { name: "Nagpur", region: "West India", state: "Maharashtra" },
  { name: "Nashik", region: "West India", state: "Maharashtra" },
  { name: "Aurangabad", region: "West India", state: "Maharashtra" },
  { name: "Ahmedabad", region: "West India", state: "Gujarat" },
  { name: "Surat", region: "West India", state: "Gujarat" },
  { name: "Vadodara", region: "West India", state: "Gujarat" },
  { name: "Rajkot", region: "West India", state: "Gujarat" },
  { name: "Goa", region: "West India", state: "Goa" },
  { name: "Panaji", region: "West India", state: "Goa" },
  { name: "Bhopal", region: "West India", state: "Madhya Pradesh" },
  { name: "Indore", region: "West India", state: "Madhya Pradesh" },
  { name: "Ujjain", region: "West India", state: "Madhya Pradesh" },
  { name: "Gwalior", region: "West India", state: "Madhya Pradesh" },
  { name: "Jabalpur", region: "West India", state: "Madhya Pradesh" },

  // ─── South India ───
  { name: "Chennai", region: "South India", state: "Tamil Nadu" },
  { name: "Coimbatore", region: "South India", state: "Tamil Nadu" },
  { name: "Madurai", region: "South India", state: "Tamil Nadu" },
  { name: "Ooty", region: "South India", state: "Tamil Nadu" },
  { name: "Kodaikanal", region: "South India", state: "Tamil Nadu" },
  { name: "Trichy", region: "South India", state: "Tamil Nadu" },
  { name: "Bangalore", region: "South India", state: "Karnataka" },
  { name: "Bengaluru", region: "South India", state: "Karnataka" },
  { name: "Mysore", region: "South India", state: "Karnataka" },
  { name: "Mangalore", region: "South India", state: "Karnataka" },
  { name: "Hubli", region: "South India", state: "Karnataka" },
  { name: "Hyderabad", region: "South India", state: "Telangana" },
  { name: "Warangal", region: "South India", state: "Telangana" },
  { name: "Kochi", region: "South India", state: "Kerala" },
  { name: "Thiruvananthapuram", region: "South India", state: "Kerala" },
  { name: "Kozhikode", region: "South India", state: "Kerala" },
  { name: "Munnar", region: "South India", state: "Kerala" },
  { name: "Alleppey", region: "South India", state: "Kerala" },
  { name: "Visakhapatnam", region: "South India", state: "Andhra Pradesh" },
  { name: "Vijayawada", region: "South India", state: "Andhra Pradesh" },
  { name: "Tirupati", region: "South India", state: "Andhra Pradesh" },

  // ─── East India ───
  { name: "Kolkata", region: "East India", state: "West Bengal" },
  { name: "Darjeeling", region: "East India", state: "West Bengal" },
  { name: "Siliguri", region: "East India", state: "West Bengal" },
  { name: "Patna", region: "East India", state: "Bihar" },
  { name: "Ranchi", region: "East India", state: "Jharkhand" },
  { name: "Bhubaneswar", region: "East India", state: "Odisha" },
  { name: "Puri", region: "East India", state: "Odisha" },
  { name: "Cuttack", region: "East India", state: "Odisha" },
  { name: "Guwahati", region: "East India", state: "Assam" },
  { name: "Shillong", region: "East India", state: "Meghalaya" },
  { name: "Imphal", region: "East India", state: "Manipur" },
  { name: "Agartala", region: "East India", state: "Tripura" },
  { name: "Gangtok", region: "East India", state: "Sikkim" },

  // ─── Northeast India ───
  { name: "Itanagar", region: "Northeast India", state: "Arunachal Pradesh" },
  { name: "Kohima", region: "Northeast India", state: "Nagaland" },
  { name: "Aizawl", region: "Northeast India", state: "Mizoram" },
  { name: "Dibrugarh", region: "Northeast India", state: "Assam" },

  // ─── Central India ───
  { name: "Raipur", region: "Central India", state: "Chhattisgarh" },
  { name: "Bilaspur", region: "Central India", state: "Chhattisgarh" },

  // ─── Union Territories ───
  { name: "Port Blair", region: "Union Territory", state: "Andaman & Nicobar" },
  { name: "Puducherry", region: "Union Territory", state: "Puducherry" },
  { name: "Lakshadweep", region: "Union Territory", state: "Lakshadweep" },

  // ─── International (Popular) ───
  { name: "Dubai", region: "International", state: "UAE" },
  { name: "London", region: "International", state: "United Kingdom" },
  { name: "New York", region: "International", state: "USA" },
  { name: "Paris", region: "International", state: "France" },
  { name: "Tokyo", region: "International", state: "Japan" },
  { name: "Singapore", region: "International", state: "Singapore" },
  { name: "Bangkok", region: "International", state: "Thailand" },
  { name: "Colombo", region: "International", state: "Sri Lanka" },
  { name: "Kathmandu", region: "International", state: "Nepal" },
  { name: "Istanbul", region: "International", state: "Turkey" },
  { name: "Sydney", region: "International", state: "Australia" },
  { name: "Toronto", region: "International", state: "Canada" },
  { name: "Berlin", region: "International", state: "Germany" },
  { name: "Rome", region: "International", state: "Italy" },
  { name: "Moscow", region: "International", state: "Russia" },
  { name: "Beijing", region: "International", state: "China" },
  { name: "Seoul", region: "International", state: "South Korea" },
  { name: "Kuala Lumpur", region: "International", state: "Malaysia" },
  { name: "Bali", region: "International", state: "Indonesia" },
  { name: "Lima", region: "International", state: "Peru" },
  { name: "Cairo", region: "International", state: "Egypt" },
  { name: "Cape Town", region: "International", state: "South Africa" },
  { name: "Rio de Janeiro", region: "International", state: "Brazil" },
  { name: "Los Angeles", region: "International", state: "USA" },
  { name: "San Francisco", region: "International", state: "USA" },
  { name: "Chicago", region: "International", state: "USA" },
  { name: "Miami", region: "International", state: "USA" },
];

// Deduplicate by name (keep first occurrence)
const AVAILABLE_CITIES = CITY_DATABASE.filter(
  (city, index, arr) =>
    arr.findIndex((c) => c.name.toLowerCase() === city.name.toLowerCase()) ===
    index
);

// Group cities by region
function groupByRegion(
  cities: typeof AVAILABLE_CITIES
): Record<string, typeof AVAILABLE_CITIES> {
  const groups: Record<string, typeof AVAILABLE_CITIES> = {};
  for (const city of cities) {
    if (!groups[city.region]) groups[city.region] = [];
    groups[city.region].push(city);
  }
  return groups;
}

const REGION_ORDER = [
  "North India",
  "South India",
  "West India",
  "East India",
  "Northeast India",
  "Central India",
  "Union Territory",
  "International",
];

export function WeatherComparison() {
  const geocode = useAction(api.weather.geocodeLocation);
  const fetchWeather = useAction(api.weather.fetchWeather);

  const [cities, setCities] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setSearch("");
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  // Focus search input when picker opens
  useEffect(() => {
    if (pickerOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [pickerOpen]);

  const addCity = async (cityName: string) => {
    if (cities.length >= 4) return;
    if (
      cities.some((c) => c.location.name.toLowerCase() === cityName.toLowerCase())
    )
      return;

    setPickerOpen(false);
    setSearch("");
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
        setCities((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("Failed to load weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeCity = (index: number) => {
    setCities((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter cities based on search
  const filtered = search.trim()
    ? AVAILABLE_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.state.toLowerCase().includes(search.toLowerCase()) ||
          c.region.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const grouped = filtered
    ? groupByRegion(filtered)
    : groupByRegion(AVAILABLE_CITIES);

  const selectedNames = cities.map((c) => c.location.name.toLowerCase());

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white to-primary/5 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <MapPin className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-medium">
            {cities.length === 0
              ? "Select Cities to Compare"
              : `Comparing ${cities.length} ${cities.length === 1 ? "city" : "cities"}`}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{cities.length}/4</span>
      </div>

      {/* City picker trigger */}
      <div className="relative mb-4" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          disabled={cities.length >= 4 || loading}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>
              {cities.length >= 4
                ? "Maximum 4 cities reached"
                : "Add a city to compare"}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown city picker */}
        {pickerOpen && cities.length < 4 && (
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden">
            {/* Search bar */}
            <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities, states, or regions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* City list */}
            <div className="max-h-80 overflow-y-auto p-1.5">
              {filtered && filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No cities found matching "{search}"
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Try a different name, state, or region
                  </p>
                </div>
              ) : (
                REGION_ORDER.map((region) => {
                  const regionCities = grouped[region];
                  if (!regionCities || regionCities.length === 0) return null;
                  return (
                    <div key={region} className="mb-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        {region === "International" ? (
                          <Globe className="h-2.5 w-2.5 text-muted-foreground/40" />
                        ) : (
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground/40" />
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                          {region}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {regionCities.map((city) => {
                          const isSelected = selectedNames.includes(
                            city.name.toLowerCase()
                          );
                          return (
                            <button
                              key={city.name}
                              onClick={() => !isSelected && addCity(city.name)}
                              disabled={isSelected || loading}
                              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary/10 text-primary cursor-default"
                                  : "hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                              }`}
                            >
                              <span className="truncate font-medium">
                                {city.name}
                              </span>
                              <span className="truncate text-[10px] text-muted-foreground/50">
                                {city.state}
                              </span>
                              {isSelected && (
                                <span className="ml-auto text-primary text-[10px]">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 mb-4 rounded-lg bg-muted/30 px-3 py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">
            Fetching weather data...
          </span>
        </div>
      )}

      {/* Comparison grid */}
      {cities.length > 0 ? (
        <div
          className={`grid gap-3 ${
            cities.length === 1
              ? "grid-cols-1"
              : cities.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
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
          <MapPin className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            Choose cities to compare weather
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/60 max-w-xs mx-auto">
            Click "Add a city" above to browse and select from available cities.
            Compare up to 4 cities side by side.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {["Mumbai", "Delhi", "Chennai", "Bangalore"].map((city) => (
              <button
                key={city}
                onClick={() => addCity(city)}
                disabled={loading}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                + {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
