import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Comprehensive city list organized by region
const CITIES = [
  // North India
  { name: "Delhi", state: "Delhi", country: "India", lat: 28.6139, lon: 77.2090, region: "North India" },
  { name: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lon: 75.7873, region: "North India" },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lon: 80.9462, region: "North India" },
  { name: "Chandigarh", state: "Punjab", country: "India", lat: 30.7333, lon: 76.7794, region: "North India" },
  { name: "Amritsar", state: "Punjab", country: "India", lat: 31.6340, lon: 74.8723, region: "North India" },
  { name: "Agra", state: "Uttar Pradesh", country: "India", lat: 27.1767, lon: 78.0081, region: "North India" },
  { name: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lon: 82.9739, region: "North India" },
  { name: "Dehradun", state: "Uttarakhand", country: "India", lat: 30.3165, lon: 78.0322, region: "North India" },
  { name: "Shimla", state: "Himachal Pradesh", country: "India", lat: 31.1048, lon: 77.1734, region: "North India" },
  { name: "Srinagar", state: "Jammu & Kashmir", country: "India", lat: 34.0837, lon: 74.7973, region: "North India" },
  { name: "Patna", state: "Bihar", country: "India", lat: 25.6093, lon: 85.1376, region: "North India" },
  { name: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lon: 75.8577, region: "North India" },
  { name: "Bhopal", state: "Madhya Pradesh", country: "India", lat: 23.2599, lon: 77.4126, region: "North India" },
  { name: "Kanpur", state: "Uttar Pradesh", country: "India", lat: 26.4499, lon: 80.3319, region: "North India" },
  { name: "Nagpur", state: "Maharashtra", country: "India", lat: 21.1458, lon: 79.0882, region: "North India" },
  { name: "Jodhpur", state: "Rajasthan", country: "India", lat: 26.2389, lon: 73.0243, region: "North India" },
  { name: "Meerut", state: "Uttar Pradesh", country: "India", lat: 28.9845, lon: 77.7064, region: "North India" },
  { name: "Allahabad", state: "Uttar Pradesh", country: "India", lat: 25.4358, lon: 81.8463, region: "North India" },
  { name: "Gwalior", state: "Madhya Pradesh", country: "India", lat: 26.2183, lon: 78.1828, region: "North India" },

  // South India
  { name: "Bangalore", state: "Karnataka", country: "India", lat: 12.9716, lon: 77.5946, region: "South India" },
  { name: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lon: 80.2707, region: "South India" },
  { name: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lon: 78.4867, region: "South India" },
  { name: "Kochi", state: "Kerala", country: "India", lat: 9.9312, lon: 76.2673, region: "South India" },
  { name: "Coimbatore", state: "Tamil Nadu", country: "India", lat: 11.0168, lon: 76.9558, region: "South India" },
  { name: "Mysore", state: "Karnataka", country: "India", lat: 12.2958, lon: 76.6394, region: "South India" },
  { name: "Madurai", state: "Tamil Nadu", country: "India", lat: 9.9252, lon: 78.1198, region: "South India" },
  { name: "Thiruvananthapuram", state: "Kerala", country: "India", lat: 8.5241, lon: 76.9366, region: "South India" },
  { name: "Mangalore", state: "Karnataka", country: "India", lat: 12.9141, lon: 74.8560, region: "South India" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lon: 83.2185, region: "South India" },
  { name: "Tiruchirappalli", state: "Tamil Nadu", country: "India", lat: 10.7905, lon: 78.7047, region: "South India" },
  { name: "Hubli", state: "Karnataka", country: "India", lat: 15.3647, lon: 75.1240, region: "South India" },
  { name: "Belgaum", state: "Karnataka", country: "India", lat: 15.8497, lon: 74.4977, region: "South India" },
  { name: "Salem", state: "Tamil Nadu", country: "India", lat: 11.6643, lon: 78.1460, region: "South India" },

  // West India
  { name: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lon: 72.8777, region: "West India" },
  { name: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lon: 73.8567, region: "West India" },
  { name: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lon: 72.5714, region: "West India" },
  { name: "Surat", state: "Gujarat", country: "India", lat: 21.1702, lon: 72.8311, region: "West India" },
  { name: "Rajkot", state: "Gujarat", country: "India", lat: 22.3039, lon: 70.8022, region: "West India" },
  { name: "Vadodara", state: "Gujarat", country: "India", lat: 22.3072, lon: 73.1812, region: "West India" },
  { name: "Goa", state: "Goa", country: "India", lat: 15.2993, lon: 74.1240, region: "West India" },
  { name: "Panaji", state: "Goa", country: "India", lat: 15.4989, lon: 73.8278, region: "West India" },
  { name: "Nashik", state: "Maharashtra", country: "India", lat: 19.9975, lon: 73.7898, region: "West India" },
  { name: "Aurangabad", state: "Maharashtra", country: "India", lat: 19.8762, lon: 75.3433, region: "West India" },
  { name: "Thane", state: "Maharashtra", country: "India", lat: 19.2183, lon: 72.9781, region: "West India" },

  // East India
  { name: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lon: 88.3639, region: "East India" },
  { name: "Bhubaneswar", state: "Odisha", country: "India", lat: 20.2961, lon: 85.8245, region: "East India" },
  { name: "Guwahati", state: "Assam", country: "India", lat: 26.1445, lon: 91.7362, region: "East India" },
  { name: "Ranchi", state: "Jharkhand", country: "India", lat: 23.3441, lon: 85.3096, region: "East India" },
  { name: "Patna", state: "Bihar", country: "India", lat: 25.6093, lon: 85.1376, region: "East India" },
  { name: "Raipur", state: "Chhattisgarh", country: "India", lat: 21.2514, lon: 81.6296, region: "East India" },
  { name: "Puri", state: "Odisha", country: "India", lat: 19.8135, lon: 85.8312, region: "East India" },
  { name: "Cuttack", state: "Odisha", country: "India", lat: 20.4625, lon: 85.8830, region: "East India" },
  { name: "Shillong", state: "Meghalaya", country: "India", lat: 25.5788, lon: 91.8933, region: "East India" },

  // International
  { name: "Dubai", state: "UAE", country: "UAE", lat: 25.2048, lon: 55.2708, region: "International" },
  { name: "London", state: "United Kingdom", country: "UK", lat: 51.5074, lon: -0.1278, region: "International" },
  { name: "New York", state: "USA", country: "USA", lat: 40.7128, lon: -74.0060, region: "International" },
  { name: "Paris", state: "France", country: "France", lat: 48.8566, lon: 2.3522, region: "International" },
  { name: "Tokyo", state: "Japan", country: "Japan", lat: 35.6762, lon: 139.6503, region: "International" },
  { name: "Singapore", state: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, region: "International" },
  { name: "Bangkok", state: "Thailand", country: "Thailand", lat: 13.7563, lon: 100.5018, region: "International" },
  { name: "Sydney", state: "Australia", country: "Australia", lat: -33.8688, lon: 151.2093, region: "International" },
  { name: "Toronto", state: "Canada", country: "Canada", lat: 43.6532, lon: -79.3832, region: "International" },
  { name: "Berlin", state: "Germany", country: "Germany", lat: 52.5200, lon: 13.4050, region: "International" },
  { name: "Kathmandu", state: "Nepal", country: "Nepal", lat: 27.7172, lon: 85.3240, region: "International" },
  { name: "Colombo", state: "Sri Lanka", country: "Sri Lanka", lat: 6.9271, lon: 79.8612, region: "International" },
];

interface CitySearchBarProps {
  onSelect: (name: string, lat: number, lon: number) => void;
  placeholder?: string;
  compact?: boolean;
}

export function CitySearchBar({ onSelect, placeholder = "Search for your city...", compact = false }: CitySearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Filter cities based on query
  const filteredCities = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query]);

  // Group by region for display
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredCities> = {};
    for (const city of filteredCities) {
      if (!groups[city.region]) groups[city.region] = [];
      groups[city.region].push(city);
    }
    return groups;
  }, [filteredCities]);

  const handleSelect = async (city: typeof CITIES[0]) => {
    setQuery(city.name);
    setIsOpen(false);
    setIsSearching(true);

    try {
      // Use Open-Meteo geocoding for fresh coordinates
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.name)}&count=1&language=en&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        onSelect(r.name || city.name, r.latitude, r.longitude);
      } else {
        // Fallback to built-in coordinates
        onSelect(city.name, city.lat, city.lon);
      }
    } catch {
      onSelect(city.name, city.lat, city.lon);
    } finally {
      setIsSearching(false);
    }
  };

  if (compact) {
    return (
      <div ref={containerRef} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-border/50 bg-muted/20 pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isOpen && query.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-2xl"
            >
              {filteredCities.length === 0 ? (
                <div className="py-6 text-center">
                  <Search className="h-4 w-4 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No cities found for "{query}"</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Try a different name or state</p>
                </div>
              ) : (
                <div className="p-1.5">
                  {Object.entries(grouped).map(([region, cities]) => (
                    <div key={region} className="mb-1">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground/40" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                          {region}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {cities.map((city) => (
                          <button
                            key={`${city.name}-${city.state}`}
                            onClick={() => handleSelect(city)}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-muted/50 transition-colors"
                          >
                            <span className="truncate font-medium text-foreground/80">{city.name}</span>
                            <span className="truncate text-[10px] text-muted-foreground/50">{city.state}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full-size version for standalone use
  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border/50 bg-background pl-11 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-2xl"
          >
            {filteredCities.length === 0 ? (
              <div className="py-8 text-center">
                <Search className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No cities found for "{query}"</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Try a different name, state, or region</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(grouped).map(([region, cities]) => (
                  <div key={region} className="mb-2">
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground/40" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {region}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      {cities.map((city) => (
                        <button
                          key={`${city.name}-${city.state}`}
                          onClick={() => handleSelect(city)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors"
                        >
                          <span className="truncate font-medium text-foreground/80">{city.name}</span>
                          <span className="truncate text-[10px] text-muted-foreground/50">{city.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
