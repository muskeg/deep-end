import zonesData from '../data/zones.json';
import { ZONE_CONFIG } from '../utils/Constants.js';

/**
 * DepthZoneSystem
 * Manages depth-based zones with difficulty scaling and environmental changes
 */
export default class DepthZoneSystem {
  constructor(scene) {
    this.scene = scene;
    this.zones = zonesData.zones;
    this.currentZone = null;
    this.previousZone = null;
  }

  /**
   * Get the zone for a given depth
   * @param {number} depth - Depth in pixels (Y position)
   * @returns {Object} Zone configuration
   */
  getCurrentZone(depth) {
    // Convert pixels to meters (approximate: 1 meter = 100 pixels)
    const depthInMeters = depth / 100;
    
    for (const zone of this.zones) {
      if (depthInMeters >= zone.minDepth && depthInMeters < zone.maxDepth) {
        return zone;
      }
    }
    
    // Default to last zone if beyond max depth
    return this.zones[this.zones.length - 1];
  }

  /**
   * Update ambient lighting based on current depth
   * @param {number} depth - Depth in pixels
   * @param {Phaser.Lights.LightsManager} lightsManager - Phaser lights system
   */
  updateAmbientLight(depth, lightsManager) {
    const currentZone = this.getCurrentZone(depth);
    const depthInMeters = depth / 100;
    
    // Check if we're in a transition zone (within TRANSITION_DISTANCE of boundary)
    let targetColor = currentZone.ambientColor;
    let targetIntensity = currentZone.ambientIntensity;
    
    // Find if we're near a zone boundary
    for (let i = 0; i < this.zones.length - 1; i++) {
      const zone = this.zones[i];
      const nextZone = this.zones[i + 1];
      const boundary = zone.maxDepth;
      
      // Calculate distance from boundary in meters
      const distanceFromBoundary = Math.abs(depthInMeters - boundary);
      const transitionMeters = ZONE_CONFIG.TRANSITION_DISTANCE / 100; // Convert to meters
      
      if (distanceFromBoundary < transitionMeters) {
        // We're in transition - lerp between zones
        const lerpFactor = distanceFromBoundary / transitionMeters;
        
        if (depthInMeters < boundary) {
          // Transitioning from current to next
          targetColor = this.lerpColor(
            nextZone.ambientColor,
            zone.ambientColor,
            lerpFactor
          );
          targetIntensity = this.lerp(
            nextZone.ambientIntensity,
            zone.ambientIntensity,
            lerpFactor
          );
        } else {
          // Just crossed boundary, transitioning into next
          targetColor = this.lerpColor(
            zone.ambientColor,
            nextZone.ambientColor,
            lerpFactor
          );
          targetIntensity = this.lerp(
            zone.ambientIntensity,
            nextZone.ambientIntensity,
            lerpFactor
          );
        }
        break;
      }
    }
    
    // Apply ambient light settings
    lightsManager.setAmbientColor(targetColor);
    
    // Store current zone for other systems
    if (this.currentZone?.name !== currentZone.name) {
      this.previousZone = this.currentZone;
      this.currentZone = currentZone;
      
      // Emit zone change event
      if (this.previousZone) {
        console.log(`[DepthZone] Entered ${currentZone.name} from ${this.previousZone.name}`);
        this.scene.events.emit('zone-changed', currentZone, this.previousZone);
      }
    }
  }

  /**
   * Get enemy multipliers for current zone
   * @param {Object} zone - Zone configuration
   * @returns {Object} Multipliers for speed, damage, spawn rate
   */
  getEnemyMultipliers(zone) {
    return {
      speed: zone.enemySpeedMultiplier,
      damage: zone.enemyDamageMultiplier,
      spawnRate: zone.enemySpawnRate
    };
  }

  /**
   * Get pearl value for zone
   * @param {Object} zone - Zone configuration
   * @returns {number} Pearl value (1, 5, or 20)
   */
  getPearlValue(zone) {
    return zone.pearlValue;
  }

  /**
   * Get available enemy types for zone
   * @param {Object} zone - Zone configuration
   * @returns {Array<string>} Enemy type names
   */
  getEnemyTypes(zone) {
    return zone.enemyTypes;
  }

  /**
   * Linear interpolation
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  lerp(a, b, t) {
    return a + (b - a) * (1 - t);
  }

  /**
   * Lerp between two hex colors
   * @param {string|number} color1 - First color (hex)
   * @param {string|number} color2 - Second color (hex)
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated color
   */
  lerpColor(color1, color2, t) {
    // Convert string hex to number if needed
    const c1 = typeof color1 === 'string' ? parseInt(color1.replace('0x', ''), 16) : color1;
    const c2 = typeof color2 === 'string' ? parseInt(color2.replace('0x', ''), 16) : color2;
    
    // Extract RGB components
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    // Lerp each component
    const r = Math.floor(this.lerp(r1, r2, t));
    const g = Math.floor(this.lerp(g1, g2, t));
    const b = Math.floor(this.lerp(b1, b2, t));
    
    // Combine back into hex
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Get zone name for display
   * @param {Object} zone - Zone configuration
   * @returns {string} Zone name
   */
  getZoneName(zone) {
    return zone ? zone.name : 'Unknown';
  }

  /**
   * Get all zones
   * @returns {Array<Object>} All zone configurations
   */
  getAllZones() {
    return this.zones;
  }
}
