/**
 * Zhanguo Qi - Game Store
 */

import { create } from 'zustand';
import { Owner, GameState, Difficulty } from '../types';
import {
  createInitialBoard,
  getPiece,
} from '../game/board';
import {
  getValidMoves,
  executeMove,
  executeCrossbowFire,
  executeArcherFire,
  executeVolley,
  executeConvert,
  executeDivisionMove,
  checkWinConditions,
  resetReloading,
  getVolleyTargets,
  getConvertTargets,
} from '../game/logic';
import { AIPlayer } from '../game/ai';
import { FormationType } from '../game/formations';

interface GameStore extends GameState {
  humanPlayer: Owner;
  aiPlayer: AIPlayer | null;
  isAITurn: boolean;

  // Actions
  initGame: (humanPlaysAs: Owner, difficulty?: Difficulty) => void;
  selectPiece: (row: number, col: number) => void;
  movePiece: (toRow: number, toCol: number) => void;
  crossbowFire: () => void;
  archerFire: () => void;
  toggleVolleyMode: () => void;
  toggleConvertMode: () => void;
  executeVolleyAt: (row: number, col: number) => void;
  executeConvertAt: (row: number, col: number) => void;
  divisionMove: (zone: 'left' | 'center' | 'right', direction: 'forward' | 'back', verticalZone?: 'front' | 'main' | 'rear') => void;
  changeFormation: (zone: 'left' | 'center' | 'right', formation: FormationType) => void;
  endTurn: () => void;
  triggerAITurn: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  board: createInitialBoard(),
  currentPlayer: Owner.BLACK,
  selectedPiece: null,
  validMoves: [],
  gameLog: ['Game started. BLACK moves first.'],
  winner: null,
  bonusTurns: 0,
  convertMode: false,
  volleyMode: false,
  humanPlayer: Owner.BLACK,
  aiPlayer: null,
  isAITurn: false,
  difficulty: Difficulty.NORMAL,
  turnCount: 1,
  zoneFormations: {
    left: FormationType.LINE,
    center: FormationType.LINE,
    right: FormationType.LINE,
  },

  initGame: (humanPlaysAs: Owner, difficulty: Difficulty = Difficulty.NORMAL) => {
    const aiOwner = humanPlaysAs === Owner.BLACK ? Owner.RED : Owner.BLACK;
    set({
      board: createInitialBoard(),
      currentPlayer: Owner.BLACK,
      selectedPiece: null,
      validMoves: [],
      gameLog: [`Game started (${difficulty} mode). BLACK moves first.`],
      winner: null,
      bonusTurns: 0,
      convertMode: false,
      volleyMode: false,
      humanPlayer: humanPlaysAs,
      aiPlayer: new AIPlayer(aiOwner, difficulty),
      isAITurn: humanPlaysAs !== Owner.BLACK,
      difficulty,
      turnCount: 1,
      zoneFormations: {
        left: FormationType.LINE,
        center: FormationType.LINE,
        right: FormationType.LINE,
      },
    });

    // If AI plays BLACK, trigger AI turn
    if (humanPlaysAs !== Owner.BLACK) {
      setTimeout(() => get().triggerAITurn(), 500);
    }
  },

  selectPiece: (row: number, col: number) => {
    const state = get();
    if (state.winner || state.isAITurn) return;
    if (state.currentPlayer !== state.humanPlayer) return;

    const piece = getPiece(state.board, row, col);

    // Handle volley mode targeting
    if (state.volleyMode && state.selectedPiece) {
      const targets = getVolleyTargets(state.board, state.selectedPiece);
      if (targets.some((t) => t.row === row && t.col === col)) {
        get().executeVolleyAt(row, col);
        return;
      }
    }

    // Handle convert mode targeting
    if (state.convertMode && state.selectedPiece) {
      const targets = getConvertTargets(state.board, state.selectedPiece);
      if (targets.some((t) => t.row === row && t.col === col)) {
        get().executeConvertAt(row, col);
        return;
      }
    }

    if (!piece || piece.owner !== state.currentPlayer) {
      set({ selectedPiece: null, validMoves: [], convertMode: false, volleyMode: false });
      return;
    }

    const moves = getValidMoves(state.board, piece, state.currentPlayer);
    set({ selectedPiece: piece, validMoves: moves, convertMode: false, volleyMode: false });
  },

  movePiece: (toRow: number, toCol: number) => {
    const state = get();
    if (!state.selectedPiece || state.winner || state.isAITurn) return;

    const isValidMove = state.validMoves.some(
      (m) => m.row === toRow && m.col === toCol
    );
    if (!isValidMove) return;

    const result = executeMove(
      state.board,
      state.selectedPiece.row,
      state.selectedPiece.col,
      toRow,
      toCol
    );

    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    }
  },

  crossbowFire: () => {
    const state = get();
    if (!state.selectedPiece || state.winner || state.isAITurn) return;
    if (state.selectedPiece.type !== 'X') return;

    const result = executeCrossbowFire(state.board, state.selectedPiece);
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    }
  },

  archerFire: () => {
    const state = get();
    if (!state.selectedPiece || state.winner || state.isAITurn) return;
    if (state.selectedPiece.type !== 'B') return;

    const result = executeArcherFire(state.board, state.selectedPiece);
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    }
  },

  toggleVolleyMode: () => {
    const state = get();
    if (!state.selectedPiece || state.selectedPiece.type !== 'B') return;
    set({ volleyMode: !state.volleyMode, convertMode: false });
  },

  toggleConvertMode: () => {
    const state = get();
    if (!state.selectedPiece || state.selectedPiece.type !== 'P') return;
    set({ convertMode: !state.convertMode, volleyMode: false });
  },

  executeVolleyAt: (row: number, col: number) => {
    const state = get();
    if (!state.selectedPiece || state.winner || state.isAITurn) return;

    const result = executeVolley(state.board, state.selectedPiece, { row, col });
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        volleyMode: false,
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    }
  },

  executeConvertAt: (row: number, col: number) => {
    const state = get();
    if (!state.selectedPiece || state.winner || state.isAITurn) return;

    const result = executeConvert(state.board, state.selectedPiece, { row, col });
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        convertMode: false,
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    }
  },

  divisionMove: (zone: 'left' | 'center' | 'right', direction: 'forward' | 'back', verticalZone?: 'front' | 'main' | 'rear') => {
    const state = get();
    if (state.winner || state.isAITurn) return;

    const result = executeDivisionMove(state.board, state.currentPlayer, zone, direction, verticalZone);
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, result.message],
        selectedPiece: null,
        validMoves: [],
        winner,
      });

      if (!winner) {
        // Normal turn change
        get().endTurn();
      }
    }
  },

  changeFormation: (zone: 'left' | 'center' | 'right', formation: FormationType) => {
    const state = get();
    if (state.winner || state.isAITurn) return;

    // Update formation for this zone
    const newFormations = { ...state.zoneFormations, [zone]: formation };
    const formationName = formation.charAt(0).toUpperCase() + formation.slice(1).replace('_', ' ');
    
    // Formation change gives opponent 2 bonus turns
    const nextPlayer = state.currentPlayer === Owner.RED ? Owner.BLACK : Owner.RED;
    
    set({
      zoneFormations: newFormations,
      gameLog: [...state.gameLog, `${state.currentPlayer} changes ${zone} zone to ${formationName} formation! Opponent gets 2 bonus turns.`],
      selectedPiece: null,
      validMoves: [],
      bonusTurns: 2,
      currentPlayer: nextPlayer,
      isAITurn: nextPlayer !== state.humanPlayer,
    });

    if (nextPlayer !== state.humanPlayer) {
      setTimeout(() => get().triggerAITurn(), 500);
    }
  },

  endTurn: () => {
    const state = get();

    // Handle bonus turns
    if (state.bonusTurns > 0) {
      set({ bonusTurns: state.bonusTurns - 1 });
      if (state.currentPlayer !== state.humanPlayer) {
        setTimeout(() => get().triggerAITurn(), 500);
      }
      return;
    }

    // Switch player
    const nextPlayer = state.currentPlayer === Owner.RED ? Owner.BLACK : Owner.RED;
    const newBoard = resetReloading(state.board, state.currentPlayer);

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      convertMode: false,
      volleyMode: false,
      isAITurn: nextPlayer !== state.humanPlayer,
      turnCount: state.turnCount + 1,
    });

    // Trigger AI turn if needed
    if (nextPlayer !== state.humanPlayer) {
      setTimeout(() => get().triggerAITurn(), 500);
    }
  },

  triggerAITurn: () => {
    const state = get();
    if (state.winner || !state.aiPlayer) return;
    if (state.currentPlayer === state.humanPlayer) return;

    set({ isAITurn: true });

    const result = state.aiPlayer.makeMove(state.board);
    if (result.success) {
      const winner = checkWinConditions(result.newBoard);
      set({
        board: result.newBoard,
        gameLog: [...state.gameLog, `AI: ${result.message}`],
        winner,
      });

      if (!winner) {
        get().endTurn();
      }
    } else {
      // AI has no moves - pass
      set({
        gameLog: [...state.gameLog, 'AI passes.'],
      });
      get().endTurn();
    }
  },
}));
