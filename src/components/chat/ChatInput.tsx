import { ArrowUp, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  voiceInput?: React.ReactNode;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
  placeholder = "Ask about the weather…",
  voiceInput,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-border/50 bg-gradient-to-t from-background to-background/80 backdrop-blur-xl sm:pb-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mb-0 mb-12">
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white/80 shadow-sm px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/10">
          {voiceInput}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Scroll input into view on mobile when keyboard opens
              setTimeout(() => textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300);
            }}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading || !value.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
          Weather data by Open-Meteo · Not for aviation or safety-critical use
        </p>
      </div>
    </div>
  );
}
