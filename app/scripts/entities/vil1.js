//--------------------------------------------------------------------------
// Wiesniak
//--------------------------------------------------------------------------
game.addEntity('vil1', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'friends';
    this.solid = true;
  }

  update() {
    if (this.onScreen()) {
      this.force.y += this._game.world.gravity;
      this.move();
    }
  }
});
