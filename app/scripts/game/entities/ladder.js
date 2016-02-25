//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
game.addEntity('ladder', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.visible = false;
  }
  collide(element) {
    const { input } = this._game.player;
    if (element.type === 'player') {
      if (input.up) {
        this._game.player.force.y = -this._game.world.gravity - 0.5;
      }
      else {
        this._game.player.force.y = 0.5;
      }
      if (!input.left && !input.right && this._game.player.x !== this.x) {
        this._game.player.x = this.x;
      }
    }
  };
});
