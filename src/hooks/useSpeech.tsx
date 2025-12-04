import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechOptions {
  volume?: number;
  rate?: number;
  voice?: SpeechSynthesisVoice | null;
  loop?: boolean;
}

export const useSpeech = (options: UseSpeechOptions = {}) => {
  const { volume = 1, rate = 1, voice = null, loop = true } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentText, setCurrentText] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const loopingRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported");
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();
    
    setCurrentText(text);
    loopingRef.current = loop;

    const createUtterance = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume;
      utterance.rate = rate;
      
      if (voice) {
        utterance.voice = voice;
      } else {
        // Try to find a good English voice
        const englishVoice = availableVoices.find(
          (v) => v.lang.startsWith("en") && v.localService
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        if (loopingRef.current) {
          // Small delay before repeating
          setTimeout(() => {
            if (loopingRef.current) {
              speechSynthesis.speak(createUtterance());
            }
          }, 500);
        } else {
          setIsSpeaking(false);
          setCurrentText("");
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        loopingRef.current = false;
      };

      return utterance;
    };

    utteranceRef.current = createUtterance();
    speechSynthesis.speak(utteranceRef.current);
  }, [volume, rate, voice, loop, availableVoices]);

  const stop = useCallback(() => {
    loopingRef.current = false;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentText("");
  }, []);

  const speakOnce = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported");
      return;
    }

    speechSynthesis.cancel();
    loopingRef.current = false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText("");
    };
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [volume, rate, voice]);

  return {
    speak,
    speakOnce,
    stop,
    isSpeaking,
    currentText,
    availableVoices,
    isSupported: "speechSynthesis" in window,
  };
};
