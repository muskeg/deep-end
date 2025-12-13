import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/Constants.js';

/**
 * GameOverScene - Victory/defeat screen with restart option
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  init(data) {
    this.victory = data.victory || false;
    this.level = data.level || 1;
    this.score = data.score || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // Result title
    const resultColor = this.victory ? '#00ff00' : '#ff0000';
    const resultText = this.victory ? 'LEVEL COMPLETE!' : 'OXYGEN DEPLETED';
    
    const title = this.add.text(width / 2, height / 3, resultText, {
      font: 'bold 48px monospace',
      fill: resultColor,
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    // Stats
    const statsY = height / 2 - 20;
    const stats = [
      `Level: ${this.level}`,
      '',
      this.victory ? 'All pearls collected!' : 'Try again!'
    ];
    
    stats.forEach((line, index) => {
      const text = this.add.text(width / 2, statsY + (index * 32), line, {
        font: '24px monospace',
        fill: '#ffffff',
        align: 'center'
      });
      text.setOrigin(0.5);
    });
    
    // Restart button
    const restartButton = this.add.text(width / 2, height - 120, 'RESTART', {
      font: 'bold 28px monospace',
      fill: '#ffffff',
      backgroundColor: '#003d66',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#00ccff' });
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#ffffff' });
    });
    
    restartButton.on('pointerdown', () => {
      this.restartGame();
    });
    
    // Menu button
    const menuButton = this.add.text(width / 2, height - 70, 'MAIN MENU', {
      font: '20px monospace',
      fill: '#aaaaaa'
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });
    
    menuButton.on('pointerover', () => {
      menuButton.setStyle({ fill: '#ffffff' });
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setStyle({ fill: '#aaaaaa' });
    });
    
    menuButton.on('pointerdown', () => {
      this.returnToMenu();
    });
    
    // Keyboard shortcuts
    this.input.keyboard.once('keydown-SPACE', () => {
      this.restartGame();
    });
    
    this.input.keyboard.once('keydown-ESC', () => {
      this.returnToMenu();
    });
    
    // Continue to next level if victory
    if (this.victory) {
      const continueText = this.add.text(width / 2, height - 160, 'Press ENTER for Next Level', {
        font: '18px monospace',
        fill: '#00ff00'
      });
      continueText.setOrigin(0.5);
      
      this.input.keyboard.once('keydown-ENTER', () => {
        this.nextLevel();
      });
    }
  }

  restartGame() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { level: this.level, score: 0 });
    });
  }

  nextLevel() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME, { level: this.level + 1, score: this.score });
    });
  }

  returnToMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }
}
