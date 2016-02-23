//==========================================================================
// Camera
//--------------------------------------------------------------------------
class Camera
{
  constructor() {
    this.x = 0;
    this.y = 0;
    this.underground = false;
    this.rector = 2;
    this.a = 1;
  }
  //------------------------------------------------------------------------
  update() {
    const { player, resolution, map } = Game;
    if ((player.x + this.x > resolution.x / 2 && player.force.x > 0) || (player.x + this.x < resolution.x / 2 && player.force.x < 0)) {
      this.x -= Math.floor(player.force.x);
    }
    if (this.x > 0) {
      this.x = 0;
    }
    if (this.x - resolution.x < -map.width * map.spriteSize) {
      this.x = (-map.width * map.spriteSize) + resolution.x;
    }
    this.y = -((player.y + player.height) - (resolution.y / 2));

    if (this.y > 0) {
      this.y = 0;
    }
    if (this.y < -map.height * map.spriteSize) {
      this.y = (-map.height * map.spriteSize) / 2;
    }
    // above the surface
    if (Math.round((player.y + (player.height / 2)) / map.spriteSize) < map.surface) {
      this.underground = false;
      if ((this.y - resolution.y) < -map.surface * map.spriteSize) {
        this.y = (-map.surface * map.spriteSize) + resolution.y;
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
        this.y = this.y + this.rector;
      }
      else if (this.a === 2) {
        this.x = this.x + this.rector;
      }
      else if (this.a === 3) {
        this.y = this.y - this.rector;
      }
      else {
        this.x = this.x - this.rector;
      }
      if(this.a < 4) { this.a++; } else { this.a = 1; }
    }
  }
  //------------------------------------------------------------------------
  center() {
    const { player, resolution } = Game;
    this.x = -(player.x - (resolution.x / 2));
    this.y = -((player.y + player.height) - (resolution.y / 2));
  }
  //------------------------------------------------------------------------
  shake() {
    if (this.rector < 0) {
      this.rector = 2;
      return;
    }
    this.rector -= 0.2;
    setTimeout(() => this.shake(), 50);
  }
}
