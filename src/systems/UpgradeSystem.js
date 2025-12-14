import upgradesData from '../data/upgrades.json';

/**
 * UpgradeSystem
 * Applies upgrade effects to player and entities
 */
export default class UpgradeSystem {
  constructor(progressionSystem) {
    this.progressionSystem = progressionSystem;
  }

  /**
   * Get multiplier for a specific upgrade effect
   * @param {string} upgradeType - Type of upgrade
   * @param {string} effectKey - Effect property key
   * @returns {number} Total multiplier (1.0 = no upgrade)
   */
  getUpgradeMultiplier(upgradeType, effectKey) {
    const level = this.progressionSystem.getUpgradeLevel(upgradeType);
    
    if (level === 0) {
      return 1.0;
    }

    const upgradeData = upgradesData.upgrades.find(u => u.type === upgradeType);
    
    if (!upgradeData || !upgradeData.effects[effectKey]) {
      return 1.0;
    }

    const effectValue = upgradeData.effects[effectKey];
    
    // For multiplier effects, calculate: 1 + (effect * level)
    // Example: level 3 oxygen (0.2 per level) = 1 + (0.2 * 3) = 1.6x
    return 1.0 + (effectValue * level);
  }

  /**
   * Get bonus value for a specific upgrade effect
   * @param {string} upgradeType - Type of upgrade
   * @param {string} effectKey - Effect property key
   * @returns {number} Total bonus value
   */
  getUpgradeBonus(upgradeType, effectKey) {
    const level = this.progressionSystem.getUpgradeLevel(upgradeType);
    
    if (level === 0) {
      return 0;
    }

    const upgradeData = upgradesData.upgrades.find(u => u.type === upgradeType);
    
    if (!upgradeData || !upgradeData.effects[effectKey]) {
      return 0;
    }

    const effectValue = upgradeData.effects[effectKey];
    
    // For bonus effects, calculate: effect * level
    // Example: level 2 harpoon (5 damage per level) = 5 * 2 = +10 damage
    return effectValue * level;
  }

  /**
   * Get reduction value for cooldown-type upgrades
   * @param {string} upgradeType - Type of upgrade
   * @param {string} effectKey - Effect property key
   * @returns {number} Reduction amount (to subtract from base value)
   */
  getUpgradeReduction(upgradeType, effectKey) {
    const level = this.progressionSystem.getUpgradeLevel(upgradeType);
    
    if (level === 0) {
      return 0;
    }

    const upgradeData = upgradesData.upgrades.find(u => u.type === upgradeType);
    
    if (!upgradeData || !upgradeData.effects[effectKey]) {
      return 0;
    }

    const effectValue = upgradeData.effects[effectKey];
    
    // For reduction effects: effect * level
    // Example: level 3 dash (0.5s reduction per level) = 0.5 * 3 = -1.5s cooldown
    return effectValue * level;
  }

  /**
   * Apply all relevant upgrades to player
   * @param {Object} player - Player entity
   */
  applyUpgrades(player) {
    // Oxygen capacity multiplier
    const oxygenMultiplier = this.getUpgradeMultiplier('oxygen', 'maxOxygenMultiplier');
    player.oxygenMultiplier = oxygenMultiplier;

    // Light radius multiplier
    const lightMultiplier = this.getUpgradeMultiplier('light', 'lightRadiusMultiplier');
    player.lightMultiplier = lightMultiplier;

    // Speed multiplier
    const speedMultiplier = this.getUpgradeMultiplier('speed', 'speedMultiplier');
    player.speedMultiplier = speedMultiplier;

    // Harpoon damage bonus
    const harpoonBonus = this.getUpgradeBonus('harpoon', 'harpoonDamageBonus');
    player.harpoonDamageBonus = harpoonBonus;

    // Dash cooldown reduction
    const dashReduction = this.getUpgradeReduction('dash', 'dashCooldownReduction');
    player.dashCooldownReduction = dashReduction * 1000; // Convert to ms

    // Sonar range bonus
    const sonarBonus = this.getUpgradeBonus('sonar', 'sonarRangeBonus');
    player.sonarRangeBonus = sonarBonus;

    console.log('[UpgradeSystem] Applied upgrades to player:', {
      oxygen: oxygenMultiplier,
      light: lightMultiplier,
      speed: speedMultiplier,
      harpoonDamage: harpoonBonus,
      dashCooldown: dashReduction,
      sonarRange: sonarBonus
    });
  }

  /**
   * Get formatted upgrade summary for UI display
   * @returns {Object} Upgrade effects summary
   */
  getUpgradeSummary() {
    return {
      oxygen: this.getUpgradeMultiplier('oxygen', 'maxOxygenMultiplier'),
      light: this.getUpgradeMultiplier('light', 'lightRadiusMultiplier'),
      speed: this.getUpgradeMultiplier('speed', 'speedMultiplier'),
      harpoonDamage: this.getUpgradeBonus('harpoon', 'harpoonDamageBonus'),
      dashCooldown: this.getUpgradeReduction('dash', 'dashCooldownReduction'),
      sonarRange: this.getUpgradeBonus('sonar', 'sonarRangeBonus')
    };
  }
}
