//--------------------------------------------------------------------------
// Grenade
//--------------------------------------------------------------------------
Game.addEntity('grenade', function (obj) {
  Entity.apply(this, arguments);
  this.family = 'bullets';
  this.type = 'grenade';
  this.width = 4;
  this.height = 4;
  this.damage = 10;
  this.speed = Game.player.throwSpeed + Math.abs(Game.player.force.x);
  this.maxSpeed = 5;
  this.force = {x: 0, y: 0};
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      GrenadeExplosion(this.x, this.y);
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += Game.map.gravity;
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
        GrenadeExplosion(this.x, this.y);
      }
    }
  };
});

