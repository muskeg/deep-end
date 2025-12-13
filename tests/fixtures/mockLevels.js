/**
 * Mock Level Data for Testing
 * Deterministic level layouts for reproducible tests
 */

export const mockLevels = {
  // Simple test level - small, predictable layout
  simple: {
    width: 20,
    height: 15,
    tiles: [
      // 1 = wall, 0 = open space
      // Row format for readability
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    entities: {
      player: { x: 3, y: 3 },
      clams: [
        { x: 10, y: 5, hasPearl: true },
        { x: 15, y: 8, hasPearl: true },
        { x: 5, y: 10, hasPearl: false }
      ],
      enemies: [],
      currents: []
    }
  },

  // Medium test level - with enemies and currents
  medium: {
    width: 30,
    height: 20,
    tiles: null, // Will be generated with cellular automata
    entities: {
      player: { x: 5, y: 5 },
      clams: [
        { x: 10, y: 8, hasPearl: true },
        { x: 20, y: 10, hasPearl: true },
        { x: 15, y: 15, hasPearl: true },
        { x: 8, y: 12, hasPearl: false }
      ],
      enemies: [
        { type: 'jellyfish', x: 15, y: 8, patrolPath: [[15,8], [20,8], [20,12], [15,12]] },
        { type: 'eel', x: 25, y: 15, patrolPath: [[25,15], [25,10]] }
      ],
      currents: [
        { x: 10, y: 5, direction: 90, strength: 0.5 }, // Right
        { x: 20, y: 15, direction: 180, strength: 0.6 } // Down
      ]
    }
  },

  // Complex test level - full feature set
  complex: {
    width: 50,
    height: 50,
    tiles: null, // Generated
    entities: {
      player: { x: 5, y: 5 },
      clams: [
        { x: 10, y: 10, hasPearl: true },
        { x: 20, y: 15, hasPearl: true },
        { x: 30, y: 20, hasPearl: true },
        { x: 40, y: 25, hasPearl: true },
        { x: 15, y: 35, hasPearl: true },
        { x: 25, y: 40, hasPearl: false },
        { x: 35, y: 30, hasPearl: false }
      ],
      enemies: [
        { type: 'jellyfish', x: 15, y: 15, patrolPath: [[15,15], [25,15], [25,20], [15,20]] },
        { type: 'jellyfish', x: 35, y: 30, patrolPath: [[35,30], [40,30], [40,35], [35,35]] },
        { type: 'eel', x: 20, y: 25, patrolPath: [[20,25], [20,35]] },
        { type: 'eel', x: 40, y: 40, patrolPath: [[40,40], [30,40]] }
      ],
      currents: [
        { x: 10, y: 20, direction: 0, strength: 0.5 },
        { x: 25, y: 30, direction: 90, strength: 0.6 },
        { x: 35, y: 15, direction: 180, strength: 0.4 },
        { x: 15, y: 40, direction: 270, strength: 0.7 }
      ]
    }
  },

  // Edge case: Empty level (no entities except player)
  empty: {
    width: 20,
    height: 15,
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    entities: {
      player: { x: 10, y: 7 },
      clams: [],
      enemies: [],
      currents: []
    }
  }
};

/**
 * Helper: Get mock level by name
 */
export function getMockLevel(name) {
  return mockLevels[name] || mockLevels.simple;
}

/**
 * Helper: Create custom test level
 */
export function createCustomLevel(config) {
  return {
    width: config.width || 20,
    height: config.height || 15,
    tiles: config.tiles || null,
    entities: {
      player: config.player || { x: 3, y: 3 },
      clams: config.clams || [],
      enemies: config.enemies || [],
      currents: config.currents || []
    }
  };
}
