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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
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

export function TechStack() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 glass px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-6"
          >
            <Lock className="h-3.5 w-3.5" />
            Built with Modern Stack
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Technical Architecture
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 sm:mt-5 text-lg sm:text-xl leading-relaxed text-muted-foreground"
          >
            Designed for scalability, performance, and real-time weather intelligence delivery.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {TECH_STACK.map((stack) => (
            <motion.div
              key={stack.category}
              variants={cardVariants}
              className="perspective-1000"
            >
              <div className="h-full rounded-2xl border border-border/40 glass p-7 sm:p-8 card-3d shadow-sm">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stack.color} shadow-lg`}>
                    <stack.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{stack.category}</h3>
                </div>
                <div className="space-y-4">
                  {stack.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Key differentiators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-14 rounded-2xl border border-border/40 glass p-7 sm:p-10"
        >
          <h3 className="text-lg sm:text-xl font-bold text-center mb-8">Key Differentiators for India</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: "Mobile-First", desc: "Responsive design optimized for smartphones used by 750M+ Indian mobile internet users" },
              { icon: Wifi, title: "Low Bandwidth", desc: "Optimized payloads for areas with poor connectivity — works on 2G/3G networks" },
              { icon: Database, title: "Free & Open", desc: "No API keys required for weather data. Google Gemini AI for advanced conversations." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3.5 rounded-xl bg-white/50 dark:bg-white/5 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
