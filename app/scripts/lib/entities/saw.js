//--------------------------------------------------------------------------
// Saw
//--------------------------------------------------------------------------
var Saw = function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.maxSpeed = 1;
  this.speed = 0.1;
  this.damage = 100;
  this.solid = true;
  this.animation = {x: 0, y: 0, w: 48, h: 48, frames: 5, fps: 10, loop: true};
  this.collide = function (element) {
    if (element.damage > 0 && element.family !== 'enemies')
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (m.hole) {
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x) {
        this.direction = !this.direction;
      }
      this.animate();
    }
  }
};
Saw.prototype = Entity.prototype;
Saw.prototype.constructor = Saw;
