//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
game.addEntity('trigger', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.visible = false;
  }
  collide(element) {
    if (this._game.input.action && element.type === 'player') {
      const { player } = this._game;
      if (this.properties.activator === 'player' || player.canUse(this.properties.activator)) {
        // @todo clear elements
        this._game.elements.clearInRange(this);
        this.clearTiles();
        this.kill();
      }
      else {
        this._game.renderer.msg(this.properties.message, 50);
      }
    }
  }
  update() {
    /*if (this.onScreen()) {

    }*/
  }
  clearTiles(){
    const { spriteSize } = this._game.world;
      for (let x=0; x < Math.round(this.width / spriteSize); x++) {
        this._game.shootExplosion(this.x + (x*spriteSize), this.y, '#6C5040');
        for (let y = 0; y < Math.round(this.height / spriteSize); y++) {
          const PX=Math.round((this.x + (x * spriteSize)) / spriteSize);
          const PY=Math.round((this.y + (y * spriteSize)) / spriteSize);
          this._game.world.clearTile(PX, PY, 'ground');
      }
    }
    this._game.camera.shake();
  }
});
