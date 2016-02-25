//--------------------------------------------------------------------------
// Lava
//--------------------------------------------------------------------------
game.addEntity('lava', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    const { spriteSize } = this._game.map;
    this.family = 'traps';
    this.damage = 1000;
    this.canShoot = true;
    this.shootDelay = 1000;
    this.shootTimeout = null;
    this.animation = {x: 0, y: 0, w: spriteSize, h: spriteSize, frames: 4, fps: 5, loop: true};
  }

  draw($, image) {
    const { camera } = this._game;
    const { spriteSize } = this._game.map;
    for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
      for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
        const PX = Math.round((this.x + (x * spriteSize)) / spriteSize);
        const PY = Math.round((this.y + (y * spriteSize)) / spriteSize);
        if (!this._game.map.isSolid(PX, PY)) {
          $.drawImage(image,
            this.animFrame * spriteSize, y === 0 ? y : spriteSize,
            spriteSize, spriteSize,
            Math.floor(this.x + camera.x) + (x * spriteSize), Math.floor(this.y + camera.y) + (y * spriteSize),
            spriteSize, spriteSize
          );
        }
      }
    }
  }

  shoot() {
    this._game.elements.add('lava_stone', {x: this.x + Math.random() * this.width, y: this.y, direction: 0});
    this.shootTimeout = setTimeout(()=>{this.canShoot = true;}, this.shootDelay);
    this.canShoot = false;
  }
  
  update() {
    if (this.onScreen()) {
      if (this.canShoot) {
        this.shoot();
      }
      this.animate();
    }
  }
});
