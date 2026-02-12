import Phaser from 'phaser';
import ProgressionSystem from '../systems/ProgressionSystem.js';
import UpgradeSystem from '../systems/UpgradeSystem.js';
import ShopMenu from '../ui/ShopMenu.js';
import AudioManager from '../utils/AudioManager.js';
import { SCENES, COLORS, UI_CONFIG } from '../utils/Constants.js';

/**
 * ShopScene
 * Surface shop for purchasing permanent upgrades
 */
export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SHOP });
  }

  create() {
    console.log('[ShopScene] Initializing shop');
    
    // Initialize systems
    this.progressionSystem = new ProgressionSystem();
    this.upgradeSystem = new UpgradeSystem(this.progressionSystem);
    
    // Initialize audio
    this.audioManager = new AudioManager(this);
    this.audioManager.initialize();
    
    // Create background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create shop menu
    this.shopMenu = new ShopMenu(this, this.progressionSystem);
    this.shopMenu.renderPearlBalance();
    this.shopMenu.renderUpgradeList((upgradeType) => this.onUpgradeClick(upgradeType));
    
    // Create start dive button
    this.createStartDiveButton();
    
    // Create statistics display
    this.createStatisticsDisplay();
  }

  /**
   * Create background visuals
   */
  createBackground() {
    // Dark blue background (surface water)
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x003d66
    );
    
    // Title background bar
    this.add.rectangle(
      this.scale.width / 2,
      40,
      this.scale.width,
      80,
      0x001a33,
      0.8
    );
  }

  /**
   * Create title text
   */
  createTitle() {
    this.add.text(
      this.scale.width / 2,
      40,
      'Surface Shop',
      {
        font: UI_CONFIG.FONT.TITLE,
        fill: UI_CONFIG.COLORS.TEXT_PRIMARY,
        stroke: UI_CONFIG.COLORS.STROKE,
        strokeThickness: 6
      }
    ).setOrigin(0.5);
  }

  /**
   * Create start dive button
   */
  createStartDiveButton() {
    const buttonY = this.scale.height - 80;
    
    const button = this.add.rectangle(
      this.scale.width / 2,
      buttonY,
      300,
      60,
      0x00aa00,
      0.9
    );
    
    const buttonText = this.add.text(
      this.scale.width / 2,
      buttonY,
      'Start Dive',
      {
        font: UI_CONFIG.FONT.LARGE,
        fill: UI_CONFIG.COLORS.TEXT_PRIMARY
      }
    ).setOrigin(0.5);
    
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      button.setFillStyle(0x00cc00, 1.0);
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(0x00aa00, 0.9);
    });
    
    button.on('pointerdown', () => {
      this.onStartDiveClick();
    });
  }

  /**
   * Create statistics display
   */
  createStatisticsDisplay() {
    const stats = this.progressionSystem.getStatistics();
    const x = 20;
    const y = this.scale.height - 200;

    // Format play time
    const totalMinutes = Math.floor((stats.totalPlayTime || 0) / 60);
    const totalSecs = (stats.totalPlayTime || 0) % 60;
    const longestMin = Math.floor((stats.longestDive || 0) / 60);
    const longestSec = (stats.longestDive || 0) % 60;

    // Header
    this.add.text(x, y, '── Statistics ──', {
      font: UI_CONFIG.FONT.MEDIUM,
      fill: UI_CONFIG.COLORS.TEXT_ACCENT
    });

    const statsText = [
      `Pearls Collected: ${stats.totalPearlsCollected}`,
      `Enemies Killed:   ${stats.enemiesKilled}`,
      `Deepest Depth:    ${Math.floor(stats.deepestDepthReached)}m`,
      `Total Dives:      ${stats.totalDives}`,
      `Deaths:           ${stats.totalDeaths || 0}`,
      `Upgrades Bought:  ${stats.upgradesPurchased || 0}`,
      `Total Play Time:  ${totalMinutes}m ${totalSecs}s`,
      `Longest Dive:     ${longestMin}m ${longestSec}s`
    ].join('\n');

    this.add.text(x, y + 28, statsText, {
      font: UI_CONFIG.FONT.SMALL,
      fill: UI_CONFIG.COLORS.TEXT_SECONDARY,
      lineSpacing: 4
    });
  }

  /**
   * Handle upgrade purchase click
   * @param {string} upgradeType - Type of upgrade to purchase
   */
  onUpgradeClick(upgradeType) {
    const success = this.progressionSystem.purchaseUpgrade(upgradeType);
    
    if (success) {
      console.log(`[ShopScene] Purchased ${upgradeType} upgrade`);
      
      // Play purchase sound
      if (this.audioManager) {
        this.audioManager.playUpgradePurchase();
      }
      
      // Refresh menu to show updated costs and balance
      this.shopMenu.refresh((type) => this.onUpgradeClick(type));
      
      // Show success feedback
      this.showPurchaseSuccess(upgradeType);
    } else {
      console.warn(`[ShopScene] Failed to purchase ${upgradeType}`);
      
      // Show error feedback
      this.showPurchaseError();
    }
  }

  /**
   * Handle start dive button click
   */
  onStartDiveClick() {
    console.log('[ShopScene] Starting new dive');
    
    // Increment dive counter
    this.progressionSystem.updateStatistic('totalDives', 1);
    
    // Get all owned upgrades
    const upgrades = this.progressionSystem.getAllUpgrades();
    
    // Calculate upgrade effects
    const upgradeParams = {
      oxygenMultiplier: this.upgradeSystem.getUpgradeMultiplier('oxygen', 'maxOxygenMultiplier'),
      lightMultiplier: this.upgradeSystem.getUpgradeMultiplier('light', 'lightRadiusMultiplier'),
      speedMultiplier: this.upgradeSystem.getUpgradeMultiplier('speed', 'speedMultiplier'),
      harpoonDamageBonus: this.upgradeSystem.getUpgradeBonus('harpoon', 'harpoonDamageBonus'),
      dashCooldownReduction: this.upgradeSystem.getUpgradeReduction('dash', 'dashCooldownReduction') * 1000,
      sonarRangeBonus: this.upgradeSystem.getUpgradeBonus('sonar', 'sonarRangeBonus')
    };
    
    console.log('[ShopScene] Upgrade parameters:', upgradeParams);
    
    // Transition to game scene with upgrade data
    this.scene.start(SCENES.GAME, { upgradeParams });
  }

  /**
   * Show purchase success feedback
   * @param {string} upgradeType - Purchased upgrade type
   */
  showPurchaseSuccess(upgradeType) {
    const text = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `${upgradeType.toUpperCase()} UPGRADED!`,
      {
        font: UI_CONFIG.FONT.HEADER,
        fill: UI_CONFIG.COLORS.TEXT_SUCCESS,
        stroke: UI_CONFIG.COLORS.STROKE,
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Fade in and out
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Show purchase error feedback
   */
  showPurchaseError() {
    const text = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'INSUFFICIENT PEARLS',
      {
        font: UI_CONFIG.FONT.HEADER,
        fill: UI_CONFIG.COLORS.TEXT_DANGER,
        stroke: UI_CONFIG.COLORS.STROKE,
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Fade in and out
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        text.destroy();
      }
    });
  }
}
