//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
Game.Entities.trigger = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this) && !this.dead && Game.input.action) {
        if (this.properties.activator === 'player' || player.canUse(this.properties.activator))
          eval(this.properties.action);
        else
          renderer.msg(this.properties.message, 50);
      }
    }
  }
};
Class.extend(Game.Entities.trigger, Entity);
