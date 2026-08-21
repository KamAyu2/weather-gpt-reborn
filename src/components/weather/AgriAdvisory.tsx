import { Sprout, Droplets, Bug, Scissors, AlertTriangle, CheckCircle } from "lucide-react";
import type { WeatherData } from "@/convex/weather";

interface AgriAdvisoryProps {
  weatherData: WeatherData;
}

interface Advisory {
  type: "irrigation" | "sowing" | "pest" | "harvest";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  icon: React.ElementType;
  color: string;
}

function generateAdvisories(weatherData: WeatherData): Advisory[] {
  const { current, daily } = weatherData;
  const today = daily[0];
  const advisories: Advisory[] = [];

  // Irrigation Advisory
  if (current.humidity < 40 && current.temperature > 30) {
    advisories.push({
      type: "irrigation",
      title: "Irrigation Needed",
      message: "Low humidity and high temperature detected. Crops may need irrigation today. Water early morning or late evening for best results.",
      severity: "high",
      icon: Droplets,
      color: "text-blue-500 bg-blue-500/10",
    });
  } else if (current.humidity > 80 || today.precipitationProbabilityMax > 60) {
    advisories.push({
      type: "irrigation",
      title: "Skip Irrigation",
      message: "High humidity or rain expected. Skip irrigation today to prevent waterlogging and root diseases.",
      severity: "medium",
      icon: Droplets,
      color: "text-emerald-500 bg-emerald-500/10",
    });
  }

  // Sowing Advisory
  if (today.temperatureMin >= 15 && today.temperatureMax <= 35 && current.humidity >= 50) {
    advisories.push({
      type: "sowing",
      title: "Good Sowing Conditions",
      message: "Temperature and humidity are favorable for sowing. Consider planting crops today.",
      severity: "low",
      icon: Sprout,
      color: "text-green-500 bg-green-500/10",
    });
  } else if (today.temperatureMin < 10 || today.temperatureMax > 40) {
    advisories.push({
      type: "sowing",
      title: "Avoid Sowing Today",
      message: "Extreme temperatures detected. Delay sowing until conditions improve to ensure better germination.",
      severity: "high",
      icon: Sprout,
      color: "text-red-500 bg-red-500/10",
    });
  }

  // Pest Advisory
  if (current.humidity > 70 && current.temperature > 25 && current.temperature < 35) {
    advisories.push({
      type: "pest",
      title: "Pest Risk Alert",
      message: "Warm and humid conditions favor pest growth. Monitor crops for aphids, mites, and fungal diseases. Consider preventive measures.",
      severity: "medium",
      icon: Bug,
      color: "text-amber-500 bg-amber-500/10",
    });
  }

  // Harvest Advisory
  if (current.humidity < 60 && today.precipitationProbabilityMax < 20) {
    advisories.push({
      type: "harvest",
      title: "Good Harvest Conditions",
      message: "Dry conditions with low rain probability. Ideal for harvesting mature crops and drying grains.",
      severity: "low",
      icon: Scissors,
      color: "text-purple-500 bg-purple-500/10",
    });
  } else if (today.precipitationProbabilityMax > 50) {
    advisories.push({
      type: "harvest",
      title: "Delay Harvest",
      message: "Rain expected today. Delay harvesting to prevent crop damage and grain spoilage.",
      severity: "high",
      icon: Scissors,
      color: "text-red-500 bg-red-500/10",
    });
  }

  return advisories;
}

export function AgriAdvisory({ weatherData }: AgriAdvisoryProps) {
  const advisories = generateAdvisories(weatherData);

  if (advisories.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
            <Sprout className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Agriculture Advisory</h3>
            <p className="text-[10px] text-muted-foreground">Crop-specific weather advice</p>
          </div>
        </div>

        <div className="space-y-3">
          {advisories.map((advisory, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-white/80 dark:bg-background/50 p-3 border border-border/30"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${advisory.color}`}>
                <advisory.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-medium">{advisory.title}</h4>
                  {advisory.severity === "high" && (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  )}
                  {advisory.severity === "low" && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {advisory.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
