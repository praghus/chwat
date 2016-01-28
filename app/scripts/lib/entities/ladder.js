//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
var Ladder = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.collide = function (element) {
    if (element.type === 'player') {
      if (player.input.up) player.force.y = -map.gravity - 0.5;
      else player.force.y = 0.5;
      //else player.force.y = -map.gravity;
      if (!player.input.left && !player.input.right && player.x !== this.x) {
        player.x = this.x;
      }
      ;
    }
  };
};
Ladder.prototype = Entity.prototype;
Ladder.prototype.constructor = Ladder;
