//--------------------------------------------------------------------------
// Spear
//--------------------------------------------------------------------------
game.addEntity('spear', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    const { spriteSize } = this._game.world;
    this.family = 'traps';
    this.damage = 20;
    this.maxHeight = spriteSize * 2;
    this.animation = {x: 0, y: 0, w: this.width, h: this.height, frames: 4, fps: 20, loop: true};
  }

  draw($, image) {
    const { camera } = this._game;
    $.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), this.animation.y + this.animOffset,
      this.width, this.height,
      Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.width, this.height);
  }

  update() {
    if (this.onScreen()) {
      const { player } = this._game;
      const { spriteSize } = this._game.world;
      this.seesPlayer();
      if ((this.animFrame === 0 && Math.round(Math.random() * 20) === 0) || this.animFrame > 0) {
        this.animate();
      }
      if (this.PlayerM >= 0 && this.PlayerM < 4 && player.x >= this.x - player.width - spriteSize && player.x <= this.x + this.width + spriteSize) {
        if (this.height < this.maxHeight) {
          this.y -= 2;
          this.height += 2;
        }
      } else if (this.height > 8) {
        this.y += 1;
        this.height -= 1;
      }
    }
  }
});
