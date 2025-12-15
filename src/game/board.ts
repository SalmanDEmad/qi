/**
 * Zhanguo Qi - Board Logic (19x19)
 * 
 * Board configuration loaded from boardConfig.json for easy customization.
 * 
 * BOARD LAYOUT:
 * - 19 columns × 19 rows
 * - LEFT:   Cols 0-5   (6 wide)
 * - GAP:    Col 6      (empty)
 * - CENTER: Cols 7-12  (6 wide)
 * - GAP:    Col 13     (empty)
 * - RIGHT:  Cols 14-18 (5 wide)
 * 
 * DEPTH STRUCTURE:
 * - Rows 0-2:   Red HQ/Rear
 * - Rows 3-4:   Red Reserves
 * - Rows 5-6:   Red Main Line (COMMANDERS HERE)
 * - Row 7:      Red Vanguard
 * - Rows 8-10:  RIVER (neutral zone)
 * - Row 11:     Black Vanguard
 * - Rows 12-13: Black Main Line (COMMANDERS HERE)
 * - Rows 14-15: Black Reserves
 * - Rows 16-18: Black HQ/Rear
 * 
 * Commanders (5 per side):
 * - G: General (3 HP)
 * - H: HQ (3 HP, can't move)
 * - K: Vanguard Commander
 * - L: Left Wing Commander
 * - N: Noble (Center Commander)
 * - R: Right Wing Commander
 */

import { Piece, Owner, PieceType } from '../types';
import boardConfig from './boardConfig.json';

// Export config values
export const BOARD_SIZE = boardConfig.boardSize;
export const RIVER_ROWS = boardConfig.river.rows;
export const CONTESTED_CITY = boardConfig.river.contestedCity;
export const GAP_COLS = boardConfig.gaps;
export const LEFT_ZONE = boardConfig.zones.left;
export const CENTER_ZONE = boardConfig.zones.center;
export const RIGHT_ZONE = boardConfig.zones.right;

// Vertical zones for division moves
export const VERTICAL_ZONES = boardConfig.verticalZones;

// Get vertical zone for a piece
export type VerticalZone = 'front' | 'main' | 'rear';
export function getVerticalZone(row: number, owner: Owner): VerticalZone | null {
  const zones = owner === Owner.RED ? VERTICAL_ZONES.red : VERTICAL_ZONES.black;
  if (row >= zones.front.start && row <= zones.front.end) return 'front';
  if (row >= zones.main.start && row <= zones.main.end) return 'main';
  if (row >= zones.rear.start && row <= zones.rear.end) return 'rear';
  return null; // In river or enemy territory
}

export function isGapColumn(col: number): boolean {
  return GAP_COLS.includes(col);
}

export function isRiverRow(row: number): boolean {
  return RIVER_ROWS.includes(row);
}

export function createPiece(
  type: PieceType,
  owner: Owner,
  row: number,
  col: number,
  health?: number
): Piece {
  // Default health: G and H have 3 HP, others have 1
  const defaultHealth = (type === 'G' || type === 'H') ? 3 : 1;
  return {
    type,
    owner,
    row,
    col,
    isReloading: false,
    health: health ?? defaultHealth,
  };
}

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Place RED pieces
  for (const p of boardConfig.red.pieces) {
    board[p.row][p.col] = createPiece(
      p.type as PieceType,
      Owner.RED,
      p.row,
      p.col,
      p.health
    );
  }

  // Place BLACK pieces
  for (const p of boardConfig.black.pieces) {
    board[p.row][p.col] = createPiece(
      p.type as PieceType,
      Owner.BLACK,
      p.row,
      p.col,
      p.health
    );
  }

  return board;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getPiece(
  board: (Piece | null)[][],
  row: number,
  col: number
): Piece | null {
  if (!isValidPosition(row, col)) return null;
  return board[row][col];
}

export function findPieceByType(
  board: (Piece | null)[][],
  owner: Owner,
  type: PieceType
): Piece | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.owner === owner && piece.type === type) {
        return piece;
      }
    }
  }
  return null;
}

export function getAllPieces(
  board: (Piece | null)[][],
  owner?: Owner
): Piece[] {
  const pieces: Piece[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && (owner === undefined || piece.owner === owner)) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row =>
    row.map(piece =>
      piece ? { ...piece } : null
    )
  );
}

export function getZoneForColumn(col: number): 'left' | 'center' | 'right' | 'gap' {
  if (col <= LEFT_ZONE.end) return 'left';
  if (GAP_COLS.includes(col)) return 'gap';
  if (col <= CENTER_ZONE.end) return 'center';
  if (GAP_COLS.includes(col)) return 'gap';
  return 'right';
}

export function isOnOwnSide(row: number, owner: Owner): boolean {
  // River is at rows 11-13
  // RED's own side is rows 14-24 (bottom, after river)
  // BLACK's own side is rows 0-10 (top, before river)
  if (owner === Owner.RED) {
    return row >= 14;
  } else {
    return row <= 10;
  }
}

export function isOnEnemySide(row: number, owner: Owner): boolean {
  // Enemy side is the opposite of own side, excluding river
  if (owner === Owner.RED) {
    return row <= 10; // RED's enemy side is BLACK's territory
  } else {
    return row >= 14;  // BLACK's enemy side is RED's territory
  }
}

export function movePiece(
  board: (Piece | null)[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): { newBoard: (Piece | null)[][]; captured: Piece | null } {
  const newBoard = cloneBoard(board);
  const piece = newBoard[fromRow][fromCol];
  const captured = newBoard[toRow][toCol];

  if (piece) {
    piece.row = toRow;
    piece.col = toCol;
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
  }

  return { newBoard, captured };
}

export function removePiece(
  board: (Piece | null)[][],
  row: number,
  col: number
): (Piece | null)[][] {
  const newBoard = cloneBoard(board);
  newBoard[row][col] = null;
  return newBoard;
}

/**
 * Deal damage to General/HQ based on adjacent enemies.
 * Any adjacent enemy deals 1 damage per turn.
 * Returns updated board.
 */
export function applyHQDamage(
  board: (Piece | null)[][],
  owner: Owner
): { newBoard: (Piece | null)[][]; damage: number } {
  const general = findPieceByType(board, owner, 'G');
  if (!general) return { newBoard: board, damage: 0 };
  
  const enemyOwner = owner === Owner.RED ? Owner.BLACK : Owner.RED;
  let adjacentEnemies = 0;
  
  // Count adjacent enemies
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = general.row + dr;
      const nc = general.col + dc;
      if (!isValidPosition(nr, nc)) continue;
      const piece = getPiece(board, nr, nc);
      if (piece && piece.owner === enemyOwner) {
        adjacentEnemies++;
      }
    }
  }
  
  if (adjacentEnemies === 0) return { newBoard: board, damage: 0 };
  
  // Deal 1 damage per adjacent enemy (simplified from original)
  const newBoard = cloneBoard(board);
  const hq = newBoard[general.row][general.col];
  if (hq) {
    hq.health = Math.max(0, hq.health - adjacentEnemies);
  }
  
  return { newBoard, damage: adjacentEnemies };
}
