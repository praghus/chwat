//--------------------------------------------------------------------------
// Phantom
//--------------------------------------------------------------------------
var EnemyPhantom = function () {
  Entity.apply(this, arguments);
  this.family = 'enemies';
  this.maxSpeed = 0.5;
  this.speed = 0.1;
  this.energy = 30;
  this.maxEnergy = 30;
  this.damage = 10;
  this.canJump = true;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 16, h: 32, frames: 2, fps: 8, loop: true},
    LEFT: {x: 32, y: 0, w: 16, h: 32, frames: 2, fps: 8, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family !== 'enemies')
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.y += this.y > player.y ? -0.02 : 0.5;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      this.move();
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
};
EnemyPhantom.prototype = Entity.prototype;
EnemyPhantom.prototype.constructor = EnemyPhantom;
