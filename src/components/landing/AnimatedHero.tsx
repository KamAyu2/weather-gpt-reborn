import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Cloud, ArrowRight } from "lucide-react";

const TYPING_TEXTS = [
  "What's the weather in Mumbai?",
  "Should I irrigate crops today?",
  "Any cyclone alerts for Chennai?",
  "7-day forecast for Delhi",
  "Is it safe to fly tomorrow?",
];

function TypingDemo() {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
  }, []);

  useEffect(() => {
    const currentText = TYPING_TEXTS[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setCharIndex(prev => prev + 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex > 0) {
        setCharIndex(prev => prev - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex(prev => (prev + 1) % TYPING_TEXTS.length);
      }
    }, isDeleting ? 30 : 70);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <div className="rounded-lg border border-border/60 bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Cloud className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="text-sm sm:text-base text-foreground/80 truncate">
              {TYPING_TEXTS[textIndex].slice(0, isMobile ? Math.min(charIndex, 35) : charIndex)}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-primary ml-0.5 shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnimatedHero() {
  return (
    <div className="relative min-h-[85dvh] flex items-center justify-center">
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            AI-Powered Weather
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15]">
          Weather intelligence
          <br />
          <span className="text-primary">
            your team can act on.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto">
          Ask any weather question in plain language. Get real-time conditions,
          forecasts, agriculture advisories, and disaster alerts.
        </p>

        {/* Typing demo */}
        <div className="mt-8 max-w-md mx-auto">
          <TypingDemo />
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.location.href = "/auth?returnTo=/dashboard"}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-7 text-base font-medium text-primary-foreground transition-opacity w-full sm:w-auto justify-center magnetic-btn"
          >
            Start using Weather GPT
            <ArrowRight className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">No credit card required</span>
        </div>

        {/* Feature pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {["🎤 Voice Input", "🌍 10 Languages", "🌾 Agriculture", "⚠️ Disaster Alerts"].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-border/60 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
