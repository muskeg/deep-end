import Phaser from 'phaser';
import { SCENES, UI_CONFIG } from '../utils/Constants.js';

/**
 * BootScene - Asset loading and initialization
 * First scene that runs when game starts
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: UI_CONFIG.FONT.MEDIUM,
        fill: UI_CONFIG.COLORS.TEXT_PRIMARY
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: UI_CONFIG.FONT.MEDIUM,
        fill: UI_CONFIG.COLORS.TEXT_ACCENT
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    // Update progress bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ccff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // ── Load Sprite Assets ──────────────────────────────────────────────
    
    // Diver sprites (8 directions x idle/swim/dash)
    const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
    for (const dir of directions) {
      this.load.image(`diver-idle-${dir}`, `assets/sprites/diver/diver-idle-${dir}.png`);
      this.load.image(`diver-swim-${dir}-0`, `assets/sprites/diver/diver-swim-${dir}-0.png`);
      this.load.image(`diver-swim-${dir}-1`, `assets/sprites/diver/diver-swim-${dir}-1.png`);
      this.load.image(`diver-dash-${dir}`, `assets/sprites/diver/diver-dash-${dir}.png`);
    }
    
    // Enemy sprites
    for (let i = 0; i < 3; i++) {
      this.load.image(`jellyfish-${i}`, `assets/sprites/enemies/jellyfish-${i}.png`);
    }
    for (const dir of ['left', 'right', 'up', 'down']) {
      this.load.image(`eel-${dir}-0`, `assets/sprites/enemies/eel-${dir}-0.png`);
      this.load.image(`eel-${dir}-1`, `assets/sprites/enemies/eel-${dir}-1.png`);
    }
    
    // Clam sprites
    this.load.image('clam-closed', 'assets/sprites/clams/clam-closed.png');
    this.load.image('clam-open', 'assets/sprites/clams/clam-open.png');
    this.load.image('clam-open-pearl', 'assets/sprites/clams/clam-open-pearl.png');
    for (let i = 0; i < 3; i++) {
      this.load.image(`clam-opening-${i}`, `assets/sprites/clams/clam-opening-${i}.png`);
    }
    
    // Pearl sprites (shimmer animation)
    for (let i = 0; i < 3; i++) {
      this.load.image(`pearl-${i}`, `assets/sprites/pearl/pearl-${i}.png`);
    }
    
    // Harpoon sprite
    this.load.image('harpoon', 'assets/sprites/harpoon/harpoon.png');
    
    // Wall tile variants
    for (let i = 0; i < 4; i++) {
      this.load.image(`wall-${i}`, `assets/sprites/walls/wall-${i}.png`);
    }
    
    // Water current effect sprites
    for (let i = 0; i < 3; i++) {
      this.load.image(`current-${i}`, `assets/sprites/effects/current-${i}.png`);
    }
  }

  create() {
    // Transition to menu scene
    this.scene.start(SCENES.MENU);
  }
}
