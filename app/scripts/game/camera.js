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
    if ((Game.player.x + this.x > ResolutionX / 2 && Game.player.force.x > 0) || (Game.player.x + this.x < ResolutionX / 2 && Game.player.force.x < 0)) {
      this.x -= Math.floor(Game.player.force.x);
    }
    if (this.x > 0) {
      this.x = 0;
    }
    if (this.x - ResolutionX < -Game.map.width * Game.map.spriteSize) {
      this.x = (-Game.map.width * Game.map.spriteSize) + ResolutionX;
    }
    this.y = -((Game.player.y + Game.player.height) - (ResolutionY / 2));

    if (this.y > 0) {
      this.y = 0;
    }
    if (this.y < -Game.map.height * Game.map.spriteSize) {
      this.y = (-Game.map.height * Game.map.spriteSize) / 2;
    }
    // above the surface
    if (Math.round((Game.player.y + (Game.player.height / 2)) / Game.map.spriteSize) < Game.map.surface) {
      this.underground = false;
      if ((this.y - ResolutionY) < -Game.map.surface * Game.map.spriteSize) {
        this.y = (-Game.map.surface * Game.map.spriteSize) + ResolutionY;
      }
    } else {
      // under the surface
      this.underground = true;
      if ((this.y) >= -Game.map.surface * Game.map.spriteSize) {
        this.y = (-Game.map.surface * Game.map.spriteSize);
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
    this.x = -(Game.player.x - (ResolutionX / 2));
    this.y = -((Game.player.y + Game.player.height) - (ResolutionY / 2));
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
