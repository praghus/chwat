//--------------------------------------------------------------------------
// Bridge
//--------------------------------------------------------------------------
game.addEntity('bridge', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.animations = {
      UP    : {x: 0, y: 0,  w: 160, h: 80, frames: 1, fps: 0, loop: false},
      DOWN  : {x: 0, y: 80, w: 160, h: 80, frames: 1, fps: 0, loop: false},
    };
    this.animation = this.animations.UP;
  }


  collide (element) {
    if (this.activated && !element.doJump && element.force.y > 0 && element.y + element.height > this.y + this.height -16) {
      element.y = (this.y + this.height - 16) - element.height ;
      element.force.y = (this.y + this.height - 16) - element.y - element.height;
      element.fall = false;
      element.onFloor = true;
      if (element.doJump) {
        element.doJump = false;
      }
    }
  }

  update() {
    if (this.activated && !this.dead) {
      this.animation = this.animations.DOWN;
    }
  }
});
