//--------------------------------------------------------------------------
// Lava stone
//--------------------------------------------------------------------------
var LavaStone = function (obj, dir) {
  Entity.apply(this, arguments);
  this.type = 'lava_bullet';
  this.family = 'traps';
  this.damage = 100;
  this.width = 4;
  this.height = 4;
  this.speed = 2;
  this.maxSpeed = 2;
  this.damage = 20;
  this.direction = Math.round(Math.random() * 2);
  this.force = {x: 0, y: -4 - Math.random() * 4};
  this.color = 'rgb(200,100,0)';
  this.draw = function (ctx, image) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height);
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x || !m.y) this.dead = true;
      if (this.dead)
        ShootExplosion(this.x, this.y, this.color);
    }
  }
};
LavaStone.prototype = Entity.prototype;
LavaStone.prototype.constructor = LavaStone;
