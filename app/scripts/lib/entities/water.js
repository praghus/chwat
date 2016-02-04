//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
Game.addEntity('water', function () {
  Entity.apply(this, arguments);
  this.animation = {x: 0, y: 0, w: map.spriteSize, h: map.spriteSize, frames: 7, fps: 20, loop: true};
  this.fall = false;
  this.wave = 0;
  this.direction = DIR.DOWN;
  this.draw = function (ctx, image) {
    ctx.globalAlpha = 0.4;
    for (var y = 0; y < Math.round(this.height / map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
          PY = Math.round((this.y + (y * map.spriteSize)) / map.spriteSize);
        if (!map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * map.spriteSize, y === 0 ? y + this.wave : map.spriteSize,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
        }
        if (y + 1 === Math.round(this.height / map.spriteSize) && !map.isSolid(PX, PY + 1)) {
          this.fall = true;
        }
      }
    }
    if (this.fall) {
      this.fall = false;
      this.y += 32;
    }
    ctx.globalAlpha = 1;
  };
  this.update = function () {
    if (this.onScreen()) {
      this.animate();
      if (this.animFrame === 5) {
        this.wave += this.direction === DIR.DOWN ? 0.5 : -0.5;
      }
      if (this.wave > 2)
        this.direction = DIR.UP;
      }
      if(this.wave < -2) {
        this.direction = DIR.DOWN;
      }
      if (Game.Math.overlap(player, this)) {
        if (!Game.input.up) {
          player.force.y = +0.5;
        }
        else if (player.force.y > 0 && player.y >= this.y - 16) {
          player.force.y = -1.5;
        }
      }
    }
});
