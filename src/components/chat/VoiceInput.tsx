import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

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
  onresult: (event: { results: { length: number; 0: { length: number; 0: { transcript: string; isFinal: boolean } } } }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
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
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language, onResult]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null;
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
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
