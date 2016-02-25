//--------------------------------------------------------------------------
// Dark Mask
//--------------------------------------------------------------------------
game.addEntity('dark_mask', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.active = false;
    this.activated = false;
    this._game.map.addMask(obj);
  }
  draw($, image) {
    for (let y = -1; y < Math.round(this.height / this._game.map.spriteSize) + 1; y++) {
      for (let x = -1; x < Math.round(this.width / this._game.map.spriteSize) + 1; x++) {
        let PX = Math.round(((this.x - this._game.map.spriteSize) + (x * this._game.map.spriteSize)) / this._game.map.spriteSize) + 1;
        let PY = Math.round(((this.y - this._game.map.spriteSize) + (y * this._game.map.spriteSize)) / this._game.map.spriteSize) + 1;
        if (!this._game.map.isSolid(PX, PY)) {
          let frame = 0;
          if (x === -1 && !this._game.map.isSolid(PX - 1, PY)) {
            frame = 1;
          }
          if (x + 1 === Math.round(this.width / this._game.map.spriteSize) + 1 && !this._game.map.isSolid(PX + 1, PY)) {
            frame = 2;
          }
          if (y === -1 && !this._game.map.isSolid(PX, PY - 1)) {
            frame = 3;
          }
          if (y + 1 === Math.round(this.height / this._game.map.spriteSize) + 1 && !this._game.map.isSolid(PX, PY + 1)) {
            frame = 4;
          }
          $.globalAlpha = this._game.renderer.DarkAlpha;
          $.drawImage(image,
            frame * this._game.map.spriteSize, 0,
            this._game.map.spriteSize, this._game.map.spriteSize,
            Math.floor(this.x + this._game.camera.x) + (x * this._game.map.spriteSize), Math.floor(this.y + this._game.camera.y) + (y * this._game.map.spriteSize),
            this._game.map.spriteSize, this._game.map.spriteSize
          );
          $.globalAlpha = 1;
        }
      }
    }
  }
  render($, image) {
    if (this.onScreen() && !this._game.player.inDark && !this._game.camera.underground) {
      this.draw($, image);
    }
  }
  update() {
    if (this.onScreen()) {
      if (this._game.m.overlap(this._game.player, this)) {
        this.active = true;
        if (!this.activated) {
          this._game.player.inDark += 1;
          this.activated = true;
        }
        if (this._game.renderer.DarkAlpha > 0) {
          this._game.renderer.DarkAlpha = 0;
        }
      }
      else {
        if (this.active) {
          this._game.player.inDark -= 1;
          this.activated = false;
          this.active = false;
        }
        if (this._game.renderer.DarkAlpha < 1) {
          this._game.renderer.DarkAlpha += 0.05;
        }
      }
    } else if (this.active) {
      this._game.player.inDark -= 1;
      this.activated = false;
      this.active = false;
    }
  }
});
