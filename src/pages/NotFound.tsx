import { motion } from "framer-motion";
import { Cloud, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30">
              <Cloud className="h-7 w-7 text-muted-foreground/60" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-2">
            404
          </h1>
          <p className="text-sm text-muted-foreground">
            This page doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-2 text-xs text-muted-foreground transition-all hover:border-border hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </button>
        </div>
      </div>
    </motion.div>
  );
}
