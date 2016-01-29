//==========================================================================
// Camera
//--------------------------------------------------------------------------
var Camera = Class.create({
  initialize: function () {
    this.x = 0;
    this.y = 0;
    this.underground = false;
    this.rector = 2;
    this.a = 1;
  },
  //------------------------------------------------------------------------
  update: function (dt) {
    if ((player.x + this.x > ResolutionX / 2 && player.force.x > 0) || (player.x + this.x < ResolutionX / 2 && player.force.x < 0)) {
      this.x -= Math.floor(player.force.x);
    }
    if (this.x > 0) {
      this.x = 0;
    }
    if (this.x - ResolutionX < -map.width * map.spriteSize) {
      this.x = (-map.width * map.spriteSize) + ResolutionX;
    }
    this.y = -((player.y + player.height) - (ResolutionY / 2));

    if (this.y > 0) {
      this.y = 0;
    }
    if (this.y < -map.height * map.spriteSize) {
      this.y = (-map.height * map.spriteSize) / 2;
    }
    // above the surface
    if (Math.round((player.y + (player.height / 2)) / map.spriteSize) < map.surface) {
      this.underground = false;
      if ((this.y - ResolutionY) < -map.surface * map.spriteSize) {
        this.y = (-map.surface * map.spriteSize) + ResolutionY;
      }
    } else {
      // under the surface
      this.underground = true;
      if ((this.y) >= -map.surface * map.spriteSize) {
        this.y = (-map.surface * map.spriteSize);
      }
    }
    // shake
    if (this.rector !== 2) {
      if (this.a === 1) {
        camera.y = camera.y + this.rector;
      }
      else if (this.a === 2) {
        camera.x = camera.x + this.rector;
      }
      else if (this.a === 3) {
        camera.y = camera.y - this.rector;
      }
      else {
        camera.x = camera.x - this.rector;
      }
      if(this.a < 4) { this.a++; } else { this.a = 1; }
    }
  },
  //------------------------------------------------------------------------
  center: function () {
    this.x = -(player.x - (ResolutionX / 2));
    this.y = -((player.y + player.height) - (ResolutionY / 2));
  },
  //------------------------------------------------------------------------
  shake: function () {
    if (this.rector < 0) {
      this.rector = 2;
      return;
    }
    this.rector -= 0.2;
    setTimeout(function() { this.shake(); }.bind(this), 50);
  }
});
