import { motion } from "framer-motion";
import { ArrowRight, Cloud, CloudRain, Wind, Thermometer, MapPin, Globe, Star, Sun, Moon, MessageCircle, Zap, Shield, Sprout, AlertTriangle, Mic, Languages } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "@/hooks/use-theme";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { TechStack } from "@/components/landing/TechStack";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { AnimatedStats } from "@/components/landing/AnimatedStats";

const FEATURES = [
  {
    icon: Cloud,
    title: "Real-Time Conditions",
    description: "Current temperature, humidity, wind speed, UV index, and atmospheric pressure — updated continuously from global weather stations.",
    color: "from-blue-400 to-cyan-500",
    iconColor: "text-blue-500",
  },
  {
    icon: CloudRain,
    title: "7-Day Forecasts",
    description: "Daily breakdowns with precipitation probability, temperature ranges, and wind forecasts to plan with confidence.",
    color: "from-indigo-400 to-purple-500",
    iconColor: "text-indigo-500",
  },
  {
    icon: Sprout,
    title: "Agriculture Advisory",
    description: "Crop-specific weather advice for farmers — irrigation timing, sowing conditions, pest alerts, and harvest windows.",
    color: "from-green-400 to-emerald-500",
    iconColor: "text-green-500",
  },
  {
    icon: AlertTriangle,
    title: "Disaster Alerts",
    description: "Real-time severe weather monitoring — cyclones, floods, heatwaves, cold waves, and thunderstorm warnings.",
    color: "from-orange-400 to-red-500",
    iconColor: "text-orange-500",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak your weather query naturally. Designed for rural accessibility where typing may be difficult.",
    color: "from-rose-400 to-pink-500",
    iconColor: "text-rose-500",
  },
  {
    icon: Languages,
    title: "10 Indian Languages",
    description: "Full multilingual support — English, Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.",
    color: "from-violet-400 to-indigo-500",
    iconColor: "text-violet-500",
  },
  {
    icon: MessageCircle,
    title: "AI-Powered Chat",
    description: "Ask anything — weather questions, general knowledge, or just chat. Our AI handles all conversations naturally.",
    color: "from-teal-400 to-cyan-500",
    iconColor: "text-teal-500",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Meteorological data for every region on Earth. From local conditions to international forecasts.",
    color: "from-sky-400 to-blue-500",
    iconColor: "text-sky-500",
  },
];

const STATS = [
  { value: "200K+", label: "Locations", icon: MapPin },
  { value: "10", label: "Languages", icon: Languages },
  { value: "Real-time", label: "Updates", icon: Zap },
  { value: "24/7", label: "Available", icon: Shield },
];

export default function Landing() {
  const navigate = useNavigate();
  const { resolved: currentTheme, toggle: toggleTheme } = useTheme();

  const handleGetStarted = () => {
    navigate("/auth?returnTo=/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col"
    >
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-top">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-lg gradient-primary">
              <Cloud className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Weather Chat</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title="Toggle theme"
            >
              {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleGetStarted}
              className="inline-flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-full gradient-primary px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-white transition-all hover:opacity-90 shadow-lg shadow-primary/25"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Animated Hero ──────────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ─── Animated Stats ────────────────────────────────────────────── */}
      <AnimatedStats />

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for teams that need answers
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              From daily operations to long-range planning — get precise weather
              data when and where you need it.
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm p-5 sm:p-6 card-hover shadow-sm"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Demo ──────────────────────────────────────────────────── */}
      <LiveDemo />

      {/* ─── Tech Stack ──────────────────────────────────────────────────── */}
      <TechStack />

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="mx-auto max-w-2xl px-5 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
            Ask about any location and receive instant, accurate weather data.
          </p>
          <div className="mt-6 sm:mt-8">
            <button
              onClick={handleGetStarted}
              className="inline-flex h-11 sm:h-12 items-center gap-2 sm:gap-2.5 rounded-full gradient-primary px-5 sm:px-6 text-sm font-medium text-white transition-all hover:opacity-90 shadow-lg shadow-primary/30 w-full sm:w-auto justify-center"
            >
              Open Weather Chat
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-6 sm:py-8 bg-muted/30 safe-area-bottom">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-primary">
              <Cloud className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium">Weather Chat</span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            Weather data by Open-Meteo
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
