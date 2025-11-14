'use client';

import { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import ResultsDisplay from '@/components/ResultsDisplay';
import HistoryView from '@/components/HistoryView';
import { ThoughtSession } from '@/types';

type View = 'landing' | 'recording' | 'processing' | 'results' | 'history';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentSession, setCurrentSession] = useState<ThoughtSession | null>(null);
  const [sessions, setSessions] = useState<ThoughtSession[]>([]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('minddump_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }
  }, []);

  const handleRecordingComplete = async (transcript: string) => {
    setCurrentView('processing');
    
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to process thoughts');
      }

      const data = await response.json();
      const session: ThoughtSession = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        transcript,
        categories: data.categories,
      };

      setCurrentSession(session);
      setCurrentView('results');
    } catch (error) {
      console.error('Error processing thoughts:', error);
      alert('Failed to process your thoughts. Please try again.');
      setCurrentView('landing');
    }
  };

  const handleSaveSession = () => {
    if (!currentSession) return;

    const updated = [currentSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('minddump_sessions', JSON.stringify(updated));
    
    // Reset to landing
    setCurrentView('landing');
    setCurrentSession(null);
  };

  const handleNewDump = () => {
    setCurrentView('landing');
    setCurrentSession(null);
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleBackFromHistory = () => {
    setCurrentView('landing');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* Safe area padding for iPhone */}
      <div className="min-h-screen pb-safe">
        {currentView === 'landing' && (
          <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center font-jetbrains">
              MindDump
            </h1>
            <p className="text-white/90 text-lg mb-12 text-center max-w-md">
              Clear your mind in 5 minutes
            </p>
            
            <VoiceRecorder
              onComplete={handleRecordingComplete}
              onStart={() => setCurrentView('recording')}
            />

            {sessions.length > 0 && (
              <button
                onClick={handleViewHistory}
                className="mt-8 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all"
              >
                📚 View History ({sessions.length})
              </button>
            )}
          </div>
        )}

        {currentView === 'recording' && (
          <VoiceRecorder
            onComplete={handleRecordingComplete}
            onStart={() => {}}
          />
        )}

        {currentView === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-24 h-24 border-8 border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              🧠 Organizing your thoughts...
            </h2>
            <p className="text-white/80 text-center">
              This usually takes 10-15 seconds
            </p>
          </div>
        )}

        {currentView === 'results' && currentSession && (
          <div className="min-h-screen px-4 py-8">
            <ResultsDisplay
              session={currentSession}
              onSave={handleSaveSession}
              onNewDump={handleNewDump}
            />
          </div>
        )}

        {currentView === 'history' && (
          <HistoryView
            sessions={sessions}
            onBack={handleBackFromHistory}
            onSelectSession={(session) => {
              setCurrentSession(session);
              setCurrentView('results');
            }}
          />
        )}
      </div>
    </main>
  );
}

