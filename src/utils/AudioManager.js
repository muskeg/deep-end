/**
 * AudioManager - Handles all game sound effects
 * Manages loading, playing, and volume control for audio
 */
export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.volume = 0.5;
    this.sounds = {};
  }

  /**
   * Preload all audio assets
   * Call this in the scene's preload() method
   */
  static preload(scene) {
    // For now, we'll use Phaser's built-in audio generation
    // In production, replace with actual audio files
    
    // Note: Using procedurally generated sounds via Web Audio API
    // No files to load - sounds will be generated on-demand
  }

  /**
   * Initialize audio manager
   * Call this in the scene's create() method
   */
  initialize() {
    // Create sound objects using Phaser's sound manager
    // These will be generated procedurally using Web Audio API
    this.sounds = {
      pearlCollect: null,
      enemyHit: null,
      levelComplete: null,
      gameOver: null,
      oxygenWarning: null
    };
  }

  /**
   * Play pearl collection sound
   */
  playPearlCollect() {
    if (!this.enabled) return;
    
    // Generate a pleasant chime sound
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.05); // E5
    oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.1); // G5
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  }

  /**
   * Play enemy collision sound
   */
  playEnemyHit() {
    if (!this.enabled) return;
    
    // Generate a warning/damage sound
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, context.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(this.volume * 0.4, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  }

  /**
   * Play level complete sound
   */
  playLevelComplete() {
    if (!this.enabled) return;
    
    // Generate a victory fanfare
    const context = this.scene.sound.context;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, i) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(freq, context.currentTime + i * 0.1);
      
      gainNode.gain.setValueAtTime(this.volume * 0.25, context.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + i * 0.1 + 0.3);
      
      oscillator.start(context.currentTime + i * 0.1);
      oscillator.stop(context.currentTime + i * 0.1 + 0.3);
    });
  }

  /**
   * Play game over sound
   */
  playGameOver() {
    if (!this.enabled) return;
    
    // Generate a descending defeat sound
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(392.00, context.currentTime); // G4
    oscillator.frequency.exponentialRampToValueAtTime(196.00, context.currentTime + 0.5); // G3
    
    gainNode.gain.setValueAtTime(this.volume * 0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  }

  /**
   * Play oxygen warning sound
   */
  playOxygenWarning() {
    if (!this.enabled) return;
    
    // Generate a short, gentle beep
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5 - softer tone
    
    // Smooth envelope with proper decay
    gainNode.gain.setValueAtTime(0.001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(this.volume * 0.06, context.currentTime + 0.01); // Fast attack, quieter
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08); // Smooth decay
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.08);
  }

  /**
   * Toggle audio on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Check if audio is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}
