//--------------------------------------------------------------------------
// Gloom
//--------------------------------------------------------------------------
var EnemyGloom = function () {
  Entity.apply(this, arguments);
  this.family = 'enemies';
  this.maxSpeed = 0.5;
  this.speed = 0.1;
  this.energy = 100;
  this.maxEnergy = 100;
  this.damage = 10;
  this.canJump = true;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 32, h: 32, frames: 2, fps: 8, loop: true},
    LEFT: {x: 64, y: 0, w: 32, h: 32, frames: 2, fps: 8, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family != 'enemies')
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      else if (!m.x) {
        this.direction = !this.direction;
      }
      if (this.force.y != 0) this.force.y *= 0.8;
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
};
EnemyGloom.prototype = Entity.prototype;
EnemyGloom.prototype.constructor = EnemyGloom;
