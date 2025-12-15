/**
 * Zhanguo Qi - Start Screen Component
 */

import { useState } from 'react';
import { Owner, Difficulty } from '../types';
import { useGameStore } from '../store';

export function StartScreen() {
  const { initGame } = useGameStore();
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-2">⚔️ Zhanguo Qi</h1>
        <p className="text-gray-400 mb-6">The Warring States Chess</p>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <p className="text-white font-semibold mb-2">Difficulty:</p>
          <div className="flex gap-2 justify-center">
            {Object.values(Difficulty).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  difficulty === diff
                    ? diff === Difficulty.EASY
                      ? 'bg-green-600 text-white'
                      : diff === Difficulty.NORMAL
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {difficulty === Difficulty.EASY && 'AI makes random moves from top options'}
            {difficulty === Difficulty.NORMAL && 'AI uses basic tactics and threat awareness'}
            {difficulty === Difficulty.EXPERT && 'AI protects pieces, uses full strategic evaluation'}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-white font-semibold">Choose your side:</p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => initGame(Owner.BLACK, difficulty)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 border-2 border-gray-600"
            >
              ⚫ BLACK
              <div className="text-sm font-normal text-gray-400">Move First</div>
            </button>

            <button
              onClick={() => initGame(Owner.RED, difficulty)}
              className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 border-2 border-red-600"
            >
              🔴 RED
              <div className="text-sm font-normal text-red-300">Move Second</div>
            </button>
          </div>
        </div>

        <div className="mt-8 text-left text-gray-400 text-sm space-y-2">
          <h3 className="font-semibold text-white">Quick Rules:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>1 action per turn (move, attack, or special)</li>
            <li>Capture enemy General (G) or HQ (H) to win</li>
            <li>Division moves advance/retreat entire flanks</li>
            <li>Ranged units can't fire if enemy adjacent</li>
            <li>Priest (P) can convert Infantry/Advisors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
