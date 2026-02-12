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
   * Play harpoon fire sound - short metallic whoosh
   */
  playHarpoonFire() {
    if (!this.enabled) return;
    
    const context = this.scene.sound.context;
    
    // White noise burst for the whoosh
    const bufferSize = context.sampleRate * 0.1;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter for metallic quality
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, context.currentTime + 0.05);
    filter.Q.setValueAtTime(5, context.currentTime);
    
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(this.volume * 0.25, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    
    noise.start(context.currentTime);
    noise.stop(context.currentTime + 0.1);
  }

  /**
   * Play harpoon hit sound - impact thud
   */
  playHarpoonHit() {
    if (!this.enabled) return;
    
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(this.volume * 0.35, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.12);
  }

  /**
   * Play dash activate sound - quick ascending sweep
   */
  playDashActivate() {
    if (!this.enabled) return;
    
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(this.volume * 0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.12);
  }

  /**
   * Play upgrade purchase sound - cash register ding
   */
  playUpgradePurchase() {
    if (!this.enabled) return;
    
    const context = this.scene.sound.context;
    const notes = [659.25, 783.99, 1046.50]; // E5, G5, C6 ascending
    
    notes.forEach((freq, i) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, context.currentTime + i * 0.08);
      
      gainNode.gain.setValueAtTime(this.volume * 0.2, context.currentTime + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + i * 0.08 + 0.2);
      
      oscillator.start(context.currentTime + i * 0.08);
      oscillator.stop(context.currentTime + i * 0.08 + 0.2);
    });
  }

  /**
   * Play zone transition sound - deep reverberant tone shift
   */
  playZoneTransition() {
    if (!this.enabled) return;
    
    const context = this.scene.sound.context;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, context.currentTime);    // A3
    oscillator.frequency.linearRampToValueAtTime(110, context.currentTime + 0.4); // A2
    
    gainNode.gain.setValueAtTime(this.volume * 0.15, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, context.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
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

  // ── Background Music (Zone Ambient Drones) ──────────────────────────

  /**
   * Start ambient background music for a zone
   * Uses looping oscillators to create an underwater drone
   * @param {string} zoneName - 'Sunlight Zone', 'Twilight Zone', or 'Midnight Zone'
   */
  startZoneMusic(zoneName) {
    // Stop any existing music
    this.stopZoneMusic();
    if (!this.enabled) return;

    const context = this.scene.sound.context;
    this._musicGain = context.createGain();
    this._musicGain.gain.setValueAtTime(0.001, context.currentTime);
    this._musicGain.connect(context.destination);

    this._musicOscillators = [];

    let config;
    if (zoneName.includes('Midnight')) {
      // Ominous: low rumble + dissonant minor 2nd
      config = [
        { type: 'sine', freq: 55, gain: 0.06 },       // A1 bass drone
        { type: 'sine', freq: 58.27, gain: 0.03 },     // Bb1 dissonance
        { type: 'triangle', freq: 110, gain: 0.02 }    // A2 undertone
      ];
    } else if (zoneName.includes('Twilight')) {
      // Tense: minor chord drone
      config = [
        { type: 'sine', freq: 82.41, gain: 0.05 },     // E2
        { type: 'sine', freq: 123.47, gain: 0.03 },    // B2
        { type: 'triangle', freq: 146.83, gain: 0.02 } // D3 (minor feel)
      ];
    } else {
      // Calm: open fifth, airy
      config = [
        { type: 'sine', freq: 130.81, gain: 0.04 },   // C3
        { type: 'sine', freq: 196.00, gain: 0.025 },   // G3
        { type: 'triangle', freq: 261.63, gain: 0.015 } // C4
      ];
    }

    config.forEach(({ type, freq, gain }) => {
      const osc = context.createOscillator();
      const g = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, context.currentTime);
      g.gain.setValueAtTime(gain * this.volume, context.currentTime);
      osc.connect(g);
      g.connect(this._musicGain);
      osc.start(context.currentTime);
      this._musicOscillators.push({ oscillator: osc, gainNode: g });
    });

    // Fade in over 1 second
    this._musicGain.gain.exponentialRampToValueAtTime(1, context.currentTime + 1);
  }

  /**
   * Stop zone background music
   */
  stopZoneMusic() {
    if (!this._musicOscillators || this._musicOscillators.length === 0) return;

    try {
      const context = this.scene.sound.context;
      // Fade out over 0.5s then stop
      if (this._musicGain) {
        this._musicGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this._musicOscillators) {
          this._musicOscillators.forEach(({ oscillator }) => {
            try { oscillator.stop(); } catch (e) { /* already stopped */ }
          });
          this._musicOscillators = [];
        }
      }, 600);
    } catch (e) {
      this._musicOscillators = [];
    }
  }
}
