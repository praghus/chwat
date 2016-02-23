//--------------------------------------------------------------------------
// Crush
//--------------------------------------------------------------------------
Game.addEntity('crush', function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 10, fps: 5, loop: true};
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, {
          x: this.x + Game.player.width,
          y: this.y - 1,
          width: this.width - (Game.player.width * 2),
          height: this.height
        })) {
        if (this.animFrame === 9) {
          for (var x = 0; x < Math.round(this.width / Game.map.spriteSize); x++) {
            var PX = Math.round((this.x + (x * Game.map.spriteSize)) / Game.map.spriteSize),
              PY = Math.round(this.y / Game.map.spriteSize);
            ShootExplosion(this.x + 16, this.y + 16, '#666666');
            Game.map.data.ground[PX][PY] = 0;
          }
          this.dead = true;
        }
        this.animate();
      }
    }
  };
});

