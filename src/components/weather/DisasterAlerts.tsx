import { AlertTriangle, CloudLightning, Thermometer, Snowflake, Wind, Eye } from "lucide-react";
import type { WeatherData } from "@/convex/weather";

interface DisasterAlertsProps {
  weatherData: WeatherData;
  location?: string;
}

interface Alert {
  type: "flood" | "cyclone" | "heatwave" | "coldwave" | "storm" | "wind";
  title: string;
  message: string;
  severity: "watch" | "warning" | "danger";
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function generateDisasterAlerts(weatherData: WeatherData): Alert[] {
  const { current, daily } = weatherData;
  const alerts: Alert[] = [];

  // Heatwave Alert
  if (current.temperature >= 42) {
    alerts.push({
      type: "heatwave",
      title: "Extreme Heatwave Warning",
      message: `Dangerous heat conditions at ${Math.round(current.temperature)}°C. Avoid outdoor activities, stay hydrated, and check on vulnerable people.`,
      severity: "danger",
      icon: Thermometer,
      color: "text-red-600",
      bgColor: "bg-red-500/10 border-red-500/30",
    });
  } else if (current.temperature >= 38) {
    alerts.push({
      type: "heatwave",
      title: "Heatwave Advisory",
      message: `Very hot at ${Math.round(current.temperature)}°C. Take precautions: drink plenty of water, wear light clothing, and avoid midday sun.`,
      severity: "warning",
      icon: Thermometer,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10 border-orange-500/30",
    });
  }

  // Cold Wave Alert
  if (current.temperature <= 2) {
    alerts.push({
      type: "coldwave",
      title: "Severe Cold Wave Warning",
      message: `Freezing conditions at ${Math.round(current.temperature)}°C. Risk of hypothermia and frostbite. Keep warm and limit outdoor exposure.`,
      severity: "danger",
      icon: Snowflake,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/30",
    });
  } else if (current.temperature <= 8) {
    alerts.push({
      type: "coldwave",
      title: "Cold Wave Advisory",
      message: `Cold conditions at ${Math.round(current.temperature)}°C. Dress warmly and protect sensitive crops from frost.`,
      severity: "warning",
      icon: Snowflake,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10 border-sky-500/30",
    });
  }

  // Thunderstorm Alert
  if (current.weatherCode >= 95) {
    alerts.push({
      type: "storm",
      title: "Thunderstorm Alert",
      message: "Active thunderstorm in the area. Seek shelter immediately, avoid open areas, and stay away from tall objects.",
      severity: "danger",
      icon: CloudLightning,
      color: "text-violet-600",
      bgColor: "bg-violet-500/10 border-violet-500/30",
    });
  } else if (daily.some(d => d.weatherCode >= 95)) {
    alerts.push({
      type: "storm",
      title: "Thunderstorm Watch",
      message: "Thunderstorms possible in the coming days. Stay weather-aware and have a shelter plan ready.",
      severity: "watch",
      icon: CloudLightning,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10 border-violet-500/30",
    });
  }

  // Wind Alert
  if (current.windSpeed >= 60) {
    alerts.push({
      type: "wind",
      title: "Severe Wind Warning",
      message: `Dangerous winds at ${Math.round(current.windSpeed)} km/h. Secure loose objects, avoid travel, and stay indoors.`,
      severity: "danger",
      icon: Wind,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10 border-cyan-500/30",
    });
  } else if (current.windSpeed >= 40) {
    alerts.push({
      type: "wind",
      title: "Strong Wind Advisory",
      message: `Strong winds at ${Math.round(current.windSpeed)} km/h. Be cautious outdoors and secure lightweight objects.`,
      severity: "warning",
      icon: Wind,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10 border-cyan-500/30",
    });
  }

  // Heavy Rain / Flood Risk
  const heavyRainDays = daily.filter(d => d.precipitationSum > 50).length;
  if (heavyRainDays >= 2) {
    alerts.push({
      type: "flood",
      title: "Flood Risk Alert",
      message: `${heavyRainDays} days of heavy rain expected. Risk of flooding in low-lying areas. Avoid flood-prone zones and stay informed.`,
      severity: "warning",
      icon: AlertTriangle,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/30",
    });
  }

  return alerts;
}

export function DisasterAlerts({ weatherData, location }: DisasterAlertsProps) {
  const alerts = generateDisasterAlerts(weatherData);

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200/60 dark:border-green-800/40 bg-green-50/80 dark:bg-green-950/30 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
            <Eye className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">All Clear</h3>
            <p className="text-xs text-green-700/80 dark:text-green-400/80 font-medium">
              No severe weather alerts for {location || "this area"}. Conditions are safe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/30 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Weather Alerts</h3>
            <p className="text-[10px] text-foreground/60 font-medium">{alerts.length} active alert{alerts.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl p-3 border ${alert.bgColor}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-background/50 ${alert.color}`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-semibold ${alert.color}`}>{alert.title}</h4>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                    alert.severity === "danger" ? "bg-red-500/20 text-red-600" :
                    alert.severity === "warning" ? "bg-amber-500/20 text-amber-600" :
                    "bg-blue-500/20 text-blue-600"
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/70">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
