import { CloudRain, MapPin, Thermometer, Wind } from "lucide-react";

const SUGGESTIONS = [
  { text: "What's the weather in Mumbai?", icon: Thermometer },
  { text: "7-day forecast for Delhi", icon: CloudRain },
  { text: "Is it raining in London?", icon: MapPin },
  { text: "Wind conditions in Tokyo", icon: Wind },
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
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted/60 hover:text-foreground"
        >
          <suggestion.icon className="h-3.5 w-3.5" />
          {suggestion.text}
        </button>
      ))}
    </div>
  );
}
