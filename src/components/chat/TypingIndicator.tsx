import { Cloud } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted/50 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:400ms]" />
      </div>
    </div>
  );
}
