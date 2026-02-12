/**
 * InputSystem - Unified input handling for keyboard, gamepad, and touch
 */

export default class InputSystem {
  /**
   * Create an input system
   * @param {Phaser.Scene} scene - The game scene
   * @param {Phaser.Physics.Arcade.Sprite} player - The player entity
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    
    // Input state
    this.movementVector = { x: 0, y: 0 };
    this.actionPressed = { dash: false, harpoon: false, interact: false };
    
    // Keyboard
    this.setupKeyboard();
    
    // Gamepad
    this.gamepad = null;
    this.setupGamepad();
    
    // Touch/Mobile
    this.isMobile = this.scene.sys.game.device.os.android || 
                     this.scene.sys.game.device.os.iOS || 
                     this.scene.sys.game.device.os.iPad || 
                     this.scene.sys.game.device.os.iPhone;
    
    if (this.isMobile) {
      this.setupTouchControls();
    }
  }
  
  /**
   * Setup keyboard controls
   */
  setupKeyboard() {
    this.keys = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up2: Phaser.Input.Keyboard.KeyCodes.UP,
      down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      harpoon: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });
  }
  
  /**
   * Setup gamepad support
   */
  setupGamepad() {
    // Check if gamepad plugin is available
    if (!this.scene.input || !this.scene.input.gamepad) {
      console.log('[InputSystem] Gamepad plugin not available');
      return;
    }
    
    // Try to start the gamepad plugin
    try {
      // Start the gamepad plugin if not already started
      if (!this.scene.input.gamepad.enabled) {
        this.scene.input.gamepad.start();
      }
      
      // Listen for new gamepad connections
      this.scene.input.gamepad.on('connected', (pad) => {
        this.gamepad = pad;
        console.log('[InputSystem] Gamepad connected:', pad.id);
      });
      
      // Check if a gamepad is already connected
      if (this.scene.input.gamepad.total > 0) {
        this.gamepad = this.scene.input.gamepad.getPad(0);
        console.log('[InputSystem] Using existing gamepad:', this.gamepad.id);
      }
    } catch (e) {
      console.log('[InputSystem] Gamepad setup failed:', e.message);
    }
  }
  
  /**
   * Setup touch controls for mobile
   */
  setupTouchControls() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Touch target position (tap to move)
    this.touchTarget = null;
    this.touchMoveThreshold = 30; // Minimum distance to keep moving
    
    // Action buttons container
    this.touchButtons = this.scene.add.container(0, 0);
    this.touchButtons.setScrollFactor(0);
    this.touchButtons.setDepth(2000);
    
    // Dash button (bottom right)
    const dashBtn = this.createTouchButton(width - 80, height - 80, 60, 'DASH', 0x00aaff);
    dashBtn.on('pointerdown', () => {
      this.actionPressed.dash = true;
    });
    dashBtn.on('pointerup', () => {
      this.actionPressed.dash = false;
    });
    dashBtn.on('pointerout', () => {
      this.actionPressed.dash = false;
    });
    
    // Harpoon button (bottom right, above dash)
    const harpoonBtn = this.createTouchButton(width - 80, height - 160, 60, 'HARPOON', 0xff6600);
    harpoonBtn.on('pointerdown', () => {
      this.actionPressed.harpoon = true;
    });
    harpoonBtn.on('pointerup', () => {
      this.actionPressed.harpoon = false;
    });
    harpoonBtn.on('pointerout', () => {
      this.actionPressed.harpoon = false;
    });
    
    // Interact button (bottom left)
    const interactBtn = this.createTouchButton(80, height - 80, 60, 'OPEN', 0x00ff88);
    interactBtn.on('pointerdown', () => {
      this.actionPressed.interact = true;
    });
    interactBtn.on('pointerup', () => {
      this.actionPressed.interact = false;
    });
    interactBtn.on('pointerout', () => {
      this.actionPressed.interact = false;
    });
    
    this.touchButtons.add([dashBtn, harpoonBtn, interactBtn]);
    harpoonBtn.on('pointerup', () => {
      this.actionPressed.harpoon = false;
    });
    harpoonBtn.on('pointerout', () => {
      this.actionPressed.harpoon = false;
    });
    
    this.touchButtons.add([dashBtn, harpoonBtn]);
    
    // Movement area (tap anywhere else to move there)
    const moveZone = this.scene.add.zone(0, 0, width, height);
    moveZone.setOrigin(0, 0);
    moveZone.setInteractive();
    moveZone.setScrollFactor(0);
    
    moveZone.on('pointerdown', (pointer) => {
      // Convert screen coordinates to world coordinates
      const worldX = this.scene.cameras.main.scrollX + pointer.x;
      const worldY = this.scene.cameras.main.scrollY + pointer.y;
      this.touchTarget = { x: worldX, y: worldY };
    });
    
    moveZone.on('pointerup', () => {
      this.touchTarget = null;
    });
    
    // Visual indicator for touch target
    this.touchIndicator = this.scene.add.circle(0, 0, 10, 0xffffff, 0.3);
    this.touchIndicator.setStrokeStyle(2, 0xffffff, 0.8);
    this.touchIndicator.setVisible(false);
    this.touchIndicator.setDepth(1999);
  }
  
  /**
   * Create a touch button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Button size
   * @param {string} label - Button label
   * @param {number} color - Button color
   * @returns {Phaser.GameObjects.Container} Button container
   */
  createTouchButton(x, y, size, label, color) {
    const button = this.scene.add.container(x, y);
    
    // Background circle
    const bg = this.scene.add.circle(0, 0, size / 2, color, 0.5);
    bg.setStrokeStyle(2, color, 0.8);
    
    // Label text
    const text = this.scene.add.text(0, 0, label, {
      fontSize: '12px',
      color: '#ffffff',
      fontWeight: 'bold'
    });
    text.setOrigin(0.5, 0.5);
    
    button.add([bg, text]);
    button.setSize(size, size);
    button.setInteractive(new Phaser.Geom.Circle(0, 0, size / 2), Phaser.Geom.Circle.Contains);
    
    // Visual feedback
    button.on('pointerdown', () => {
      bg.setAlpha(0.8);
      button.setScale(0.95);
    });
    button.on('pointerup', () => {
      bg.setAlpha(0.5);
      button.setScale(1);
    });
    button.on('pointerout', () => {
      bg.setAlpha(0.5);
      button.setScale(1);
    });
    
    return button;
  }
  
  /**
   * Update input system and return movement/action state
   * @param {number} delta - Delta time in milliseconds
   * @returns {object} Input state
   */
  update(delta) {
    // Reset movement vector
    this.movementVector.x = 0;
    this.movementVector.y = 0;
    
    // Keyboard input
    if (this.keys.left.isDown || this.keys.left2.isDown) {
      this.movementVector.x -= 1;
    }
    if (this.keys.right.isDown || this.keys.right2.isDown) {
      this.movementVector.x += 1;
    }
    if (this.keys.up.isDown || this.keys.up2.isDown) {
      this.movementVector.y -= 1;
    }
    if (this.keys.down.isDown || this.keys.down2.isDown) {
      this.movementVector.y += 1;
    }
    
    // Gamepad input
    if (this.gamepad) {
      const leftStickX = this.gamepad.leftStick.x;
      const leftStickY = this.gamepad.leftStick.y;
      
      // Apply deadzone
      const deadzone = 0.15;
      if (Math.abs(leftStickX) > deadzone) {
        this.movementVector.x += leftStickX;
      }
      if (Math.abs(leftStickY) > deadzone) {
        this.movementVector.y += leftStickY;
      }
      
      // D-pad
      if (this.gamepad.left) this.movementVector.x -= 1;
      if (this.gamepad.right) this.movementVector.x += 1;
      if (this.gamepad.up) this.movementVector.y -= 1;
      if (this.gamepad.down) this.movementVector.y += 1;
      
      // Action buttons
      if (this.gamepad.A || this.gamepad.X) {
        this.actionPressed.dash = true;
      }
      if (this.gamepad.B || this.gamepad.Y || this.gamepad.R1) {
        this.actionPressed.harpoon = true;
      }
      if (this.gamepad.R2 || this.gamepad.L2) {
        this.actionPressed.interact = true;
      }
    }
    
    // Touch input (tap to move)
    if (this.touchTarget) {
      const dx = this.touchTarget.x - this.player.x;
      const dy = this.touchTarget.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Show touch indicator
      this.touchIndicator.setPosition(this.touchTarget.x, this.touchTarget.y);
      this.touchIndicator.setVisible(true);
      
      // If close enough, clear target
      if (distance < this.touchMoveThreshold) {
        this.touchTarget = null;
        this.touchIndicator.setVisible(false);
      } else {
        // Move toward target
        this.movementVector.x = dx / distance;
        this.movementVector.y = dy / distance;
      }
    } else if (this.touchIndicator) {
      this.touchIndicator.setVisible(false);
    }
    
    // Normalize diagonal movement
    const magnitude = Math.sqrt(
      this.movementVector.x * this.movementVector.x + 
      this.movementVector.y * this.movementVector.y
    );
    
    if (magnitude > 1) {
      this.movementVector.x /= magnitude;
      this.movementVector.y /= magnitude;
    }
    
    // Action inputs
    const dashPressed = this.keys.dash.isDown || this.actionPressed.dash;
    const harpoonPressed = this.keys.harpoon.isDown || this.actionPressed.harpoon;
    const interactPressed = this.keys.interact.isDown || this.actionPressed.interact;
    
    // Reset touch action states (they're one-frame)
    if (!this.keys.dash.isDown) {
      this.actionPressed.dash = false;
    }
    if (!this.keys.harpoon.isDown) {
      this.actionPressed.harpoon = false;
    }
    if (!this.keys.interact.isDown) {
      this.actionPressed.interact = false;
    }
    
    return {
      movement: this.movementVector,
      dash: dashPressed,
      harpoon: harpoonPressed,
      interact: interactPressed
    };
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.touchButtons) {
      this.touchButtons.destroy();
    }
    if (this.touchIndicator) {
      this.touchIndicator.destroy();
    }
  }
}
