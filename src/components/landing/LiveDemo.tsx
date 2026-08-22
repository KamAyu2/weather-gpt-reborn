import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, User, ArrowRight, Play, Pause } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  delay: number;
}

const DEMO_MESSAGES: Message[] = [
  {
    role: "user",
    content: "What's the weather in Mumbai today?",
    delay: 0,
  },
  {
    role: "assistant",
    content: "Good evening! I just checked the weather in Mumbai for you.\n\nIt's quite hot out there — 34°C and Partly cloudy. You might want to stay hydrated if you're heading out!\n\nHere are the details:\n• Temperature: 34°C (feels like 38°C)\n• Humidity: 75%\n• Wind: 14 km/h SW\n• UV Index: 8 (Very High)\n\n💡 Tip: Apply sunscreen SPF 30+ and wear sunglasses.",
    delay: 1500,
  },
  {
    role: "user",
    content: "Should I irrigate crops in Pune?",
    delay: 3000,
  },
  {
    role: "assistant",
    content: "Great question! I checked Pune's conditions for your crops.\n\n🌡️ Temperature: 28°C with moderate humidity\n💧 Rain probability: 30% today\n\n🌾 Agriculture Advisory:\n• Good conditions for most agricultural activities\n• Dry conditions — ensure adequate irrigation\n• Low humidity — increase irrigation frequency\n\nBest time to irrigate: Early morning or late evening.",
    delay: 4500,
  },
  {
    role: "user",
    content: "Any cyclone alerts for Chennai?",
    delay: 6000,
  },
  {
    role: "assistant",
    content: "✅ All clear for Chennai!\n\nNo severe weather alerts at this time. Conditions are safe.\n\nCurrent conditions:\n• Temperature: 31°C, Humidity: 68%\n• Wind: 12 km/h NE\n• Weather: Clear sky\n\nI'll keep monitoring and alert you if anything changes.",
    delay: 7500,
  },
];

export function LiveDemo() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Only start the demo when the section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          // Kick off the demo after a short delay
          setTimeout(() => {
            setIsPlaying(true);
          }, 800);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || currentIndex >= DEMO_MESSAGES.length) return;

    const timer = setTimeout(() => {
      setVisibleMessages(prev => [...prev, DEMO_MESSAGES[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
      // Do NOT call scrollIntoView — it fights with user scrolling
    }, currentIndex === 0 ? 500 : DEMO_MESSAGES[currentIndex].delay - (currentIndex > 0 ? DEMO_MESSAGES[currentIndex - 1].delay : 0));

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex]);

  const reset = () => {
    setVisibleMessages([]);
    setCurrentIndex(0);
    setIsPlaying(true);
    hasStartedRef.current = true;
  };

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-xl text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground shadow-sm mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Demo
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              See it in action
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Watch how Weather GPT responds to real questions about weather, agriculture, and disaster alerts.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-2xl"
        >
          {/* Chat window */}
          <div className="rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Cloud className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Weather GPT</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={reset}
                  className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-5 space-y-4">
              <AnimatePresence>
                {visibleMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mt-0.5">
                        <Cloud className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md shadow-sm"
                        : "bg-muted/50 text-foreground rounded-bl-md"
                    }`}>
                      <div className="whitespace-pre-wrap break-words text-sm">
                        {msg.content}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/90 mt-0.5 shadow-sm">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isPlaying && visibleMessages.length < DEMO_MESSAGES.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mt-0.5">
                    <Cloud className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3 rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-5 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-2.5">
                <span className="text-sm text-muted-foreground/50 flex-1">Try it yourself →</span>
                <button
                  onClick={() => window.location.href = "/auth?returnTo=/dashboard"}
                  className="rounded-lg gradient-primary px-3 py-1 text-xs font-medium text-white flex items-center gap-1"
                >
                  Get Started <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
