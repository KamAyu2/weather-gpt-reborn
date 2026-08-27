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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
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
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm text-muted-foreground mb-5">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See it in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Watch how Weather GPT responds to real questions about weather, agriculture, and disaster alerts.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Chat window */}
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 sm:px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Cloud className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Weather GPT</p>
                  <p className="text-xs text-primary flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-xl border border-border/50 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-all duration-200 flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={reset}
                  className="rounded-xl border border-border/50 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 space-y-4">
              <AnimatePresence>
                {visibleMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                      x: msg.role === "user" ? 20 : -20,
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mt-0.5">
                        <Cloud className="h-4 w-4 text-primary" />
                      </div>
                    )}                      <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      <div className="whitespace-pre-wrap break-words text-sm">
                        {msg.content}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isPlaying && visibleMessages.length < DEMO_MESSAGES.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mt-0.5">
                    <Cloud className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-5 py-3.5 rounded-bl-md">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-5 sm:px-6 py-3.5">
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 px-5 py-3">
                <span className="text-sm text-muted-foreground/50 flex-1">Try it yourself →</span>
                <button
                  onClick={() => window.location.href = "/auth?returnTo=/dashboard"}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground flex items-center gap-1.5 magnetic-btn"
                >
                  Get Started <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
