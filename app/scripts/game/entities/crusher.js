//--------------------------------------------------------------------------
// Crusher
//--------------------------------------------------------------------------
game.addEntity('crusher', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'traps';
    this.damage = 1000;
    this.fall = false;
    this.rise = false;
    this.solid = true;
    this.shadowCaster = true;
    this.fallDelay = parseInt(this.properties.delay);
    this.fallTimeout = setTimeout(()=>{this.fall = true}, this.fallDelay);
  }

  update() {
    if (this.onScreen()) {
      const { spriteSize } = this._game.world;
      if (this.rise) {
        this.force.y -= 0.005;
      }
      if (this.fall) {
        this.force.y += this._game.world.gravity;
      }
      this.move();

      if (this.onFloor){
        this.force.y = 0;
        this.fall = false;
        this.rise = true;
        this._game.camera.shake();
      }
      if (this.onCeiling) {
        this.rise = false;
        this.fallTimeout = setTimeout(()=> {this.fall = true}, this.fallDelay);
      }

    } else {
      this.fallTimeout = null;
    }
  };
});
