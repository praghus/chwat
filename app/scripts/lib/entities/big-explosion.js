Game.Entities['explosion2'] = function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.type = 'explosion2';
  this.width = 48;
  this.height = 112;
  this.damage = 5;
  this.animation = {x: 0, y: 0, w: 48, h: 112, frames: 21, fps: 30, loop: true};
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
    if (this.animFrame === this.animation.frames - 1) this.dead = true;
  }
};
Class.extend(Game.Entities['explosion2'], Entity);
