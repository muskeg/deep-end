/**
 * Game Constants
 * Central configuration for game parameters
 */

export const GAME_CONFIG = {
  TILE_SIZE: 32,
  GRID_WIDTH: 50,
  GRID_HEIGHT: 50
};

export const PLAYER_CONFIG = {
  SPEED: 150, // pixels per second
  COLLISION_RADIUS: 16,
  INITIAL_OXYGEN: 100,
  INTERACTION_RADIUS: 48 // Distance to interact with clams
};

export const OXYGEN_CONFIG = {
  BASE_DEPLETION_RATE: 1, // % per second
  DIFFICULT_TERRAIN_MULTIPLIER: 1.5,
  ENEMY_COLLISION_DAMAGE: 10, // % instant loss
  WARNING_THRESHOLD: 20 // % when to show warning
};

export const ENEMY_CONFIG = {
  JELLYFISH: {
    SPEED: 100,
    CHASE_SPEED: 150,
    DETECTION_RADIUS: 200,
    PATROL_SPEED: 80
  },
  EEL: {
    SPEED: 120,
    CHASE_SPEED: 200,
    DETECTION_RADIUS: 250,
    AGGRO_RANGE: 250,
    LUNGE_SPEED: 300,
    LUNGE_RANGE: 60, // Distance at which eel initiates lunge
    LUNGE_COOLDOWN: 2000, // ms between lunges
    LUNGE_DURATION: 500 // ms for lunge attack
  },
  ATTACK_COOLDOWN: 1000, // ms
  INVULNERABILITY_DURATION: 1000 // ms after hit
};

export const CURRENT_CONFIG = {
  DEFAULT_STRENGTH: 150, // Base force applied
  MIN_STRENGTH: 50,
  MAX_STRENGTH: 300,
  PARTICLE_COUNT: 20,
  VISUAL_ALPHA: 0.3 // Transparency of current zone
};

export const LEVEL_CONFIG = {
  DIFFICULTY_SCALING: {
    1: { clams: [3, 5], enemies: [0, 1], currents: [0, 2], oxygen: 100, depletionRate: 1.0 },
    3: { clams: [5, 8], enemies: [2, 3], currents: [2, 4], oxygen: 90, depletionRate: 1.5 },
    5: { clams: [8, 12], enemies: [3, 5], currents: [4, 6], oxygen: 80, depletionRate: 2.0 },
    7: { clams: [10, 15], enemies: [5, 8], currents: [6, 8], oxygen: 70, depletionRate: 2.5 },
    10: { clams: [15, 20], enemies: [8, 12], currents: [8, 12], oxygen: 60, depletionRate: 3.0 }
  }
};

export const CAVERN_CONFIG = {
  INITIAL_DENSITY: 0.40, // 40% walls (was 45%)
  ITERATIONS: 5, // More smoothing (was 4)
  BIRTH_THRESHOLD: 5,
  DEATH_THRESHOLD: 3,
  MIN_OPEN_SPACE: 0.50 // 50% must be navigable (was 40%)
};

export const COLORS = {
  WATER: 0x003d66,
  WALL: 0x1a1a2e,
  PLAYER: 0x00ccff,
  CLAM_CLOSED: 0x8b7355,
  CLAM_OPEN: 0xffd700,
  PEARL: 0xffffff,
  JELLYFISH: 0xff6ec7,
  EEL: 0x4caf50,
  CURRENT: 0x66d9ff,
  OXYGEN_FULL: 0x00ff00,
  OXYGEN_WARNING: 0xffaa00,
  OXYGEN_CRITICAL: 0xff0000
};

export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene'
};

export const INPUTS = {
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  INTERACT: ['Space'],
  PAUSE: ['Escape'],
  ATTACK: ['KeyQ'],
  DASH: ['ShiftLeft', 'ShiftRight'],
  SURFACE: ['Escape']
};

export const COMBAT_CONFIG = {
  HARPOON: {
    BASE_DAMAGE: 20,
    SPEED: 400, // pixels per second
    MAX_RANGE: 600, // pixels
    COOLDOWN: 1000 // ms
  },
  DASH: {
    SPEED_MULTIPLIER: 2.5,
    DURATION: 500, // ms
    COOLDOWN: 3000 // ms (5 seconds - will be reduced by upgrades)
  },
  ENEMY_HEALTH: {
    JELLYFISH: 20,
    SQUID: 40,
    ANGLERFISH: 60
  },
  CHASE: {
    ABANDON_DISTANCE: 800, // pixels
    ABANDON_TIME: 10000, // ms (10 seconds)
    PATHFINDING_UPDATE_RATE: 500 // ms (0.5 seconds)
  }
};

export const ZONE_CONFIG = {
  SUNLIGHT: {
    MIN_DEPTH: 0,
    MAX_DEPTH: 500
  },
  TWILIGHT: {
    MIN_DEPTH: 500,
    MAX_DEPTH: 1500
  },
  MIDNIGHT: {
    MIN_DEPTH: 1500,
    MAX_DEPTH: 10000
  },
  TRANSITION_DISTANCE: 100 // pixels for smooth lerp transitions
};

export const UPGRADE_CONFIG = {
  BASE_COST_MULTIPLIER: 1.5, // Exponential cost scaling
  SAVE_VERSION: 1 // For LocalStorage schema migrations
};

export const PEARL_VALUE = 10; // Base points per pearl (deprecated - now zone-based: 1/5/20)

export const FPS_TARGET = 60;

export const AUDIO_VOLUME = {
  SFX: 0.7,
  MUSIC: 0.5
};
