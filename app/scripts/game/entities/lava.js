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
  this.animation = {x: 0, y: 0, w: Game.map.spriteSize, h: Game.map.spriteSize, frames: 4, fps: 5, loop: true};
  this.draw = function (ctx, image) {
    for (var y = 0; y < Math.round(this.height / Game.map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / Game.map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * Game.map.spriteSize)) / Game.map.spriteSize),
            PY = Math.round((this.y + (y * Game.map.spriteSize)) / Game.map.spriteSize);
        if (!Game.map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * Game.map.spriteSize, y === 0 ? y : Game.map.spriteSize,
            Game.map.spriteSize, Game.map.spriteSize,
            Math.floor(this.x + Game.camera.x) + (x * Game.map.spriteSize), Math.floor(this.y + Game.camera.y) + (y * Game.map.spriteSize),
            Game.map.spriteSize, Game.map.spriteSize
          );
        }
      }
    }
  };
  this.shoot = function () {
    Game.elements.add('lava_stone', {x: this.x + Math.random() * this.width, y: this.y, direction: 0});
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
