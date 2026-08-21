import { CloudRain, MapPin, Thermometer, Wind, MessageCircle, HelpCircle, Snowflake, Sun } from "lucide-react";

const SUGGESTIONS = [
  { text: "What's the weather in Mumbai?", icon: Thermometer, color: "text-orange-500" },
  { text: "7-day forecast for Delhi", icon: CloudRain, color: "text-blue-500" },
  { text: "Is it raining in London?", icon: MapPin, color: "text-emerald-500" },
  { text: "Wind conditions in Tokyo", icon: Wind, color: "text-cyan-500" },
  { text: "Tell me a joke", icon: MessageCircle, color: "text-violet-500" },
  { text: "What's the capital of France?", icon: HelpCircle, color: "text-amber-500" },
  { text: "Snow forecast for Moscow", icon: Snowflake, color: "text-sky-500" },
  { text: "UV index in Sydney today", icon: Sun, color: "text-yellow-500" },
];

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.text}
          onClick={() => onSelect(suggestion.text)}
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary shadow-sm card-hover"
        >
          <suggestion.icon className={`h-3.5 w-3.5 ${suggestion.color}`} />
          {suggestion.text}
        </button>
      ))}
    </div>
  );
}
