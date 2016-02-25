//--------------------------------------------------------------------------
// Jump through
//--------------------------------------------------------------------------
game.addEntity('jump_through', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.visible = false;
  }

  collide(element) {
    const { input } = this._game.player;
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!input.up && !input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      if (element.doJump) {
        element.doJump = false;
      }
      if (element.type === 'player' && input.up) {
        this._game.player.force.y = -6;
        this._game.player.doJump = true;
      }
    }
  }
});
