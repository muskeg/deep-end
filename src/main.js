import Phaser from 'phaser';
import { GAME_CONFIG, SCENES, FPS_TARGET } from './utils/Constants.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/**
 * Phaser Game Configuration
 */
const config = {
  type: Phaser.AUTO, // Use WebGL if available, fallback to Canvas
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-canvas', // Mount point in index.html
  backgroundColor: '#001a33',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // No gravity for underwater movement
      debug: false // Set to true for collision box visualization
    }
  },
  fps: {
    target: FPS_TARGET,
    forceSetTimeOut: false
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true, // Crisp pixel graphics
    antialias: false
  }
};

/**
 * Initialize the game
 */
const game = new Phaser.Game(config);

export default game;
