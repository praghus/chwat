//--------------------------------------------------------------------------
// Coin
//--------------------------------------------------------------------------
game.addEntity('coin', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'items';
    this.type = 'coin';
    this.width = 8;
    this.height = 8;
    this.animation = {x: 0, y: 0, w: 8, h: 8, frames: 10, fps: 30, loop: true};
    this.force = {x: 0, y: -5};
  }

  collide(element) {
    if (element.type === 'player') {
      this.dead = true;
      this._game.player.coinCollect += 1;
    }
  }

  update() {
    if (this.onScreen()) {
      this.animate();
      this.force.y += this._game.world.gravity;
      this.move();
    }
  };
});

