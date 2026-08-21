import { useState } from "react";
import { BarChart3, Thermometer, Droplets, Wind } from "lucide-react";
import type { WeatherData } from "@/convex/weather";

interface WeatherChartProps {
  weatherData: WeatherData;
}

type Metric = "temperature" | "humidity" | "wind" | "rain";

export function WeatherChart({ weatherData }: WeatherChartProps) {
  const [metric, setMetric] = useState<Metric>("temperature");
  const { daily } = weatherData;

  const maxDays = Math.min(daily.length, 7);

  const getData = () => {
    return daily.slice(0, maxDays).map((day, i) => ({
      day: i === 0 ? "Today" : i === 1 ? "Tmrw" : new Date(Date.now() + i * 86400000).toLocaleDateString("en-US", { weekday: "short" }),
      high: Math.round(day.temperatureMax),
      low: Math.round(day.temperatureMin),
      humidity: Math.round(daily[i]?.precipitationProbabilityMax ?? 50),
      wind: Math.round(daily[i]?.windSpeedMax ?? 10),
      rain: Math.round(daily[i]?.precipitationProbabilityMax ?? 0),
    }));
  };

  const data = getData();
  const maxVal = Math.max(...data.map((d) => {
    if (metric === "temperature") return d.high;
    if (metric === "humidity") return d.humidity;
    if (metric === "wind") return d.wind;
    return d.rain;
  }));

  const metrics: { key: Metric; label: string; icon: React.ElementType; color: string }[] = [
    { key: "temperature", label: "Temp", icon: Thermometer, color: "text-orange-500" },
    { key: "humidity", label: "Rain %", icon: Droplets, color: "text-blue-500" },
    { key: "wind", label: "Wind", icon: Wind, color: "text-cyan-500" },
  ];

  const barColors: Record<Metric, string> = {
    temperature: "bg-gradient-to-t from-orange-400 to-orange-300",
    humidity: "bg-gradient-to-t from-blue-400 to-blue-300",
    wind: "bg-gradient-to-t from-cyan-400 to-cyan-300",
    rain: "bg-gradient-to-t from-blue-500 to-blue-400",
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white to-primary/5 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">7-Day Overview</span>
        </div>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                metric === m.key
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <m.icon className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => {
          const value = metric === "temperature" ? d.high : metric === "humidity" ? d.humidity : d.wind;
          const lowVal = metric === "temperature" ? d.low : 0;
          const heightPercent = maxVal > 0 ? (value / maxVal) * 100 : 0;
          const lowPercent = maxVal > 0 ? (lowVal / maxVal) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {/* Value label */}
              <span className="text-[10px] font-medium text-muted-foreground">
                {value}{metric === "temperature" ? "°" : metric === "humidity" ? "%" : ""}
              </span>

              {/* Bar container */}
              <div className="w-full flex flex-col items-center" style={{ height: "80px" }}>
                {metric === "temperature" && (
                  <div
                    className="w-full rounded-t-sm bg-muted/40"
                    style={{ height: `${lowPercent}%`, minHeight: lowPercent > 0 ? "4px" : "0" }}
                  />
                )}
                <div
                  className={`w-full rounded-t-md ${barColors[metric]} transition-all duration-500`}
                  style={{
                    height: `${metric === "temperature" ? Math.max(heightPercent - lowPercent, 5) : Math.max(heightPercent, 5)}%`,
                  }}
                />
              </div>

              {/* Day label */}
              <span className="text-[10px] text-muted-foreground/60 font-medium">{d.day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend for temperature */}
      {metric === "temperature" && (
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-gradient-to-t from-orange-400 to-orange-300" />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-muted/40" />
            Low
          </span>
        </div>
      )}
    </div>
  );
}
