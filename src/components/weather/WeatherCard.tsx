import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Thermometer, AlertTriangle } from "lucide-react";
import { WeatherIcon, getWeatherIconInfo } from "./WeatherIcon";
import type { WeatherData } from "@/convex/weather";
import { useLanguage } from "@/lib/i18n";

interface WeatherCardProps {
  weatherData: WeatherData;
  compact?: boolean;
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}

function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-emerald-500" };
  if (uv <= 5) return { label: "Moderate", color: "text-amber-500" };
  if (uv <= 7) return { label: "High", color: "text-orange-500" };
  if (uv <= 10) return { label: "Very High", color: "text-red-500" };
  return { label: "Extreme", color: "text-red-600" };
}

function getWeatherDescription(code: number, translate?: (key: string) => string): string {
  const keyMap: Record<number, string> = {
    0: 'weather.clearSky', 1: 'weather.mainlyClear', 2: 'weather.partlyCloudy', 3: 'weather.overcast',
    45: 'weather.foggy', 48: 'weather.foggy',
    51: 'weather.lightDrizzle', 53: 'weather.lightDrizzle', 55: 'weather.lightDrizzle',
    61: 'weather.moderateRain', 63: 'weather.moderateRain', 65: 'weather.heavyRain',
    71: 'weather.slightSnow', 73: 'weather.moderateSnow', 75: 'weather.heavySnow',
    80: 'weather.rainShowers', 81: 'weather.rainShowers', 82: 'weather.heavyRain',
    95: 'weather.thunderstorm', 96: 'weather.thunderstorm', 99: 'weather.severeThunderstorm',
  };
  const key = keyMap[code];
  return key && translate ? translate(key) : (keyMap[code] || 'Unknown');
}

function formatDay(index: number, translate?: (key: string) => string): string {
  if (index === 0) return translate ? translate('weather.todayLabel') : 'Today';
  if (index === 1) return translate ? translate('weather.tmrwLabel') : 'Tmrw';
  return new Date(Date.now() + index * 86400000).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ─── Stat Item ───────────────────────────────────────────────────────────────

function StatItem({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 bg-muted/30 rounded-xl p-2.5">
      <div className="flex items-center gap-1.5 text-foreground/60">
        <Icon className="h-3 w-3" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground">{value}</span>
      {sub &&        <span className="text-xs text-foreground/60 font-medium">{sub}</span>}
    </div>
  );
}

// ─── Alert Banner ────────────────────────────────────────────────────────────

function AlertBanner({ type, message }: { type: "heat" | "cold" | "wind" | "uv" | "storm"; message: string }) {
  const styles = {
    heat:  "border-amber-500/30 bg-amber-500/5 text-amber-600",
    cold:  "border-sky-500/30 bg-sky-500/5 text-sky-600",
    wind:  "border-orange-500/30 bg-orange-500/5 text-orange-600",
    uv:    "border-red-500/30 bg-red-500/5 text-red-600",
    storm: "border-violet-500/30 bg-violet-500/5 text-violet-600",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 mt-4 ${styles[type]}`}>
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-xs leading-relaxed">{message}</p>
    </div>
  );
}

// ─── Compact Card (for dashboard widget) ─────────────────────────────────────

export function WeatherCardCompact({ weatherData }: { weatherData: WeatherData }) {
  const { location, current, daily } = weatherData;
  const today = daily[0];
  const uv = getUVLevel(current.uvIndex);
  const { translate } = useLanguage();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/70 font-medium">{location.name}, {location.country}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-foreground drop-shadow-sm">{Math.round(current.temperature)}</span>
            <span className="text-lg font-medium text-foreground/70">°C</span>
          </div>
          <p className="mt-0.5 text-xs text-foreground/70 font-medium">{getWeatherDescription(current.weatherCode, translate)}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${getWeatherIconInfo(current.weatherCode).bg}`}>
          <WeatherIcon code={current.weatherCode} size={28} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatItem icon={Thermometer} label="Feels" value={`${Math.round(current.apparentTemperature)}°`} />
        <StatItem icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
        <StatItem icon={Wind} label="Wind" value={`${Math.round(current.windSpeed)} km/h`} sub={getWindDirection(current.windDirection)} />
      </div>

      {today && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-foreground/70 font-medium">{translate('weather.highLabel')} {Math.round(today.temperatureMax)}°</span>
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/70 font-medium">{translate('weather.lowLabel')} {Math.round(today.temperatureMin)}°</span>
          </div>
          {today.sunrise && (
            <div className="flex items-center gap-1.5 text-[10px] text-foreground/50 font-medium">
              <Sunrise className="h-3 w-3" />
              {formatTime(today.sunrise)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Full Card (for chat responses) ──────────────────────────────────────────

export function WeatherCard({ weatherData }: WeatherCardProps) {
  const { location, current, daily } = weatherData;
  const today = daily[0];
  const uv = getUVLevel(current.uvIndex);
  const windDir = getWindDirection(current.windDirection);
  const { translate } = useLanguage();

  // Determine alerts
  const alerts: Array<{ type: "heat" | "cold" | "wind" | "uv" | "storm"; message: string }> = [];
  if (current.temperature >= 40) alerts.push({ type: "heat", message: translate('weather.heatAdvisory') });
  else if (current.temperature <= 0) alerts.push({ type: "cold", message: translate('weather.coldAdvisory') });
  if (current.windSpeed >= 50) alerts.push({ type: "wind", message: translate('weather.windAdvisory') });
  if (current.uvIndex >= 8) alerts.push({ type: "uv", message: `${translate('weather.uvAlert')} (${current.uvIndex}).` });
  if (current.weatherCode >= 95) alerts.push({ type: "storm", message: translate('weather.stormAlert') });

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-md">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-foreground/60 font-medium">
              {location.name}{location.country ? `, ${location.country}` : ""}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight leading-none text-foreground drop-shadow-sm">
                {Math.round(current.temperature)}
              </span>
              <span className="text-xl font-medium text-foreground/70">°C</span>
            </div>
            <p className="mt-1 text-sm text-foreground/80 font-medium">
              {translate('weather.feelsLike')} {Math.round(current.apparentTemperature)}° · {getWeatherDescription(current.weatherCode, translate)}
            </p>
          </div>
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${getWeatherIconInfo(current.weatherCode).bg}`}>
            <WeatherIcon code={current.weatherCode} size={32} />
          </div>
        </div>

        {/* ─── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <StatItem icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
          <StatItem icon={Wind} label="Wind" value={`${Math.round(current.windSpeed)} km/h`} sub={windDir} />
          <StatItem icon={Eye} label="UV Index" value={`${current.uvIndex}`} sub={uv.label} />
          <StatItem icon={Gauge} label="Pressure" value={`${Math.round(current.pressure)} hPa`} />
        </div>

        {/* ─── Today Row ──────────────────────────────────────────────────── */}
        {today && (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-muted/30 px-4 py-3 text-xs">
            <div className="flex items-center gap-1.5 text-foreground/70 font-medium">
              <Thermometer className="h-3.5 w-3.5" />
              <span>{Math.round(today.temperatureMin)}° / {Math.round(today.temperatureMax)}°</span>
            </div>
            {today.precipitationProbabilityMax > 0 && (
              <span className="text-blue-500">{today.precipitationProbabilityMax}% rain</span>
            )}
            {today.sunrise && (
              <div className="flex items-center gap-1 text-foreground/50 font-medium">
                <Sunrise className="h-3 w-3" />
                {formatTime(today.sunrise)}
              </div>
            )}
            {today.sunset && (
              <div className="flex items-center gap-1 text-foreground/50 font-medium">
                <Sunset className="h-3 w-3" />
                {formatTime(today.sunset)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 7-Day Forecast ─────────────────────────────────────────────── */}
      <div className="border-t border-border/50 px-6 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
          7-Day Forecast
        </p>
        <div className="grid grid-cols-7 gap-1">
          {daily.slice(0, 7).map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition-colors hover:bg-muted/30">
              <span className="text-[10px] font-medium text-muted-foreground">{formatDay(i, translate)}</span>
              <WeatherIcon code={day.weatherCode} size={18} />
              <span className="text-xs font-medium">{Math.round(day.temperatureMax)}°</span>
              <span className="text-[10px] text-foreground/50 font-medium">{Math.round(day.temperatureMin)}°</span>
              {day.precipitationProbabilityMax > 20 && (
                <span className="text-[9px] text-blue-500">{day.precipitationProbabilityMax}% {translate('weather.rainChanceLabel')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Alerts ──────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="border-t border-border/50 px-6 py-4">
          {alerts.map((alert, i) => (
            <AlertBanner key={i} type={alert.type} message={alert.message} />
          ))}
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <div className="border-t border-border/50 bg-muted/10 px-6 py-2.5">
        <p className="text-center text-[10px] text-foreground/40 font-medium">
          Data from Open-Meteo · Not for aviation or safety-critical use
        </p>
      </div>
    </div>
  );
}
