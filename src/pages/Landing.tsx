import { motion } from "framer-motion";
import { ArrowRight, Cloud, CloudRain, Wind, Thermometer, MapPin, Globe } from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: Cloud,
    title: "Real-time Weather",
    description: "Current conditions with temperature, humidity, wind, and UV data updated live from global weather stations.",
  },
  {
    icon: CloudRain,
    title: "7-Day Forecasts",
    description: "Detailed weekly outlooks with precipitation probability, daily ranges, and severe weather alerts.",
  },
  {
    icon: MapPin,
    title: "Location Intelligence",
    description: "Ask about any city worldwide. Natural language understanding lets you ask in your own words.",
  },
  {
    icon: Wind,
    title: "Weather Alerts",
    description: "Automatic warnings for extreme conditions — heat waves, storms, high UV, and strong winds.",
  },
  {
    icon: Thermometer,
    title: "Climate Insights",
    description: "Understand temperature trends, humidity patterns, and seasonal forecasts at a glance.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Weather data for every city on Earth. From Mumbai to New York, we've got you covered.",
  },
];

const STATS = [
  { value: "200K+", label: "Locations" },
  { value: "7-Day", label: "Forecasts" },
  { value: "Real-time", label: "Updates" },
  { value: "Free", label: "Always" },
];

export default function Landing() {
  const navigate = useNavigate();

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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Cloud className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">WeatherGPT</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGetStarted}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background transition-all hover:opacity-90"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Powered by live meteorological data
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
          >
            Weather intelligence,
            <br />
            <span className="text-muted-foreground">in plain language.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            Ask any weather question in natural language. Get real-time conditions,
            forecasts, and alerts for any location on Earth — powered by live
            meteorological data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <button
              onClick={handleGetStarted}
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              Start asking questions
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">No account needed</span>
          </motion.div>

          {/* Sample query cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              "Weather in Mumbai",
              "Forecast for Tokyo",
              "Is it raining in London?",
            ].map((query) => (
              <div
                key={query}
                className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground"
              >
                <span className="mr-1.5 opacity-40">›</span>
                {query}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-8">
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to know
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              From current conditions to weekly forecasts — ask naturally and get
              precise, actionable weather intelligence.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-background p-8"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border/60">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to check the weather?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Ask about any city. Get instant, accurate weather data.
          </p>
          <div className="mt-8">
            <button
              onClick={handleGetStarted}
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              Try WeatherGPT
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">WeatherGPT</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Weather data by Open-Meteo
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
