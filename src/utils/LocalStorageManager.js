import { UPGRADE_CONFIG } from './Constants.js';

/**
 * LocalStorageManager
 * Handles persistent data storage with versioning and validation
 */
export default class LocalStorageManager {
  constructor(storageKey = 'deepend_save') {
    this.storageKey = storageKey;
  }

  /**
   * Save data to LocalStorage
   * @param {Object} data - Data object to save
   * @returns {boolean} Success status
   */
  save(data) {
    try {
      const versionedData = {
        version: UPGRADE_CONFIG.SAVE_VERSION,
        timestamp: Date.now(),
        ...data
      };
      
      const jsonString = JSON.stringify(versionedData);
      localStorage.setItem(this.storageKey, jsonString);
      
      console.log('[LocalStorage] Data saved successfully', versionedData);
      return true;
    } catch (error) {
      console.error('[LocalStorage] Save failed:', error);
      return false;
    }
  }

  /**
   * Load data from LocalStorage
   * @returns {Object|null} Loaded data or null if not found/invalid
   */
  load() {
    try {
      const jsonString = localStorage.getItem(this.storageKey);
      
      if (!jsonString) {
        console.log('[LocalStorage] No save data found');
        return null;
      }

      const data = JSON.parse(jsonString);
      
      if (!this.validate(data)) {
        console.warn('[LocalStorage] Invalid save data, ignoring');
        return null;
      }

      // Handle version migrations if needed
      const migratedData = this.migrate(data);
      
      console.log('[LocalStorage] Data loaded successfully', migratedData);
      return migratedData;
    } catch (error) {
      console.error('[LocalStorage] Load failed:', error);
      return null;
    }
  }

  /**
   * Validate save data structure
   * @param {Object} data - Data to validate
   * @returns {boolean} Is valid
   */
  validate(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields
    if (!data.hasOwnProperty('version') || !data.hasOwnProperty('timestamp')) {
      return false;
    }

    // Check version is valid number
    if (typeof data.version !== 'number' || data.version < 1) {
      return false;
    }

    return true;
  }

  /**
   * Migrate old save data to current version
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  migrate(data) {
    let migratedData = { ...data };

    // No migrations needed yet (version 1 is current)
    // Future migrations would go here:
    // if (data.version === 1) {
    //   // Migrate v1 -> v2
    //   migratedData = { ...migratedData, newField: defaultValue };
    //   migratedData.version = 2;
    // }

    return migratedData;
  }

  /**
   * Clear all save data
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('[LocalStorage] Save data cleared');
      return true;
    } catch (error) {
      console.error('[LocalStorage] Clear failed:', error);
      return false;
    }
  }

  /**
   * Check if save data exists
   * @returns {boolean} Has save data
   */
  hasSaveData() {
    return localStorage.getItem(this.storageKey) !== null;
  }
}
