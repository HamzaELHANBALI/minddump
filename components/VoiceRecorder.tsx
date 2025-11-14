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
  onstart: (() => void) | null;
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
  const timerRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
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
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Accumulate final transcripts
      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
        setTranscript(transcriptRef.current + interimTranscript);
      } else if (interimTranscript) {
        setTranscript(transcriptRef.current + interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Continue listening, don't stop
        return;
      }
      if (event.error === 'not-allowed') {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        alert('Microphone permission denied. Please allow microphone access in Safari settings.');
        return;
      }
      if (event.error === 'aborted') {
        // User stopped, this is normal
        return;
      }
      if (event.error === 'network') {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        alert('Network error. Please check your connection and try again.');
      }
    };

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended, isRecording:', isRecording);
      // On iOS Safari, recognition stops after 60 seconds or when no speech
      // Restart if still recording
      if (isRecording) {
        try {
          // Small delay before restarting
          setTimeout(() => {
            if (isRecording && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.log('Recognition restart error:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      alert('Microphone permission is required. Please allow access in Safari settings.');
      return;
    }

    if (!recognitionRef.current) {
      alert('Speech recognition not available. Please use Safari on iOS.');
      return;
    }

    try {
      // Reset state
      setTranscript('');
      transcriptRef.current = '';
      setTimeElapsed(0);
      setIsRecording(true);
      onStart();

      // Start recognition
      recognitionRef.current.start();

      // Start timer - use window.setInterval for better compatibility
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => {
          const next = prev + 1;
          return next;
        });
      }, 1000);
    } catch (e: any) {
      console.error('Failed to start recording:', e);
      setIsRecording(false);
      if (e.message?.includes('already started')) {
        // Already started, that's okay
        return;
      }
      alert('Failed to start recording. Please try again.');
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
        const finalTranscript = transcriptRef.current || transcript;
        if (finalTranscript.trim()) {
          onComplete(finalTranscript.trim());
        } else {
          setIsRecording(false);
          alert('No speech detected. Please speak clearly and try again.');
        }
      }, 1000);
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
            className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative"
          >
            <span 
              className="absolute inset-0 flex items-center justify-center text-6xl md:text-7xl"
              style={{ lineHeight: '1' }}
            >
              🎙️
            </span>
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

