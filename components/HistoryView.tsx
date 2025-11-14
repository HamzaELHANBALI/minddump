'use client';

import { ThoughtSession } from '@/types';

interface HistoryViewProps {
  sessions: ThoughtSession[];
  onBack: () => void;
  onSelectSession: (session: ThoughtSession) => void;
}

export default function HistoryView({ sessions, onBack, onSelectSession }: HistoryViewProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  const getTotalItems = (session: ThoughtSession) => {
    return (
      session.categories.actions.length +
      session.categories.decisions.length +
      session.categories.worries.length +
      session.categories.wins.length
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Your History
        </h1>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 active:scale-95 transition-all"
        >
          ← Back
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/80 text-lg mb-4">No sessions yet</p>
          <p className="text-white/60">Start your first brain dump to see it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="w-full p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-left hover:bg-white/20 active:scale-98 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm">{formatDate(session.timestamp)}</span>
                <span className="text-white/60 text-sm">
                  {getTotalItems(session)} items
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                {session.categories.actions.length > 0 && (
                  <span className="text-green-300">📋 {session.categories.actions.length}</span>
                )}
                {session.categories.decisions.length > 0 && (
                  <span className="text-orange-300">🤔 {session.categories.decisions.length}</span>
                )}
                {session.categories.worries.length > 0 && (
                  <span className="text-red-300">😰 {session.categories.worries.length}</span>
                )}
                {session.categories.wins.length > 0 && (
                  <span className="text-blue-300">🎉 {session.categories.wins.length}</span>
                )}
              </div>
              <p className="text-white/70 text-sm mt-3 line-clamp-2">
                {session.transcript.substring(0, 100)}...
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

