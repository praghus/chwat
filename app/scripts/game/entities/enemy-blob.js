//--------------------------------------------------------------------------
// Blob
//--------------------------------------------------------------------------
game.addEntity('enemy_blob', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'enemies';
    this.maxSpeed = 1;
    this.speed = 0.1;
    this.energy = 30;
    this.maxEnergy = 30;
    this.damage = 10;
    this.solid = true;
    this.animations = {
      RIGHT: {x: 0, y: 0, w: 20, h: 20, frames: 6, fps: 10, loop: true},
      LEFT: {x: 0, y: 20, w: 20, h: 20, frames: 6, fps: 10, loop: true}
    };
  }

  hit(s){
    this.force.x += -(this.force.x * 4);
    this.force.y = -2;
    this.energy -= s;
    if (this.energy <= 0) {
      this.dead = true;
      this._game.explosion(this.x, this.y);
      this._game.elements.add('coin', {x: this.x + 8, y: this.y});
    }
  }

  collide(element) {
    if (element.damage > 0 && element.family !== 'enemies') {
      this.hit(element.damage);
    }
  }

  update() {
    if (this.onScreen()) {
      this.awake = true;
    }
    if (this.awake && !this.dead) {
      this.force.y += this._game.world.gravity;
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      if (this.seesPlayer()) {
        this.direction = this._game.player.x > this.x ? this.DIR.RIGHT : this.DIR.LEFT;
      }

      this.move();

      if ((this.PlayerM > 1.4 && this.PlayerM < 1.5) || (this.PlayerM < -1.4 && this.PlayerM > -1.5)) {
        this.force.y -= 2;
      }
      if (this.expectedX !== this.x && this.onFloor) {
        if (this.PlayerM > 0.2 || this.PlayerM < -0.2) {
          this.force.y -= 5;
        }
        else {
          if (this.expectedX < this.x) {
            this.direction = this.DIR.RIGHT;
            this.force.x *= -0.6;
          }
          if (this.expectedX > this.x) {
            this.direction = this.DIR.LEFT;
            this.force.x *= -0.6;
          }
        }
      }
      if (this.onLeftEdge) {
        this.direction = this.DIR.RIGHT;
        this.force.x *= -0.6;
      }
      if (this.onRightEdge) {
        this.direction = this.DIR.LEFT;
        this.force.x *= -0.6;
      }
      this.animate(this.direction === this.DIR.RIGHT ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
});
