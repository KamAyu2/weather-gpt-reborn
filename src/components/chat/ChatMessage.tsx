import { motion } from "framer-motion";
import { Cloud, Star, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  starred?: boolean;
  messageId?: string;
  onToggleStar?: (messageId: string) => void;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${key++}`} className="font-medium text-foreground">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    if (parts.length === 0) {
      parts.push(line);
    }

    if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <div key={`line-${key++}`} className="flex gap-2 py-0.5">
          <span className="text-muted-foreground/50 mt-0.5">·</span>
          <span>{parts.slice(1)}</span>
        </div>
      );
    } else {
      elements.push(
        <span key={`line-${key++}`}>
          {parts}
          {line !== lines[lines.length - 1] && <br />}
        </span>
      );
    }
  }

  return elements;
}

export function ChatMessage({ role, content, timestamp, starred, messageId, onToggleStar }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
          <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-background rounded-br-md"
            : "bg-muted/50 text-foreground rounded-bl-md"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {isUser ? content : parseMarkdown(content)}
        </div>
        <div className={`mt-1.5 flex items-center gap-2 ${isUser ? "justify-end" : "justify-between"}`}>
          {timestamp && (
            <span
              className={`text-[10px] ${
                isUser ? "text-background/50" : "text-muted-foreground/50"
              }`}
            >
              {formatTime(timestamp)}
            </span>
          )}
          {!isUser && messageId && onToggleStar && (
            <button
              onClick={() => onToggleStar(messageId)}
              className={`ml-auto rounded-md p-1 transition-colors ${
                starred
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/60"
              }`}
              title={starred ? "Remove from saved" : "Save this message"}
            >
              <Star className={`h-3 w-3 ${starred ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}
