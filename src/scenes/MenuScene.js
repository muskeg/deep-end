import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/Constants.js';
import ScoreManager from '../utils/ScoreManager.js';
import ProgressionSystem from '../systems/ProgressionSystem.js';

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
    
    // Create systems
    const scoreManager = new ScoreManager();
    this.progressionSystem = new ProgressionSystem();
    
    // Check if save data exists
    const hasSaveData = this.progressionSystem.hasSaveData();
    
    // Title
    const title = this.add.text(width / 2, height / 3, 'DEEP END', {
      font: 'bold 42px monospace',
      fill: '#00ccff',
      stroke: '#003d66',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 3 + 50, 'Roguelike Diving Adventure', {
      font: '20px monospace',
      fill: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2
    });
    subtitle.setOrigin(0.5);
    
    // Show Continue or New Game buttons based on save data
    if (hasSaveData) {
      this.createContinueButton(width, height);
      this.createNewGameButton(width, height, true);
    } else {
      this.createNewGameButton(width, height, false);
    }
  }

  /**
   * Create Continue button
   */
  createContinueButton(width, height) {
    const continueButton = this.add.text(width / 2, height / 2 + 20, 'CONTINUE', {
      font: 'bold 28px monospace',
      fill: '#ffffff',
      backgroundColor: '#003d66',
      padding: { x: 20, y: 10 }
    });
    continueButton.setOrigin(0.5);
    continueButton.setInteractive({ useHandCursor: true });
    
    // Show pearl count
    const pearls = this.progressionSystem.getPearls();
    const pearlText = this.add.text(width / 2, height / 2 + 55, `Pearls: ${pearls}`, {
      font: '16px monospace',
      fill: '#ffdd00'
    });
    pearlText.setOrigin(0.5);
    
    // Hover effects
    continueButton.on('pointerover', () => {
      continueButton.setStyle({ fill: '#00ff00' });
    });
    
    continueButton.on('pointerout', () => {
      continueButton.setStyle({ fill: '#ffffff' });
    });
    
    continueButton.on('pointerdown', () => {
      // Go to shop scene with existing save
      this.scene.start(SCENES.SHOP);
    });
  }

  /**
   * Create New Game button
   */
  createNewGameButton(width, height, showReset) {
    const yOffset = showReset ? 80 : 40;
    const buttonText = showReset ? 'NEW GAME (Reset Progress)' : 'START GAME';
    
    const newGameButton = this.add.text(width / 2, height / 2 + yOffset, buttonText, {
      font: 'bold 24px monospace',
      fill: showReset ? '#ffaa00' : '#ffffff',
      backgroundColor: '#003d66',
      padding: { x: 20, y: 10 }
    });
    newGameButton.setOrigin(0.5);
    newGameButton.setInteractive({ useHandCursor: true });
    
    // Hover effects
    newGameButton.on('pointerover', () => {
      newGameButton.setStyle({ fill: '#ff0000' });
    });
    
    newGameButton.on('pointerout', () => {
      newGameButton.setStyle({ fill: showReset ? '#ffaa00' : '#ffffff' });
    });
    
    newGameButton.on('pointerdown', () => {
      if (showReset) {
        // Reset progression and start fresh
        this.progressionSystem.resetProgression();
        console.log('[MenuScene] Starting new game - progress reset');
      }
      // Go to shop scene (fresh start)
      this.scene.start(SCENES.SHOP);
    });
    
    // Instructions (only if no save data)
    if (!showReset) {
      const instructions = [
        'Controls:',
        'WASD or Arrow Keys - Move',
        'SPACE - Interact with Clams',
        'Q - Fire Harpoon',
        'SHIFT - Dash',
        'ESC - Surface Voluntarily',
        '',
        'Collect pearls and buy upgrades!'
      ];
      
      const instructionY = height / 2 + 120;
      instructions.forEach((line, index) => {
        const text = this.add.text(width / 2, instructionY + (index * 22), line, {
          font: '14px monospace',
          fill: '#aaaaaa',
          align: 'center'
        });
        text.setOrigin(0.5);
      });
    }
    
    // Keyboard shortcut to start
    this.input.keyboard.once('keydown-ENTER', () => {
      if (!showReset) {
        this.scene.start(SCENES.SHOP);
      }
    });
  }
}
