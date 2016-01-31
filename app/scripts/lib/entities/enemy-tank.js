//--------------------------------------------------------------------------
// Shooting tank
//--------------------------------------------------------------------------
Game.addEntity('enemy_tank', function () {
  Entity.apply(this, arguments);
  this.family = 'enemies';
  this.solid = true;
  this.countToShoot = 0;
  this.canShoot = true;
  this.shootDelay = 5000;
  this.shootTimeout = null;
  this.energy = 100;
  this.maxEnergy = 100;
  this.speed = 0.1;
  this.maxSpeed = 0.5;
  this.animation = {x: 0, y: 0, w: 32, h: 32, frames: 2, fps: 4, loop: true};
  this.damage = 30;
  this.shoot = function () {
    elements.add('enemy_bullet', {x: this.x - 17, y: this.y + 3, direction: 0});
    elements.add('enemy_bullet', {x: this.x + this.width + 1, y: this.y + 3, direction: 1});
    this.shootTimeout = setTimeout(function () {this.canShoot = true;}.bind(this), this.shootDelay);
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family !== 'enemies') {
      this.hit(element.damage);
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      this.awake = true;
    }
    if (this.awake && !this.dead) {
      if (this.seesPlayer() && this.canShoot) {
        this.countToShoot = 40;
        this.canShoot = false;
      }
      this.force.y += map.gravity;
      if (this.countToShoot > 0) {
        this.countToShoot -= 1;
        this.force.x *= 0.8;
        if (this.countToShoot === 20) {
          this.shoot();
        }
      }
      else {
        this.force.x += this.direction > 0 ? this.speed : -this.speed;
      }
      var m = this.move();
      if (m.hole) {
        console.log('hole');
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x && this.onFloor) {
        this.direction = !this.direction;
        this.force.x *= -0.6;
      }
      this.animate();
    }
  };
});
