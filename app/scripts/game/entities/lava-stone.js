//--------------------------------------------------------------------------
// Lava stone
//--------------------------------------------------------------------------
game.addEntity('lava_stone', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'traps';
    this.damage = 100;
    this.width = 4;
    this.height = 4;
    this.speed = 2;
    this.maxSpeed = 2;
    this.damage = 20;
    this.direction = Math.round(Math.random() * 2);
    this.force = {x: 0, y: -4 - Math.random() * 4};
    this.color = 'rgb(200,100,0)';
  }

  draw($) {
    const { camera } = this._game;
    $.fillStyle = this.color;
    $.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height);
  }

  update() {
    if (!this.dead) {
      this.force.y += this._game.world.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      this.move();
      if (this.expectedX !== this.x || this.expectedY !== this.y) {
        this.dead = true;
      }
      if (this.dead){
        this._game.shootExplosion(this.x, this.y, this.color);
      }
    }
  };
});
