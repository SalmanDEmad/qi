/**
 * Zhanguo Qi - Game Controls Component
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../store';
import { canCrossbowFire, canArcherFire, getVolleyTargets, getConvertTargets } from '../game/logic';
import { PIECE_NAMES, Owner } from '../types';
import { FormationType, FORMATION_DATA } from '../game/formations';
import { BOARD_SIZE } from '../game/board';

export function GameControls() {
  const {
    board,
    selectedPiece,
    currentPlayer,
    humanPlayer,
    winner,
    isAITurn,
    convertMode,
    volleyMode,
    zoneFormations,
    crossbowFire,
    archerFire,
    toggleVolleyMode,
    toggleConvertMode,
    divisionMove,
    changeFormation,
  } = useGameStore();

  const [selectedZone, setSelectedZone] = useState<'left' | 'center' | 'right'>('center');
  const [selectedFormation, setSelectedFormation] = useState<FormationType>(FormationType.LINE);

  // Count pieces for each side
  const pieceCount = useMemo(() => {
    let red = 0;
    let black = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.owner === Owner.RED) red++;
          else black++;
        }
      }
    }
    return { red, black };
  }, [board]);

  const canFireCrossbow = selectedPiece?.type === 'X' && 
    !selectedPiece.isReloading && 
    canCrossbowFire(board, selectedPiece);
  
  const canFireArcher = selectedPiece?.type === 'B' && 
    !selectedPiece.isReloading && 
    canArcherFire(board, selectedPiece);
  
  const canVolley = selectedPiece?.type === 'B' && 
    !selectedPiece.isReloading && 
    getVolleyTargets(board, selectedPiece).length > 0;
  
  const canConvert = selectedPiece?.type === 'P' && 
    getConvertTargets(board, selectedPiece).length > 0;

  const isMyTurn = currentPlayer === humanPlayer && !isAITurn;

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg space-y-4 w-64">
      {/* Status */}
      <div className="text-center">
        {winner ? (
          <div className={`text-2xl font-bold ${winner === humanPlayer ? 'text-green-400' : 'text-red-400'}`}>
            {winner === humanPlayer ? '🎉 You Win!' : '💀 You Lose'}
          </div>
        ) : (
          <div className={`text-lg font-semibold ${isMyTurn ? 'text-green-400' : 'text-yellow-400'}`}>
            {isAITurn ? 'AI is thinking...' : `${currentPlayer}'s turn`}
          </div>
        )}
      </div>

      {/* Piece Counter */}
      <div className="bg-gray-700 p-2 rounded">
        <div className="text-xs text-gray-400 text-center mb-1">Pieces Remaining</div>
        <div className="flex justify-around text-sm">
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg">{pieceCount.red}</div>
            <div className="text-red-300 text-xs">RED</div>
          </div>
          <div className="text-gray-500">vs</div>
          <div className="text-center">
            <div className="text-gray-300 font-bold text-lg">{pieceCount.black}</div>
            <div className="text-gray-400 text-xs">BLACK</div>
          </div>
        </div>
      </div>

      {/* Quick help for ranged units */}
      {isMyTurn && !winner && !selectedPiece && (
        <div className="bg-gray-700/50 p-2 rounded text-xs text-gray-400">
          <div className="font-semibold text-gray-300 mb-1">💡 Ranged Units:</div>
          <div>• <span className="text-orange-400">X</span> Crossbow: Click to select, then "Crossbow Fire" to shoot forward</div>
          <div>• <span className="text-orange-400">B</span> Archer: Click to select, then "Archer Fire" or "Volley" for area attack</div>
          <div className="mt-1 text-yellow-500">Select a ranged unit to see attack options!</div>
        </div>
      )}

      {/* Selected piece info */}
      {selectedPiece && (
        <div className="bg-gray-700 p-3 rounded">
          <div className="font-semibold">Selected: {PIECE_NAMES[selectedPiece.type]}</div>
          <div className="text-sm text-gray-300">
            Position: ({selectedPiece.row + 1}, {selectedPiece.col + 1})
          </div>
          {selectedPiece.isReloading && (
            <div className="text-sm text-yellow-400">Reloading...</div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isMyTurn && selectedPiece && (
        <div className="space-y-2">
          {canFireCrossbow && (
            <button
              onClick={crossbowFire}
              className="w-full bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded font-semibold transition"
            >
              🏹 Crossbow Fire
            </button>
          )}

          {canFireArcher && (
            <button
              onClick={archerFire}
              className="w-full bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded font-semibold transition"
            >
              🎯 Archer Fire
            </button>
          )}

          {canVolley && (
            <button
              onClick={toggleVolleyMode}
              className={`w-full px-4 py-2 rounded font-semibold transition ${
                volleyMode
                  ? 'bg-orange-400 ring-2 ring-white'
                  : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              💥 Volley {volleyMode && '(Select Target)'}
            </button>
          )}

          {canConvert && (
            <button
              onClick={toggleConvertMode}
              className={`w-full px-4 py-2 rounded font-semibold transition ${
                convertMode
                  ? 'bg-purple-400 ring-2 ring-white'
                  : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              ✝️ Convert {convertMode && '(Select Target)'}
            </button>
          )}
        </div>
      )}

      {/* Division moves */}
      {isMyTurn && !winner && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-400">Division Moves:</div>
          
          {/* Full division move (all rows) */}
          <div className="text-xs text-gray-500 mb-1">Full Division:</div>
          <div className="grid grid-cols-3 gap-1 text-xs mb-2">
            {(['left', 'center', 'right'] as const).map((zone) => (
              <div key={zone} className="flex flex-col gap-1">
                <span className="text-gray-400 capitalize text-center">{zone}</span>
                <button
                  onClick={() => divisionMove(zone, 'forward')}
                  className="bg-blue-600 hover:bg-blue-500 px-1 py-1 rounded transition"
                >
                  ↑
                </button>
                <button
                  onClick={() => divisionMove(zone, 'back')}
                  className="bg-blue-600 hover:bg-blue-500 px-1 py-1 rounded transition"
                >
                  ↓
                </button>
              </div>
            ))}
          </div>

          {/* Vertical zone moves */}
          <div className="text-xs text-gray-500 mb-1">By Formation Line:</div>
          <div className="space-y-1 text-xs">
            {(['front', 'main', 'rear'] as const).map((vZone) => (
              <div key={vZone} className="flex items-center gap-1">
                <span className="w-10 text-gray-400 capitalize">{vZone}:</span>
                {(['left', 'center', 'right'] as const).map((zone) => (
                  <div key={zone} className="flex gap-0.5">
                    <button
                      onClick={() => divisionMove(zone, 'forward', vZone)}
                      className="bg-indigo-600 hover:bg-indigo-500 px-1 py-0.5 rounded-l transition"
                      title={`${vZone} ${zone} forward`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => divisionMove(zone, 'back', vZone)}
                      className="bg-indigo-600 hover:bg-indigo-500 px-1 py-0.5 rounded-r transition"
                      title={`${vZone} ${zone} back`}
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formation selection */}
      {isMyTurn && !winner && (
        <div className="space-y-2 border-t border-gray-600 pt-3">
          <div className="text-sm font-semibold text-gray-400">Change Formation:</div>
          
          {/* Current formations display */}
          <div className="text-xs text-gray-500 space-y-1">
            {(['left', 'center', 'right'] as const).map((zone) => (
              <div key={zone} className="flex justify-between">
                <span className="capitalize">{zone}:</span>
                <span className="text-gray-300">
                  {FORMATION_DATA[zoneFormations[zone]]?.symbol || '—'} {FORMATION_DATA[zoneFormations[zone]]?.name || 'Line'}
                </span>
              </div>
            ))}
          </div>

          {/* Zone selector */}
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`flex-1 px-2 py-1 rounded text-xs transition ${
                  selectedZone === zone
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </button>
            ))}
          </div>

          {/* Formation selector */}
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value as FormationType)}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            {Object.values(FormationType).map((formation) => (
              <option key={formation} value={formation}>
                {FORMATION_DATA[formation].symbol} {FORMATION_DATA[formation].name}
              </option>
            ))}
          </select>

          {/* Formation description */}
          <div className="text-xs text-gray-400">
            {FORMATION_DATA[selectedFormation].description}
          </div>

          {/* Apply button */}
          <button
            onClick={() => changeFormation(selectedZone, selectedFormation)}
            className="w-full bg-green-600 hover:bg-green-500 px-3 py-2 rounded font-semibold transition text-sm"
          >
            Apply {FORMATION_DATA[selectedFormation].name} to {selectedZone.charAt(0).toUpperCase() + selectedZone.slice(1)}
          </button>
          
          <div className="text-xs text-yellow-400">
            ⚠️ Formation changes give opponent 2 bonus turns!
          </div>
        </div>
      )}
    </div>
  );
}
