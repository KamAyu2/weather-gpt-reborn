import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import {
  Cloud,
  LogOut,
  Plus,
  Star,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { VoiceInput } from "@/components/chat/VoiceInput";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { WeatherComparison } from "@/components/weather/WeatherComparison";
import { MobileNav } from "@/components/ui/MobileNav";
import { Id } from "@/convex/_generated/dataModel";
import { useLanguage, LANGUAGES, type Language } from "@/lib/i18n";
import { Globe, GitCompare, Menu } from "lucide-react";

type View = "home" | "chat" | "starred" | "compare";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("home");
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [langOpen, setLangOpen] = useState(false);


  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const { resolved: currentTheme, toggle: toggleTheme } = useTheme();
  const { language, setLanguage, translate } = useLanguage();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversations = useQuery(api.chat.getConversations);
  const geminiKey = useQuery(api.chat.getGeminiKey);
  const messages = useQuery(
    api.chat.getMessages,
    activeConversation ? { conversationId: activeConversation } : "skip"
  );
  const starredMessages = useQuery(api.chat.getStarredMessages);
  const createConversation = useMutation(api.chat.createConversation) as (args: { title?: string }) => Promise<Id<"conversations">>;
  const sendMessage = useMutation(api.chat.sendMessage);
  const processMessage = useAction(api.chat.processMessage);
  const toggleStar = useMutation(api.chat.toggleStar);
  const saveAssistantMessage = useMutation(api.chat.saveAssistantMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [view]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    setView("chat");

    try {
      let convId = activeConversation;
      if (!convId) {
        convId = await createConversation({ title: text.slice(0, 60) });
        setActiveConversation(convId);
      }

      await sendMessage({
        conversationId: convId,
        content: text,
      });

      const result = await processMessage({
        conversationId: convId,
        content: text,
        language: language,
      });

      // If backend says "use client LLM", call Gemini directly from the browser
      const resultAny = result as Record<string, unknown>;
      if (resultAny?.useClientLLM) {
        const { callGeminiFromClient } = await import("@/lib/gemini");
        // Use key from Convex backend, fallback to localStorage
        const llmKey = geminiKey || localStorage.getItem("gemini_api_key") || "";
        if (llmKey) {
          const llmResponse = await callGeminiFromClient(text, language, llmKey);
          console.log('[WeatherGPT] LLM response:', llmResponse ? 'success' : 'null', 'keyLen:', llmKey.length, 'lang:', language);
          if (llmResponse) {
            await saveAssistantMessage({
              conversationId: convId,
              content: llmResponse,
            });
          } else {
            await saveAssistantMessage({
              conversationId: convId,
              content: "I couldn't generate a response. Please try again.",
            });
          }
        } else {
          await saveAssistantMessage({
            conversationId: convId,
            content: "General knowledge features require a Gemini API key. Please ask weather-related questions instead.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setInput("");
    setView("chat");
  };

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConversation(id);
    setView("chat");
    setInput("");
  };

  const handleToggleStar = async (messageId: string) => {
    try {
      await toggleStar({ messageId: messageId as Id<"messages"> });
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  const handleDashboardAsk = (text: string) => {
    setInput(text);
    setView("chat");
    // Trigger send after state updates
    setTimeout(() => {
      handleSend(text);
    }, 50);
  };

  const handleGoHome = () => {
    setView("home");
    setActiveConversation(null);
    setInput("");
  };

  const showWelcome = view === "chat" && !activeConversation && (!messages || messages.length === 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}            className={`flex h-full flex-col border-r border-border/60 overflow-hidden ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-lg bg-background w-72" : "bg-sidebar"}`}
          >
            {/* Logo */}
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Cloud className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-foreground">Weather GPT</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Navigation */}
            <nav aria-label="Sidebar navigation" className="px-2 pt-3 space-y-0.5">
              <button
                onClick={handleGoHome}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  view === "home"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {translate("nav.dashboard")}
              </button>
              <button
                onClick={handleNewConversation}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  view === "chat" && !activeConversation
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                {translate("nav.newChat")}
              </button>
              <button
                onClick={() => setView("compare")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  view === "compare"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                {translate("nav.compareCities")}
              </button>
              <button
                onClick={() => setView("starred")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  view === "starred"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                {translate("nav.savedMessages")}
                {starredMessages && starredMessages.length > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {starredMessages.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {currentTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {currentTheme === "dark" ? translate("nav.lightMode") : translate("nav.darkMode")}
              </button>

              {/* Language Selector — hover dropdown */}
              <div className="relative" onMouseEnter={() => setLangOpen(true)} onMouseLeave={() => setLangOpen(false)}>
                <button
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{LANGUAGES[language]?.flag} {LANGUAGES[language]?.native || "English"}</span>
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-border/60 bg-card shadow-2xl"
                    >
                      <div className="p-1.5 max-h-64 overflow-y-auto">
                        {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][]).map(([code, lang]) => (
                          <button
                            key={code}
                            onClick={() => { setLanguage(code); setLangOpen(false); }}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                              language === code
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <span className="text-sm w-5 text-center">{lang.flag}</span>
                            <span>{lang.native}</span>
                            {language === code && <span className="ml-auto text-primary text-[10px]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Conversations */}
            <div className="mt-2 border-t border-border/50 pt-2 flex-1 overflow-y-auto px-2">
              <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Chats
              </p>
              {conversations?.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeConversation === conv._id && view === "chat"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {conv.title || translate("nav.newChat")}
                </button>
              ))}
            </div>

            {/* User */}
            <div className="border-t border-border/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-xs font-medium text-foreground">{user?.name || "Guest"}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{user?.email || "Anonymous"}</p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Main Area ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header role="banner" aria-label="Dashboard header" className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background px-4">
          <div className="flex items-center gap-2">
            {isMobile && !sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            {!sidebarOpen && !isMobile && (
              <button
                onClick={toggleTheme}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                title="Toggle theme"
              >
                {currentTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            )}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors mr-1"
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </button>
            )}
            {!sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                  <Cloud className="h-3 w-3 text-background" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-foreground">Weather GPT</span>
              </div>
            )}
            {sidebarOpen && view === "chat" && (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Chat</span>
              </div>
            )}
            {sidebarOpen && view === "home" && (
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            )}
            {sidebarOpen && view === "compare" && (
              <div className="flex items-center gap-2">
                <GitCompare className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">{translate("compare.title")}</span>
              </div>
            )}
            {sidebarOpen && view === "starred" && (
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">Saved Messages</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main role="main" className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <DashboardHome
                  onSelectConversation={(id) => handleSelectConversation(id as Id<"conversations">)}
                  onAskQuestion={handleDashboardAsk}
                />
              </motion.div>
            )}

            {view === "compare" && (
              <motion.div
                key="compare"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full overflow-y-auto"
              >
                <div className="mx-auto max-w-4xl px-6 py-10">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">{translate("compare.title")}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {translate("compare.subtitle")}
                  </p>
                  <div className="mt-8">
                    <WeatherComparison />
                  </div>
                </div>
              </motion.div>
            )}

            {view === "starred" && (
              <motion.div
                key="starred"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full overflow-y-auto"
              >
                <div className="mx-auto max-w-3xl px-6 py-10">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">{translate("common.saved")}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {translate("common.starToSave")}
                  </p>

                  {starredMessages && starredMessages.length > 0 ? (
                    <div className="mt-8 space-y-3">
                      {starredMessages.map((msg) => (
                        <button
                          key={msg._id}
                          onClick={() => handleSelectConversation(msg.conversationId)}
                          className="w-full rounded-xl border border-border/50 bg-muted/20 p-5 text-left transition-all hover:border-border hover:bg-muted/30"
                        >
                          <div className="flex items-start gap-3">
                            <Star className="h-4 w-4 mt-0.5 fill-amber-500 text-amber-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-medium text-foreground">
                                  {msg.metadata?.location
                                    ? `Weather in ${msg.metadata.location}${msg.metadata.country ? `, ${msg.metadata.country}` : ""}`
                                    : msg.conversationTitle}
                                </p>
                                <span className="text-[10px] text-muted-foreground/50">
                                  {new Date(msg.timestamp).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-foreground/70 line-clamp-3">
                                {msg.content.replace(/\*\*/g, "").slice(0, 300)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(msg._id);
                              }}
                              className="shrink-0 rounded-md p-1 text-amber-500 hover:text-amber-600 transition-colors"
                              title={translate("common.removeFromSaved")}
                            >
                              <Star className="h-3.5 w-3.5 fill-current" />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 rounded-xl border border-dashed border-border/50 p-12 text-center">
                      <Star className="h-6 w-6 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {translate("common.noSavedMessages")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {translate("common.starToSave")}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {(view === "chat" || showWelcome) && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col"
              >
                {showWelcome ? (
                  <div className="flex h-full flex-col items-center justify-center px-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center"
                    >
                      <div className="mb-6 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
                          <Cloud className="h-7 w-7 text-muted-foreground/60" />
                        </div>
                      </div>
                      <h2 className="text-lg font-medium tracking-tight text-foreground">
                        {translate("chat.welcome")}
                      </h2>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        {translate("chat.welcomeSubtitle")}
                      </p>
                      <div className="mt-8">
                        <SuggestionChips onSelect={handleSend} />
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl px-4 py-6">
                      <div className="flex flex-col gap-5">
                        {messages?.map((msg) => (
                          <ChatMessage
                            key={msg._id}
                            role={msg.role}
                            content={msg.content}
                            timestamp={msg.timestamp}
                            starred={msg.starred}
                            messageId={msg._id}
                            onToggleStar={handleToggleStar}
                            metadata={msg.metadata}
                          />
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <MobileNav
            currentView={view}
            onViewChange={(v) => {
              setView(v);
              if (v === "chat") handleNewConversation();
            }}
            onNewChat={handleNewConversation}
            starredCount={starredMessages?.length ?? 0}
          />
        )}

        {/* Input — only show in chat view */}
        {view === "chat" && (
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => handleSend()}
            isLoading={isLoading}
            voiceInput={<VoiceInput onResult={(transcript: string) => { setInput(transcript); setTimeout(() => handleSend(transcript), 50); }} />}
          />
        )}
      </div>
    </div>
  );
}
