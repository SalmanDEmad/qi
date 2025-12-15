/**
 * Zhanguo Qi - Main App
 */

import { useState } from 'react';
import { useGameStore } from './store';
import { Board, GameControls, GameLog, StartScreen, Suggestions, IntroScreen, BackgroundMusic } from './components';

function Game() {
  const { winner, initGame, humanPlayer } = useGameStore();

  return (
    <>
      {/* Game area */}
      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        {/* Left panel - Controls */}
        <div className="order-2 lg:order-1">
          <GameControls />
        </div>

        {/* Center - Board */}
        <div className="order-1 lg:order-2">
          <Board />
        </div>

        {/* Right panel - Log */}
        <div className="order-3">
          <GameLog />
        </div>
      </div>

      {/* New game button */}
      {winner && (
        <div className="text-center mt-4">
          <button
            onClick={() => initGame(humanPlayer)}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg transition"
          >
            🔄 Play Again
          </button>
        </div>
      )}

      {/* Piece Reference */}
      <div className="mt-4 max-w-4xl mx-auto">
        <div className="bg-stone-900/80 border border-amber-900/30 p-4 rounded-lg">
          <h3 className="text-amber-100 font-bold text-center mb-3">📜 Piece Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-amber-400 font-bold">G</span>
              <span className="text-stone-300"> - General (King)</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-amber-400 font-bold">H</span>
              <span className="text-stone-300"> - HQ (Headquarters)</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-sky-400 font-bold">K</span>
              <span className="text-stone-300"> - Vanguard</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-sky-400 font-bold">N/L/R</span>
              <span className="text-stone-300"> - Commanders</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-emerald-400 font-bold">I</span>
              <span className="text-stone-300"> - Infantry</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-violet-400 font-bold">V</span>
              <span className="text-stone-300"> - Cavalry (Knight)</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-orange-400 font-bold">X</span>
              <span className="text-stone-300"> - Crossbowman</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-orange-400 font-bold">B</span>
              <span className="text-stone-300"> - Archer (Bowman)</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-red-400 font-bold">S</span>
              <span className="text-stone-300"> - Siege Engine</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-cyan-400 font-bold">T</span>
              <span className="text-stone-300"> - Chariot</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-pink-400 font-bold">P</span>
              <span className="text-stone-300"> - Priest (Convert)</span>
            </div>
            <div className="bg-stone-800 p-2 rounded border border-stone-700">
              <span className="text-indigo-400 font-bold">A</span>
              <span className="text-stone-300"> - Advisor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions link */}
      <div className="mt-4 text-center">
        <a
          href="/suggestions"
          className="text-amber-400 hover:text-amber-300 text-sm"
        >
          💡 Have feedback? Submit a suggestion →
        </a>
      </div>
    </>
  );
}

function App() {
  const { aiPlayer } = useGameStore();
  // Always show intro on page load
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Simple hash-based routing
  const path = window.location.pathname;

  if (path === '/suggestions') {
    return <Suggestions />;
  }

  return (
    <>
      {/* Persistent background music */}
      <BackgroundMusic />

      {/* Show cinematic intro on first visit */}
      {showIntro ? (
        <IntroScreen onComplete={handleIntroComplete} />
      ) : !aiPlayer ? (
        <StartScreen />
      ) : (
        <div className="min-h-screen bg-stone-950 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-amber-100">⚔️ Zhanguo Qi</h1>
              <p className="text-amber-200/60 text-sm">The Warring States Chess</p>
              {/* Pro Tip - moved here for visibility */}
              <div className="mt-2 inline-block bg-amber-950/50 border border-amber-700/50 px-4 py-1.5 rounded text-amber-200 text-xs">
                <span className="font-bold">💡 Tip:</span> Take out enemy archers using volleys first to dominate.
              </div>
            </div>

            <Game />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
