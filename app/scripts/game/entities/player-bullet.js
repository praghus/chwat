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


/*      var EX = this.x, EY = this.y,
          BX = this.direction === 0 ? EX - this.speed : EX + this.speed,
          p = Game.renderer.ctx.getImageData(BX + Game.camera.x, EY + Game.camera.y, 1, 1).data;

      this.color = Game.m.brighten('#' + ('000000' + Game.m.rgbToHex(p[0], p[1], p[2])).slice(-6), 20);

      if (Math.floor(BX / Game.map.spriteSize) >= 0 && Math.floor(EY / Game.map.spriteSize) >= 0) {
        if (Game.map.isSolid(Math.floor(BX / Game.map.spriteSize), Math.floor(EY / Game.map.spriteSize))) {
          this.dead = true;
        }
      }*/
      if (this.dead) {
        this._game.shootExplosion(this.x, this.y, this.color);
      }
    }
  };
});
