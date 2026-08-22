import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MapPin, Languages, Zap, Shield, TrendingUp, Users, Globe2, Cloud } from "lucide-react";

const STATS = [
  { value: 200000, suffix: "+", label: "Weather Stations", icon: MapPin, color: "text-blue-500" },
  { value: 10, suffix: "", label: "Indian Languages", icon: Languages, color: "text-violet-500" },
  { value: 15, suffix: "min", label: "Update Frequency", icon: Zap, color: "text-amber-500" },
  { value: 24, suffix: "/7", label: "Available", icon: Shield, color: "text-emerald-500" },
  { value: 99.9, suffix: "%", label: "Uptime", icon: TrendingUp, color: "text-cyan-500" },
  { value: 100, suffix: "+", label: "Countries Covered", icon: Globe2, color: "text-indigo-500" },
  { value: 50, suffix: "ms", label: "Avg Response", icon: Cloud, color: "text-sky-500" },
  { value: 1000, suffix: "+", label: "Daily Queries", icon: Users, color: "text-rose-500" },
];

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

function AnimatedCounter({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Smooth ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(target * eased);
      
      if (progress >= 1) {
        clearInterval(timer);
        setCount(target);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const displayValue = target >= 100000 ? formatNumber(Math.round(count)) : 
                       target >= 100 ? Math.round(count).toString() : 
                       count.toFixed(1);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-16 sm:py-20 border-y border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-4 lg:grid-cols-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.07,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={isInView ? { scale: 1, rotate: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.07 + 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <stat.icon className={`h-6 w-6 ${stat.color} mb-2.5`} />
              </motion.div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-tight">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
