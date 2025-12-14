import LocalStorageManager from '../utils/LocalStorageManager.js';
import upgradesData from '../data/upgrades.json';

/**
 * ProgressionSystem
 * Manages player progression: pearls, upgrades, statistics
 */
export default class ProgressionSystem extends LocalStorageManager {
  constructor() {
    super('deepend_progression');
    
    this.pearls = 0;
    this.upgrades = {};
    this.statistics = {
      totalPearlsCollected: 0,
      enemiesKilled: 0,
      deepestDepthReached: 0,
      totalDives: 0,
      totalDeaths: 0
    };

    // Initialize upgrade levels to 0
    upgradesData.upgrades.forEach(upgrade => {
      this.upgrades[upgrade.type] = 0;
    });

    // Try to load existing save
    this.loadProgress();
  }

  /**
   * Load progression data from LocalStorage
   * @returns {boolean} Success status
   */
  loadProgress() {
    const data = this.load();
    
    if (data) {
      this.pearls = data.pearls || 0;
      this.upgrades = data.upgrades || this.upgrades;
      this.statistics = data.statistics || this.statistics;
      return true;
    }
    
    return false;
  }

  /**
   * Save progression data to LocalStorage
   * @returns {boolean} Success status
   */
  saveProgress() {
    return this.save({
      pearls: this.pearls,
      upgrades: this.upgrades,
      statistics: this.statistics
    });
  }

  /**
   * Add pearls to balance
   * @param {number} amount - Pearls to add
   */
  addPearls(amount) {
    this.pearls += amount;
    this.statistics.totalPearlsCollected += amount;
    this.saveProgress();
    console.log(`[Progression] Added ${amount} pearls. Total: ${this.pearls}`);
  }

  /**
   * Get current pearl balance
   * @returns {number} Current pearls
   */
  getPearls() {
    return this.pearls;
  }

  /**
   * Increment a statistic by 1
   * @param {string} statName - Name of the statistic to increment
   */
  incrementStat(statName) {
    if (this.statistics.hasOwnProperty(statName)) {
      this.statistics[statName]++;
      this.saveProgress();
      console.log(`[Progression] ${statName}: ${this.statistics[statName]}`);
    } else {
      console.warn(`[Progression] Unknown statistic: ${statName}`);
    }
  }

  /**
   * Purchase an upgrade
   * @param {string} upgradeType - Type of upgrade to purchase
   * @returns {boolean} Success status
   */
  purchaseUpgrade(upgradeType) {
    const upgradeData = upgradesData.upgrades.find(u => u.type === upgradeType);
    
    if (!upgradeData) {
      console.error(`[Progression] Invalid upgrade type: ${upgradeType}`);
      return false;
    }

    const currentLevel = this.upgrades[upgradeType] || 0;
    const cost = this.getUpgradeCost(upgradeType, currentLevel);

    if (!this.canAffordUpgrade(upgradeType)) {
      console.warn(`[Progression] Cannot afford ${upgradeType} upgrade (need ${cost}, have ${this.pearls})`);
      return false;
    }

    // Deduct cost and increase level
    this.pearls -= cost;
    this.upgrades[upgradeType] = currentLevel + 1;
    this.saveProgress();

    console.log(`[Progression] Purchased ${upgradeType} level ${this.upgrades[upgradeType]} for ${cost} pearls`);
    return true;
  }

  /**
   * Get upgrade level
   * @param {string} upgradeType - Type of upgrade
   * @returns {number} Current level (0 if not owned)
   */
  getUpgradeLevel(upgradeType) {
    return this.upgrades[upgradeType] || 0;
  }

  /**
   * Calculate upgrade cost for next level
   * @param {string} upgradeType - Type of upgrade
   * @param {number} currentLevel - Current upgrade level
   * @returns {number} Cost for next level
   */
  getUpgradeCost(upgradeType, currentLevel = null) {
    const upgradeData = upgradesData.upgrades.find(u => u.type === upgradeType);
    
    if (!upgradeData) {
      return Infinity;
    }

    const level = currentLevel !== null ? currentLevel : this.upgrades[upgradeType] || 0;
    const cost = upgradeData.baseCost * Math.pow(upgradeData.costMultiplier, level);
    
    return Math.floor(cost);
  }

  /**
   * Check if player can afford upgrade
   * @param {string} upgradeType - Type of upgrade
   * @returns {boolean} Can afford
   */
  canAffordUpgrade(upgradeType) {
    const currentLevel = this.upgrades[upgradeType] || 0;
    const cost = this.getUpgradeCost(upgradeType, currentLevel);
    return this.pearls >= cost;
  }

  /**
   * Get all upgrades with their current state
   * @returns {Array} Array of upgrade objects with current level and cost
   */
  getAllUpgrades() {
    return upgradesData.upgrades.map(upgrade => ({
      ...upgrade,
      currentLevel: this.upgrades[upgrade.type] || 0,
      nextCost: this.getUpgradeCost(upgrade.type),
      canAfford: this.canAffordUpgrade(upgrade.type)
    }));
  }

  /**
   * Update statistics
   * @param {string} stat - Statistic name
   * @param {number} value - Value to add or set
   * @param {boolean} set - If true, set value instead of adding
   */
  updateStatistic(stat, value, set = false) {
    if (this.statistics.hasOwnProperty(stat)) {
      if (set) {
        this.statistics[stat] = value;
      } else {
        this.statistics[stat] += value;
      }
      this.saveProgress();
    }
  }

  /**
   * Get statistics
   * @returns {Object} All statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Reset all progression (new game)
   */
  resetProgression() {
    this.pearls = 0;
    
    upgradesData.upgrades.forEach(upgrade => {
      this.upgrades[upgrade.type] = 0;
    });

    this.statistics = {
      totalPearlsCollected: 0,
      enemiesKilled: 0,
      deepestDepthReached: 0,
      totalDives: 0,
      totalDeaths: 0
    };

    this.clear();
    console.log('[Progression] Reset to new game state');
  }
}
