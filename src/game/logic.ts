/**
 * Zhanguo Qi - Game Logic
 */

import { Piece, Owner, PieceType, Position, PIECE_NAMES } from '../types';
import {
  BOARD_SIZE,
  isValidPosition,
  getPiece,
  findPieceByType,
  movePiece,
  removePiece,
  cloneBoard,
} from './board';

// ============= PIECE UTILITIES =============

export function isSiege(piece: Piece): boolean {
  return piece.type === 'S';
}

export function isInfantry(piece: Piece): boolean {
  return piece.type === 'I';
}

export function isCavalry(piece: Piece): boolean {
  return piece.type === 'V';
}

export function isCommander(piece: Piece): boolean {
  return ['G', 'H', 'N', 'L', 'R', 'K'].includes(piece.type);
}

export function isVanguard(piece: Piece): boolean {
  return piece.type === 'K';
}

export function isGeneral(piece: Piece): boolean {
  return piece.type === 'G';
}

export function isRanged(piece: Piece): boolean {
  return piece.type === 'X' || piece.type === 'B';
}

export function isHQ(piece: Piece): boolean {
  return piece.type === 'H';
}

export function isChariot(piece: Piece): boolean {
  return piece.type === 'T';
}

export function isPriest(piece: Piece): boolean {
  return piece.type === 'P';
}

export function isArcher(piece: Piece): boolean {
  return piece.type === 'B';
}

export function isCrossbowman(piece: Piece): boolean {
  return piece.type === 'X';
}

export function getSymbol(piece: Piece): string {
  return piece.owner === Owner.RED
    ? piece.type.toUpperCase()
    : piece.type.toLowerCase();
}

// ============= MOVEMENT VALIDATION =============

export function getValidMoves(
  board: (Piece | null)[][],
  piece: Piece,
  currentPlayer: Owner
): Position[] {
  if (piece.owner !== currentPlayer) return [];

  const moves: Position[] = [];
  const { type } = piece;

  switch (type) {
    case 'G': // General/HQ - 1 orthogonal, stay near start
      addOrthogonalMoves(board, piece, moves, 1);
      break;

    case 'K': // Vanguard - up to 2 any direction
    case 'N':
    case 'L':
    case 'R': // Commanders - up to 2 any direction
      addAllDirectionMoves(board, piece, moves, 2);
      break;

    case 'A': // Advisor - 1 diagonal only
      addDiagonalMoves(board, piece, moves, 1);
      break;

    case 'I': // Infantry - 1 forward or sideways
      addInfantryMoves(board, piece, moves);
      break;

    case 'V': // Cavalry - L-shape (knight move)
      addKnightMoves(board, piece, moves);
      break;

    case 'X': // Crossbowman - 1 any direction (melee)
      addAllDirectionMoves(board, piece, moves, 1);
      break;

    case 'S': // Siege - 1 orthogonal
      addOrthogonalMoves(board, piece, moves, 1);
      break;

    case 'T': // Chariot - 2 orthogonal (straight line)
      addChariotMoves(board, piece, moves);
      break;

    case 'B': // Archer - 1 any direction
      addAllDirectionMoves(board, piece, moves, 1);
      break;

    case 'P': // Priest - 1 any direction (cannot capture, only move to empty)
      addPriestMoves(board, piece, moves);
      break;
  }

  return moves;
}

function addOrthogonalMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[],
  range: number
) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    for (let i = 1; i <= range; i++) {
      const nr = piece.row + dr * i;
      const nc = piece.col + dc * i;
      if (!isValidPosition(nr, nc)) break;
      const target = getPiece(board, nr, nc);
      if (!target) {
        moves.push({ row: nr, col: nc });
      } else if (target.owner !== piece.owner) {
        moves.push({ row: nr, col: nc });
        break;
      } else {
        break;
      }
    }
  }
}

function addDiagonalMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[],
  range: number
) {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  for (const [dr, dc] of directions) {
    for (let i = 1; i <= range; i++) {
      const nr = piece.row + dr * i;
      const nc = piece.col + dc * i;
      if (!isValidPosition(nr, nc)) break;
      const target = getPiece(board, nr, nc);
      if (!target) {
        moves.push({ row: nr, col: nc });
      } else if (target.owner !== piece.owner) {
        moves.push({ row: nr, col: nc });
        break;
      } else {
        break;
      }
    }
  }
}

function addAllDirectionMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[],
  range: number
) {
  addOrthogonalMoves(board, piece, moves, range);
  addDiagonalMoves(board, piece, moves, range);
}

// Priests can only move to empty squares - they convert, not capture
function addPriestMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[]
) {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // orthogonal
    [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
  ];
  for (const [dr, dc] of directions) {
    const nr = piece.row + dr;
    const nc = piece.col + dc;
    if (!isValidPosition(nr, nc)) continue;
    const target = getPiece(board, nr, nc);
    // Priests can only move to empty squares
    if (!target) {
      moves.push({ row: nr, col: nc });
    }
  }
}

function addInfantryMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[]
) {
  // RED at BOTTOM (rows 14-24): forward = -1 (up toward river)
  // BLACK at TOP (rows 0-10): forward = +1 (down toward river)
  const forward = piece.owner === Owner.RED ? -1 : 1;
  const backward = -forward;
  
  // Check if on own side (can retreat) or enemy side (cannot retreat)
  // RED's own side is rows 14-24, BLACK's own side is rows 0-10
  const isOnOwnSide = piece.owner === Owner.RED 
    ? piece.row >= 14 
    : piece.row <= 10;
  
  // Forward and sideways always allowed
  const directions: [number, number][] = [
    [forward, 0], // forward
    [0, -1], // left
    [0, 1], // right
  ];
  
  // Backward only allowed on own side
  if (isOnOwnSide) {
    directions.push([backward, 0]);
  }
  
  for (const [dr, dc] of directions) {
    const nr = piece.row + dr;
    const nc = piece.col + dc;
    if (!isValidPosition(nr, nc)) continue;
    const target = getPiece(board, nr, nc);
    if (!target || target.owner !== piece.owner) {
      moves.push({ row: nr, col: nc });
    }
  }
}

function addKnightMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[]
) {
  const offsets = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  for (const [dr, dc] of offsets) {
    const nr = piece.row + dr;
    const nc = piece.col + dc;
    if (!isValidPosition(nr, nc)) continue;
    const target = getPiece(board, nr, nc);
    if (!target || target.owner !== piece.owner) {
      moves.push({ row: nr, col: nc });
    }
  }
}

function addChariotMoves(
  board: (Piece | null)[][],
  piece: Piece,
  moves: Position[]
) {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    // Chariot moves exactly 2 squares in a straight line
    const nr = piece.row + dr * 2;
    const nc = piece.col + dc * 2;

    // Check intermediate square is not blocked by friendly
    const midR = piece.row + dr;
    const midC = piece.col + dc;
    if (!isValidPosition(midR, midC)) continue;
    const midPiece = getPiece(board, midR, midC);
    if (midPiece && midPiece.owner === piece.owner) continue;

    if (!isValidPosition(nr, nc)) continue;
    const target = getPiece(board, nr, nc);
    if (!target || target.owner !== piece.owner) {
      moves.push({ row: nr, col: nc });
    }
  }
}

// ============= SPECIAL ACTIONS =============

export function canCrossbowFire(
  board: (Piece | null)[][],
  piece: Piece
): Position | null {
  if (piece.type !== 'X') return null;

  // RED at BOTTOM (high rows): fires up (-1), BLACK at TOP (low rows): fires down (+1)
  const direction = piece.owner === Owner.RED ? -1 : 1;
  
  // Check if enemy directly in front (can't shoot - too close for ranged)
  const frontRow = piece.row + direction;
  const frontPiece = getPiece(board, frontRow, piece.col);
  if (frontPiece && frontPiece.owner !== piece.owner) {
    return null; // Enemy in melee range - can't use ranged attack
  }
  
  // Scan for targets (range 2-3, skipping adjacent friendly)
  for (let i = 2; i <= 3; i++) {
    const tr = piece.row + direction * i;
    if (!isValidPosition(tr, piece.col)) break;
    const target = getPiece(board, tr, piece.col);
    if (target) {
      if (target.owner !== piece.owner && !isSiege(target)) {
        return { row: tr, col: piece.col };
      }
      break; // Blocked by any piece
    }
  }
  return null;
}

export function canArcherFire(
  board: (Piece | null)[][],
  piece: Piece
): Position | null {
  if (piece.type !== 'B') return null;

  // RED at BOTTOM (high rows): fires up (-1), BLACK at TOP (low rows): fires down (+1)
  const direction = piece.owner === Owner.RED ? -1 : 1;
  
  // Check if enemy directly in front (can't shoot - too close for ranged)
  const frontRow = piece.row + direction;
  const frontPiece = getPiece(board, frontRow, piece.col);
  if (frontPiece && frontPiece.owner !== piece.owner) {
    return null; // Enemy in melee range - can't use ranged attack
  }
  
  // Scan for targets (range 2-4, skipping adjacent friendly)
  for (let i = 2; i <= 4; i++) {
    const tr = piece.row + direction * i;
    if (!isValidPosition(tr, piece.col)) break;
    const target = getPiece(board, tr, piece.col);
    if (target) {
      if (target.owner !== piece.owner && !isSiege(target)) {
        return { row: tr, col: piece.col };
      }
      break; // Blocked by any piece
    }
  }
  return null;
}

export function getVolleyTargets(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  if (piece.type !== 'B') return [];  // No reload needed

  const targets: Position[] = [];
  // RED at BOTTOM (high rows): fires up (-1), BLACK at TOP (low rows): fires down (+1)
  const direction = piece.owner === Owner.RED ? -1 : 1;

  // Volley can hit row 4-6 squares ahead
  for (let dist = 4; dist <= 6; dist++) {
    const tr = piece.row + direction * dist;
    for (let dc = -1; dc <= 1; dc++) {
      const tc = piece.col + dc;
      if (!isValidPosition(tr, tc)) continue;
      const target = getPiece(board, tr, tc);
      if (target && target.owner !== piece.owner && !isSiege(target)) {
        targets.push({ row: tr, col: tc });
      }
    }
  }
  return targets;
}

export function getConvertTargets(
  board: (Piece | null)[][],
  piece: Piece
): Position[] {
  if (piece.type !== 'P') return [];

  const targets: Position[] = [];
  // Adjacent squares
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const tr = piece.row + dr;
      const tc = piece.col + dc;
      if (!isValidPosition(tr, tc)) continue;
      const target = getPiece(board, tr, tc);
      if (
        target &&
        target.owner !== piece.owner &&
        ['I', 'A'].includes(target.type)
      ) {
        targets.push({ row: tr, col: tc });
      }
    }
  }
  return targets;
}

// ============= THREAT DETECTION =============

/**
 * Get all positions threatened by enemy ranged units (crossbows and archers)
 * Returns positions where the human player's pieces are under threat
 */
export function getRangedThreats(
  board: (Piece | null)[][],
  enemyOwner: Owner
): Position[] {
  const threats: Position[] = [];
  const seen = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece || piece.owner !== enemyOwner) continue;

      // Check crossbow threats
      if (piece.type === 'X' && !piece.isReloading) {
        const target = canCrossbowFire(board, piece);
        if (target) {
          const key = `${target.row},${target.col}`;
          if (!seen.has(key)) {
            seen.add(key);
            threats.push(target);
          }
        }
      }

      // Check archer threats
      if (piece.type === 'B' && !piece.isReloading) {
        const target = canArcherFire(board, piece);
        if (target) {
          const key = `${target.row},${target.col}`;
          if (!seen.has(key)) {
            seen.add(key);
            threats.push(target);
          }
        }
        // Also check volley threats
        const volleyTargets = getVolleyTargets(board, piece);
        for (const vt of volleyTargets) {
          const key = `${vt.row},${vt.col}`;
          if (!seen.has(key)) {
            seen.add(key);
            threats.push(vt);
          }
        }
      }
    }
  }

  return threats;
}

// ============= WIN CONDITIONS =============

export function checkWinConditions(board: (Piece | null)[][]): Owner | null {
  // Win by capturing General (G) OR HQ (H)
  const redGeneral = findPieceByType(board, Owner.RED, 'G');
  const redHQ = findPieceByType(board, Owner.RED, 'H');
  const blackGeneral = findPieceByType(board, Owner.BLACK, 'G');
  const blackHQ = findPieceByType(board, Owner.BLACK, 'H');

  // RED loses if General OR HQ is captured/destroyed
  if (!redGeneral || redGeneral.health <= 0) return Owner.BLACK;
  if (!redHQ || redHQ.health <= 0) return Owner.BLACK;
  
  // BLACK loses if General OR HQ is captured/destroyed
  if (!blackGeneral || blackGeneral.health <= 0) return Owner.RED;
  if (!blackHQ || blackHQ.health <= 0) return Owner.RED;

  return null;
}

// ============= EXECUTE ACTIONS =============

export interface ActionResult {
  success: boolean;
  message: string;
  newBoard: (Piece | null)[][];
  bonusTurns?: number;
}

export function executeMove(
  board: (Piece | null)[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): ActionResult {
  const piece = getPiece(board, fromRow, fromCol);
  if (!piece) {
    return { success: false, message: 'No piece at source', newBoard: board };
  }

  const target = getPiece(board, toRow, toCol);
  
  // Priests cannot capture by moving - they must use convert ability
  if (piece.type === 'P' && target && target.owner !== piece.owner) {
    return { success: false, message: 'Priests cannot capture - use Convert ability', newBoard: board };
  }

  const { newBoard, captured } = movePiece(board, fromRow, fromCol, toRow, toCol);

  let message: string;
  if (captured) {
    const targetName = PIECE_NAMES[captured.type];
    message = `${getSymbol(piece)} captures ${getSymbol(captured)} (${targetName})!`;
  } else {
    message = `Moved ${getSymbol(piece)} to (${toRow + 1},${toCol + 1})`;
  }

  return { success: true, message, newBoard };
}

export function executeCrossbowFire(
  board: (Piece | null)[][],
  piece: Piece
): ActionResult {
  const targetPos = canCrossbowFire(board, piece);
  if (!targetPos) {
    return { success: false, message: 'No valid target', newBoard: board };
  }

  const target = getPiece(board, targetPos.row, targetPos.col);
  if (!target) {
    return { success: false, message: 'Target lost', newBoard: board };
  }

  const newBoard = removePiece(board, targetPos.row, targetPos.col);
  // No reload needed - can fire every turn

  const targetName = PIECE_NAMES[target.type];
  return {
    success: true,
    message: `Crossbow fires: HIT! Killed ${getSymbol(target)} (${targetName})`,
    newBoard,
  };
}

export function executeArcherFire(
  board: (Piece | null)[][],
  piece: Piece
): ActionResult {
  const targetPos = canArcherFire(board, piece);
  if (!targetPos) {
    return { success: false, message: 'No valid target', newBoard: board };
  }

  const target = getPiece(board, targetPos.row, targetPos.col);
  if (!target) {
    return { success: false, message: 'Target lost', newBoard: board };
  }

  const newBoard = removePiece(board, targetPos.row, targetPos.col);
  // No reload needed - can fire every turn

  const targetName = PIECE_NAMES[target.type];
  return {
    success: true,
    message: `Archer fires: HIT! Killed ${getSymbol(target)} (${targetName})`,
    newBoard,
  };
}

export function executeVolley(
  board: (Piece | null)[][],
  piece: Piece,
  targetPos: Position
): ActionResult {
  const targets = getVolleyTargets(board, piece);
  const isValid = targets.some(
    (t) => t.row === targetPos.row && t.col === targetPos.col
  );

  if (!isValid) {
    return { success: false, message: 'Invalid volley target', newBoard: board };
  }

  const target = getPiece(board, targetPos.row, targetPos.col);
  if (!target) {
    return { success: false, message: 'Target lost', newBoard: board };
  }

  const newBoard = removePiece(board, targetPos.row, targetPos.col);
  // No reload needed - can fire every turn

  const targetName = PIECE_NAMES[target.type];
  return {
    success: true,
    message: `Volley! Killed ${getSymbol(target)} (${targetName})`,
    newBoard,
  };
}

export function executeConvert(
  board: (Piece | null)[][],
  priest: Piece,
  targetPos: Position
): ActionResult {
  const targets = getConvertTargets(board, priest);
  const isValid = targets.some(
    (t) => t.row === targetPos.row && t.col === targetPos.col
  );

  if (!isValid) {
    return { success: false, message: 'Invalid convert target', newBoard: board };
  }

  const target = getPiece(board, targetPos.row, targetPos.col);
  if (!target) {
    return { success: false, message: 'Target lost', newBoard: board };
  }

  const newBoard = cloneBoard(board);
  const converted = newBoard[targetPos.row][targetPos.col];
  if (converted) {
    converted.owner = priest.owner;
  }

  const targetName = PIECE_NAMES[target.type];
  return {
    success: true,
    message: `Priest converts ${getSymbol(target)} (${targetName})!`,
    newBoard,
  };
}

export function executeDivisionMove(
  board: (Piece | null)[][],
  owner: Owner,
  zone: 'left' | 'center' | 'right',
  direction: 'forward' | 'back',
  verticalZone?: 'front' | 'main' | 'rear'
): ActionResult {
  // Horizontal zone ranges matching boardConfig.json for 25x25 board
  const colRanges: Record<string, [number, number]> = {
    left: [0, 6],       // Cols 0-6
    center: [8, 16],    // Cols 8-16 (skip gap at 7)
    right: [18, 24],    // Cols 18-24 (skip gap at 17)
  };
  
  // Vertical zone ranges for 25x25 board
  const verticalRanges: Record<string, Record<string, [number, number]>> = {
    [Owner.RED]: {
      front: [14, 17],   // Front line
      main: [18, 20],    // Main body (around G)
      rear: [21, 24],    // Rear guard (around H)
    },
    [Owner.BLACK]: {
      front: [7, 10],    // Front line
      main: [4, 6],      // Main body (around G)
      rear: [0, 3],      // Rear guard (around H)
    },
  };

  const commanderTypes: Record<string, PieceType> = {
    left: 'L',
    center: 'N',
    right: 'R',
  };

  const [minCol, maxCol] = colRanges[zone];
  const commander = findPieceByType(board, owner, commanderTypes[zone]);

  if (!commander) {
    return { success: false, message: 'No commander in zone', newBoard: board };
  }

  // RED is at BOTTOM (rows 14-24), forward = -row (toward river)
  // BLACK is at TOP (rows 0-10), forward = +row (toward river)
  const dr = owner === Owner.RED
    ? (direction === 'forward' ? -1 : 1)
    : (direction === 'forward' ? 1 : -1);

  const newBoard = cloneBoard(board);
  let movedCount = 0;
  let capturedCount = 0;

  // Determine row range based on vertical zone
  let minRow = 0;
  let maxRow = BOARD_SIZE - 1;
  
  if (verticalZone) {
    const vRanges = verticalRanges[owner];
    [minRow, maxRow] = vRanges[verticalZone];
  }

  // Find all pieces in zone belonging to owner
  const piecesToMove: Piece[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const piece = newBoard[r][c];
      if (piece && piece.owner === owner) {
        // H (HQ) never moves in division moves
        if (piece.type === 'H') continue;
        // G only moves in 'main' vertical zone division moves
        if (piece.type === 'G' && verticalZone !== 'main') continue;
        piecesToMove.push(piece);
      }
    }
  }

  // Move pieces (from front to back to avoid collisions)
  piecesToMove.sort((a, b) => (dr < 0 ? a.row - b.row : b.row - a.row));

  for (const piece of piecesToMove) {
    const newRow = piece.row + dr;
    if (!isValidPosition(newRow, piece.col)) continue;
    
    const target = getPiece(newBoard, newRow, piece.col);
    
    // Can't move into friendly piece
    if (target && target.owner === owner) continue;
    
    // Capture enemy piece if present (except commanders can't be captured by division move)
    if (target && target.owner !== owner) {
      if (isCommander(target)) continue; // Can't capture commander with division move
      // Capture the enemy!
      capturedCount++;
    }

    // Move the piece
    newBoard[piece.row][piece.col] = null;
    piece.row = newRow;
    newBoard[newRow][piece.col] = piece;
    movedCount++;
  }

  if (movedCount === 0) {
    return { success: false, message: 'No pieces could move', newBoard: board };
  }

  const zoneLabel = verticalZone ? `${verticalZone.toUpperCase()} ` : '';
  const captureMsg = capturedCount > 0 ? ` Captured ${capturedCount} enemies!` : '';
  return {
    success: true,
    message: `${zoneLabel}DIVISION MOVE ${zone} ${direction}: moved ${movedCount} pieces.${captureMsg}`,
    newBoard,
  };
}

// Reset reloading status at end of turn
export function resetReloading(
  board: (Piece | null)[][],
  owner: Owner
): (Piece | null)[][] {
  const newBoard = cloneBoard(board);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = newBoard[r][c];
      if (piece && piece.owner === owner && piece.isReloading) {
        piece.isReloading = false;
      }
    }
  }
  return newBoard;
}
