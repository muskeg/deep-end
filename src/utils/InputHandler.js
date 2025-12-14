import { INPUTS } from './Constants.js';

/**
 * InputHandler
 * Manages keyboard input for player controls
 */
export default class InputHandler {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    
    // Register keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      W: 'W',
      A: 'A',
      S: 'S',
      D: 'D',
      SPACE: 'SPACE',
      ESC: 'ESC',
      Q: 'Q',
      SHIFT: 'SHIFT'
    });
    
    // Track just-pressed state
    this.justPressed = {
      interact: false,
      attack: false,
      dash: false,
      surface: false
    };
    
    // Track callbacks for cleanup
    this.pauseCallback = null;
    this.attackCallback = null;
    this.dashCallback = null;
    this.surfaceCallback = null;
  }
  
  /**
   * Get movement input state
   */
  getMovementInput() {
    if (!this.enabled || !this.cursors || !this.keys) {
      return { up: false, down: false, left: false, right: false };
    }
    
    return {
      up: (this.cursors.up?.isDown || this.keys.W?.isDown) || false,
      down: (this.cursors.down?.isDown || this.keys.S?.isDown) || false,
      left: (this.cursors.left?.isDown || this.keys.A?.isDown) || false,
      right: (this.cursors.right?.isDown || this.keys.D?.isDown) || false
    };
  }
  
  /**
   * Check if interact button is pressed
   */
  isInteractPressed() {
    if (!this.enabled || !this.keys.SPACE) return false;
    return this.keys.SPACE.isDown;
  }
  
  /**
   * Check if interact button was just pressed (this frame)
   */
  isInteractJustPressed() {
    if (!this.enabled || !this.keys.SPACE) return false;
    
    const isDown = this.keys.SPACE.isDown;
    const duration = this.keys.SPACE.getDuration ? this.keys.SPACE.getDuration() : 100;
    
    return isDown && duration < 50; // Just pressed within 50ms
  }
  
  /**
   * Check if pause button is pressed
   */
  isPausePressed() {
    if (!this.enabled || !this.keys.ESC) return false;
    return this.keys.ESC.isDown;
  }
  
  /**
   * Register pause callback
   */
  onPause(callback) {
    this.pauseCallback = callback;
    this.scene.input.keyboard.on('keydown-ESCAPE', callback);
  }
  
  /**
   * Register interact callback
   */
  onInteract(callback) {
    this.interactCallback = callback;
    this.scene.input.keyboard.on('keydown-SPACE', callback);
  }

  /**
   * Register attack callback
   */
  onAttack(callback) {
    this.attackCallback = callback;
    this.scene.input.keyboard.on('keydown-Q', callback);
  }

  /**
   * Register dash callback
   */
  onDash(callback) {
    this.dashCallback = callback;
    this.scene.input.keyboard.on('keydown-SHIFT', callback);
  }

  /**
   * Register surface callback (ESC key for voluntary surface)
   */
  onSurface(callback) {
    this.surfaceCallback = callback;
    // ESC already registered for pause, this will be an alternative handler
  }

  /**
   * Check if attack button is pressed
   */
  isAttackPressed() {
    if (!this.enabled || !this.keys.Q) return false;
    return this.keys.Q.isDown;
  }

  /**
   * Check if dash button is pressed
   */
  isDashPressed() {
    if (!this.enabled || !this.keys.SHIFT) return false;
    return this.keys.SHIFT.isDown;
  }
  
  /**
   * Check if any movement key is pressed
   */
  hasMovementInput() {
    const input = this.getMovementInput();
    return input.up || input.down || input.left || input.right;
  }
  
  /**
   * Get normalized movement direction vector
   */
  getMovementDirection() {
    const input = this.getMovementInput();
    
    let x = 0;
    let y = 0;
    
    if (input.left) x -= 1;
    if (input.right) x += 1;
    if (input.up) y -= 1;
    if (input.down) y += 1;
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      x /= magnitude;
      y /= magnitude;
    }
    
    return { x, y };
  }
  
  /**
   * Disable input
   */
  disable() {
    this.enabled = false;
  }
  
  /**
   * Enable input
   */
  enable() {
    this.enabled = true;
  }
  
  /**
   * Check if input is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  
  /**
   * Get input state as string (for debugging)
   */
  getInputStateString() {
    const input = this.getMovementInput();
    const states = [];
    
    if (input.up) states.push('up');
    if (input.down) states.push('down');
    if (input.left) states.push('left');
    if (input.right) states.push('right');
    if (this.isInteractPressed()) states.push('interact');
    
    return states.length > 0 ? states.join(', ') : 'none';
  }
  
  /**
   * Reset all input state
   */
  reset() {
    // Reset cursor keys
    this.cursors.up.isDown = false;
    this.cursors.down.isDown = false;
    this.cursors.left.isDown = false;
    this.cursors.right.isDown = false;
    
    // Reset WASD and action keys
    this.keys.W.isDown = false;
    this.keys.A.isDown = false;
    this.keys.S.isDown = false;
    this.keys.D.isDown = false;
    this.keys.SPACE.isDown = false;
    this.keys.ESC.isDown = false;
    this.keys.Q.isDown = false;
    this.keys.SHIFT.isDown = false;
    
    // Clear just-pressed flags
    this.justPressed = {
      interact: false,
      attack: false,
      dash: false,
      surface: false
    };
  }
  
  /**
   * Update loop
   */
  update() {
    // Clear just-pressed flags
    // This would normally happen automatically through Phaser's input system
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    if (this.interactCallback) {
      this.scene.input.keyboard.off('keydown-SPACE', this.interactCallback);
    }
    if (this.pauseCallback) {
      this.scene.input.keyboard.off('keydown-ESCAPE', this.pauseCallback);
    }
    if (this.attackCallback) {
      this.scene.input.keyboard.off('keydown-Q', this.attackCallback);
    }
    if (this.dashCallback) {
      this.scene.input.keyboard.off('keydown-SHIFT', this.dashCallback);
    }
  }
}
