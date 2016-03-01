//--------------------------------------------------------------------------
// Bat
//--------------------------------------------------------------------------
game.addEntity('enemy_bat', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family     = "enemies";
    this.maxSpeed   = 1;
    this.speed      = 0.2;
    this.energy     = 30;
    this.maxEnergy  = 30;
    this.damage     = 10;
    //this.canFly     = true;
    this.solid      = true;
    this.animFrame  = Math.random()*6;
    this.animations = {
      RIGHT: {x:0,  y:0,  w:28, h:20, frames:6, fps:16, loop:true},
      LEFT:  {x:0,  y:20, w:28, h:20, frames:6, fps:16, loop:true}
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
      this.force.y += this.y > this._game.player.y ? -0.01 : 0.01;
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      if (this.seesPlayer()) {
        this.direction = this._game.player.x > this.x ? this.DIR.RIGHT : this.DIR.LEFT;
      }
      this.move();
      if (this.expectedX !== this.x) {
        this.force.y -= 0.03;
        if (this.expectedY !== this.y) {
          if (this.expectedX < this.x) {
            this.direction = this.DIR.RIGHT;
            this.force.x *= -0.6;
          }
          if (this.expectedX > this.x) {
            this.direction = this.DIR.LEFT;
            this.force.x *= -0.6;
          }
        }
      } else if(this.expectedY !== this.y) {
        this.force.y += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;
      }
      this.animate(this.direction === this.DIR.RIGHT ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
});
