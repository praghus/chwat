//--------------------------------------------------------------------------
// Crush
//--------------------------------------------------------------------------
Game.Entities['crush'] = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 10, fps: 5, loop: true};
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, {
          x: this.x + player.width,
          y: this.y - 1,
          width: this.width - (player.width * 2),
          height: this.height
        })) {
        if (this.animFrame == 9) {
          for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
            var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
              PY = Math.round(this.y / map.spriteSize);
            ShootExplosion(this.x + 16, this.y + 16, '#666666');
            map.data.ground[PX][PY] = 0;
          }
          this.dead = true;
        }
        this.animate();
      }
    }
  }
};
Class.extend(Game.Entities['crush'], Entity);

