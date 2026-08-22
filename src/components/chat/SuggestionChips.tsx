import { CloudRain, MapPin, Thermometer, Wind, MessageCircle, HelpCircle, Snowflake, Sun, Sprout, AlertTriangle, Lightbulb, BookOpen } from "lucide-react";

const SUGGESTIONS = [
  { text: "What's the weather in Mumbai?", icon: Thermometer, color: "text-orange-500" },
  { text: "7-day forecast for Delhi", icon: CloudRain, color: "text-blue-500" },
  { text: "Weather in my village in Punjab", icon: MapPin, color: "text-emerald-500" },
  { text: "Should I irrigate crops in Pune?", icon: Sprout, color: "text-green-500" },
  { text: "Any cyclone alerts for Chennai?", icon: AlertTriangle, color: "text-red-500" },
  { text: "Tell me a joke", icon: MessageCircle, color: "text-violet-500" },
  { text: "What's the capital of France?", icon: BookOpen, color: "text-indigo-500" },
  { text: "UV index in Shimla today", icon: Sun, color: "text-yellow-500" },
  { text: "How do I make chai?", icon: Lightbulb, color: "text-amber-500" },
  { text: "Weather in Srinagar this week", icon: Snowflake, color: "text-sky-500" },
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
