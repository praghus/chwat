//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
Game.Entities.ladder = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.collide = function (element) {
    if (element.type === 'player') {
      if (Game.input.up) player.force.y = -map.gravity - 0.5;
      else player.force.y = 0.5;
      //else player.force.y = -map.gravity;
      if (!Game.input.left && !Game.input.right && player.x !== this.x) {
        player.x = this.x;
      }
      ;
    }
  };
};
Class.extend(Game.Entities.ladder, Entity);
