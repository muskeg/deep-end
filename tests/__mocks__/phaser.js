/**
 * Phaser Mock for Jest Tests
 * Provides minimal Phaser API surface for unit testing
 */

class MockSprite {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.active = true;
    this.visible = true;
    this.alpha = 1;
    this.scale = 1;
    this.body = {
      velocity: { x: 0, y: 0 },
      enable: true,
      setCircle: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    };
  }
  
  setCollideWorldBounds = jest.fn().mockReturnValue(this);
  setImmovable = jest.fn().mockReturnValue(this);
  setVelocity(x, y) {
    this.body.velocity.x = x;
    this.body.velocity.y = y;
    return this;
  }
  destroy() {
    this.active = false;
  }
}

class MockGraphics {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
  
  clear() { return this; }
  fillStyle() { return this; }
  fillCircle() { return this; }
  fillRect() { return this; }
  fillRoundedRect() { return this; }
  fillTriangle() { return this; }
  lineStyle() { return this; }
  strokeCircle() { return this; }
  beginPath() { return this; }
  moveTo() { return this; }
  lineTo() { return this; }
  strokePath() { return this; }
  setAlpha() { return this; }
  destroy() {}
}

class MockText {
  constructor(scene, x, y, text, style) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;
    this.style = style || {};
  }
  
  setText(text) {
    this.text = text;
    return this;
  }
  
  setColor(color) {
    this.style.fill = color;
    return this;
  }
  
  setOrigin(x, y) {
    this.originX = x;
    this.originY = y;
    return this;
  }
  
  destroy() {}
}

class MockGameObject {
  constructor(scene, type) {
    this.scene = scene;
    this.type = type;
    this.active = true;
    this.visible = true;
  }
  
  destroy() {
    this.active = false;
  }
}

const Phaser = {
  GameObjects: {
    GameObject: MockGameObject,
    Sprite: MockSprite,
    Graphics: MockGraphics,
    Text: MockText
  },
  Physics: {
    Arcade: {
      Sprite: MockSprite
    }
  },
  
  Math: {
    Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    Distance: {
      Between: (x1, y1, x2, y2) => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
      }
    }
  },
  
  Scene: class Scene {
    constructor(config) {
      this.key = config.key || 'MockScene';
      this.add = {
        existing: jest.fn(),
        sprite: jest.fn(() => new MockSprite(this, 0, 0)),
        graphics: jest.fn(() => new MockGraphics()),
        text: jest.fn((x, y, text, style) => new MockText(this, x, y, text, style)),
        circle: jest.fn(() => ({ x: 0, y: 0 })),
        rectangle: jest.fn(() => ({ x: 0, y: 0 }))
      };
      this.physics = {
        add: {
          existing: jest.fn(),
          sprite: jest.fn(() => new MockSprite(this, 0, 0)),
          overlap: jest.fn()
        }
      };
      this.events = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        once: jest.fn()
      };
      this.tweens = {
        add: jest.fn((config) => {
          // Immediately call onComplete for testing
          if (config.onComplete) {
            setTimeout(config.onComplete, 0);
          }
          return {
            stop: jest.fn()
          };
        })
      };
      this.time = {
        now: 0,
        addEvent: jest.fn((config) => {
          const timer = {
            remove: jest.fn()
          };
          if (config.callback && config.delay) {
            setTimeout(config.callback, config.delay);
          }
          return timer;
        })
      };
      this.input = {
        keyboard: {
          addKeys: jest.fn(() => ({})),
          createCursorKeys: jest.fn(() => ({
            up: { isDown: false },
            down: { isDown: false },
            left: { isDown: false },
            right: { isDown: false }
          })),
          on: jest.fn(),
          off: jest.fn(),
          once: jest.fn()
        }
      };
      this.cameras = {
        main: {
          width: 800,
          height: 600,
          fadeIn: jest.fn(),
          fadeOut: jest.fn(),
          once: jest.fn()
        }
      };
    }
  },
  
  Game: jest.fn(),
  AUTO: 'AUTO',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH'
  }
};

export default Phaser;
