//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
game.addEntity('trigger', class extends Entity {

  constructor(obj, game) {
    super(obj, game);
    this.visible = false;
    this.activated = false;
  }

  collide(element) {
    if (!this.activated && !this.dead && (this._game.input.action || this.properties.activator === 'player') && element.type === 'player') {
      const { player } = this._game;
      if (player.canUse(this.properties.activator)) {
        const a = player.use(this.properties.activator);
        this.activated = true;
        if (this.properties.related){
          let rel = this._game.elements.getById(this.properties.related);
          rel.activated = true;
          rel.trigger = this;
          rel.activator = a;
        }
      }
      else if(this.properties.message){
        this._game.renderer.msg(this.properties.message, 1000);
      }
    }
  }

  update() {
    if (this.activated){
      if(this.properties.clear) {
        this._game.elements.clearInRange(this);
        this.clearTiles();
      }
      //this._game.elements.clearInRange(this);
      this.dead = true;
    }
  }

  clearTiles(){
    const { spriteSize } = this._game.world;
      for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
        this._game.shootExplosion(this.x + (x*spriteSize), this.y, '#6C5040');
        for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
          const PX = Math.round((this.x + (x * spriteSize)) / spriteSize);
          const PY = Math.round((this.y + (y * spriteSize)) / spriteSize);
          this._game.world.clearTile(PX, PY, 'ground');
      }
    }
    this._game.camera.shake();
  }
});
