/**
 * Zhanguo Qi - Board Component
 */

import { useMemo } from 'react';
import { useGameStore } from '../store';
import { PieceComponent } from './Piece';
import { BOARD_SIZE, GAP_COLS, RIVER_ROWS, CONTESTED_CITY, LEFT_ZONE, CENTER_ZONE, RIGHT_ZONE } from '../game/board';
import { getVolleyTargets, getConvertTargets, getRangedThreats } from '../game/logic';
import { Owner } from '../types';

// Column labels for 25 columns (A-Y)
const COL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split(''); // 25 chars: A-Y

export function Board() {
  const {
    board,
    selectedPiece,
    validMoves,
    convertMode,
    volleyMode,
    selectPiece,
    movePiece,
    winner,
    isAITurn,
    humanPlayer,
    turnCount,
  } = useGameStore();

  // Board layout: BLACK at rows 0-10 (top), RED at rows 14-24 (bottom)
  // We want human's pieces at the BOTTOM of screen
  // If human is BLACK: flip board so BLACK (top rows) appears at bottom
  // If human is RED: no flip needed, RED already at bottom
  const shouldFlip = humanPlayer === Owner.BLACK;

  // Get positions threatened by enemy ranged units
  const enemyOwner = humanPlayer === Owner.BLACK ? Owner.RED : Owner.BLACK;
  const threatenedPositions = useMemo(() => {
    return getRangedThreats(board, enemyOwner);
  }, [board, enemyOwner]);

  // Get special targets for volley/convert modes
  const volleyTargets = selectedPiece && volleyMode
    ? getVolleyTargets(board, selectedPiece)
    : [];
  const convertTargets = selectedPiece && convertMode
    ? getConvertTargets(board, selectedPiece)
    : [];

  const handleCellClick = (row: number, col: number) => {
    if (winner || isAITurn) return;

    const piece = board[row][col];

    // Check if clicking on a valid move
    if (selectedPiece && validMoves.some((m) => m.row === row && m.col === col)) {
      movePiece(row, col);
      return;
    }

    // Check volley/convert targets
    if (volleyTargets.some((t) => t.row === row && t.col === col)) {
      selectPiece(row, col);
      return;
    }
    if (convertTargets.some((t) => t.row === row && t.col === col)) {
      selectPiece(row, col);
      return;
    }

    // Select piece
    if (piece) {
      selectPiece(row, col);
    } else {
      selectPiece(-1, -1); // Deselect
    }
  };

  // Division zones with GAP columns
  // Left: 0-5 (6 cols), Gap: 6, Center: 7-12 (6 cols), Gap: 13, Right: 14-18 (5 cols)
  const getZone = (col: number): 'left' | 'center' | 'right' | 'gap' => {
    if (col <= LEFT_ZONE.end) return 'left';
    if (GAP_COLS.includes(col)) return 'gap';
    if (col <= CENTER_ZONE.end) return 'center';
    return 'right';
  };

  const getCellStyle = (row: number, col: number) => {
    const isValidMove = validMoves.some((m) => m.row === row && m.col === col);
    const isVolleyTarget = volleyTargets.some((t) => t.row === row && t.col === col);
    const isConvertTarget = convertTargets.some((t) => t.row === row && t.col === col);
    const isRiver = RIVER_ROWS.includes(row);
    const isContestedCity = row === CONTESTED_CITY.row && col === CONTESTED_CITY.col;
    const isGap = GAP_COLS.includes(col);
    const zone = getZone(col);

    // Base colors - flat colors, no gradients
    let bgColor = 'bg-amber-100';
    
    if (isContestedCity) {
      bgColor = 'bg-yellow-400';
    } else if (isRiver) {
      bgColor = isGap ? 'bg-blue-300' : 'bg-blue-200';
    } else if (isGap) {
      bgColor = 'bg-gray-200';
    } else if (zone === 'left') {
      bgColor = 'bg-rose-100';
    } else if (zone === 'right') {
      bgColor = 'bg-sky-100';
    } else {
      bgColor = 'bg-amber-100';
    }

    // Check if this cell has a threatened piece (human's piece under ranged attack)
    const isThreatened = threatenedPositions.some((p) => p.row === row && p.col === col);

    let highlight = '';
    if (isValidMove) {
      highlight = 'ring-2 ring-inset ring-green-500 bg-green-200';
    } else if (isVolleyTarget) {
      highlight = 'ring-2 ring-inset ring-orange-500 bg-orange-200';
    } else if (isConvertTarget) {
      highlight = 'ring-2 ring-inset ring-purple-500 bg-purple-200';
    } else if (isThreatened) {
      highlight = 'ring-2 ring-inset ring-red-500';
    }

    return `${bgColor} ${highlight}`;
  };

  // Get display order for rows/cols based on flip
  const getDisplayIndex = (index: number) => shouldFlip ? (BOARD_SIZE - 1 - index) : index;

  return (
    <div className="inline-block">
      {/* Turn counter */}
      <div className="text-center mb-2 text-sm font-semibold text-gray-700">
        Turn {turnCount}
      </div>
      {/* Zone labels */}
      <div className="flex text-[10px] font-bold mb-1 ml-5">
        <div 
          className="text-rose-600 text-center bg-rose-50 rounded px-1"
          style={{ width: `${(LEFT_ZONE.end - LEFT_ZONE.start + 1) * 24}px` }}
        >
          LEFT
        </div>
        <div style={{ width: '24px' }}></div>
        <div 
          className="text-amber-700 text-center bg-amber-50 rounded px-1"
          style={{ width: `${(CENTER_ZONE.end - CENTER_ZONE.start + 1) * 24}px` }}
        >
          CENTER
        </div>
        <div style={{ width: '24px' }}></div>
        <div 
          className="text-sky-600 text-center bg-sky-50 rounded px-1"
          style={{ width: `${(RIGHT_ZONE.end - RIGHT_ZONE.start + 1) * 24}px` }}
        >
          RIGHT
        </div>
      </div>

      <div className="flex">
        {/* Row numbers - left side */}
        <div className="flex flex-col justify-around pr-1 text-[10px] font-mono text-gray-500">
          {Array.from({ length: BOARD_SIZE }).map((_, displayRow) => {
            const row = getDisplayIndex(displayRow);
            return (
              <div key={row} className="h-6 flex items-center justify-end w-4">
                {row}
              </div>
            );
          })}
        </div>

        <div className="border-4 border-amber-800 rounded-lg shadow-2xl bg-amber-200">
          {/* Column letters - top */}
          <div className="flex border-b border-amber-600">
            {Array.from({ length: BOARD_SIZE }).map((_, displayCol) => {
              const col = getDisplayIndex(displayCol);
              const isGap = GAP_COLS.includes(col);
              return (
                <div 
                  key={col} 
                  className={`w-6 h-4 text-[10px] font-mono text-center ${isGap ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {COL_LABELS[col] || '?'}
                </div>
              );
            })}
          </div>

          {/* Board grid */}
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 24px)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 24px)`,
            }}
          >
            {Array.from({ length: BOARD_SIZE }).map((_, displayRow) =>
              Array.from({ length: BOARD_SIZE }).map((_, displayCol) => {
                const row = getDisplayIndex(displayRow);
                const col = getDisplayIndex(displayCol);
                
                const piece = board[row][col];
                const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;

                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={`
                      w-6 h-6
                      flex items-center justify-center
                      border border-amber-300/30
                      cursor-pointer
                      ${getCellStyle(row, col)}
                    `}
                  >
                    {piece && (
                      <PieceComponent
                        piece={piece}
                        isSelected={isSelected}
                        onClick={() => handleCellClick(row, col)}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Column letters - bottom */}
          <div className="flex border-t border-amber-600">
            {Array.from({ length: BOARD_SIZE }).map((_, displayCol) => {
              const col = getDisplayIndex(displayCol);
              const isGap = GAP_COLS.includes(col);
              return (
                <div 
                  key={col} 
                  className={`w-6 h-4 text-[10px] font-mono text-center ${isGap ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {COL_LABELS[col] || '?'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row numbers - right side */}
        <div className="flex flex-col justify-around pl-1 text-[10px] font-mono text-gray-500">
          {Array.from({ length: BOARD_SIZE }).map((_, displayRow) => {
            const row = getDisplayIndex(displayRow);
            return (
              <div key={row} className="h-6 flex items-center justify-start w-4">
                {row}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-3 text-[10px] mt-1 text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-200 border"></span> River
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 border"></span> City
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-200 border"></span> Gap
        </span>
      </div>
    </div>
  );
}
