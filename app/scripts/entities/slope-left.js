//--------------------------------------------------------------------------
// Slope left
//--------------------------------------------------------------------------
game.addEntity('slope_left', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.visible = false;
    this.vectorMask = [
      new SAT.Vector(0, 0),
      new SAT.Vector(0, this.height),
      new SAT.Vector(this.width, this.height)
    ];
  }

  collide(element) {
    if(!this.dead && element.solid) {
      const expectedY=(this.y - element.height) + (element.x - this.x) * (this.height / this.width);
      if (element.y >= expectedY) {
        element.force.y = 0;
        element.y = expectedY;
        element.doJump = false;
        if (element.type === 'player' && this._game.input.up) {
          element.force.y = -6;
        }
      } else if (element.force.y === 0) {
        element.force.y += 1;
      }
    }
  }
});
