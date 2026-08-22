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
  },
  {
    icon: CloudRain,
    title: "7-Day Forecasts",
    description: "Daily breakdowns with precipitation probability, temperature ranges, and wind forecasts to plan with confidence.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Sprout,
    title: "Agriculture Advisory",
    description: "Crop-specific weather advice for farmers — irrigation timing, sowing conditions, pest alerts, and harvest windows.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: AlertTriangle,
    title: "Disaster Alerts",
    description: "Real-time severe weather monitoring — cyclones, floods, heatwaves, cold waves, and thunderstorm warnings.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak your weather query naturally. Designed for rural accessibility where typing may be difficult.",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: Languages,
    title: "10 Indian Languages",
    description: "Full multilingual support — English, Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.",
    color: "from-violet-400 to-indigo-500",
  },
  {
    icon: MessageCircle,
    title: "AI-Powered Chat",
    description: "Ask anything — weather questions, general knowledge, or just chat. Our AI handles all conversations naturally.",
    color: "from-teal-400 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Meteorological data for every region on Earth. From local conditions to international forecasts.",
    color: "from-sky-400 to-blue-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
    },
  },
};

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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass safe-area-top">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight">Weather GPT</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-300"
              title="Toggle theme"
            >
              {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleGetStarted}
              className="inline-flex h-9 items-center gap-2 rounded-full gradient-primary px-4 text-sm font-semibold text-white magnetic-btn shadow-lg shadow-primary/25"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Animated Hero ──────────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ─── Animated Stats ────────────────────────────────────────────── */}
      <AnimatedStats />

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 glass px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-6"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Why Weather GPT
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            >
              Built for teams that need answers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-5 text-lg sm:text-xl leading-relaxed text-muted-foreground"
            >
              From daily operations to long-range planning — get precise weather
              data when and where you need it.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="perspective-1000"
              >
                <div className="h-full rounded-2xl border border-border/40 glass p-6 sm:p-7 card-3d shadow-sm">
                  <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Section divider ────────────────────────────────────────────── */}
      <div className="section-divider mx-6" />

      {/* ─── Live Demo ──────────────────────────────────────────────────── */}
      <LiveDemo />

      {/* ─── Section divider ────────────────────────────────────────────── */}
      <div className="section-divider mx-6" />

      {/* ─── Tech Stack ──────────────────────────────────────────────────── */}
      <TechStack />

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-20 sm:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-orb" />
          <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-3xl animate-orb-delay" />
        </div>

        <div className="relative mx-auto max-w-2xl px-5 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 sm:mt-5 text-lg sm:text-xl text-muted-foreground"
          >
            Ask about any location and receive instant, accurate weather data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 sm:mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGetStarted}
              className="inline-flex h-14 items-center gap-3 rounded-full gradient-primary px-8 sm:px-10 text-lg font-semibold text-white magnetic-btn shadow-xl shadow-primary/30 w-full sm:w-auto justify-center"
            >
              Open Weather GPT
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8 sm:py-10 bg-muted/30 safe-area-bottom">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/15">
                <Cloud className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">Weather GPT</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Weather data by Open-Meteo
            </span>
          </div>
          <div className="mt-5 pt-5 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by <span className="font-bold text-foreground">Team Craxzy</span>
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
