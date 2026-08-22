import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Cloud, CloudRain, Loader2, Mail, Sun, Snowflake, Wind, Zap, Star, Globe, Shield, Mic, Languages } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

// Floating weather icon component
function FloatingIcon({ icon: Icon, delay, x, y, size, color }: {
  icon: React.ElementType;
  delay: number;
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.3, 0.3, 0],
        scale: [0, 1, 1, 0.8],
        y: [0, -20, -40, -60],
        x: [0, x * 0.3, x * 0.6, x],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className="absolute pointer-events-none"
      style={{ left: `${50 + x}%`, top: `${40 + y}%` }}
    >
      <Icon className={`${color}`} style={{ width: size, height: size }} />
    </motion.div>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't auto-redirect on load — user may have signed out intentionally.
  // Only redirect after an explicit sign-in action below.

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Globe, text: "200K+ locations", color: "text-blue-500" },
    { icon: Zap, text: "Real-time data", color: "text-amber-500" },
    { icon: Shield, text: "Disaster alerts", color: "text-red-500" },
    { icon: Mic, text: "Voice input", color: "text-violet-500" },
    { icon: Languages, text: "10 languages", color: "text-emerald-500" },
    { icon: Star, text: "AI-powered", color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating weather icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon icon={Cloud} delay={0} x={-15} y={5} size={20} color="text-blue-400/30" />
        <FloatingIcon icon={Sun} delay={1.5} x={18} y={-5} size={24} color="text-yellow-400/30" />
        <FloatingIcon icon={CloudRain} delay={3} x={-10} y={10} size={18} color="text-cyan-400/30" />
        <FloatingIcon icon={Snowflake} delay={4.5} x={12} y={-8} size={16} color="text-sky-400/30" />
        <FloatingIcon icon={Wind} delay={6} x={-8} y={15} size={18} color="text-emerald-400/30" />
        <FloatingIcon icon={Zap} delay={2} x={20} y={0} size={14} color="text-amber-400/30" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Minimal top bar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 h-14 border-b border-border/40 glass flex items-center px-6"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/15">
            <Cloud className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold tracking-tight">Weather GPT</span>
        </button>
      </motion.nav>

      {/* Auth Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left side — Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Your personal
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent gradient-text-animated">
                weather assistant
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
              Ask any weather question in plain language. Get real-time conditions,
              forecasts, agriculture advisories, and disaster alerts.
            </p>

            {/* Feature pills */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-2 rounded-xl border border-border/40 glass px-3 py-2.5 shadow-sm"
                >
                  <feature.icon className={`h-4 w-4 ${feature.color} shrink-0`} />
                  <span className="text-xs font-medium text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side — Auth Card */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-[420px]"
          >
            <Card className="border-border/40 glass shadow-2xl shadow-black/5 card-3d">
              {step === "signIn" ? (
                <>
                  <CardHeader className="text-center pt-8">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/30"
                      >
                        <Cloud className="h-7 w-7 text-white" />
                      </motion.div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to Weather GPT</CardTitle>
                    <CardDescription className="text-sm mt-2">
                      Enter your email to get started, or continue as a guest
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="pl-10 h-12 rounded-xl"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {error}
                        </motion.p>
                      )}
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25 magnetic-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Send verification code
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-3 text-muted-foreground">
                            or
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl border-border/50 font-medium hover:bg-muted/50"
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                      >
                        <span className="mr-2">👤</span>
                        Continue as Guest
                      </Button>
                    </CardContent>
                  </form>
                </>
              ) : (
                <>
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-xl font-bold">Check your email</CardTitle>
                    <CardDescription className="mt-1">
                      We've sent a 6-digit code to{" "}
                      <span className="font-medium text-foreground">{step.email}</span>
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleOtpSubmit}>
                    <CardContent className="pb-4 space-y-4">
                      <input type="hidden" name="email" value={step.email} />
                      <input type="hidden" name="code" value={otp} />

                      <div className="flex justify-center">
                        <InputOTP
                          value={otp}
                          onChange={setOtp}
                          maxLength={6}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                              const form = (e.target as HTMLElement).closest("form");
                              if (form) {
                                form.requestSubmit();
                              }
                            }
                          }}
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        Didn't receive a code?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary font-medium"
                          onClick={() => setStep("signIn")}
                        >
                          Try again
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 pb-6">
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25 magnetic-btn"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Verify & continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                        className="w-full rounded-xl text-muted-foreground"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}

              <div className="py-3 px-6 text-xs text-center text-muted-foreground/60 border-t border-border/30">
                Weather data by{" "}
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors"
                >
                  Open-Meteo
                </a>
                {" • Built by "}
                <span className="font-semibold text-foreground/80">Team Craxzy</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
