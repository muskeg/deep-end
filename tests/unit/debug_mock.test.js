import Phaser from 'phaser';

test('MockSprite body has setGravityY', () => {
  const sprite = new Phaser.Physics.Arcade.Sprite(null, 0, 0, 'test');
  console.log('direct body keys:', Object.keys(sprite.body));
  expect(typeof sprite.body.setGravityY).toBe('function');
});

test('Derived class preserves body methods', () => {
  const mockScene = {
    add: { existing: jest.fn() },
    physics: { add: { existing: jest.fn() } },
    time: { addEvent: jest.fn(() => ({ remove: jest.fn() })) }
  };
  
  class TestChild extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
      super(scene, x, y, 'test');
      scene.add.existing(this);
      scene.physics.add.existing(this);
      console.log('in derived constructor, body keys:', Object.keys(this.body));
      console.log('setGravityY type:', typeof this.body.setGravityY);
      this.body.setGravityY(200);
    }
  }
  
  const child = new TestChild(mockScene, 0, 0);
  expect(typeof child.body.setGravityY).toBe('function');
});
