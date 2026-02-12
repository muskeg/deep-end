import Phaser from 'phaser';
import { SCENES, COLORS, UI_CONFIG } from '../utils/Constants.js';

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
      font: UI_CONFIG.FONT.TITLE,
      fill: resultColor,
      stroke: UI_CONFIG.COLORS.STROKE,
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
        font: UI_CONFIG.FONT.LARGE,
        fill: UI_CONFIG.COLORS.TEXT_PRIMARY,
        align: 'center'
      });
      text.setOrigin(0.5);
    });
    
    // Return to Shop button (primary action for roguelike loop)
    const shopButton = this.add.text(width / 2, height - 170, 'RETURN TO SHOP', {
      font: UI_CONFIG.FONT.LARGE,
      fill: UI_CONFIG.COLORS.TEXT_PRIMARY,
      backgroundColor: '#006600',
      padding: { x: 20, y: 10 }
    });
    shopButton.setOrigin(0.5);
    shopButton.setInteractive({ useHandCursor: true });
    
    shopButton.on('pointerover', () => {
      shopButton.setStyle({ fill: '#00ff00' });
    });
    
    shopButton.on('pointerout', () => {
      shopButton.setStyle({ fill: '#ffffff' });
    });
    
    shopButton.on('pointerdown', () => {
      this.returnToShop();
    });
    
    // Restart button
    const restartButton = this.add.text(width / 2, height - 110, 'RESTART', {
      font: UI_CONFIG.FONT.LARGE,
      fill: UI_CONFIG.COLORS.TEXT_SECONDARY,
      backgroundColor: UI_CONFIG.COLORS.BG_PANEL,
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ fill: '#00ccff' });
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ fill: '#cccccc' });
    });
    
    restartButton.on('pointerdown', () => {
      this.restartGame();
    });
    
    // Menu button
    const menuButton = this.add.text(width / 2, height - 60, 'MAIN MENU', {
      font: UI_CONFIG.FONT.MEDIUM,
      fill: UI_CONFIG.COLORS.TEXT_MUTED
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
      this.returnToShop();
    });
    
    this.input.keyboard.once('keydown-ESC', () => {
      this.returnToMenu();
    });
    
    this.input.keyboard.once('keydown-R', () => {
      this.restartGame();
    });
    
    // Continue to next level if victory
    if (this.victory) {
      const continueText = this.add.text(width / 2, height - 160, 'Press ENTER for Next Level', {
        font: UI_CONFIG.FONT.MEDIUM,
        fill: UI_CONFIG.COLORS.TEXT_SUCCESS
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

  returnToShop() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.SHOP);
    });
  }

  returnToMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }
}
