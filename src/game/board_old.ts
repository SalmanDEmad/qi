/**
 * Zhanguo Qi - Board Logic
 */

import { Piece, Owner, PieceType, Position } from '../types';

export const BOARD_SIZE = 15;

export function createPiece(
  type: PieceType,
  owner: Owner,
  row: number,
  col: number
): Piece {
  return {
    type,
    owner,
    row,
    col,
    isReloading: false,
    health: type === 'H' ? 3 : 1,
  };
}

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  // Helper to place pieces
  const place = (type: PieceType, owner: Owner, row: number, col: number) => {
    board[row][col] = createPiece(type, owner, row, col);
  };

  // ============================================================
  // WARRING STATES FORMATION - Three Division Setup
  // ============================================================
  // Key principles:
  // - Commanders WITH their troops (not in palace)
  // - Infantry has 2-3 row depth (not single line)
  // - Crossbows/Archers BEHIND infantry screens
  // - Clear Left/Center/Right division structure
  // - Cavalry on flanks, integrated with formation
  // - Reserves in rear (Siege, Priests)
  // ============================================================

  // === RED pieces (bottom, rows 8-14) ===
  
  // Row 14: HQ (protected rear)
  place('H', Owner.RED, 14, 7);
  
  // Row 13: Palace - General with Advisors
  place('A', Owner.RED, 13, 6);
  place('G', Owner.RED, 13, 7);
  place('A', Owner.RED, 13, 8);
  
  // Row 12: Reserves - Siege engines and Priests (rear support)
  place('P', Owner.RED, 12, 3);   // Left priest
  place('S', Owner.RED, 12, 5);   // Left siege
  place('A', Owner.RED, 12, 7);   // Center advisor (reserve)
  place('S', Owner.RED, 12, 9);   // Right siege
  place('P', Owner.RED, 12, 11);  // Right priest
  
  // Row 11: Command Row - Center Commander with support
  place('P', Owner.RED, 11, 7);   // Priest with center commander
  place('N', Owner.RED, 11, 6);   // CENTER COMMANDER - commands rows 10-8
  
  // Row 10: Second Line - Infantry with Wing Commanders
  place('V', Owner.RED, 10, 1);   // Left flank cavalry
  place('L', Owner.RED, 10, 2);   // LEFT COMMANDER - with left wing
  place('T', Owner.RED, 10, 3);   // Left chariot
  place('I', Owner.RED, 10, 5);   // Infantry
  place('I', Owner.RED, 10, 6);   // Infantry
  place('I', Owner.RED, 10, 7);   // Infantry (center)
  place('I', Owner.RED, 10, 8);   // Infantry
  place('I', Owner.RED, 10, 9);   // Infantry
  place('T', Owner.RED, 10, 11);  // Right chariot
  place('R', Owner.RED, 10, 12);  // RIGHT COMMANDER - with right wing
  place('V', Owner.RED, 10, 13);  // Right flank cavalry
  
  // Row 9: Ranged Row - Crossbows and Archers BEHIND infantry
  place('V', Owner.RED, 9, 2);    // Left cavalry support
  place('B', Owner.RED, 9, 4);    // Left archer
  place('X', Owner.RED, 9, 5);    // Left crossbow
  place('I', Owner.RED, 9, 7);    // Center infantry (screen)
  place('X', Owner.RED, 9, 9);    // Right crossbow
  place('B', Owner.RED, 9, 10);   // Right archer
  place('V', Owner.RED, 9, 12);   // Right cavalry support
  
  // Row 8: Front Line - Main battle line (first to contact)
  place('V', Owner.RED, 8, 1);    // Far left cavalry (flanking)
  place('I', Owner.RED, 8, 4);    // Left infantry
  place('I', Owner.RED, 8, 5);    // Infantry
  place('I', Owner.RED, 8, 6);    // Infantry
  place('I', Owner.RED, 8, 7);    // Center infantry
  place('I', Owner.RED, 8, 8);    // Infantry
  place('I', Owner.RED, 8, 9);    // Infantry
  place('I', Owner.RED, 8, 10);   // Right infantry
  place('V', Owner.RED, 8, 13);   // Far right cavalry (flanking)

  // === BLACK pieces (top, rows 0-6) - Mirror formation ===
  
  // Row 0: HQ (protected rear)
  place('H', Owner.BLACK, 0, 7);
  
  // Row 1: Palace - General with Advisors
  place('A', Owner.BLACK, 1, 6);
  place('G', Owner.BLACK, 1, 7);
  place('A', Owner.BLACK, 1, 8);
  
  // Row 2: Reserves - Siege engines and Priests
  place('P', Owner.BLACK, 2, 3);
  place('S', Owner.BLACK, 2, 5);
  place('A', Owner.BLACK, 2, 7);
  place('S', Owner.BLACK, 2, 9);
  place('P', Owner.BLACK, 2, 11);
  
  // Row 3: Command Row - Center Commander
  place('N', Owner.BLACK, 3, 8);  // CENTER COMMANDER
  place('P', Owner.BLACK, 3, 7);  // Priest support
  
  // Row 4: Second Line - Infantry with Wing Commanders
  place('V', Owner.BLACK, 4, 1);
  place('L', Owner.BLACK, 4, 2);  // LEFT COMMANDER
  place('T', Owner.BLACK, 4, 3);
  place('I', Owner.BLACK, 4, 5);
  place('I', Owner.BLACK, 4, 6);
  place('I', Owner.BLACK, 4, 7);
  place('I', Owner.BLACK, 4, 8);
  place('I', Owner.BLACK, 4, 9);
  place('T', Owner.BLACK, 4, 11);
  place('R', Owner.BLACK, 4, 12); // RIGHT COMMANDER
  place('V', Owner.BLACK, 4, 13);
  
  // Row 5: Ranged Row - Crossbows and Archers behind infantry
  place('V', Owner.BLACK, 5, 2);
  place('B', Owner.BLACK, 5, 4);
  place('X', Owner.BLACK, 5, 5);
  place('I', Owner.BLACK, 5, 7);
  place('X', Owner.BLACK, 5, 9);
  place('B', Owner.BLACK, 5, 10);
  place('V', Owner.BLACK, 5, 12);
  
  // Row 6: Front Line - Main battle line
  place('V', Owner.BLACK, 6, 1);
  place('I', Owner.BLACK, 6, 4);
  place('I', Owner.BLACK, 6, 5);
  place('I', Owner.BLACK, 6, 6);
  place('I', Owner.BLACK, 6, 7);
  place('I', Owner.BLACK, 6, 8);
  place('I', Owner.BLACK, 6, 9);
  place('I', Owner.BLACK, 6, 10);
  place('V', Owner.BLACK, 6, 13);

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
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
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
