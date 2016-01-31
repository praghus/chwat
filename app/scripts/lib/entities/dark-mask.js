//--------------------------------------------------------------------------
// Dark Mask
//--------------------------------------------------------------------------
Game.addEntity('dark_mask', function (obj) {
  map.addMask(obj);
  Entity.apply(this, arguments);
  this.active = false;
  this.activated = false;
  this.draw = function (ctx, image) {
    for (var y = -1; y < Math.round(this.height / map.spriteSize) + 1; y++) {
      for (var x = -1; x < Math.round(this.width / map.spriteSize) + 1; x++) {
        var PX = Math.round(((this.x - map.spriteSize) + (x * map.spriteSize)) / map.spriteSize) + 1,
          PY = Math.round(((this.y - map.spriteSize) + (y * map.spriteSize)) / map.spriteSize) + 1;
        if (!map.isSolid(PX, PY)) {
          var frame = 0;
          if (x === -1 && !map.isSolid(PX - 1, PY)) {
            frame = 1;
          }
          if (x + 1 === Math.round(this.width / map.spriteSize) + 1 && !map.isSolid(PX + 1, PY)) {
            frame = 2;
          }
          if (y === -1 && !map.isSolid(PX, PY - 1)) {
            frame = 3;
          }
          if (y + 1 === Math.round(this.height / map.spriteSize) + 1 && !map.isSolid(PX, PY + 1)) {
            frame = 4;
          }
          ctx.globalAlpha = DarkAlpha;
          ctx.drawImage(image,
            frame * map.spriteSize, 0,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
          ctx.globalAlpha = 1;
        }
      }
    }
  };
  this.render = function (ctx, image) {
    if (this.onScreen() && !player.inDark && !camera.underground) {
      this.draw(ctx, image);
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this)) {
        this.active = true;
        if (!this.activated) {
          player.inDark += 1;
          this.activated = true;
        }
        if (DarkAlpha > 0) {
          DarkAlpha = 0;
        }
      }
      else {
        if (this.active) {
          player.inDark -= 1;
          this.activated = false;
          this.active = false;
        }
        if (DarkAlpha < 1) {
          DarkAlpha += 0.05;
        }
      }
    } else if (this.active) {
      player.inDark -= 1;
      this.activated = false;
      this.active = false;
    }
  };
});
