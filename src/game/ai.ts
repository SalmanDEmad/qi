/**
 * Zhanguo Qi - AI Player (Improved)
 * 
 * Difficulty levels:
 * - EASY: Random from top 3 moves, no threat awareness
 * - NORMAL: Better prioritization, basic threat awareness
 * - EXPERT: Full tactical evaluation, protects pieces, strategic play
 */

import { Piece, Owner, Position, PIECE_VALUES, Difficulty } from '../types';
import {
  getPiece,
  getAllPieces,
  BOARD_SIZE,
  RIVER_ROWS,
} from './board';
import {
  getValidMoves,
  canCrossbowFire,
  canArcherFire,
  getVolleyTargets,
  getConvertTargets,
  executeMove,
  executeCrossbowFire,
  executeArcherFire,
  executeVolley,
  executeConvert,
  isSiege,
  isCommander,
  isRanged,
} from './logic';

interface ScoredAction {
  score: number;
  priority: number; // Higher = more urgent
  description: string;
  execute: () => { newBoard: (Piece | null)[][]; message: string };
}

export class AIPlayer {
  private owner: Owner;
  private enemy: Owner;
  private difficulty: Difficulty;

  constructor(owner: Owner, difficulty: Difficulty = Difficulty.NORMAL) {
    this.owner = owner;
    this.enemy = owner === Owner.RED ? Owner.BLACK : Owner.RED;
    this.difficulty = difficulty;
  }

  makeMove(board: (Piece | null)[][]): {
    success: boolean;
    message: string;
    newBoard: (Piece | null)[][];
  } {
    const actions = this.getAllActions(board);

    if (actions.length === 0) {
      return { success: false, message: 'No valid actions', newBoard: board };
    }

    // Sort by priority first, then score
    actions.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.score - a.score;
    });

    let chosen: ScoredAction;

    switch (this.difficulty) {
      case Difficulty.EASY: {
        // Random from top 3 moves
        const easyTop = Math.min(3, actions.length);
        chosen = actions[Math.floor(Math.random() * easyTop)];
        break;
      }

      case Difficulty.NORMAL: {
        // Take best move 70% of time, otherwise random from top 2
        if (Math.random() < 0.7 || actions[0].priority >= 100) {
          chosen = actions[0];
        } else {
          const normalTop = Math.min(2, actions.length);
          chosen = actions[Math.floor(Math.random() * normalTop)];
        }
        break;
      }

      case Difficulty.EXPERT: {
        // Always take best move, with lookahead consideration
        chosen = actions[0];
        break;
      }

      default:
        chosen = actions[0];
    }

    console.log(`AI (${this.difficulty}) chose: ${chosen.description} (score: ${chosen.score}, priority: ${chosen.priority})`);
    const result = chosen.execute();
    return { success: true, message: result.message, newBoard: result.newBoard };
  }

  private getAllActions(board: (Piece | null)[][]): ScoredAction[] {
    const actions: ScoredAction[] = [];
    const myPieces = getAllPieces(board, this.owner);
    
    // Analyze board state for strategic decisions
    const boardAnalysis = this.analyzeBoard(board);

    for (const piece of myPieces) {
      // Skip siege engines in normal/expert early game (don't spam siege moves)
      if (isSiege(piece) && this.difficulty !== Difficulty.EASY) {
        if (boardAnalysis.turnEstimate < 20 && !boardAnalysis.hasClearPath) {
          continue; // Don't move siege early
        }
      }

      // Regular moves
      const moves = getValidMoves(board, piece, this.owner);
      for (const move of moves) {
        const { score, priority } = this.evaluateMove(board, piece, move, boardAnalysis);
        actions.push({
          score,
          priority,
          description: `Move ${piece.type} (${piece.row},${piece.col}) → (${move.row},${move.col})`,
          execute: () => {
            const result = executeMove(board, piece.row, piece.col, move.row, move.col);
            return { newBoard: result.newBoard, message: result.message };
          },
        });
      }

      // Crossbow fire - HIGH PRIORITY
      if (piece.type === 'X' && !piece.isReloading) {
        const target = canCrossbowFire(board, piece);
        if (target) {
          const targetPiece = getPiece(board, target.row, target.col);
          const baseScore = targetPiece ? PIECE_VALUES[targetPiece.type] * 3 : 0;
          const priority = targetPiece && isCommander(targetPiece) ? 150 : 100;
          actions.push({
            score: baseScore,
            priority,
            description: `Crossbow fire at (${target.row},${target.col})`,
            execute: () => {
              const result = executeCrossbowFire(board, piece);
              return { newBoard: result.newBoard, message: result.message };
            },
          });
        }
      }

      // Archer fire - HIGH PRIORITY
      if (piece.type === 'B' && !piece.isReloading) {
        const target = canArcherFire(board, piece);
        if (target) {
          const targetPiece = getPiece(board, target.row, target.col);
          const baseScore = targetPiece ? PIECE_VALUES[targetPiece.type] * 3 : 0;
          const priority = targetPiece && isCommander(targetPiece) ? 150 : 100;
          actions.push({
            score: baseScore,
            priority,
            description: `Archer fire at (${target.row},${target.col})`,
            execute: () => {
              const result = executeArcherFire(board, piece);
              return { newBoard: result.newBoard, message: result.message };
            },
          });
        }

        // Volley - check for multiple targets
        const volleyTargets = getVolleyTargets(board, piece);
        if (volleyTargets.length > 0) {
          // Pick best volley target
          let bestTarget = volleyTargets[0];
          let bestValue = 0;
          for (const vt of volleyTargets) {
            const tp = getPiece(board, vt.row, vt.col);
            if (tp) {
              const val = PIECE_VALUES[tp.type];
              if (val > bestValue) {
                bestValue = val;
                bestTarget = vt;
              }
            }
          }
          if (bestValue > 0) {
            actions.push({
              score: bestValue * 2,
              priority: 90,
              description: `Volley at (${bestTarget.row},${bestTarget.col})`,
              execute: () => {
                const result = executeVolley(board, piece, bestTarget);
                return { newBoard: result.newBoard, message: result.message };
              },
            });
          }
        }
      }

      // Priest conversion - VERY HIGH PRIORITY (doubles army)
      if (piece.type === 'P') {
        const targets = getConvertTargets(board, piece);
        for (const target of targets) {
          const targetPiece = getPiece(board, target.row, target.col);
          if (targetPiece) {
            const baseScore = PIECE_VALUES[targetPiece.type] * 4; // Double value (remove enemy + gain unit)
            const priority = isCommander(targetPiece) ? 200 : 110;
            actions.push({
              score: baseScore,
              priority,
              description: `Convert ${targetPiece.type} at (${target.row},${target.col})`,
              execute: () => {
                const result = executeConvert(board, piece, target);
                return { newBoard: result.newBoard, message: result.message };
              },
            });
          }
        }
      }
    }

    return actions;
  }

  private analyzeBoard(board: (Piece | null)[][]): {
    myPieceCount: number;
    enemyPieceCount: number;
    turnEstimate: number;
    hasClearPath: boolean;
    myRangedCount: number;
    enemyRangedCount: number;
    generalThreatened: boolean;
  } {
    let myPieceCount = 0;
    let enemyPieceCount = 0;
    let myRangedCount = 0;
    let enemyRangedCount = 0;
    let generalThreatened = false;

    const myGeneral = this.findPiece(board, this.owner, 'G');
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = board[r][c];
        if (p) {
          if (p.owner === this.owner) {
            myPieceCount++;
            if (isRanged(p)) myRangedCount++;
          } else {
            enemyPieceCount++;
            if (isRanged(p)) enemyRangedCount++;
          }
        }
      }
    }

    // Check if general is threatened
    if (myGeneral && this.difficulty !== Difficulty.EASY) {
      generalThreatened = this.isSquareThreatened(board, myGeneral.row, myGeneral.col);
    }

    // Estimate turn number based on piece count vs starting count
    const startingPieces = 80; // Approximate
    const turnEstimate = Math.max(0, (startingPieces - myPieceCount - enemyPieceCount) * 2);

    // Check if there's a clear path to enemy (no major blockers in center)
    let hasClearPath = true;
    const centerCol = 12;
    for (const riverRow of RIVER_ROWS) {
      for (let c = centerCol - 2; c <= centerCol + 2; c++) {
        const p = getPiece(board, riverRow, c);
        if (p && p.owner === this.enemy) {
          hasClearPath = false;
          break;
        }
      }
    }

    return {
      myPieceCount,
      enemyPieceCount,
      turnEstimate,
      hasClearPath,
      myRangedCount,
      enemyRangedCount,
      generalThreatened,
    };
  }

  private evaluateMove(
    board: (Piece | null)[][],
    piece: Piece,
    to: Position,
    analysis: ReturnType<typeof this.analyzeBoard>
  ): { score: number; priority: number } {
    let score = 0;
    let priority = 50; // Base priority for moves

    const target = getPiece(board, to.row, to.col);

    // === CAPTURE EVALUATION ===
    if (target && target.owner !== piece.owner) {
      const captureValue = PIECE_VALUES[target.type] || 100;

      // Win condition - capture General or HQ
      if (target.type === 'G' || target.type === 'H') {
        return { score: 99999, priority: 999 };
      }

      score += captureValue * 2;
      priority = 80; // Captures are high priority

      // Bonus for capturing with cheaper piece (good trade)
      const myValue = PIECE_VALUES[piece.type] || 100;
      if (myValue < captureValue) {
        score += (captureValue - myValue);
        priority = 90;
      }

      // Extra bonus for capturing commanders
      if (isCommander(target)) {
        score += 500;
        priority = 95;
      }

      // Extra bonus for capturing ranged units (they're dangerous)
      if (isRanged(target)) {
        score += 200;
      }
    }

    // === ADVANCEMENT EVALUATION ===
    // RED at bottom (high rows), advances up (-row)
    // BLACK at top (low rows), advances down (+row)
    const forwardDir = this.owner === Owner.RED ? -1 : 1;
    const advancement = (to.row - piece.row) * forwardDir;
    
    if (advancement > 0) {
      // Forward movement bonus
      score += advancement * 15;
      
      // Extra bonus for advancing combat units
      if (piece.type === 'I' || piece.type === 'V' || piece.type === 'T') {
        score += advancement * 10;
      }
    }

    // === PIECE-SPECIFIC LOGIC ===
    
    // Siege: Only move forward if path is clear
    if (isSiege(piece)) {
      if (advancement > 0 && analysis.hasClearPath) {
        score += 50;
      } else if (advancement <= 0) {
        score -= 100; // Don't retreat siege
      }
    }

    // Ranged units: Stay back, don't advance too far
    if (isRanged(piece)) {
      // Check if we're moving into danger
      if (this.difficulty !== Difficulty.EASY) {
        if (this.isSquareThreatened(board, to.row, to.col)) {
          score -= 300;
        }
      }
      // Ranged should not be on front line
      const frontLine = this.owner === Owner.RED ? 11 : 13;
      const distanceFromFront = Math.abs(to.row - frontLine);
      if (distanceFromFront < 3) {
        score -= 100; // Too close to front
      }
    }

    // Commanders: Protect them!
    if (isCommander(piece)) {
      if (this.difficulty !== Difficulty.EASY) {
        if (this.isSquareThreatened(board, to.row, to.col)) {
          score -= 500; // Major penalty for exposing commander
          priority = 10; // Low priority - don't do this
        }
      }
    }

    // === DEFENSIVE EVALUATION ===
    
    // If general is threatened, prioritize blocking/protecting moves
    if (analysis.generalThreatened && this.difficulty === Difficulty.EXPERT) {
      const myGeneral = this.findPiece(board, this.owner, 'G');
      if (myGeneral) {
        // Moving to block an attacker
        const dist = Math.abs(to.row - myGeneral.row) + Math.abs(to.col - myGeneral.col);
        if (dist <= 2) {
          score += 200;
          priority = 85;
        }
      }
    }

    // === POSITIONAL EVALUATION ===
    
    // Center control bonus (center column is ~12 for 25-wide board)
    const centerCol = 12;
    const colDistFromCenter = Math.abs(to.col - centerCol);
    score += Math.max(0, 15 - colDistFromCenter);

    // Crossing river is valuable
    const isInRiver = RIVER_ROWS.includes(to.row);
    const wasBeforeRiver = this.owner === Owner.RED 
      ? piece.row > Math.max(...RIVER_ROWS)
      : piece.row < Math.min(...RIVER_ROWS);
    if (isInRiver && wasBeforeRiver) {
      score += 30; // Bonus for pushing into river
    }

    // Avoid clustering (don't stack pieces)
    let adjacentFriendly = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const adj = getPiece(board, to.row + dr, to.col + dc);
        if (adj && adj.owner === this.owner) {
          adjacentFriendly++;
        }
      }
    }
    if (adjacentFriendly > 3) {
      score -= 20; // Penalty for overcrowding
    }

    // === THREAT AVOIDANCE (Normal/Expert only) ===
    if (this.difficulty !== Difficulty.EASY) {
      if (PIECE_VALUES[piece.type] > 200) {
        if (this.isSquareThreatened(board, to.row, to.col)) {
          score -= PIECE_VALUES[piece.type] * 0.5;
        }
      }
    }

    // Small random factor for variety
    score += Math.random() * 3;

    return { score: Math.floor(score), priority };
  }

  private isSquareThreatened(
    board: (Piece | null)[][],
    row: number,
    col: number
  ): boolean {
    const enemyPieces = getAllPieces(board, this.enemy);
    
    for (const enemy of enemyPieces) {
      // Check regular movement threats
      const moves = getValidMoves(board, enemy, this.enemy);
      if (moves.some((m) => m.row === row && m.col === col)) {
        return true;
      }

      // Check ranged threats
      if (enemy.type === 'X') {
        const target = canCrossbowFire(board, enemy);
        if (target && target.row === row && target.col === col) {
          return true;
        }
      }
      if (enemy.type === 'B') {
        const target = canArcherFire(board, enemy);
        if (target && target.row === row && target.col === col) {
          return true;
        }
      }
    }
    return false;
  }

  private findPiece(board: (Piece | null)[][], owner: Owner, type: string): Piece | null {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = board[r][c];
        if (p && p.owner === owner && p.type === type) {
          return p;
        }
      }
    }
    return null;
  }
}
