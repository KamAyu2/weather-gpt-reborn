import { motion } from "framer-motion";
import { LayoutDashboard, Plus, Star, GitCompare, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type View = "home" | "chat" | "starred" | "compare";

interface MobileNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewChat: () => void;
  starredCount?: number;
}

const NAV_ITEM_KEYS: { key: View; labelKey: string; icon: React.ElementType }[] = [
  { key: "home", labelKey: "mobile.home", icon: LayoutDashboard },
  { key: "compare", labelKey: "mobile.compare", icon: GitCompare },
  { key: "chat", labelKey: "chat.chat", icon: MessageSquare },
  { key: "starred", labelKey: "mobile.saved", icon: Star },
];

export function MobileNav({ currentView, onViewChange, onNewChat, starredCount = 0 }: MobileNavProps) {
  const { translate } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden safe-area-bottom">
      {/* Glass effect backdrop */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="flex items-center justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {NAV_ITEM_KEYS.map((item) => {
            const isActive = currentView === item.key;
            const Icon = item.icon;
            const label = translate(item.labelKey);

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "chat" && currentView !== "chat") {
                    onNewChat();
                  } else {
                    onViewChange(item.key);
                  }
                }}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.key === "starred" && starredCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center">
                      {starredCount > 9 ? "9+" : starredCount}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
