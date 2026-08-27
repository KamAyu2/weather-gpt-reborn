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
      temperatureMax: data.daily.temperature_2m_max[i] ?? 0,
      temperatureMin: data.daily.temperature_2m_min[i] ?? 0,
      temperatureMean: data.daily.temperature_2m_mean[i] ?? 0,
      precipitationSum: data.daily.precipitation_sum[i] ?? 0,
      weatherCode: data.daily.weather_code[i] ?? 0,
      windSpeedMax: data.daily.wind_speed_10m_max[i] ?? 0,
    }));

    // Calculate summary stats
    const validTemps = dailyData.filter((d: DailyHistorical) => d.temperatureMax !== null);
    const avgTempMax = validTemps.length > 0
      ? validTemps.reduce((sum: number, d: DailyHistorical) => sum + d.temperatureMax, 0) / validTemps.length
      : 0;
    const avgTempMin = validTemps.length > 0
      ? validTemps.reduce((sum: number, d: DailyHistorical) => sum + d.temperatureMin, 0) / validTemps.length
      : 0;
    const totalPrecipitation = dailyData.reduce((sum: number, d: DailyHistorical) => sum + (d.precipitationSum || 0), 0);

    let hottestDay = { date: "", temp: -999 };
    let coldestDay = { date: "", temp: 999 };
    for (const d of dailyData) {
      if (d.temperatureMax > hottestDay.temp) hottestDay = { date: d.date, temp: d.temperatureMax };
      if (d.temperatureMin < coldestDay.temp) coldestDay = { date: d.date, temp: d.temperatureMin };
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
