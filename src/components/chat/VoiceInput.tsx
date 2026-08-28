import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
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
    if (!SpeechRecognitionAPI) return;

    setIsSupported(true);
    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event: { results: { length: number; 0: { length: number; 0: { transcript: string; isFinal: boolean } } } }) => {
      const transcript = event.results[0][0].transcript;
      onResultRef.current(transcript);
      setIsListening(false);
    };

    recognitionInstance.onerror = () => {
      setIsListening(false);
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
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // Already started or other error
        setIsListening(false);
      }
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <button
        disabled
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/30 cursor-not-allowed"
        title="Voice input not supported in this browser. Use Chrome or Edge."
      >
        <Mic className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
        isListening
          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isListening ? translate('voice.stopListening') : translate('voice.startListening')}
      aria-label={isListening ? translate('voice.stopListening') : translate('voice.startListening')}
    >
      {isListening ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
