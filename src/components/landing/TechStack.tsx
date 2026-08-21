import { motion } from "framer-motion";
import { Database, Cloud, Cpu, Globe, Lock, Layers, Smartphone, Wifi } from "lucide-react";

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
    color: "from-blue-400 to-cyan-500",
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
    color: "from-violet-400 to-purple-500",
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
    color: "from-green-400 to-emerald-500",
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
    color: "from-orange-400 to-red-500",
  },
];

export function TechStack() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground shadow-sm mb-6">
              <Lock className="h-3 w-3" />
              Built with Modern Stack
            </span>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Technical Architecture
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Designed for scalability, performance, and real-time weather intelligence delivery.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TECH_STACK.map((stack, i) => (
            <motion.div
              key={stack.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stack.color}`}>
                  <stack.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold">{stack.category}</h3>
              </div>
              <div className="space-y-3">
                {stack.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key differentiators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8"
        >
          <h3 className="text-sm font-semibold text-center mb-6">Key Differentiators for India</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: "Mobile-First", desc: "Responsive design optimized for smartphones used by 750M+ Indian mobile internet users" },
              { icon: Wifi, title: "Low Bandwidth", desc: "Optimized payloads for areas with poor connectivity — works on 2G/3G networks" },
              { icon: Database, title: "Free & Open", desc: "No API keys required for weather data. Google Gemini AI for advanced conversations." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white/60 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
