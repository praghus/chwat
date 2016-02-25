//--------------------------------------------------------------------------
// Rock
//--------------------------------------------------------------------------
game.addEntity('rock', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.family = 'traps';
    this.speed = 0.2;
    this.maxSpeed = 2;
    this.direction = 1;
    this.damage = 100;
    this.solid = true;
    this.rotation = 0;
  }

  draw($, image) {
    const r = Math.PI / 16;
    const { camera } = this._game;
    $.save();
    $.translate(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    $.translate(16, 16);
    if (this.force.x !== 0) {
      this.rotation += this.speed / 5;
    }
    $.rotate(this.rotation * r);
    $.drawImage(image, -16, -16);
    $.restore();
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
      this.force.y += this._game.map.gravity;
      if (this.onFloor && this.speed < this.maxSpeed) {
        this.speed += 0.01;
      }
      //if(this.force.y < 0 && this.speed > 1) this.speed -=0.25;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      this.move();
    }
  };
});
