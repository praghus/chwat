//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
Game.addEntity('water', class extends Entity {
  constructor(obj) {
    super(obj);
    Entity.apply(this, arguments);
    this.animation = {x: 0, y: 0, w: Game.map.spriteSize, h: Game.map.spriteSize, frames: 7, fps: 20, loop: true};
    this.fall = false;
    this.wave = 0;
    this.direction = DIR.DOWN;
  }
  draw(ctx, image) {
    ctx.globalAlpha = 0.4;
    for (var y = 0; y < Math.round(this.height / Game.map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / Game.map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * Game.map.spriteSize)) / Game.map.spriteSize),
          PY = Math.round((this.y + (y * Game.map.spriteSize)) / Game.map.spriteSize);
        if (!Game.map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * Game.map.spriteSize, y === 0 ? y + this.wave : Game.map.spriteSize,
            Game.map.spriteSize, Game.map.spriteSize,
            Math.floor(this.x + Game.camera.x) + (x * Game.map.spriteSize), Math.floor(this.y + Game.camera.y) + (y * Game.map.spriteSize),
            Game.map.spriteSize, Game.map.spriteSize
          );
        }
        if (y + 1 === Math.round(this.height / Game.map.spriteSize) && !Game.map.isSolid(PX, PY + 1)) {
          this.fall = true;
        }
      }
    }
    if (this.fall) {
      this.fall = false;
      this.y += 32;
    }
    ctx.globalAlpha = 1;
  }
  update() {
    if (this.onScreen()) {
      this.animate();
      if (this.animFrame === 5) {
        this.wave += this.direction === DIR.DOWN ? 0.5 : -0.5;
      }
      if (this.wave > 2) {
        this.direction = DIR.UP;
      }
      if(this.wave < -2) {
        this.direction = DIR.DOWN;
      }
      if (Game.Math.overlap(player, this)) {
        if (!Game.input.up) {
          Game.player.force.y = +0.5;
        }
        else if (Game.player.force.y > 0 && Game.player.y >= this.y - 16) {
          Game.player.force.y = -1.5;
        }
      }
    }
  }
});
