//--------------------------------------------------------------------------
// Coin
//--------------------------------------------------------------------------
Game.addEntity('coin', function () {
  Entity.apply(this, arguments);
  this.family = 'items';
  this.type = 'coin';
  this.width = 8;
  this.height = 8;
  this.animation = {x: 0, y: 0, w: 8, h: 8, frames: 10, fps: 30, loop: true};
  this.force = {x: 0, y: -5};
  this.collide = function (element) {
    if (element.type === 'player') {
      this.dead = true;
      Game.player.coinCollect += 1;
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      this.animate();
      this.force.y += Game.map.gravity;
      this.move();
    }
  };
});

