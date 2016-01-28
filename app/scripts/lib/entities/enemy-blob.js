//--------------------------------------------------------------------------
// Blob
//--------------------------------------------------------------------------
var EnemyBlob = function () {
  Entity.apply(this, arguments);
  this.family = 'enemies';
  this.maxSpeed = 1;
  this.speed = 0.1;
  this.energy = 30;
  this.maxEnergy = 30;
  this.damage = 10;
  this.tryJump = 0;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 20, h: 20, frames: 6, fps: 10, loop: true},
    LEFT: {x: 0, y: 20, w: 20, h: 20, frames: 6, fps: 10, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family !== 'enemies')
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.y += map.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      var m = this.move();
      if ((this.PlayerM > 1.4 && this.PlayerM < 1.5) ||
        (this.PlayerM < -1.4 && this.PlayerM > -1.5))
        this.force.y -= 2;
      if (m.hole && this.onFloor) {
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x && this.onFloor) {
        if (this.PlayerM > 0.2 || this.PlayerM < -0.2)
          this.force.y -= 5;
        else
          this.direction = !this.direction;
      }
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
      this.animate();
    }
  }
};
EnemyBlob.prototype = Entity.prototype;
EnemyBlob.prototype.constructor = EnemyBlob;
