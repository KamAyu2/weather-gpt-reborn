import { motion } from "framer-motion";
import { Database, Cloud, Cpu, Globe, Layers, Smartphone, Wifi } from "lucide-react";

const TECH_STACK = [
  {
    category: "Frontend",
    items: [
      { name: "React + TypeScript", desc: "Type-safe UI components" },
      { name: "Tailwind CSS", desc: "Utility-first styling" },
      { name: "Framer Motion", desc: "Smooth animations" },
      { name: "shadcn/ui", desc: "Accessible components" },
    ],
    icon: Layers,
  },
  {
    category: "Backend",
    items: [
      { name: "Convex", desc: "Real-time database & serverless" },
      { name: "Open-Meteo API", desc: "Free meteorological data" },
      { name: "Web Speech API", desc: "Voice recognition" },
      { name: "Google Gemini", desc: "AI-powered conversations" },
    ],
    icon: Cloud,
  },
  {
    category: "Features",
    items: [
      { name: "10 Indian Languages", desc: "Multilingual i18n system" },
      { name: "Agriculture Advisory", desc: "Crop-specific weather advice" },
      { name: "Disaster Alerts", desc: "Real-time severe weather monitoring" },
      { name: "Voice Input", desc: "Rural accessibility support" },
    ],
    icon: Cpu,
  },
  {
    category: "Architecture",
    items: [
      { name: "Serverless Functions", desc: "Auto-scaling backend" },
      { name: "Real-time Subscriptions", desc: "Live data updates" },
      { name: "Type-safe Queries", desc: "End-to-end TypeScript" },
      { name: "Edge Computing", desc: "Low-latency responses" },
    ],
    icon: Globe,
  },
];

export function TechStack() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm text-muted-foreground mb-5">
            Built with Modern Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Technical Architecture
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Designed for scalability, performance, and real-time weather intelligence delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {TECH_STACK.map((stack) => (
            <div
              key={stack.category}
              className="rounded-xl border border-border/60 bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <stack.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-base font-bold">{stack.category}</h3>
              </div>
              <div className="space-y-3">
                {stack.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key differentiators */}
        <div className="mt-12 rounded-xl border border-border/60 bg-card p-6 sm:p-8">
          <h3 className="text-lg font-bold text-center mb-6">Key Differentiators for India</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: "Mobile-First", desc: "Optimized for smartphones used by 750M+ Indian mobile internet users" },
              { icon: Wifi, title: "Low Bandwidth", desc: "Works on 2G/3G networks in areas with poor connectivity" },
              { icon: Database, title: "Free & Open", desc: "No API keys required for weather data. Gemini AI for conversations." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
