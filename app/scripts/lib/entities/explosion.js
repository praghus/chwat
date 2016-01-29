//--------------------------------------------------------------------------
// Explosions
//--------------------------------------------------------------------------
Game.Entities['explosion'] = function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.type = 'explosion1';
  this.width = 32;
  this.height = 60;
  this.damage = 2;
  this.animation = {x: 0, y: 0, w: 32, h: 60, frames: 15, fps: 30, loop: true};
  this.vectorMask = [
    new V(0, 0),
    new V(this.width, 0),
    new V(this.width, this.height),
    new V(0, this.height)
  ];
  this.update = function () {
    if (this.onScreen()) this.awake = true;
    if (this.awake && !this.dead) this.animate();
    if (this.animFrame > 5) this.damage = 0;
    if (this.animFrame == this.animation.frames - 1) this.dead = true;
  }
};
Class.extend(Game.Entities['explosion'], Entity);
