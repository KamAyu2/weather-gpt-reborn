import { action } from "./_generated/server";
import { v } from "convex/values";

// ─── Geocoding via Open-Meteo (free, no API key) ────────────────────────────

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population?: number;
  elevation?: number;
  feature_code?: string;
}

export const geocodeLocation = action({
  args: { query: v.string() },
  handler: async (_ctx, args) => {
    // Strategy 1: Direct geocoding
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.query)}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding request failed");
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      return data.results as GeocodingResult[];
    }

    // Strategy 2: Try with "India" appended for small locations
    const indiaUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.query + " India")}&count=10&language=en&format=json`;
    const indiaRes = await fetch(indiaUrl);
    if (indiaRes.ok) {
      const indiaData = await indiaRes.json();
      if (indiaData.results && indiaData.results.length > 0) {
        return indiaData.results as GeocodingResult[];
      }
    }

    // Strategy 3: Try partial match
    const words = args.query.split(/\s+/);
    if (words.length > 1) {
      const partialUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(words[0])}&count=10&language=en&format=json`;
      const partialRes = await fetch(partialUrl);
      if (partialRes.ok) {
        const partialData = await partialRes.json();
        if (partialData.results && partialData.results.length > 0) {
          return partialData.results as GeocodingResult[];
        }
      }
    }

    throw new Error(`Location "${args.query}" not found. Please try a different city or place name.`);
  },
});

// ─── Reverse geocoding: coordinates → place name ───────────────────────────

export const reverseGeocode = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (_ctx, args) => {
    try {
      // Open-Meteo doesn't have reverse geocoding, use Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${args.latitude}&lon=${args.longitude}&format=json&zoom=10`;
      const res = await fetch(nominatimUrl, {
        headers: { "User-Agent": "WeatherGPT/1.0" },
      });
      if (!res.ok) {
        return { name: "Your Location", country: "India" };
      }
      const data = await res.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.county || address.state || "Your Location";
      const country = address.country || "India";
      return { name: city, country };
    } catch {
      return { name: "Your Location", country: "India" };
    }
  },
});

// ─── Find nearby locations ─────────────────────────────────────────────────

export const findNearbyLocations = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const offsets = [
      { lat: 0, lon: 0, label: "Your location" },
      { lat: 0.5, lon: 0, label: "North" },
      { lat: -0.5, lon: 0, label: "South" },
      { lat: 0, lon: 0.5, label: "East" },
      { lat: 0, lon: -0.5, label: "West" },
      { lat: 0.35, lon: 0.35, label: "Northeast" },
      { lat: -0.35, lon: -0.35, label: "Southwest" },
      { lat: 0.35, lon: -0.35, label: "Northwest" },
      { lat: -0.35, lon: 0.35, label: "Southeast" },
    ];

    const results = offsets.map(offset => ({
      latitude: args.latitude + offset.lat,
      longitude: args.longitude + offset.lon,
      label: offset.label,
    }));

    return results;
  },
});

// ─── Weather data via Open-Meteo ────────────────────────────────────────────

export interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    apparentTemperature: number;
    precipitation: number;
    cloudCover: number;
    pressure: number;
    uvIndex: number;
    isDay: boolean;
  };
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    weatherCode: number;
    precipitationSum: number;
    precipitationProbabilityMax: number;
    windSpeedMax: number;
    uvIndexMax: number;
    sunrise: string;
    sunset: string;
  }>;
  hourly?: Array<{
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability: number;
    windSpeed: number;
  }>;
}

export const fetchWeather = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.string(),
    country: v.string(),
    timezone: v.string(),
  },
  handler: async (_ctx, args) => {
    const params = new URLSearchParams({
      latitude: args.latitude.toString(),
      longitude: args.longitude.toString(),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "uv_index",
        "is_day",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "uv_index_max",
        "sunrise",
        "sunset",
      ].join(","),
      hourly: [
        "temperature_2m",
        "weather_code",
        "precipitation_probability",
        "wind_speed_10m",
      ].join(","),
      timezone: args.timezone,
      forecast_days: "7",
      forecast_hourly: "24",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather data request failed");
    const data = await res.json();

    const weatherData: WeatherData = {
      location: {
        name: args.locationName,
        country: args.country,
        latitude: args.latitude,
        longitude: args.longitude,
        timezone: args.timezone,
      },
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        cloudCover: data.current.cloud_cover,
        pressure: data.current.pressure_msl,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        uvIndex: data.current.uv_index,
        isDay: data.current.is_day === 1,
      },
      daily: data.daily.time.map((date: string, i: number) => ({
        date,
        temperatureMax: data.daily.temperature_2m_max[i],
        temperatureMin: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weather_code[i],
        precipitationSum: data.daily.precipitation_sum[i],
        precipitationProbabilityMax: data.daily.precipitation_probability_max[i],
        windSpeedMax: data.daily.wind_speed_10m_max[i],
        uvIndexMax: data.daily.uv_index_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      })),
      hourly: data.hourly?.time
        ? data.hourly.time.slice(0, 24).map((time: string, i: number) => ({
            time,
            temperature: data.hourly.temperature_2m[i],
            weatherCode: data.hourly.weather_code[i],
            precipitationProbability: data.hourly.precipitation_probability[i],
            windSpeed: data.hourly.wind_speed_10m[i],
          }))
        : undefined,
    };

    return weatherData;
  },
});

// ─── Historical Weather Data (Feature 7: Climate Trend Analysis) ─────────────

export interface HistoricalWeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    temperatureMean: number;
    precipitationSum: number;
    weatherCode: number;
    windSpeedMax: number;
  }>;
  summary: {
    avgTempMax: number;
    avgTempMin: number;
    totalPrecipitation: number;
    hottestDay: { date: string; temp: number };
    coldestDay: { date: string; temp: number };
    rainyDays: number;
    totalDays: number;
  };
}

export const fetchHistoricalWeather = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.string(),
    country: v.string(),
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
  },
  handler: async (_ctx, args) => {
    const params = new URLSearchParams({
      latitude: args.latitude.toString(),
      longitude: args.longitude.toString(),
      start_date: args.startDate,
      end_date: args.endDate,
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "precipitation_sum",
        "weather_code",
        "wind_speed_10m_max",
      ].join(","),
      timezone: "auto",
    });

    const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Historical weather data request failed");
    const data = await res.json();

    interface DailyHistorical {
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      temperatureMean: number;
      precipitationSum: number;
      weatherCode: number;
      windSpeedMax: number;
    }

    const dailyData: DailyHistorical[] = data.daily.time.map((date: string, i: number) => ({
      date,
      temperatureMax: data.daily.temperature_2m_max?.[i] ?? null as unknown as number,
      temperatureMin: data.daily.temperature_2m_min?.[i] ?? null as unknown as number,
      temperatureMean: data.daily.temperature_2m_mean?.[i] ?? null as unknown as number,
      precipitationSum: data.daily.precipitation_sum?.[i] ?? 0,
      weatherCode: data.daily.weather_code?.[i] ?? 0,
      windSpeedMax: data.daily.wind_speed_10m_max?.[i] ?? 0,
    }));

    // Filter to only days with valid temperature data for averages
    const validTemps = dailyData.filter((d: DailyHistorical) => d.temperatureMax != null && d.temperatureMax !== 0);
    const avgTempMax = validTemps.length > 0
      ? validTemps.reduce((sum: number, d: DailyHistorical) => sum + (d.temperatureMax ?? 0), 0) / validTemps.length
      : 0;
    const avgTempMin = validTemps.length > 0
      ? validTemps.reduce((sum: number, d: DailyHistorical) => sum + (d.temperatureMin ?? 0), 0) / validTemps.length
      : 0;
    const totalPrecipitation = dailyData.reduce((sum: number, d: DailyHistorical) => sum + (d.precipitationSum || 0), 0);

    let hottestDay = { date: "", temp: -999 };
    let coldestDay = { date: "", temp: 999 };
    for (const d of dailyData) {
      if (d.temperatureMax != null && d.temperatureMax > hottestDay.temp) hottestDay = { date: d.date, temp: d.temperatureMax };
      if (d.temperatureMin != null && d.temperatureMin < coldestDay.temp) coldestDay = { date: d.date, temp: d.temperatureMin };
    }

    const rainyDays = dailyData.filter((d: DailyHistorical) => (d.precipitationSum || 0) > 1).length;

    return {
      location: {
        name: args.locationName,
        country: args.country,
        latitude: args.latitude,
        longitude: args.longitude,
      },
      period: { startDate: args.startDate, endDate: args.endDate },
      daily: dailyData,
      summary: {
        avgTempMax: Math.round(avgTempMax * 10) / 10,
        avgTempMin: Math.round(avgTempMin * 10) / 10,
        totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
        hottestDay,
        coldestDay,
        rainyDays,
        totalDays: dailyData.length,
      },
    };
  },
});

// ─── GFS/NWP Model Forecast (Feature 3: Numerical Weather Prediction) ──────

export interface NWPForecastData {
  model: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationSum: number;
    weatherCode: number;
    windSpeedMax: number;
  }>;
}

export const fetchNWPForecast = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.string(),
    model: v.optional(v.string()), // "gfs_seamless", "ecmwf_ifs025", "icon_global", etc.
  },
  handler: async (_ctx, args) => {
    // Open-Meteo supports multiple NWP models:
    // gfs_seamless = GFS (NOAA) - Global Forecast System
    // ecmwf_ifs025 = ECMWF IFS - European Centre
    // icon_global = ICON (DWD) - German Weather Service
    // meteofrance_seamless = Météo-France
    // The default ensemble blends GFS + ECMWF
    
    const model = args.model || "gfs_seamless";
    
    const params = new URLSearchParams({
      latitude: args.latitude.toString(),
      longitude: args.longitude.toString(),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "wind_speed_10m_max",
      ].join(","),
      models: model,
      timezone: "auto",
      forecast_days: "7",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NWP model forecast request failed for ${model}`);
    const data = await res.json();

    const modelName: Record<string, string> = {
      gfs_seamless: "GFS (NOAA Global Forecast System)",
      ecmwf_ifs025: "ECMWF IFS (European Centre)",
      icon_global: "ICON (DWD German Weather Service)",
      meteofrance_seamless: "Météo-France ARPEGE/AROME",
      ukmo_seamless: "UK Met Office",
    };

    return {
      model: modelName[model] || model,
      location: {
        name: args.locationName,
        latitude: args.latitude,
        longitude: args.longitude,
      },
      daily: data.daily.time.map((date: string, i: number) => ({
        date,
        temperatureMax: data.daily.temperature_2m_max[i],
        temperatureMin: data.daily.temperature_2m_min[i],
        precipitationSum: data.daily.precipitation_sum[i],
        weatherCode: data.daily.weather_code[i],
        windSpeedMax: data.daily.wind_speed_10m_max[i],
      })),
    };
  },
});

// ─── Multi-Model Comparison (compare GFS vs ECMWF) ─────────────────────────

export const fetchMultiModelComparison = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.string(),
  },
  handler: async (_ctx, args) => {
    const models = ["gfs_seamless", "ecmwf_ifs025", "icon_global"];
    
    const results = await Promise.allSettled(
      models.map(async (model) => {
        const params = new URLSearchParams({
          latitude: args.latitude.toString(),
          longitude: args.longitude.toString(),
          daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
          models: model,
          timezone: "auto",
          forecast_days: "7",
        });
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed for ${model}`);
        const data = await res.json();
        const modelName: Record<string, string> = {
          gfs_seamless: "GFS (NOAA)",
          ecmwf_ifs025: "ECMWF IFS",
          icon_global: "ICON (DWD)",
        };
        return {
          model: modelName[model] || model,
          daily: data.daily.time.map((date: string, i: number) => ({
            date,
            temperatureMax: data.daily.temperature_2m_max[i],
            temperatureMin: data.daily.temperature_2m_min[i],
            precipitationSum: data.daily.precipitation_sum[i],
            weatherCode: data.daily.weather_code[i],
            windSpeedMax: data.daily.wind_speed_10m_max[i],
          })),
        };
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<{model: string; daily: Array<{date: string; temperatureMax: number; temperatureMin: number; precipitationSum: number; weatherCode: number; windSpeedMax: number}>}> => r.status === "fulfilled")
      .map((r) => r.value);
  },
});

// ─── Severe Weather Warnings from IMD (India Meteorological Department) ─────

export interface IMDWarning {
  district: string;
  state: string;
  warningMessage: string;
  colorCode: number; // 1=Green, 2=Yellow, 3=Orange, 4=Red
  validFrom: string;
  validUpto: string;
  category: string;
}

export interface SevereWeatherSpot {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  severity: "red" | "orange" | "yellow" | "green";
  warning: string;
  type: string; // thunderstorm, rain, heatwave, cyclone, etc.
  temperature?: number;
  windSpeed?: number;
}

// Indian district coordinates (major districts for mapping warnings)
const DISTRICT_COORDS: Record<string, { lat: number; lon: number; state: string }> = {
  "Mumbai": { lat: 19.076, lon: 72.8777, state: "Maharashtra" },
  "Delhi": { lat: 28.6139, lon: 77.209, state: "Delhi" },
  "Chennai": { lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  "Kolkata": { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  "Bangalore": { lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  "Hyderabad": { lat: 17.385, lon: 78.4867, state: "Telangana" },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  "Pune": { lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  "Jaipur": { lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  "Lucknow": { lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  "Bhopal": { lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  "Patna": { lat: 25.6093, lon: 85.1376, state: "Bihar" },
  "Bhubaneswar": { lat: 20.2961, lon: 85.8245, state: "Odisha" },
  "Guwahati": { lat: 26.1445, lon: 91.7362, state: "Assam" },
  "Shimla": { lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
  "Srinagar": { lat: 34.0837, lon: 74.7973, state: "Jammu & Kashmir" },
  "Thiruvananthapuram": { lat: 8.5241, lon: 76.9366, state: "Kerala" },
  "Chandigarh": { lat: 30.7333, lon: 76.7794, state: "Chandigarh" },
  "Dehradun": { lat: 30.3165, lon: 78.0322, state: "Uttarakhand" },
  "Ranchi": { lat: 23.3441, lon: 85.3096, state: "Jharkhand" },
  "Raipur": { lat: 21.2514, lon: 81.6296, state: "Chhattisgarh" },
  "Indore": { lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  "Nagpur": { lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  "Visakhapatnam": { lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh" },
  "Coimbatore": { lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  "Madurai": { lat: 9.9252, lon: 78.1198, state: "Tamil Nadu" },
  "Kochi": { lat: 9.9312, lon: 76.2673, state: "Kerala" },
  "Varanasi": { lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  "Amritsar": { lat: 31.634, lon: 74.8723, state: "Punjab" },
  "Jodhpur": { lat: 26.2389, lon: 73.0243, state: "Rajasthan" },
  "Udaipur": { lat: 24.5854, lon: 73.7125, state: "Rajasthan" },
  "Darjeeling": { lat: 27.036, lon: 88.2627, state: "West Bengal" },
  "Gangtok": { lat: 27.3389, lon: 88.6065, state: "Sikkim" },
  "Imphal": { lat: 24.817, lon: 93.9368, state: "Manipur" },
  "Shillong": { lat: 25.5788, lon: 91.8933, state: "Meghalaya" },
  "Aizawl": { lat: 23.7271, lon: 92.7176, state: "Mizoram" },
  "Kohima": { lat: 25.6586, lon: 94.1086, state: "Nagaland" },
  "Itanagar": { lat: 27.1044, lon: 93.692, state: "Arunachal Pradesh" },
  "Agartala": { lat: 23.8315, lon: 91.2868, state: "Tripura" },
  "Panaji": { lat: 15.4909, lon: 73.8278, state: "Goa" },
};

// IMD Warning color code meanings
const IMD_COLOR_MAP: Record<number, { label: string; severity: "red" | "orange" | "yellow" | "green"; color: string }> = {
  1: { label: "No Warning", severity: "green", color: "#008000" },
  2: { label: "Yellow Alert", severity: "yellow", color: "#FFFF00" },
  3: { label: "Orange Alert", severity: "orange", color: "#FFA500" },
  4: { label: "Red Alert", severity: "red", color: "#FF0000" },
};

export const fetchIMDWarnings = action({
  args: {},
  handler: async (_ctx, args) => {
    try {
      // Fetch district-wise warnings from IMD
      const res = await fetch("https://api.imd.gov.in/api/v1/districtwarning", {
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error("IMD API request failed");
      const data = await res.json();
      
      // Parse IMD response and extract warnings
      const warnings: IMDWarning[] = [];
      const severeSpots: SevereWeatherSpot[] = [];
      
      // IMD returns data in various formats depending on the endpoint
      // Try to parse the response
      const records = Array.isArray(data) ? data : (data.records || data.data || []);
      
      for (const record of records) {
        const district = record.District || record.district || record.station || "";
        const state = record.State || record.state || "";
        const message = record.Warning || record.warning || record.message || record.Cat16 || "";
        const colorCode = parseInt(record.color || record.Color || record.colorCode || "1");
        const validFrom = record.validFrom || record.toi || "";
        const validUpto = record.validUpto || record.Vupto || "";
        const category = record.Category || record.category || "";

        if (district && message && colorCode >= 2) {
          warnings.push({
            district,
            state,
            warningMessage: message,
            colorCode,
            validFrom,
            validUpto,
            category,
          });

          // Map district to coordinates if we have them
          const coords = DISTRICT_COORDS[district];
          if (coords) {
            const colorInfo = IMD_COLOR_MAP[colorCode] || IMD_COLOR_MAP[1];
            severeSpots.push({
              name: district,
              state: coords.state,
              latitude: coords.lat,
              longitude: coords.lon,
              severity: colorInfo.severity,
              warning: message,
              type: category || "Weather Warning",
            });
          }
        }
      }

      return { warnings, severeSpots };
    } catch (error) {
      // If IMD API fails, return empty - we'll use Open-Meteo data as fallback
      return { warnings: [], severeSpots: [] };
    }
  },
});

// Fetch real-time critical weather spots using Open-Meteo data for major Indian cities
// Uses individual requests per city for reliability (batch API can fail silently)
export const fetchCriticalWeatherSpots = action({
  args: {},
  handler: async (_ctx, args) => {
    const cities = Object.entries(DISTRICT_COORDS);
    const criticalSpots: SevereWeatherSpot[] = [];

    // Fetch all cities in parallel with a concurrency limit of 8
    const CONCURRENCY = 8;
    for (let i = 0; i < cities.length; i += CONCURRENCY) {
      const batch = cities.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async ([name, info]) => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${info.lat}&longitude=${info.lon}&current=temperature_2m,wind_speed_10m,weather_code,precipitation,relative_humidity_2m&timezone=Asia/Kolkata`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Open-Meteo failed for ${name}`);
          const data = await res.json();
          return { name, info, data };
        })
      );

      for (const r of results) {
        if (r.status !== "fulfilled") continue;
        const { name, info, data } = r.value;
        if (!data?.current) continue;

        const temp = data.current.temperature_2m ?? 25;
        const wind = data.current.wind_speed_10m ?? 0;
        const code = data.current.weather_code ?? 0;
        const precip = data.current.precipitation ?? 0;
        const humidity = data.current.relative_humidity_2m ?? 50;

        let severity: "red" | "orange" | "yellow" | "green" = "green";
        let warning = "";
        let type = "Normal";

        // WMO Weather codes: 95=thunderstorm, 96=thunderstorm+hail, 99=heavy hail
        // 65=heavy rain, 67=heavy freezing rain, 82=violent rain showers
        // 75=heavy snow, 86=heavy snow showers

        // ── RED alerts: life-threatening ──
        if (code >= 95 && wind >= 60) {
          severity = "red"; type = "Severe Cyclonic Storm";
          warning = `Cyclonic thunderstorm with ${Math.round(wind)} km/h winds. Stay indoors immediately!`;
        } else if (temp >= 44) {
          severity = "red"; type = "Extreme Heatwave";
          warning = `Extreme heatwave at ${Math.round(temp)}°C. Life-threatening conditions. Avoid all outdoor activity.`;
        } else if (temp <= -3) {
          severity = "red"; type = "Severe Cold Wave";
          warning = `Severe cold wave at ${Math.round(temp)}°C. Risk of hypothermia and frostbite.`;
        } else if (wind >= 65) {
          severity = "red"; type = "Cyclonic Wind";
          warning = `Dangerous cyclonic winds at ${Math.round(wind)} km/h. Stay indoors, away from windows.`;
        } else if (code === 65 || code === 67 || code === 82) {
          severity = "red"; type = "Extreme Rainfall";
          warning = `Violent/heavy rainfall. Risk of flash flooding and waterlogging. Avoid low-lying areas.`;
        }
        // ── ORANGE alerts: dangerous ──
        else if (code >= 95) {
          severity = "orange"; type = "Thunderstorm";
          warning = `Active thunderstorm with ${precip > 0 ? Math.round(precip) + 'mm rain' : 'lightning and heavy rain'}. Seek shelter indoors.`;
        } else if (temp >= 41) {
          severity = "orange"; type = "Heatwave";
          warning = `Heatwave at ${Math.round(temp)}°C. Avoid outdoor activity between 11 AM - 4 PM. Stay hydrated.`;
        } else if (temp <= 5) {
          severity = "orange"; type = "Cold Wave";
          warning = `Cold wave at ${Math.round(temp)}°C. Protect crops and vulnerable people from frost.`;
        } else if (precip >= 15) {
          severity = "orange"; type = "Heavy Rain";
          warning = `Heavy rainfall (${Math.round(precip)}mm). Possible waterlogging in low-lying areas.`;
        } else if (wind >= 50) {
          severity = "orange"; type = "Strong Wind";
          warning = `Strong winds at ${Math.round(wind)} km/h. Secure loose objects and avoid trees.`;
        }
        // ── YELLOW alerts: caution needed ──
        else if (temp >= 38) {
          severity = "yellow"; type = "Heat Stress";
          warning = `Hot at ${Math.round(temp)}°C with ${humidity}% humidity. Stay hydrated and avoid peak sun.`;
        } else if (temp <= 10) {
          severity = "yellow"; type = "Cold Conditions";
          warning = `Cold at ${Math.round(temp)}°C. Dress in layers and carry warm clothing.`;
        } else if (code >= 61 && code <= 63) {
          severity = "yellow"; type = "Rainfall";
          warning = `Ongoing rainfall (${precip > 0 ? Math.round(precip) + 'mm' : 'moderate'}). Carry umbrella and drive carefully.`;
        } else if (code >= 80 && code <= 82) {
          severity = "yellow"; type = "Rain Showers";
          warning = `Rain showers expected. Carry an umbrella and avoid open areas.`;
        } else if (wind >= 35) {
          severity = "yellow"; type = "Breezy";
          warning = `Breezy conditions at ${Math.round(wind)} km/h. Secure lightweight objects.`;
        } else if (humidity >= 90 && temp >= 33) {
          severity = "yellow"; type = "Humid Heat";
          warning = `High humidity (${humidity}%) at ${Math.round(temp)}°C feels like a heatwave. Stay cool.`;
        }

        // Only add non-green spots
        if (severity !== "green") {
          criticalSpots.push({
            name,
            state: info.state,
            latitude: info.lat,
            longitude: info.lon,
            severity,
            warning,
            type,
            temperature: temp,
            windSpeed: wind,
          });
        }
      }
    }

    // Sort by severity (red first, then orange, then yellow)
    const severityOrder = { red: 0, orange: 1, yellow: 2, green: 3 };
    criticalSpots.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return criticalSpots;
  },
});
