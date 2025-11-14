'use client';

import { ThoughtSession } from '@/types';

interface ResultsDisplayProps {
  session: ThoughtSession;
  onSave: () => void;
  onNewDump: () => void;
}

const categoryConfig = {
  actions: {
    icon: '📋',
    title: 'Actions Needed',
    color: 'border-green-500 bg-green-50',
    textColor: 'text-green-800',
  },
  decisions: {
    icon: '🤔',
    title: 'Decisions Pending',
    color: 'border-orange-500 bg-orange-50',
    textColor: 'text-orange-800',
  },
  worries: {
    icon: '😰',
    title: 'Worries to Release',
    color: 'border-red-500 bg-red-50',
    textColor: 'text-red-800',
  },
  wins: {
    icon: '🎉',
    title: 'Wins to Celebrate',
    color: 'border-blue-500 bg-blue-50',
    textColor: 'text-blue-800',
  },
};

export default function ResultsDisplay({ session, onSave, onNewDump }: ResultsDisplayProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Your Organized Thoughts
        </h1>
        <p className="text-white/80">{formatDate(session.timestamp)}</p>
      </div>

      <div className="space-y-4 mb-8">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const items = session.categories[key as keyof typeof session.categories];
          if (!items || items.length === 0) return null;

          return (
            <div
              key={key}
              className={`p-6 rounded-xl border-l-4 ${config.color} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className={`font-bold text-lg ${config.textColor}`}>
                    {config.title}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.textColor} bg-white/50`}>
                  {items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className={`${config.textColor} text-sm md:text-base leading-relaxed`}
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onSave}
          className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
        >
          💾 Save This Session
        </button>
        <button
          onClick={onNewDump}
          className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/30 active:scale-95 transition-all"
        >
          🔄 New Dump
        </button>
      </div>
    </div>
  );
}

