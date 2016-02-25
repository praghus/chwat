//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
game.addEntity('trigger', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.visible = false;
  }

  update() {
    if (this.onScreen()) {
      const { player } = this._game;
      if (this._game.m.overlap(player, this) && !this.dead ) {
        if (this.properties.activator === 'player' || player.canUse(this.properties.activator)) {
          // @todo trigger action here
        }
        else {
          this._game.renderer.msg(this.properties.message, 50);
        }
      }
    }
  }
});
