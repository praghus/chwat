//--------------------------------------------------------------------------
// Enemy bullet
//--------------------------------------------------------------------------
Game.addEntity('enemy_bullet', function (obj) {
  Entity.apply(this, arguments);
  this.family = 'bullets';
  this.type = 'enemy_bullet';
  this.width = 8;
  this.height = 1;
  this.damage = 50;
  this.speed = 5;
  this.maxSpeed = 5;
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      ShootExplosion(this.x, this.y, '#EEEEFF');
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      this.move();
      if (Game.Math.overlap(Game.player, this) && !this.dead) {
        Game.player.hit(this.damage);
        this.dead = true;
        ShootExplosion(this.x, this.y, '#EE0000');
      }
      if (this.expectedX !== this.x) {
        this.dead = true;
        ShootExplosion(this.x, this.y, '#EEEEFF');
      }
    }
  };
});

