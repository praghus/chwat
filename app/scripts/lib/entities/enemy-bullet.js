//--------------------------------------------------------------------------
// Enemy bullet
//--------------------------------------------------------------------------
Game.addEntity('enemy_bullet', function (obj) {
  Entity.apply(this, arguments);
  this.family = 'bullets';
  this.type = 'enemy_bullet';
  this.width = 8;
  this.height = 8;
  this.damage = 50;
  this.speed = 5;
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      ShootExplosion(this.x, this.y, '#EEEEFF');
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
        BX = this.direction == 0 ? EX - this.speed : EX + this.speed;

      if (Game.Math.overlap(player, this) && !this.dead) {
        player.hit(this.damage);
        this.dead = true;
      }
      if (Math.floor(BX / map.spriteSize) >= 0 && Math.floor(EY / map.spriteSize) >= 0) {
        if (map.isSolid(Math.floor(BX / map.spriteSize), Math.floor(EY / map.spriteSize))) {
          this.dead = true;
        }
      }
      if (this.dead)
        ShootExplosion(this.x, this.y, '#EEEEFF');
    }
  }
});

