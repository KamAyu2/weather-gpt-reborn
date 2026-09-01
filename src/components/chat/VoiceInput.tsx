import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  language?: string;
}

// Minimal Web Speech API type declarations
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: { length: number; 0: { length: number; 0: { transcript: string; isFinal: boolean } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function VoiceInput({ onResult, disabled = false, language = "en-US" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  const { translate } = useLanguage();

  // Keep onResult ref current without recreating recognition
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Create SpeechRecognition once
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setErrorMsg("Voice input requires Chrome or Edge browser.");
      return;
    }

    setIsSupported(true);
    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event: { results: { length: number; 0: { length: number; 0: { transcript: string; isFinal: boolean } } } }) => {
      const transcript = event.results[0][0].transcript;
      setErrorMsg(null);
      onResultRef.current(transcript);
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: { error: string }) => {
      console.error("[VoiceInput] Speech recognition error:", event.error);
      setIsListening(false);
      switch (event.error) {
        case "not-allowed":
          setErrorMsg("Microphone access denied. Please allow mic access in your browser settings.");
          break;
        case "audio-capture":
          setErrorMsg("No microphone found. Please connect a microphone.");
          break;
        case "network":
          setErrorMsg("Network error. Please check your internet connection.");
          break;
        case "no-speech":
          setErrorMsg("No speech detected. Please try again.");
          break;
        case "aborted":
          // User cancelled — no error to show
          setErrorMsg(null);
          break;
        default:
          setErrorMsg(`Voice error: ${event.error}. Please try again.`);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      try { recognitionInstance.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    };
  }, [language]); // Only recreate when language changes

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      try { recognition.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      setErrorMsg(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // Already started or other error
        setIsListening(false);
        setErrorMsg("Could not start voice input. Please try again.");
      }
    }
  }, [isListening]);

  // Dismiss error on next click
  const handleClick = useCallback(() => {
    if (errorMsg) {
      setErrorMsg(null);
      return;
    }
    toggleListening();
  }, [errorMsg, toggleListening]);

  if (!isSupported) {
    return (
      <div className="relative group">
        <button
          disabled
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/30 cursor-not-allowed"
          title="Voice input requires Chrome or Edge browser"
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-[10px] text-background shadow-lg z-50">
          Use Chrome or Edge for voice input
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
            : errorMsg
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? translate('voice.stopListening') : errorMsg ? "Click to dismiss" : translate('voice.startListening')}
        aria-label={isListening ? translate('voice.stopListening') : translate('voice.startListening')}
      >
        {isListening ? (
          <MicOff className="h-3.5 w-3.5" />
        ) : errorMsg ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
      </button>
      {errorMsg && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-[10px] text-background shadow-lg z-50 max-w-[220px] text-center leading-relaxed">
          {errorMsg}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}
