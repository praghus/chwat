//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
game.addEntity('water', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    const { spriteSize } = this._game.world;
    this.wave = 0;
    this.direction = this.DIR.DOWN;
    this.animation = {x: 0, y: 0, w: spriteSize, h: spriteSize, frames: 7, fps: 20, loop: true};
  }
  draw($, image) {
    const { camera } = this._game;
    const { spriteSize } = this._game.world;
    $.globalAlpha = 0.4;
    for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
      for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
        const PX = Math.round((this.x + (x * spriteSize)) / spriteSize);
        const PY = Math.round((this.y + (y * spriteSize)) / spriteSize);
        if (!this._game.world.isSolid(PX, PY)) {
          $.drawImage(image,
            this.animFrame * spriteSize, y === 0 ? y + this.wave : spriteSize,
            spriteSize, spriteSize,
            Math.floor(this.x + camera.x) + (x * spriteSize), Math.floor(this.y + camera.y) + (y * spriteSize),
            spriteSize, spriteSize
          );
        }
      }
    }
    $.globalAlpha = 1;
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
      if (this._game.m.overlap(this._game.player, this)) {
        if (!this._game.player.input.up) {
          this._game.player.force.y = +0.5;
        }
        else if (this._game.player.force.y > 0 && this._game.player.y >= this.y - 16) {
          this._game.player.force.y = -1.5;
        }
      }
    }
  }
});
