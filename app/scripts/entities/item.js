//--------------------------------------------------------------------------
// Item
//--------------------------------------------------------------------------

game.addEntity('item', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.types = {
      key:      {x:0,   y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      key_1:    {x:0,   y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      tnt:      {x:16,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      crowbar:  {x:32,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      spade:    {x:48,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      axe:      {x:64,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      line:     {x:80,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      cake:     {x:96,  y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      weight:   {x:112, y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      cure:     {x:128, y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      handle:   {x:144, y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false},
      stick:    {x:160, y:0,  w: 16, h: 16, frames: 1, fps: 0, loop: false}
    };
    this.animation = this.types[this.properties.id];
  }

  collide(element) {
    if (element.type === 'player' && !this.dead && this._game.input.action) {
      this._game.player.get(this);
      this.dead = true;
    }
  }

  update() {
    if (this.onScreen()) {
      this.force.y += this._game.world.gravity;
      this.move();
    }
  }
});
