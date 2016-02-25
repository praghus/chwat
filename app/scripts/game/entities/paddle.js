//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
game.addEntity('paddle', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.speed = 1;
    this.stop = false;
    this.maxSpeed = 1;
    this.turnTimeout = null;
  }

  draw($, image) {
    const { camera } = this._game;
    const { spriteSize } = this._game.world;
    for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
      $.drawImage(image,
        0, 0, spriteSize, spriteSize,
        Math.floor(this.x + camera.x) + (x * spriteSize), Math.floor(this.y + camera.y),
        spriteSize, spriteSize
      );
    }
  }

  collide (element) {
    const { input } = this._game.player;
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!input.up && !input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      element.doJump = false;
      element.x += this.force.x;
      if (element.doJump) {
        element.doJump = false;
      }
      if (element.type === 'player') {
        this._game.camera.x = -(this._game.player.x - (this._game.resolution.x / 2));
        if (input.up) {
          this._game.player.force.y = -6;
          this._game.player.doJump = true;
        }
      }
    }
  }

  update() {
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

        this.turnTimeout = setTimeout(()=> {
          if(this.stop){
            this.stop = false;
          }
          this.turnTimeout = null;
        }, 1000);
      }
    }
  }
});
