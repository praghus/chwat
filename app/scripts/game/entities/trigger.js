//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
Game.addEntity('trigger', function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this) && !this.dead ) {
        if (this.properties.activator === 'player' || Game.player.canUse(this.properties.activator)) {
          // @todo trigger action here
        }
        else {
          Game.renderer.msg(this.properties.message, 50);
        }
      }
    }
  };
});
