import { ArrowRight, Cloud, CloudRain, Globe, Sun, Moon, MessageCircle, Zap, Sprout, AlertTriangle, Mic, Languages } from "lucide-react";
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
  },
  {
    icon: CloudRain,
    title: "7-Day Forecasts",
    description: "Daily breakdowns with precipitation probability, temperature ranges, and wind forecasts to plan with confidence.",
  },
  {
    icon: Sprout,
    title: "Agriculture Advisory",
    description: "Crop-specific weather advice for farmers — irrigation timing, sowing conditions, pest alerts, and harvest windows.",
  },
  {
    icon: AlertTriangle,
    title: "Disaster Alerts",
    description: "Real-time severe weather monitoring — cyclones, floods, heatwaves, cold waves, and thunderstorm warnings.",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak your weather query naturally. Designed for rural accessibility where typing may be difficult.",
  },
  {
    icon: Languages,
    title: "10 Indian Languages",
    description: "Full multilingual support — English, Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.",
  },
  {
    icon: MessageCircle,
    title: "AI-Powered Chat",
    description: "Ask anything — weather questions, general knowledge, or just chat. Our AI handles all conversations naturally.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Meteorological data for every region on Earth. From local conditions to international forecasts.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { resolved: currentTheme, toggle: toggleTheme } = useTheme();

  const handleGetStarted = () => {
    navigate("/auth?returnTo=/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header role="banner" className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm safe-area-top">
      <nav aria-label="Main navigation" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Cloud className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Weather GPT</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {currentTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleGetStarted}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground magnetic-btn"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
      </nav>
      </header>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main role="main" id="main-content">
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ─── Stats ──────────────────────────────────────────────────────── */}
      <AnimatedStats />

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm text-muted-foreground mb-4">
              <Zap className="h-3.5 w-3.5" />
              Why Weather GPT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Built for teams that need answers
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl">
              From daily operations to long-range planning — get precise weather
              data when and where you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border/60 bg-card p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
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
      <section className="border-t border-border/60 py-20 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Ask about any location and receive instant, accurate weather data.
          </p>
          <div className="mt-8">
            <button
              onClick={handleGetStarted}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground magnetic-btn w-full sm:w-auto justify-center"
            >
              Open Weather GPT
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer role="contentinfo" className="border-t border-border/60 py-8 bg-muted/20 safe-area-bottom">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Cloud className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Weather GPT</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Weather data by Open-Meteo
            </span>
          </div>
          <div className="mt-5 pt-5 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by <span className="font-semibold text-foreground">Team Craxzy</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
