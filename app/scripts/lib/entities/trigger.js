//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
var Trigger = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this) && !this.dead && player.input.action) {
        if (this.properties.activator === 'player' || player.canUse(this.properties.activator))
          eval(this.properties.action);
        else
          renderer.msg(this.properties.message, 50);
      }
    }
  }
};
Trigger.prototype = Entity.prototype;
Trigger.prototype.constructor = Trigger;
