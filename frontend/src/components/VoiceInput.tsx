import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { Button } from './ui';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setHint('当前浏览器不支持语音识别（建议使用 Chrome/Edge）。');
      return;
    }

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      setIsSupported(false);
      setHint('语音识别需要 HTTPS 环境（上线域名请开启 HTTPS）。');
      return;
    }

    setHint(null);
    shouldListenRef.current = true;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', event.error);
      shouldListenRef.current = false;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setHint('未授予麦克风权限或系统禁止语音识别，请在浏览器设置中允许麦克风权限。');
      } else if (event.error === 'network') {
        setHint('语音识别网络异常，请检查网络或稍后重试。');
      } else {
        setHint(`语音识别失败：${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
          return;
        } catch {
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      shouldListenRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-purple-500"
                  animate={{
                    scale: [1, 2],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
              <motion.div
                className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Mic className="w-8 h-8 text-purple-400" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? 'primary' : 'secondary'}
        disabled={!isSupported}
        className="flex items-center gap-2"
      >
        {isListening ? (
          <>
            <Square className="w-4 h-4" />
            <span>停止录音</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>语音输入</span>
          </>
        )}
      </Button>

      {isListening && (
        <motion.p
          className="mt-2 text-sm text-purple-300 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          正在聆听...
        </motion.p>
      )}

      {hint && !isListening && (
        <p className="mt-2 text-xs text-gray-400 max-w-[240px]">{hint}</p>
      )}
    </div>
  );
}
