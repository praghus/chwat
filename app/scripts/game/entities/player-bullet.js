//--------------------------------------------------------------------------
// Player bullet
//--------------------------------------------------------------------------

game.addEntity('player_bullet', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'bullets';
    this.type = 'player_bullet';
    this.width = 8;
    this.height = 1;
    this.speed = 10;
    this.maxSpeed = 10;
    this.damage = 20;
    this.color = '#666666';
  }

  collide(element) {
    if (element.solid) {
      this.dead = true;
      const EX = this.x, EY = this.y;
      const BX = this.direction === this.DIR.LEFT ? EX - this.speed : EX + this.speed;
      const p = this._game.$.getImageData(BX + this._game.camera.x, EY + this._game.camera.y, 1, 1).data;
      this.color = this._game.m.brighten('#' + ('000000' + this._game.m.rgbToHex(p[0], p[1], p[2])).slice(-6), 20);
      this._game.shootExplosion(this.x, this.y, this.color);
    }
  }

  update() {
    if (!this.dead) {
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;

      this.move();

      if (this.expectedX !== this.x) {
        this.dead = true;
      }
      if (this.dead) {
        this._game.shootExplosion(this.x, this.y, this.color);
      }
    }
  };
});
