//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
Game.addEntity('ladder', function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.collide = function (element) {
    if (element.type === 'player') {
      if (Game.input.up) {
        Game.player.force.y = -Game.map.gravity - 0.5;
      }
      else {
        Game.player.force.y = 0.5;
      }
      if (!Game.input.left && !Game.input.right && Game.player.x !== this.x) {
        Game.player.x = this.x;
      }
    }
  };
});
