//--------------------------------------------------------------------------
// Slope right
//--------------------------------------------------------------------------
game.addEntity('slope', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.visible = false;
    if (this.properties.direction === 'right') {
      this.vectorMask = [
        new SAT.Vector(0, this.height),
        new SAT.Vector(this.width, 0),
        new SAT.Vector(this.width, this.height)
      ];
    } else {
      this.vectorMask = [
        new SAT.Vector(0, 0),
        new SAT.Vector(0, this.height),
        new SAT.Vector(this.width, this.height)
      ];
    }
  }
  collide(element) {
    if(!this.dead && element.solid)
    {
      const expectedY = this.properties.direction === 'right'
        ? (this.y - element.height) + this.height - (((element.x + element.width) - this.x) * (this.height / this.width))
        : (this.y - element.height) + (element.x - this.x) * (this.height / this.width);

      if (element.y >= expectedY) {
        element.y = expectedY;
        element.force.y = 0;
        element.fall = false;
        element.doJump = false;
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
