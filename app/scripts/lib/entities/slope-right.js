//--------------------------------------------------------------------------
// Slope right
//--------------------------------------------------------------------------
Game.Entities['slope_right'] = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.vectorMask = [
    new V(0, this.height),
    new V(this.width, 0),
    new V(this.width, this.height)
  ];
  this.collide = function (element) {
    var expectedY = (this.y - element.height) + this.height - (((element.x + element.width) - this.x) * (this.height / this.width));
    if (element.y >= expectedY) {
      element.force.y = 0;
      element.y = expectedY;
      element.doJump = false;
      if (element.type === 'player' && player.input.up) element.force.y = -6;
    } else if (element.force.y == 0) {
      element.force.y += 1;
    }
  }
};
Class.extend(Game.Entities['slope_right'], Entity);
