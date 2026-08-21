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
  timezone: string;
}

export const geocodeLocation = action({
  args: { query: v.string() },
  handler: async (_ctx, args) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding request failed");
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`Location "${args.query}" not found. Please try a different city or place name.`);
    }
    return data.results as GeocodingResult[];
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
