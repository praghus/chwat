//--------------------------------------------------------------------------
// Item
//--------------------------------------------------------------------------
game.addEntity('item', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.animFrame = parseInt(this.properties.frame);
  }

  collide(element) {
    if (element.type === 'player' && !this.dead) {
      this._game.player.get(this);
      this.dead = true;
    }
  }

  update() {
    if (this.onScreen()) {
      this.force.y += this._game.world.gravity;
      this.move();
    }
  }
});
