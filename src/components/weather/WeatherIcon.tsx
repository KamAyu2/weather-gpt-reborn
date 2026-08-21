import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudSun,
  Moon,
  CloudMoon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WMO_ICON_MAP: Record<number, { Icon: LucideIcon; color: string; bg: string }> = {
  0:  { Icon: Sun,          color: "text-amber-500",    bg: "bg-amber-500/10" },  // Clear sky
  1:  { Icon: Sun,          color: "text-amber-400",    bg: "bg-amber-400/10" },  // Mainly clear
  2:  { Icon: CloudSun,     color: "text-sky-400",      bg: "bg-sky-400/10" },   // Partly cloudy
  3:  { Icon: Cloud,        color: "text-gray-400",     bg: "bg-gray-400/10" },  // Overcast
  45: { Icon: CloudFog,     color: "text-gray-400",     bg: "bg-gray-400/10" },  // Foggy
  48: { Icon: CloudFog,     color: "text-gray-400",     bg: "bg-gray-400/10" },  // Rime fog
  51: { Icon: CloudDrizzle, color: "text-sky-400",      bg: "bg-sky-400/10" },   // Light drizzle
  53: { Icon: CloudDrizzle, color: "text-sky-400",      bg: "bg-sky-400/10" },   // Moderate drizzle
  55: { Icon: CloudDrizzle, color: "text-sky-500",      bg: "bg-sky-500/10" },   // Dense drizzle
  56: { Icon: CloudDrizzle, color: "text-sky-500",      bg: "bg-sky-500/10" },   // Freezing drizzle
  57: { Icon: CloudDrizzle, color: "text-sky-600",      bg: "bg-sky-600/10" },   // Dense freezing drizzle
  61: { Icon: CloudRain,    color: "text-blue-400",     bg: "bg-blue-400/10" },  // Slight rain
  63: { Icon: CloudRain,    color: "text-blue-500",     bg: "bg-blue-500/10" },  // Moderate rain
  65: { Icon: CloudRain,    color: "text-blue-600",     bg: "bg-blue-600/10" },  // Heavy rain
  66: { Icon: CloudRain,    color: "text-blue-500",     bg: "bg-blue-500/10" },  // Freezing rain
  67: { Icon: CloudRain,    color: "text-blue-600",     bg: "bg-blue-600/10" },  // Heavy freezing rain
  71: { Icon: CloudSnow,    color: "text-sky-300",      bg: "bg-sky-300/10" },   // Slight snow
  73: { Icon: CloudSnow,    color: "text-sky-400",      bg: "bg-sky-400/10" },   // Moderate snow
  75: { Icon: CloudSnow,    color: "text-sky-500",      bg: "bg-sky-500/10" },   // Heavy snow
  77: { Icon: CloudSnow,    color: "text-sky-300",      bg: "bg-sky-300/10" },   // Snow grains
  80: { Icon: CloudRain,    color: "text-blue-400",     bg: "bg-blue-400/10" },  // Slight rain showers
  81: { Icon: CloudRain,    color: "text-blue-500",     bg: "bg-blue-500/10" },  // Moderate rain showers
  82: { Icon: CloudRain,    color: "text-blue-600",     bg: "bg-blue-600/10" },  // Violent rain showers
  85: { Icon: CloudSnow,    color: "text-sky-300",      bg: "bg-sky-300/10" },   // Slight snow showers
  86: { Icon: CloudSnow,    color: "text-sky-500",      bg: "bg-sky-500/10" },   // Heavy snow showers
  95: { Icon: CloudLightning, color: "text-violet-500", bg: "bg-violet-500/10" },// Thunderstorm
  96: { Icon: CloudLightning, color: "text-violet-500", bg: "bg-violet-500/10" },// Thunderstorm with hail
  99: { Icon: CloudLightning, color: "text-violet-600", bg: "bg-violet-600/10" },// Thunderstorm with heavy hail
};

export function getWeatherIconInfo(code: number) {
  return WMO_ICON_MAP[code] || { Icon: Sun, color: "text-gray-400", bg: "bg-gray-400/10" };
}

interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

export function WeatherIcon({ code, size = 24, className = "" }: WeatherIconProps) {
  const { Icon, color } = getWeatherIconInfo(code);
  return <Icon size={size} className={`${color} ${className}`} />;
}
