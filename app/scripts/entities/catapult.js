//--------------------------------------------------------------------------
// Catapult
//--------------------------------------------------------------------------
game.addEntity('catapult', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.solid = true;
    this.animations = {
      UP    : {x: 0, y: 0,  w: 64, h: 16, frames: 1, fps: 0, loop: false},
      DOWN  : {x: 0, y: 16, w: 64, h: 16, frames: 1, fps: 0, loop: false},
    };
    this.animation = this.animations.UP;
  }


  collide (element) {
    if (this.activated && element.type === 'player') {
      console.log(this.trigger);
      this.trigger.activated = false;
      this.trigger.dead = false;
      element.force.y = -25;
      let item = this.activator;

        item.x = this.x;
        item.y =this.y;
      element.fall = false;
      this.activated = false;
      this._game.elements.add('item', item);
    }
  }

  update() {
    if (this.activated && !this.dead) {
      this.animation = this.animations.DOWN;
    }
  }
});
