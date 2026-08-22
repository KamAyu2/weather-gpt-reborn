import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Cloud, ArrowRight, Sparkles, Zap, Globe, MapPin } from "lucide-react";

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
    <div className="relative">
      <div className="rounded-2xl border border-border/40 glass px-4 sm:px-5 py-3 sm:py-3.5 shadow-xl shadow-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shrink-0 shadow-lg shadow-primary/20">
            <Cloud className="h-4 w-4 text-white" />
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
    </div>
  );
}

function FloatingOrb({ color, size, x, y, delay, duration }: {
  color: string;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 0.6, 0.4, 0.6, 0],
        scale: [0.5, 1, 1.1, 0.9, 0.5],
        x: [0, x * 0.4, x * 0.7, x * 0.3, 0],
        y: [0, y * 0.3, y * 0.6, y * 0.4, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className="absolute rounded-full blur-3xl"
      style={{
        background: color,
        width: size,
        height: size,
        left: `${50 + x}%`,
        top: `${40 + y}%`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

export function AnimatedHero() {
  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* 3D Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb color="oklch(0.55 0.18 250 / 0.08)" size={500} x={-20} y={-10} delay={0} duration={14} />
        <FloatingOrb color="oklch(0.65 0.20 300 / 0.06)" size={400} x={25} y={5} delay={3} duration={18} />
        <FloatingOrb color="oklch(0.70 0.15 200 / 0.05)" size={350} x={-10} y={15} delay={6} duration={16} />
      </div>

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.145 0.01 260 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.145 0.01 260 / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center px-5 sm:px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mb-8 sm:mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/40 glass px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground shadow-lg shadow-black/5 animate-glow-ring">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Powered by AI & Real-time Meteorological Data</span>
            <span className="sm:hidden">AI-Powered Weather</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Weather intelligence
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent gradient-text-animated">
            your team can act on.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="mt-6 sm:mt-8 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto"
        >
          Ask any weather question in plain language. Get real-time conditions,
          forecasts, agriculture advisories, and disaster alerts.
        </motion.p>

        {/* Typing demo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.23, 1, 0.32, 1] }}
          className="mt-8 sm:mt-10 max-w-lg mx-auto"
        >
          <TypingDemo />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.23, 1, 0.32, 1] }}
          className="mt-8 sm:mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href = "/auth?returnTo=/dashboard"}
            className="inline-flex h-13 sm:h-14 items-center gap-3 rounded-full gradient-primary px-8 sm:px-10 text-base sm:text-lg font-semibold text-white transition-all shadow-xl shadow-primary/30 w-full sm:w-auto justify-center magnetic-btn"
          >
            Start using Weather GPT
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          <span className="text-sm text-muted-foreground">No credit card required</span>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15, ease: [0.23, 1, 0.32, 1] }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
        >
          {["🎤 Voice Input", "🌍 10 Languages", "🌾 Agriculture", "⚠️ Disaster Alerts"].map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.7, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-full border border-border/40 glass px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-muted-foreground shadow-md"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-border/40 flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], height: [4, 8, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 rounded-full bg-primary/50"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
