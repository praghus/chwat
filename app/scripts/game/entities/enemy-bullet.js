//--------------------------------------------------------------------------
// Enemy bullet
//--------------------------------------------------------------------------
game.addEntity('enemy_bullet', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'bullets';
    this.type = 'enemy_bullet';
    this.width = 8;
    this.height = 1;
    this.damage = 50;
    this.speed = 5;
    this.maxSpeed = 5;
  }

  collide(element) {
    if (element.solid) {
      this.dead = true;
      this._game.shootExplosion(this.x, this.y, '#EEEEFF');
    }
  }

  update() {
    if (!this.dead) {
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      this.move();

      if (this._game.m.overlap(this._game.player, this) && !this.dead) {
        this._game.player.hit(this.damage);
        this.dead = true;
        this._game.shootExplosion(this.x, this.y, '#EE0000');
      }
      if (this.expectedX !== this.x) {
        this.dead = true;
        this._game.shootExplosion(this.x, this.y, '#EEEEFF');
      }
    }
  }
});

