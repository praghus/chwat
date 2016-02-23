//--------------------------------------------------------------------------
// Crusher
//--------------------------------------------------------------------------
Game.addEntity('crusher', function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.damage = 1000;
  this.fall = false;
  this.rise = false;
  this.solid = true;
  this.shadowCaster = true;
  this.fallDelay = parseInt(this.properties.delay);
  this.fallTimeout = setTimeout(function() {this.fall = true;}.bind(this), this.fallDelay);
  this.update = function () {
    if (this.onScreen()) {
      if (this.rise) {
        this.y -= 1;
      }
      if (this.fall) {
        this.force.y += Game.map.gravity;
      }
      this.y += this.force.y;

      var ELeft = Math.floor(this.x / Game.map.spriteSize),
        ETop = Math.floor(this.y / Game.map.spriteSize),
        EBottom = Math.floor((this.y + this.height) / Game.map.spriteSize);
      if (Game.map.data.ground[ELeft][ETop] > 0) {
        this.rise = false;
        this.fallTimeout = setTimeout(function () {this.fall = true;}.bind(this), this.fallDelay);
      }
      if (Game.map.data.ground[ELeft][EBottom] > 0) {
        this.y = ETop * Game.map.spriteSize;
        this.force.y = 0;
        this.fall = false;
        this.rise = true;
        Game.camera.shake();
      }
    } else {
      this.fallTimeout = null;
    }
  };
});
