//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
Game.addEntity('water', class extends Entity {
  constructor(obj) {
    super(obj);
    const { spriteSize } = Game.map;
    this.animation = {x: 0, y: 0, w: spriteSize, h: spriteSize, frames: 7, fps: 20, loop: true};
    this.fall = false;
    this.wave = 0;
    this.direction = this.DIR.DOWN;
  }
  draw(ctx, image) {
    const { spriteSize } = Game.map;
    ctx.globalAlpha = 0.4;
    for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
      for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
        let PX = Math.round((this.x + (x * spriteSize)) / spriteSize);
        let PY = Math.round((this.y + (y * spriteSize)) / spriteSize);
        if (!Game.map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * spriteSize, y === 0 ? y + this.wave : spriteSize,
            spriteSize, spriteSize,
            Math.floor(this.x + Game.camera.x) + (x * spriteSize), Math.floor(this.y + Game.camera.y) + (y * spriteSize),
            spriteSize, spriteSize
          );
        }
        if (y + 1 === Math.round(this.height / spriteSize) && !Game.map.isSolid(PX, PY + 1)) {
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
        this.wave += this.direction === this.DIR.DOWN ? 0.5 : -0.5;
      }
      if (this.wave > 2) {
        this.direction = this.DIR.UP;
      }
      if(this.wave < -2) {
        this.direction = this.DIR.DOWN;
      }
      if (Game.Math.overlap(Game.player, this)) {
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
