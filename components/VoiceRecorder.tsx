'use client';

import { useState, useEffect, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface VoiceRecorderProps {
  onComplete: (transcript: string) => void;
  onStart: () => void;
}

export default function VoiceRecorder({ onComplete, onStart }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please use Chrome or Safari on iOS.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // User stopped speaking, continue listening
        return;
      }
      if (event.error === 'aborted' || event.error === 'network') {
        stopRecording();
        alert('Recording stopped. Please try again.');
      }
    };

    recognition.onend = () => {
      // On iOS Safari, recognition stops after 60 seconds
      // Restart if still recording
      if (isRecording) {
        try {
          recognition.start();
        } catch (e) {
          // Already started or error
          console.log('Recognition restart:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setTimeElapsed(0);
      onStart();

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Failed to start recording:', e);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Wait a moment for final results, then complete
      setTimeout(() => {
        if (transcript.trim()) {
          onComplete(transcript.trim());
        } else {
          alert('No speech detected. Please try again.');
        }
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {!isRecording ? (
        <div className="text-center">
          <button
            onClick={startRecording}
            className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-6xl md:text-7xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
          >
            🎙️
          </button>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
            Ready to clear your mind?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            Press the mic to start your brain dump. Speak naturally for 2-5 minutes.
          </p>
        </div>
      ) : (
        <div className="text-center w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">
            🎤 Listening...
          </h2>

          {/* Waveform animation */}
          <div className="flex items-center justify-center gap-2 mb-8 h-24">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-white rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(i) * 40}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>

          <div className="text-5xl md:text-6xl font-light text-white mb-8 font-mono">
            {formatTime(timeElapsed)}
          </div>

          <p className="text-white/70 mb-8 text-sm">
            Speak naturally about what's on your mind...
          </p>

          <button
            onClick={stopRecording}
            className="px-12 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-lg shadow-lg transition-all active:scale-95"
          >
            Stop Recording
          </button>

          {transcript && (
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg max-h-40 overflow-y-auto">
              <p className="text-white/90 text-sm text-left">{transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

