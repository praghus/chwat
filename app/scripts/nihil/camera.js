//==========================================================================
// Camera
//--------------------------------------------------------------------------
class Camera
{
  constructor(game) {
    this._game = game;
    this.x = 0;
    this.y = 0;
    this.underground = false;
    this.rector = 2;
    this.a = 1;
  }
  //------------------------------------------------------------------------
  update() {
    const { player, resolution, world } = this._game;
    if ((player.x + (player.width/2)) + this.x > resolution.x / 2) {
      this.x -= player.force.x > 0 ? Math.floor(player.force.x) : .5;
    }
    if ((player.x + (player.width/2)) + this.x < resolution.x / 2) {
      this.x -= player.force.x < 0 ? Math.floor(player.force.x) : -.5;
    }
    if (this.x > 0) {
      this.x = 0;
    }
    if (this.x - resolution.x < -world.width * world.spriteSize) {
      this.x = (-world.width * world.spriteSize) + resolution.x;
    }
    this.y = -((player.y + player.height) - (resolution.y / 1.5));
    if (this.y > 0) {
      this.y = 0;
    }
    // above the surface
    if (Math.round((player.y + (player.height / 2)) / world.spriteSize) < world.surface) {
      this.underground = false;
      if ((this.y - resolution.y) < -world.surface * world.spriteSize) {
        this.y = (-world.surface * world.spriteSize) + resolution.y;
      }
    } else {
      // under the surface
      this.underground = true;
      if ((this.y) >= -world.surface * world.spriteSize) {
        this.y = (-world.surface * world.spriteSize);
      }
    }
    if (this.y  - resolution.y  < -world.height * world.spriteSize) {
      this.y = (-world.height * world.spriteSize) + resolution.y;
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
    const { player, resolution } = this._game;
    this.x = -((player.x + (player.width/2))- (resolution.x / 2));
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
