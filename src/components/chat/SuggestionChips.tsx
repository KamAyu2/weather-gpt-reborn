import { CloudRain, MapPin, Thermometer, MessageCircle, HelpCircle, Snowflake, Sun, Sprout, AlertTriangle, Lightbulb, BookOpen, History, Cpu, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const SUGGESTION_KEYS = [
  { key: "suggestion.weather", icon: Thermometer, color: "text-orange-500" },
  { key: "suggestion.forecast", icon: CloudRain, color: "text-blue-500" },
  { key: "suggestion.village", icon: MapPin, color: "text-emerald-500" },
  { key: "suggestion.irrigate", icon: Sprout, color: "text-green-500" },
  { key: "suggestion.cyclone", icon: AlertTriangle, color: "text-red-500" },
  { key: "suggestion.historical", icon: History, color: "text-teal-500" },
  { key: "suggestion.nwp", icon: Cpu, color: "text-cyan-500" },
  { key: "suggestion.climate", icon: TrendingUp, color: "text-purple-500" },
  { key: "suggestion.joke", icon: MessageCircle, color: "text-violet-500" },
  { key: "suggestion.capital", icon: BookOpen, color: "text-indigo-500" },
  { key: "suggestion.uv", icon: Sun, color: "text-yellow-500" },
  { key: "suggestion.chai", icon: Lightbulb, color: "text-amber-500" },
  { key: "suggestion.srinagar", icon: Snowflake, color: "text-sky-500" },
];

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  const { translate } = useLanguage();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTION_KEYS.map((suggestion) => {
        const text = translate(suggestion.key);
        return (
          <button
            key={suggestion.key}
            onClick={() => onSelect(text)}
            className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary shadow-sm card-hover"
          >
            <suggestion.icon className={`h-3.5 w-3.5 ${suggestion.color}`} />
            {text}
          </button>
        );
      })}
    </div>
  );
}
