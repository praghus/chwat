//--------------------------------------------------------------------------
// Lava
//--------------------------------------------------------------------------
Game.addEntity('lava', function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.damage = 1000;
  this.canShoot = true;
  this.shootDelay = 1000;
  this.shootTimeout = null;
  this.animation = {x: 0, y: 0, w: map.spriteSize, h: map.spriteSize, frames: 4, fps: 5, loop: true};
  this.draw = function (ctx, image) {
    for (var y = 0; y < Math.round(this.height / map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
          PY = Math.round((this.y + (y * map.spriteSize)) / map.spriteSize);
        if (!map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * map.spriteSize, y === 0 ? y : map.spriteSize,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
        }
      }
    }
  };
  this.shoot = function () {
    elements.add('lava_stone', {x: this.x + Math.random() * this.width, y: this.y, direction: 0});
    this.shootTimeout = setTimeout(function () {this.canShoot = true;}.bind(this), this.shootDelay);
    this.canShoot = false;
  };
  this.update = function () {
    if (this.onScreen()) {
      if (this.canShoot) {
        this.shoot();
      }
      this.animate();
    }
  };
});
