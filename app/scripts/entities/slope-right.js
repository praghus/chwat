//--------------------------------------------------------------------------
// Slope right
//--------------------------------------------------------------------------
game.addEntity('slope_right', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.visible = false;
    this.vectorMask = [
      new SAT.Vector(0, this.height),
      new SAT.Vector(this.width, 0),
      new SAT.Vector(this.width, this.height)
    ];
  }

  collide(element) {
    if(!this.dead && element.solid) {
      const expectedY = (this.y - element.height) + this.height - (((element.x + element.width) - this.x) * (this.height / this.width));
      if (element.y >= expectedY) {
        element.force.y = 0;
        element.y = expectedY;
        element.doJump = false;
        element.fall = false;
        element.onFloor = true;
        if (element.type === 'player' && this._game.input.up) {
          element.doJump = true;
        }
      } else if (element.force.y === 0) {
        element.force.y+=1;
      }
    }
  }
});