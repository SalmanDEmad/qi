/**
 * Zhanguo Qi - Formation System (TypeScript version)
 * 
 * Commanders can reshape their troops into different geometric patterns,
 * each with tactical advantages. This is Chess-like spatial tactics,
 * not RPG stat bonuses.
 */

export enum FormationType {
  LINE = 'line',
  COLUMN = 'column',
  WEDGE = 'wedge',
  SHIELD_WALL = 'shield_wall',
  HOLLOW_SQUARE = 'hollow_square',
  ECHELON = 'echelon',
  SKIRMISH = 'skirmish'
}

export interface FormationInfo {
  name: string;
  description: string;
  minPieces: number;
  pattern: [number, number][]; // [rowOffset, colOffset] from commander
  symbol: string;
}

// Formation patterns - offsets from commander position (row_offset, col_offset)
// Positive row = toward enemy (for RED, that's up/negative rows)
// Commander is at (0, 0) in pattern

export const FORMATION_DATA: Record<FormationType, FormationInfo> = {
  [FormationType.LINE]: {
    name: 'Line',
    description: 'Wide front, good for holding territory',
    minPieces: 3,
    pattern: [
      [0, -3], [0, -2], [0, -1], [0, 0], [0, 1], [0, 2], [0, 3],
      [-1, -2], [-1, 0], [-1, 2],
    ],
    symbol: '▬▬▬'
  },

  [FormationType.COLUMN]: {
    name: 'Column',
    description: 'Deep and narrow, punches through enemy lines',
    minPieces: 3,
    pattern: [
      [3, 0], [2, 0], [1, 0], [0, 0], [-1, 0], [-2, 0], [-3, 0],
      [2, -1], [2, 1], [1, -1], [1, 1],
    ],
    symbol: '║'
  },

  [FormationType.WEDGE]: {
    name: 'Wedge',
    description: 'Spearhead formation, breaks enemy formations',
    minPieces: 4,
    pattern: [
      [3, 0],
      [2, -1], [2, 1],
      [1, -2], [1, 0], [1, 2],
      [0, -3], [0, -1], [0, 0], [0, 1], [0, 3],
      [-1, -2], [-1, 0], [-1, 2],
    ],
    symbol: '▲'
  },

  [FormationType.SHIELD_WALL]: {
    name: 'Shield Wall',
    description: 'Protects commander, requires 2+ attackers to break',
    minPieces: 5,
    pattern: [
      [1, -1], [1, 0], [1, 1],
      [0, -1], [0, 0], [0, 1],
      [-1, -1], [-1, 0], [-1, 1],
      [1, -2], [1, 2], [0, -2], [0, 2], [-1, -2], [-1, 2],
    ],
    symbol: '█'
  },

  [FormationType.HOLLOW_SQUARE]: {
    name: 'Hollow Square',
    description: 'All sides defended, protects ranged units. Anti-cavalry',
    minPieces: 8,
    pattern: [
      [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
      [1, -2], [1, 2],
      [0, -2], [0, 0], [0, 2],
      [-1, -2], [-1, 2],
      [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
      [1, -1], [1, 0], [1, 1], [0, -1], [0, 1], [-1, -1], [-1, 0], [-1, 1],
    ],
    symbol: '□'
  },

  [FormationType.ECHELON]: {
    name: 'Echelon',
    description: 'Diagonal formation, coordinates with allies',
    minPieces: 3,
    pattern: [
      [3, -3], [2, -2], [1, -1], [0, 0], [-1, 1], [-2, 2], [-3, 3],
      [2, -3], [3, -2], [1, -2], [2, -1], [0, -1], [1, 0],
    ],
    symbol: '╱'
  },

  [FormationType.SKIRMISH]: {
    name: 'Skirmish',
    description: 'Spread out, immune to ranged fire',
    minPieces: 3,
    pattern: [
      [4, 0],
      [2, -2], [2, 2],
      [0, -4], [0, 0], [0, 4],
      [-2, -2], [-2, 2],
      [-4, 0],
      [3, -1], [3, 1], [1, -3], [1, -1], [1, 1], [1, 3],
    ],
    symbol: '∴'
  }
};

export function getFormationInfo(formationType: FormationType): FormationInfo {
  return FORMATION_DATA[formationType];
}

export function getFormationPositions(
  commanderRow: number,
  commanderCol: number,
  formationType: FormationType,
  numPieces: number,
  isRed: boolean
): [number, number][] {
  const BOARD_SIZE = 19;  // Updated for 19x19 board
  const info = FORMATION_DATA[formationType];
  const pattern = info.pattern;
  const direction = isRed ? -1 : 1;
  
  const positions: [number, number][] = [];
  for (let i = 0; i < Math.min(numPieces, pattern.length); i++) {
    const [offsetRow, offsetCol] = pattern[i];
    const actualRow = commanderRow + (offsetRow * direction);
    const actualCol = commanderCol + offsetCol;
    
    if (actualRow >= 0 && actualRow < 15 && actualCol >= 0 && actualCol < 15) {
      positions.push([actualRow, actualCol]);
    }
  }
  
  return positions;
}

// Rock-Paper-Scissors relationships
export const FORMATION_ADVANTAGES: Record<string, string> = {
  [`${FormationType.WEDGE}-${FormationType.SHIELD_WALL}`]: 'Wedge breaks through Shield Wall',
  [`${FormationType.SHIELD_WALL}-${FormationType.LINE}`]: 'Shield Wall holds against Line',
  [`${FormationType.LINE}-${FormationType.COLUMN}`]: 'Line outflanks narrow Column',
  [`${FormationType.COLUMN}-${FormationType.WEDGE}`]: "Column's depth beats scattered Wedge",
  [`${FormationType.HOLLOW_SQUARE}-${FormationType.SKIRMISH}`]: 'Square catches scattered Skirmish',
  [`${FormationType.SKIRMISH}-${FormationType.LINE}`]: 'Skirmish harasses static Line',
};

export function checkFormationAdvantage(
  attackerFormation: FormationType | null,
  defenderFormation: FormationType | null
): string | null {
  if (attackerFormation && defenderFormation) {
    return FORMATION_ADVANTAGES[`${attackerFormation}-${defenderFormation}`] || null;
  }
  return null;
}

export interface FormationCombatResult {
  canAttack: boolean;
  reason: string;
  specialEffect: 'push' | 'formation_break' | null;
}

export function getFormationCombatModifier(
  attackerFormation: FormationType | null,
  defenderFormation: FormationType | null,
  isRangedAttack: boolean,
  attackerCount: number = 1
): FormationCombatResult {
  const result: FormationCombatResult = {
    canAttack: true,
    reason: '',
    specialEffect: null
  };

  // Shield Wall defense - requires 2+ attackers or ranged
  if (defenderFormation === FormationType.SHIELD_WALL) {
    if (attackerFormation === FormationType.WEDGE) {
      result.specialEffect = 'formation_break';
    } else if (attackerCount < 2 && !isRangedAttack) {
      result.canAttack = false;
      result.reason = 'Shield Wall requires 2+ attackers or ranged fire';
    }
  }

  // Skirmish vs ranged - dodges
  if (defenderFormation === FormationType.SKIRMISH && isRangedAttack) {
    result.canAttack = false;
    result.reason = 'Skirmish formation too spread out for ranged fire';
  }

  // Column push mechanic
  if (attackerFormation === FormationType.COLUMN) {
    result.specialEffect = 'push';
  }

  return result;
}
