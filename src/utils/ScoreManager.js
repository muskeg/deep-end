/**
 * ScoreManager - Handles persistent high score storage
 * Uses localStorage to track highest level reached
 */
export default class ScoreManager {
  constructor() {
    this.storageKey = 'deepend_highscore';
  }
  
  /**
   * Get the current high score data
   * @returns {Object} High score data {level, timestamp}
   */
  getHighScore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return { level: 0, timestamp: null };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load high score:', error);
      return { level: 0, timestamp: null };
    }
  }
  
  /**
   * Update high score if the new level is higher
   * @param {number} level - Level reached
   * @returns {boolean} True if high score was updated
   */
  updateHighScore(level) {
    try {
      const current = this.getHighScore();
      if (level > current.level) {
        const data = {
          level: level,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save high score:', error);
      return false;
    }
  }
  
  /**
   * Get formatted high score text for display
   * @returns {string} Formatted text like "Best: Level 5"
   */
  getHighScoreText() {
    const highScore = this.getHighScore();
    if (highScore.level === 0) {
      return 'Best: --';
    }
    return `Best: Level ${highScore.level}`;
  }
  
  /**
   * Clear high score (for testing or reset)
   */
  clearHighScore() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear high score:', error);
    }
  }
}
