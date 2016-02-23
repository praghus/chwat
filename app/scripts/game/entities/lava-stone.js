//--------------------------------------------------------------------------
// Lava stone
//--------------------------------------------------------------------------
Game.addEntity('lava_stone', function (obj, dir) {
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
  this.draw = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + Game.camera.x, this.y + Game.camera.y, this.width, this.height);
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += Game.map.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      this.move();
      if (this.expectedX !== this.x || this.expectedY !== this.y) {
        this.dead = true;
      }
      if (this.dead){
        ShootExplosion(this.x, this.y, this.color);
      }
    }
  };
});
