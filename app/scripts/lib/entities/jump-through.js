//--------------------------------------------------------------------------
// Jump through
//--------------------------------------------------------------------------
var JumpThrough = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.collide = function (element) {
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!player.input.up && !player.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      if (element.doJump) element.doJump = false;
      if (element.type === 'player' && player.input.up) {
        player.force.y = -6;
        player.doJump = true;
      }
    }
  }
};
JumpThrough.prototype = Entity.prototype;
JumpThrough.prototype.constructor = JumpThrough;
