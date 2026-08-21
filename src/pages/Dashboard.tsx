import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Cloud, LogOut, Plus, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { Id } from "@/convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: {
    location?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    weatherData?: unknown;
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const conversations = useQuery(api.chat.getConversations);
  const messages = useQuery(
    api.chat.getMessages,
    activeConversation ? { conversationId: activeConversation } : "skip"
  );
  const createConversation = useMutation(api.chat.createConversation) as (args: { title?: string }) => Promise<Id<"conversations">>;
  const processMessage = useAction(api.chat.processMessage);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    try {
      // Create conversation if none exists
      let convId = activeConversation;
      if (!convId) {
        convId = await createConversation({
          title: text.slice(0, 60),
        });
        setActiveConversation(convId);
      }

      // Process message (geocodes, fetches weather, saves both messages)
      await processMessage({
        conversationId: convId,
        content: text,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setInput("");
  };

  const handleSelectConversation = (id: Id<"conversations">) => {
    setActiveConversation(id);
    setInput("");
  };

  const showWelcome = !activeConversation && (!messages || messages.length === 0);

  return (
    <div className="flex h-screen bg-background">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full flex-col border-r border-border/50 bg-muted/20 overflow-hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                  <Cloud className="h-3.5 w-3.5 text-background" />
                </div>
                <span className="text-xs font-semibold tracking-tight">WeatherGPT</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleNewConversation}
              className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New conversation
            </button>

            <div className="mt-2 flex-1 overflow-y-auto px-2">
              {conversations?.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    activeConversation === conv._id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {conv.title || "New conversation"}
                </button>
              ))}
            </div>

            <div className="border-t border-border/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-xs font-medium">{user?.name || "Guest"}</p>
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

      {/* ─── Main Chat Area ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
          <div className="flex items-center gap-2">
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
                <span className="text-xs font-semibold tracking-tight">WeatherGPT</span>
              </div>
            )}
            {sidebarOpen && activeConversation && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
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
                <h2 className="text-lg font-medium tracking-tight">
                  What's the weather like?
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Ask about any city in the world. Get current conditions,
                  forecasts, and weather alerts instantly.
                </p>
                <div className="mt-8">
                  <SuggestionChips onSelect={handleSend} />
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6">
              <div className="flex flex-col gap-5">
                {messages?.map((msg) => (
                  <ChatMessage
                    key={msg._id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => handleSend()}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
