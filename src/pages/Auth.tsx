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
import { ArrowRight, Cloud, Loader2, Mail, Globe, Zap, Shield, Mic, Languages, Star } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

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

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
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
      // Navigation will happen via the useEffect above once auth propagates
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  // Auto-navigate once auth state propagates after sign-in
  useEffect(() => {
    if (isAuthenticated && !authLoading && isLoading) {
      setIsLoading(false);
      navigate(redirect);
    }
  }, [isAuthenticated, authLoading, isLoading, navigate, redirect]);

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn("anonymous");
      // Navigation will happen via the useEffect above once auth propagates
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Globe, text: "200K+ locations" },
    { icon: Zap, text: "Real-time data" },
    { icon: Shield, text: "Disaster alerts" },
    { icon: Mic, text: "Voice input" },
    { icon: Languages, text: "10 languages" },
    { icon: Star, text: "AI-powered" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal top bar */}
      <nav className="h-14 border-b border-border/60 flex items-center px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Cloud className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Weather GPT</span>
        </button>
      </nav>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left side — Branding & Features */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Your personal
              <br />
              <span className="text-primary">
                weather assistant
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
              Ask any weather question in plain language. Get real-time conditions,
              forecasts, agriculture advisories, and disaster alerts.
            </p>

            {/* Feature pills */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
                >
                  <feature.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side — Auth Card */}
          <div className="w-full max-w-[420px]">
            <Card className="border-border/60 shadow-sm">
              {step === "signIn" ? (
                <>
                  <CardHeader className="text-center pt-8">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                        <Cloud className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold">Welcome to Weather GPT</CardTitle>
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
                          className="pl-10 h-11 rounded-lg"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium magnetic-btn"
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
                          <span className="w-full border-t border-border/60" />
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
                        className="w-full h-11 rounded-lg font-medium"
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
                        <p className="text-sm text-red-500 text-center">{error}</p>
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
                        className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium magnetic-btn"
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
                        className="w-full rounded-lg text-muted-foreground"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}

              <div className="py-3 px-6 text-xs text-center text-muted-foreground border-t border-border/40">
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
                <span className="font-semibold text-foreground">Team Craxzy</span>
              </div>
            </Card>
          </div>
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
