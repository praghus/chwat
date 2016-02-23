//--------------------------------------------------------------------------
// Jump through
//--------------------------------------------------------------------------
Game.addEntity('jump_through', function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.collide = function (element) {
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!Game.input.up && !Game.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      if (element.doJump) {
        element.doJump = false;
      }
      if (element.type === 'player' && Game.input.up) {
        Game.player.force.y = -6;
        Game.player.doJump = true;
      }
    }
  };
});
