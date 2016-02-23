//--------------------------------------------------------------------------
// Dark Mask
//--------------------------------------------------------------------------
Game.addEntity('dark_mask', function (obj) {
  Game.map.addMask(obj);
  Entity.apply(this, arguments);
  this.active = false;
  this.activated = false;
  this.draw = function (ctx, image) {
    for (var y = -1; y < Math.round(this.height / Game.map.spriteSize) + 1; y++) {
      for (var x = -1; x < Math.round(this.width / Game.map.spriteSize) + 1; x++) {
        var PX = Math.round(((this.x - Game.map.spriteSize) + (x * Game.map.spriteSize)) / Game.map.spriteSize) + 1,
          PY = Math.round(((this.y - Game.map.spriteSize) + (y * Game.map.spriteSize)) / Game.map.spriteSize) + 1;
        if (!Game.map.isSolid(PX, PY)) {
          var frame = 0;
          if (x === -1 && !Game.map.isSolid(PX - 1, PY)) {
            frame = 1;
          }
          if (x + 1 === Math.round(this.width / Game.map.spriteSize) + 1 && !Game.map.isSolid(PX + 1, PY)) {
            frame = 2;
          }
          if (y === -1 && !Game.map.isSolid(PX, PY - 1)) {
            frame = 3;
          }
          if (y + 1 === Math.round(this.height / Game.map.spriteSize) + 1 && !Game.map.isSolid(PX, PY + 1)) {
            frame = 4;
          }
          ctx.globalAlpha = DarkAlpha;
          ctx.drawImage(image,
            frame * Game.map.spriteSize, 0,
            Game.map.spriteSize, Game.map.spriteSize,
            Math.floor(this.x + Game.camera.x) + (x * Game.map.spriteSize), Math.floor(this.y + Game.camera.y) + (y * Game.map.spriteSize),
            Game.map.spriteSize, Game.map.spriteSize
          );
          ctx.globalAlpha = 1;
        }
      }
    }
  };
  this.render = function (ctx, image) {
    if (this.onScreen() && !Game.player.inDark && !Game.camera.underground) {
      this.draw(ctx, image);
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this)) {
        this.active = true;
        if (!this.activated) {
          Game.player.inDark += 1;
          this.activated = true;
        }
        if (DarkAlpha > 0) {
          DarkAlpha = 0;
        }
      }
      else {
        if (this.active) {
          Game.player.inDark -= 1;
          this.activated = false;
          this.active = false;
        }
        if (DarkAlpha < 1) {
          DarkAlpha += 0.05;
        }
      }
    } else if (this.active) {
      Game.player.inDark -= 1;
      this.activated = false;
      this.active = false;
    }
  };
});
