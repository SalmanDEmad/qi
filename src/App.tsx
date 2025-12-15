/**
 * Zhanguo Qi - Main App
 */

import { useGameStore } from './store';
import { Board, GameControls, GameLog, StartScreen } from './components';

function App() {
  const { aiPlayer, winner, initGame, humanPlayer } = useGameStore();

  // Show start screen if game not initialized
  if (!aiPlayer) {
    return <StartScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white">⚔️ Zhanguo Qi</h1>
          <p className="text-gray-400">The Warring States Chess</p>
        </div>

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

        {/* Legend */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <div className="inline-flex flex-wrap gap-4 justify-center bg-gray-800 px-4 py-2 rounded-lg">
            <span>G=General</span>
            <span>H=HQ</span>
            <span>N/L/R=Commanders</span>
            <span>I=Infantry</span>
            <span>V=Cavalry</span>
            <span>X=Crossbow</span>
            <span>B=Archer</span>
            <span>S=Siege</span>
            <span>T=Chariot</span>
            <span>P=Priest</span>
            <span>A=Advisor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
