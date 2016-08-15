//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
game.addEntity('paddle', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    const { spriteSize } = this._game.world;
    this.solid = true;
    this.speed = 0.1;
    this.stop = false;
    this.maxSpeed = 1;
    this.destPosY = this.properties.destY * spriteSize;
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
    if (this.activated && !element.doJump && element.force.y > 0 && element.y + element.height > this.y + this.height -16) {
      element.y = this.y - element.height ;
      element.force.y = this.y - element.y - element.height;
      element.fall = false;
      element.onFloor = true;
      if (element.doJump) {
        element.doJump = false;
      }
    }
  }

  update() {
    /*if (this.onScreen()) {
      this.activated = true;
    }*/
    if (this.activated && !this.dead) {
      if(this.y > this.destPosY){
        this.force.y -= this.speed;
        this.move();
      }
   /*   if(!this.stop) {
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
      }*/
    }
  }
});
