/**
 * Suggestions Page - View and submit suggestions
 * Stored in localStorage (no backend needed)
 */

import { useState } from 'react';

interface Suggestion {
  id: number;
  text: string;
  timestamp: string;
}

const STORAGE_KEY = 'zhanguo_qi_suggestions';

function loadSuggestions(): Suggestion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(loadSuggestions);
  const [newSuggestion, setNewSuggestion] = useState('');

  // Save suggestion
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    const suggestion: Suggestion = {
      id: Date.now(),
      text: newSuggestion.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updated = [suggestion, ...suggestions];
    setSuggestions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewSuggestion('');
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-100">💡 Suggestions</h1>
          <p className="text-amber-200/60 mt-2">Help improve Zhanguo Qi!</p>
          <a
            href="/"
            className="text-amber-400 hover:text-amber-300 text-sm mt-2 inline-block"
          >
            ← Back to Game
          </a>
        </div>

        {/* Submit form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-stone-900/90 border border-amber-900/30 p-4 rounded-lg">
            <label className="block text-amber-100 font-semibold mb-2">
              Submit a Suggestion
            </label>
            <textarea
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="What would you like to see improved? New features? Bug reports? Balance changes?"
              className="w-full bg-stone-800 text-white p-3 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-500 border border-stone-700"
            />
            <button
              type="submit"
              disabled={!newSuggestion.trim()}
              className="mt-3 w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Submit Suggestion
            </button>
          </div>
        </form>

        {/* Suggestions list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-amber-100">
            All Suggestions ({suggestions.length})
          </h2>
          
          {suggestions.length === 0 ? (
            <div className="bg-stone-900/90 border border-amber-900/30 p-6 rounded-lg text-center text-stone-400">
              No suggestions yet. Be the first to submit one!
            </div>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="bg-stone-900/90 border border-amber-900/30 p-4 rounded-lg">
                <p className="text-stone-200 whitespace-pre-wrap">{s.text}</p>
                <p className="text-stone-500 text-sm mt-2">{s.timestamp}</p>
              </div>
            ))
          )}
        </div>

        {/* Note about storage */}
        <div className="mt-8 text-center text-stone-500 text-xs">
          <p>Suggestions are stored locally in your browser.</p>
          <p>They persist until you clear your browser data.</p>
        </div>
      </div>
    </div>
  );
}
