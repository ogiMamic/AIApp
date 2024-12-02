import { useState, useEffect, useCallback } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  language?: string;
}

export function useSpeechRecognition({
  onResult,
  language = "en-US",
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  const startListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }

    const newRecognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = language;

    let finalTranscript = "";

    newRecognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      onResult(finalTranscript + interimTranscript);
    };

    newRecognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    newRecognition.onend = () => {
      setIsListening(false);
    };

    newRecognition.start();
    setIsListening(true);
    setRecognition(newRecognition);
  }, [onResult, language]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  return { isListening, startListening, stopListening };
}
