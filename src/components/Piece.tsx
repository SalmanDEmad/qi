/**
 * Zhanguo Qi - Piece Component
 */

import { Piece as PieceType, Owner, PIECE_NAMES } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  onClick: () => void;
}

const PIECE_COLORS = {
  [Owner.RED]: {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-800',
    shadow: 'shadow-red-400/50',
  },
  [Owner.BLACK]: {
    bg: 'bg-gray-800',
    text: 'text-white',
    border: 'border-gray-900',
    shadow: 'shadow-gray-600/50',
  },
};

export function PieceComponent({ piece, isSelected, onClick }: PieceProps) {
  const colors = PIECE_COLORS[piece.owner];
  const symbol = piece.owner === Owner.RED ? piece.type : piece.type.toLowerCase();

  return (
    <button
      onClick={onClick}
      className={`
        w-5 h-5 rounded-full
        flex items-center justify-center
        font-bold text-[10px]
        border transition-all duration-100
        ${colors.bg} ${colors.text} ${colors.border}
        ${isSelected ? `ring-2 ring-yellow-400 scale-110` : ''}
        ${piece.isReloading ? 'opacity-50' : ''}
      `}
      title={`${PIECE_NAMES[piece.type]} (${piece.owner})`}
    >
      {symbol}
    </button>
  );
}
