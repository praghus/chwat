//--------------------------------------------------------------------------
// Switch
//--------------------------------------------------------------------------
game.addEntity('switch', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.animations = {
      OFF : {x: 0,  y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
      ON  : {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
    };
    this.animation = this.animations.OFF;
  }


  collide (element) {
  }

  update() {
  }

});
