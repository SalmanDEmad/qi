/**
 * Zhanguo Qi - Game Types
 */

import { FormationType } from '../game/formations';

export enum Owner {
  RED = 'Red',
  BLACK = 'Black',
}

export enum Difficulty {
  EASY = 'Easy',
  NORMAL = 'Normal',
  EXPERT = 'Expert',
}

export type PieceType =
  | 'G' // General (3 HP)
  | 'H' // HQ (3 HP, can't move)
  | 'K' // Vanguard Commander
  | 'N' // Noble (Center Commander)
  | 'L' // Commander Left
  | 'R' // Commander Right
  | 'A' // Advisor
  | 'I' // Infantry
  | 'V' // Cavalry
  | 'X' // Crossbowman (no reload)
  | 'S' // Siege
  | 'T' // Chariot
  | 'B' // Archer (no reload)
  | 'P'; // Priest

export interface Piece {
  type: PieceType;
  owner: Owner;
  row: number;
  col: number;
  isReloading: boolean;
  health: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
}

export type ActionType =
  | 'move'
  | 'crossbow_fire'
  | 'archer_fire'
  | 'archer_volley'
  | 'convert'
  | 'division_move'
  | 'barricade';

export interface GameAction {
  type: ActionType;
  piece?: Piece;
  from?: Position;
  to?: Position;
  direction?: string;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Owner;
  selectedPiece: Piece | null;
  validMoves: Position[];
  gameLog: string[];
  winner: Owner | null;
  bonusTurns: number;
  convertMode: boolean;
  volleyMode: boolean;
  zoneFormations: Record<string, FormationType>;
  turnCount: number;
  difficulty: Difficulty;
}

export const PIECE_NAMES: Record<PieceType, string> = {
  G: 'General',
  H: 'HQ',
  K: 'Vanguard',
  N: 'Noble (Center)',
  L: 'Commander (Left)',
  R: 'Commander (Right)',
  A: 'Advisor',
  I: 'Infantry',
  V: 'Cavalry',
  X: 'Crossbowman',
  S: 'Siege',
  T: 'Chariot',
  B: 'Archer',
  P: 'Priest',
};

export const PIECE_VALUES: Record<PieceType, number> = {
  G: 10000, // General - game over if captured
  H: 10000, // HQ - game over if captured
  K: 900,   // Vanguard - valuable forward commander
  N: 800,
  L: 800,
  R: 800,
  A: 200,
  I: 100,
  V: 300,
  X: 250,
  S: 350,
  T: 500,
  B: 300,
  P: 400,
};
