//--------------------------------------------------------------------------
// Grenade
//--------------------------------------------------------------------------
var Grenade = function (obj) {
  Entity.apply(this, arguments);
  this.family = 'bullets';
  this.type = 'stone';
  this.width = 4;
  this.height = 4;
  this.damage = 10;
  this.speed = Math.random() * 3 + Math.abs(player.force.x);
  this.maxSpeed = 10;
  this.direction = Math.round(Math.random() * 2);
  this.force = {x: 0, y: 0};
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      GrenadeExplosion(this.x, this.y);
    }
  }
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x) {
        this.direction = !this.direction;
        this.force.x *= -0.6;
        this.speed -= 1;
      }
      if (!m.y) this.speed -= 0.5;
      if (this.speed < 1) {
        this.dead = true;
        GrenadeExplosion(this.x, this.y);
      }
    }
  }
};
Grenade.prototype = Entity.prototype;
Grenade.prototype.constructor = Grenade;
