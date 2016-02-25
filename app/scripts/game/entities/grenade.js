//--------------------------------------------------------------------------
// Grenade
//--------------------------------------------------------------------------
game.addEntity('grenade', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    const { player } = this._game;
    this.family = 'bullets';
    this.type = 'grenade';
    this.width = 4;
    this.height = 4;
    this.damage = 10;
    this.speed = player.throwSpeed + Math.abs(player.force.x);
    this.maxSpeed = 5;
    this.force = {x: 0, y: 0};
  }

  collide(element) {
    if (element.solid) {
      this.dead = true;
      this._game.grenadeExplosion(this.x, this.y);
    }
  }

  update() {
    if (!this.dead) {
      this.force.y += this._game.world.gravity;
      this.force.x = this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      this.move();
      if (this.expectedX < this.x ) {
        this.direction = this.DIR.RIGHT;
        this.force.x *= -0.6;
        this.speed -= 1;
      }
      if (this.expectedX > this.x ) {
        this.direction = this.DIR.LEFT;
        this.force.x *= -0.6;
        this.speed -= 1;
      }
      if (this.onFloor) {
        this.force.y *= -1.5;
        this.speed -= 0.5;
      }
      if (this.speed <= 0) {
        this.dead = true;
        this._game.grenadeExplosion(this.x, this.y);
      }
    }
  };
});

