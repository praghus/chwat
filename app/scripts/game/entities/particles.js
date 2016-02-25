//==========================================================================
// Particles
//--------------------------------------------------------------------------
game.addEntity('particles', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'particles';
    this.life = Math.random() * 30 + 30;
    //this.speed = Math.random() * 2;
    this.maxSpeed = 0.5 + Math.random();
    this.dead = false;
    switch (this.type) {
      case 'shoot_particles':
        this.force = {
          x: Math.random() * 2 - 1,
          y: Math.random() * -4 - 2
        };
        break;
      default:
        var dir = Math.random() * 2 * Math.PI;
        this.force = {
          x: Math.cos(dir) * this.maxSpeed,
          y: Math.sin(dir) * this.maxSpeed
        };
        break;
    }
  }

  overlapTest(obj) {
    if (!this.dead && this._game.m.overlap(this, obj)) {
      this.collide(obj);
      obj.collide(this);
    }
  }

  update() {
    if (!this.dead) {
      this.force.y += this._game.map.gravity;
      this.move();
      if (this.y !== this.expectedY || this.x !== this.expectedX) {
        this.force.y *= -0.8;
        this.force.x *= 0.9;
      }
      this.life--;
    }
    if (this.life < 0) {
      this.dead = true;
    }
  }

  draw($) {
    $.fillStyle = this.properties.color;
    $.beginPath();
    $.rect(this.x + this._game.camera.x, this.y + this._game.camera.y, this.width, this.height);
    $.fill();
    $.closePath();
  };
});
