//--------------------------------------------------------------------------
// Explosions
//--------------------------------------------------------------------------
game.addEntity('explosion', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'traps';
    this.type = 'explosion1';
    this.width = 32;
    this.height = 60;
    this.damage = 2;
    this.animation = {x: 0, y: 0, w: 32, h: 60, frames: 15, fps: 30, loop: true};
  }

  update() {
    if (this.onScreen()) {
      this.awake = true;
    }
    if (this.awake && !this.dead) {
      this.animate();
    }
    if (this.animFrame > 5) {
      this.damage = 0;
    }
    if (this.animFrame === this.animation.frames - 1) {
      this.dead = true;
    }
  }
});
