import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/Constants.js';
import ScoreManager from '../utils/ScoreManager.js';

/**
 * MenuScene - Main menu with start game option
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create score manager
    const scoreManager = new ScoreManager();
    
    // Title
    const title = this.add.text(width / 2, height / 3, 'DEEP END', {
      font: 'bold 42px monospace',
      fill: '#00ccff',
      stroke: '#003d66',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // High score display
    const highScoreText = scoreManager.getHighScoreText();
    const highScore = this.add.text(width / 2, height / 3 + 50, highScoreText, {
      font: '20px monospace',
      fill: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2
    });
    highScore.setOrigin(0.5);
    
    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 40, 'START GAME', {
      font: 'bold 28px monospace',
      fill: '#ffffff',
      backgroundColor: '#003d66',
      padding: { x: 20, y: 10 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    
    // Hover effects
    startButton.on('pointerover', () => {
      startButton.setStyle({ fill: '#00ff00' });
    });
    
    startButton.on('pointerout', () => {
      startButton.setStyle({ fill: '#ffffff' });
    });
    
    startButton.on('pointerdown', () => {
      this.startGame();
    });
    
    // Instructions
    const instructions = [
      'Controls:',
      'WASD or Arrow Keys - Move',
      'SPACE - Interact with Clams',
      '',
      'Collect pearls before oxygen runs out!'
    ];
    
    const instructionY = height / 2 + 120;
    instructions.forEach((line, index) => {
      const text = this.add.text(width / 2, instructionY + (index * 24), line, {
        font: '16px monospace',
        fill: '#aaaaaa',
        align: 'center'
      });
      text.setOrigin(0.5);
    });
    
    // Keyboard shortcut to start
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });
    
    // Animated background effect (optional visual polish)
    this.tweens.add({
      targets: title,
      y: height / 3 - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  startGame() {
    // Transition to game scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { level: 1, score: 0 });
    });
  }
}
