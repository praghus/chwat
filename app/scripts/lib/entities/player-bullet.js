//--------------------------------------------------------------------------
// Player bullet
//--------------------------------------------------------------------------
var PlayerBullet = function (obj, dir) {
  Entity.apply(this, arguments);
  this.family = 'bullets';
  this.type = 'player_bullet';
  this.width = 8;
  this.height = 8;
  this.speed = 10;
  this.damage = 20;
  this.direction = dir;
  this.color = '#666666';
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      ShootExplosion(this.x, this.y, this.color);
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.direction == 0
        ? this.x -= this.speed
        : this.x += this.speed;

      if (this.x + camera.x < 0)
        this.dead = true;

      var EX = this.x, EY = this.y,
        BX = this.direction == 0 ? EX - this.speed : EX + this.speed,
        p = renderer.ctx.getImageData(BX + camera.x, EY + camera.y, 1, 1).data;

      this.color = Game.Math.brighten('#' + ('000000' + Game.Math.rgbToHex(p[0], p[1], p[2])).slice(-6), 20);
      if (Math.floor(BX / map.spriteSize) >= 0 && Math.floor(EY / map.spriteSize) >= 0) {
        if (map.isSolid(Math.floor(BX / map.spriteSize), Math.floor(EY / map.spriteSize))) {
          this.dead = true;
        }
      }
      if (this.dead) ShootExplosion(EX, EY, this.color);
    }
  }
};
PlayerBullet.prototype = Entity.prototype;
PlayerBullet.prototype.constructor = PlayerBullet;
