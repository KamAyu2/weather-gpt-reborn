import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <div className="relative">
      <div className="rounded-xl border border-border/60 bg-white/90 backdrop-blur-sm px-5 py-3 shadow-lg shadow-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Cloud className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="text-sm text-foreground/80">
                {TYPING_TEXTS[textIndex].slice(0, charIndex)}
              </span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-primary ml-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingIcon({ icon: Icon, color, delay, x, y }: { 
  icon: React.ElementType; 
  color: string; 
  delay: number;
  x: number;
  y: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.6, 0.6, 0],
        scale: [0, 1, 1, 0.8],
        y: [0, -20, -40, -60],
        x: [0, x * 0.3, x * 0.6, x],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className={`absolute ${color}`}
      style={{ left: `${50 + x}%`, top: `${60 + y}%` }}
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  );
}

export function AnimatedHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [0, -100],
              x: [0, Math.sin(i) * 30],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Floating weather icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={Cloud} color="text-blue-400/40" delay={0} x={-20} y={0} />
        <FloatingIcon icon={MapPin} color="text-emerald-400/40" delay={1.5} x={20} y={-10} />
        <FloatingIcon icon={Zap} color="text-amber-400/40" delay={3} x={-15} y={5} />
        <FloatingIcon icon={Globe} color="text-violet-400/40" delay={4.5} x={15} y={-5} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="h-3 w-3 text-amber-500" />
            Powered by AI & Real-time Meteorological Data
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight"
        >
          Weather intelligence
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent">
            your team can act on.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto"
        >
          Ask any weather question in plain language. Get real-time conditions,
          forecasts, agriculture advisories, and disaster alerts for any location.
        </motion.p>

        {/* Typing demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 max-w-lg mx-auto"
        >
          <TypingDemo />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = "/auth?returnTo=/dashboard"}
            className="inline-flex h-12 items-center gap-2.5 rounded-full gradient-primary px-6 text-sm font-medium text-white transition-all shadow-lg shadow-primary/30"
          >
            Start using Weather Chat
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <span className="text-xs text-muted-foreground">No credit card required</span>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {["🎤 Voice Input", "🌍 10 Languages", "🌾 Agriculture", "⚠️ Disaster Alerts"].map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="rounded-full border border-border/50 bg-white/80 backdrop-blur-sm px-4 py-2 text-xs text-muted-foreground shadow-sm"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-muted-foreground/40">Scroll to explore</span>
          <div className="h-6 w-4 rounded-full border border-border/50 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1 rounded-full bg-primary/40"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
