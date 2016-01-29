//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
Game.Entities['paddle'] = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.speed = 1;
  this.maxSpeed = 1;
  this.turnTimeout = null;
  this.draw = function (ctx, image) {
    for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
      ctx.drawImage(image,
        0, 0, map.spriteSize, map.spriteSize,
        Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y),
        map.spriteSize, map.spriteSize
      );
    }
  };
  this.collide = function (element) {
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!player.input.up && !player.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      element.doJump = false;
      element.x += this.force.x;
      if (element.doJump) element.doJump = false;
      if (element.type === 'player') {
        camera.x = -(player.x - (ResolutionX / 2));
        if (player.input.up) {
          player.force.y = -6;
          player.doJump = true;
        }
      }
    }
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x && this.turnTimeout === null) this.turnTimeout = setTimeout(function (thisObj) {
        thisObj.direction = !thisObj.direction;
        thisObj.turnTimeout = null
      }, 300, this);
    }
  }
};
Class.extend(Game.Entities['paddle'], Entity);
