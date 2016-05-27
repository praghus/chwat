//--------------------------------------------------------------------------
// Blob
//--------------------------------------------------------------------------
game.addEntity('enemy_blob', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'enemies';
    this.maxSpeed = 0.5;
    this.speed = 0.01;
    this.energy = 30;
    this.maxEnergy = 30;
    this.damage = 10;
    this.solid = true;
    this.animations = {
      DOWN_RIGHT: {x: 0, y: 0, w: 20, h: 20, frames: 6, fps: 10, loop: true},
      DOWN_LEFT: {x: 0, y: 20, w: 20, h: 20, frames: 6, fps: 10, loop: true},
      UP_RIGHT: {x: 0, y: 60, w: 20, h: 20, frames: 6, fps: 10, loop: true},
      UP_LEFT: {x: 0, y: 40, w: 20, h: 20, frames: 6, fps: 10, loop: true},
      JUMP: {x: 0, y: 80, w: 20, h: 20, frames: 2, fps: 5, loop: false}
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

  switchDirs(){
    this.direction = this.direction === this.DIR.RIGHT ? this.DIR.LEFT :this.DIR.RIGHT;
  }

  update() {
    if (this.onScreen()) {
      this.awake = true;
    }
    if (this.awake && !this.dead) {

      this.force.y += this.jump ? -0.2 : this._game.world.gravity;
      this.force.x += this.direction === this.DIR.RIGHT ? this.speed : -this.speed;

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

/*      if (this.seesPlayer() && this.onCeiling) {
        this.jump=false;
      }
      if (this.onFloor && (this.onLeftEdge || this.onRightEdge)) {
        this._game.m.randomChoice([
          ()=>this.jump = true,
          ()=>this.switchDirs()
        ])();
      }
      if (this.onFloor && this.expectedX !== this.x ) {
        this._game.m.randomChoice([
          ()=>this.jump = true,
          ()=>this.switchDirs()
        ])();
      }
      if (this.onCeiling) {
        if ((this.PlayerM > 1.4 && this.PlayerM < 1.5) || (this.PlayerM < -1.4 && this.PlayerM > -1.5)) {
          this.jump = false;
        } else if (this.expectedX !== this.x) {
          this._game.m.randomChoice([
            ()=>this.jump = false,
            ()=>this.switchDirs()
          ])();
        }
      }
*/
      if(this.onFloor) {
        this.animate(this.direction === this.DIR.RIGHT ? this.animations.DOWN_RIGHT : this.animations.DOWN_LEFT);
      } else if(this.onCeiling){
        this.animate(this.direction === this.DIR.RIGHT ? this.animations.UP_RIGHT : this.animations.UP_LEFT);
      } else {
        this.animate(this.animations.JUMP);
      }
    }
  }
});
