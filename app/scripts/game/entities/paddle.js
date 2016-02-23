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
    for (var x = 0; x < Math.round(this.width / Game.map.spriteSize); x++) {
      ctx.drawImage(image,
        0, 0, Game.map.spriteSize, Game.map.spriteSize,
        Math.floor(this.x + Game.camera.x) + (x * Game.map.spriteSize), Math.floor(this.y + Game.camera.y),
        Game.map.spriteSize, Game.map.spriteSize
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
        Game.camera.x = -(Game.player.x - (Game.resolution.x / 2));
        if (Game.input.up) {
          Game.player.force.y = -6;
          Game.player.doJump = true;
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
        this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
        this.move();
      }

      if (this.expectedX !== this.x) {
        this.force.x = 0;
        this.stop = true;
        this.direction = this.direction === this.DIR.RIGHT ? this.DIR.LEFT : this.DIR.RIGHT;

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
