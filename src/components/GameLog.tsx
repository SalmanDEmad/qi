/**
 * Zhanguo Qi - Game Log Component
 */

import { useGameStore } from '../store';
import { useEffect, useRef } from 'react';

export function GameLog() {
  const { gameLog } = useGameStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLog]);

  return (
    <div className="bg-gray-900 text-gray-200 p-4 rounded-lg w-64">
      <h3 className="font-bold text-lg mb-2 text-white">Game Log</h3>
      <div
        ref={logRef}
        className="h-64 overflow-y-auto space-y-1 text-sm font-mono"
      >
        {gameLog.map((entry, i) => (
          <div
            key={i}
            className={`${
              entry.startsWith('AI:')
                ? 'text-red-300'
                : entry.includes('captures')
                ? 'text-yellow-300'
                : entry.includes('fires')
                ? 'text-orange-300'
                : entry.includes('converts')
                ? 'text-purple-300'
                : 'text-gray-400'
            }`}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
