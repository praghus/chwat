//--------------------------------------------------------------------------
// Shooting tank
//--------------------------------------------------------------------------
game.addEntity('enemy_tank', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'enemies';
    this.solid = true;
    this.countToShoot = 0;
    this.canShoot = true;
    this.shootDelay = 5000;
    this.shootTimeout = null;
    this.energy = 100;
    this.maxEnergy = 100;
    this.speed = 0.1;
    this.maxSpeed = 0.5;
    this.animation = {x: 0, y: 0, w: 32, h: 32, frames: 2, fps: 4, loop: true};
    this.damage = 30;
  }

  shoot() {
    this._game.elements.add('enemy_bullet', {x: this.x - 17, y: this.y + 6, direction: this.DIR.LEFT});
    this._game.elements.add('enemy_bullet', {x: this.x + this.width + 1, y: this.y + 6, direction: this.DIR.RIGHT});
    this.shootTimeout = setTimeout(()=>{this.canShoot = true}, this.shootDelay);
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
      if (this.seesPlayer() && this.canShoot) {
        this.countToShoot = 40;
        this.canShoot = false;
      }
      this.force.y += this._game.map.gravity;
      if (this.countToShoot > 0) {
        this.countToShoot -= 1;
        this.force.x *= 0.8;
        if (this.countToShoot === 20) {
          this.shoot();
        }
      }
      else {
        this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      }
      this.move();
      if (this.onLeftEdge) {
        this.direction = this.DIR.RIGHT;
        this.force.x *= -0.6;
      }
      if (this.onRightEdge) {
        this.direction = this.DIR.LEFT;
        this.force.x *= -0.6;
      }
      if (this.expectedX < this.x ) {
        this.direction = this.DIR.RIGHT;
        this.force.x *= -0.6;
      }
      if (this.expectedX > this.x ) {
        this.direction = this.DIR.LEFT;
        this.force.x *= -0.6;
      }
      this.animate();
    }
  };
});
