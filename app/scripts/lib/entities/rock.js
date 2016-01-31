//--------------------------------------------------------------------------
// Rock
//--------------------------------------------------------------------------
Game.addEntity('rock', function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.speed = 0.2;
  this.maxSpeed = 2;
  this.direction = 1;
  this.damage = 100;
  this.solid = true;
  this.rotation = 0;
  this.draw = function (ctx, image) {
    var r = Math.PI / 16;
    ctx.save();
    ctx.translate(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    ctx.translate(16, 16);
    if (this.force.x !== 0) {
      this.rotation += this.speed / 5;
    }
    ctx.rotate(this.rotation * r);
    ctx.drawImage(image, -16, -16);
    ctx.restore();
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
      this.force.y += map.gravity;
      if (this.onFloor && this.speed < this.maxSpeed) {
        this.speed += 0.01;
      }
      //if(this.force.y < 0 && this.speed > 1) this.speed -=0.25;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      this.move();
    }
  };
});
