//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
Game.addEntity('paddle', function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.speed = 1;
  this.stop = false;
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
      if (!Game.input.up && !Game.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      element.doJump = false;
      element.x += this.force.x;
      if (element.doJump) {
        element.doJump = false;
      }
      if (element.type === 'player') {
        camera.x = -(player.x - (ResolutionX / 2));
        if (Game.input.up) {
          player.force.y = -6;
          player.doJump = true;
        }
      }
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      this.awake = true;
    }
    if (this.awake && !this.dead) {

      if(!this.stop) {
        this.force.x += this.direction === DIR.RIGHT ? this.speed : -this.speed;
        this.move();
      }

      if (this.expectedX !== this.x) {
        this.force.x = 0;
        this.stop = true;
        this.direction = this.direction === DIR.RIGHT ? DIR.LEFT : DIR.RIGHT;

        this.turnTimeout = setTimeout(function () {
          if(this.stop){
            this.stop = false;
          }
          this.turnTimeout = null;
        }.bind(this), 1000);
      }
    }
  };
});
