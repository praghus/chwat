//==========================================================================
// PLAYER
//--------------------------------------------------------------------------
game.addEntity('player', class extends Entity {
  constructor(obj, game) {
    super(obj, game);
    this.godMode = true;
    this.canShoot = true;
    this.canHurt = true;
    this.inDark = 0;
    this.energy = 30;
    this.maxEnergy = 30;
    this.maxSpeed = 2;
    this.speed = 0.2;
    this.coinCollect = 0;
    this.throwDelay = 500;
    this.shootDelay = 500;
    this.throwSpeed = 0;
    this.throwMaxSpeed = 5;
    this.shootTimeout = null;
    this.solid = true;
    this.items = [];
    this.animations = {
      RIGHT       : {x: 0,    y: 16,  w: 32, h: 48, frames: 8, fps: 15, loop: true},
      JUMP_RIGHT  : {x: 256,  y: 16,  w: 32, h: 48, frames: 5, fps: 15, loop: false},
      FALL_RIGHT  : {x: 320,  y: 16,  w: 32, h: 48, frames: 2, fps: 15, loop: false},
      STAND_RIGHT : {x: 448,  y: 16,  w: 32, h: 48, frames: 1, fps: 15, loop: false},
      STAND_LEFT  : {x: 480,  y: 16,  w: 32, h: 48, frames: 1, fps: 15, loop: false},
      FALL_LEFT   : {x: 512,  y: 16,  w: 32, h: 48, frames: 2, fps: 15, loop: false},
      JUMP_LEFT   : {x: 576,  y: 16,  w: 32, h: 48, frames: 4, fps: 15, loop: false},
      LEFT        : {x: 704,  y: 16,  w: 32, h: 48, frames: 8, fps: 15, loop: true},
      DEAD_RIGHT  : {x: 448,  y: 128, w: 32, h: 64, frames: 1, fps: 15, loop: false},
      DEAD_LEFT   : {x: 480,  y: 128, w: 32, h: 64, frames: 1, fps: 15, loop: false}
    };
    this.animation = this.animations.STAND_RIGHT;
  }
  //----------------------------------------------------------------------
  draw($, image) {
    /*if ((this._game.camera.underground || this._game.player.inDark > 0) && !this._game.state.dynamicLights) {
      $.globalCompositeOperation = "lighter";
      $.drawImage(this._game.renderer.images.player_light,
        -128 + Math.floor(this._game.player.x + (this._game.player.width / 2) + this._game.camera.x),
        -128 + Math.floor(this._game.player.y + (this._game.player.height / 2) + this._game.camera.y)
      );
      $.globalCompositeOperation = "source-over";
    }*/
    if (!this.canHurt && !this.dead) {
      $.globalAlpha = 0.2;
    }
    $.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), this._game.player.animation.y + this.animOffset,
      this.animation.w, this.animation.h,
      Math.floor(this.x + this._game.camera.x) - 8, Math.floor(this.y + this._game.camera.y) - 5, this.animation.w, this.animation.h
    );
    if (!this.canHurt && !this.dead) {
      $.globalAlpha = 1;
    }
  }
  //----------------------------------------------------------------------
  update() {
    let {input} = this._game;
    //if (this.godMode) this.kill = false;
    if (!this.dead) {
      if (input.left) {
        this.force.x -= this.speed;
        this.direction = this.DIR.LEFT;
      }
      if (input.right) {
        this.force.x += this.speed;
        this.direction = this.DIR.RIGHT;
      }
      if (this.onFloor && input.up) {
        this.doJump = true;
        this.force.y = -6.5;
        this.canJump = false;
        //Sound.jump.play();
      }
      if (input.down && !this.fall && this.force.y === 0) {
        this.fall = true;
        this.fallTimeout = setTimeout(() => this.fall = false, 400);
      }
      if (input.shoot && this.canShoot) {
        this.shoot();
      }
      if (input.throw && this.canShoot && this.throwSpeed < this.throwMaxSpeed) {
        this.throwSpeed += 0.5;
      }
      if (this.throwSpeed > 0 && !input.throw) {
        this.throw();
      }
      if (input.action) {
        this.get(null);
        input.action = false;
      }
      // slow down
      if (!input.left && !input.right && this.force.x !== 0) {
        this.force.x += this.direction === this.DIR.RIGHT ? -this.speed : this.speed;
        if (this.direction === this.DIR.LEFT && this.force.x > 0 || this.direction === this.DIR.RIGHT && this.force.x < 0) {
          this.force.x = 0;
        }
      }
    }
    this.force.y += this._game.world.gravity;
    this.move();

    if (this.onFloor) {
      this.force.y *= -0.6;
      this.doJump = false;
      this.fall = false;
      this.canJump = true;
    }
    if (this.expectedY < this.y) {
      this.doJump = false;
    }

    if (this.dead) {
      this.animate(this.direction === this.DIR.RIGHT ? this.animations.DEAD_RIGHT : this.animations.DEAD_LEFT);
    }
    else if (this.doJump || this.fall) {
      if (this.force.y < 0) {
        this.animate(this.direction === this.DIR.RIGHT ? this.animations.JUMP_RIGHT : this.animations.JUMP_LEFT);
      }
      else {
        this.animate(this.direction === this.DIR.RIGHT ? this.animations.FALL_RIGHT : this.animations.FALL_LEFT);
      }
    } else if (this.force.x !== 0) {
      this.animate(this.direction === this.DIR.RIGHT ? this.animations.RIGHT : this.animations.LEFT);
    }
    else {
      this.animate(this.direction === this.DIR.RIGHT ? this.animations.STAND_RIGHT : this.animations.STAND_LEFT);
    }
    // recover energy while standing
    /*if (this.force.x == 0 && this.force.y == 0 && this.energy < this.maxEnergy)
      this.energy += 0.01;*/

  }
  //----------------------------------------------------------------------
  hit(s) {
    if (this.godMode || !this.canHurt) {
      return;
    }
    this.energy -= s;
    this.force.y -= 3;
    this.canHurt = false;
    if (this.energy <= 0 && !this.dead){
      //this.kill = true;
    }
    setTimeout(()=> this.canHurt = true, 1000);
  }
  //----------------------------------------------------------------------
  canUse(id) {
    if(id === 'player'){
      return true;
    }
    if (this.items[0] && this.items[0].properties.id === id) {
      this.items[0] = this.items[1];
      this.items[1] = null;
      return true;
    }
    if (this.items[1] && this.items[1].properties.id === id) {
      this.items[1] = null;
      return true;
    }
    return false;
  }
  //----------------------------------------------------------------------
  get(item) {
    //if(item) {
      console.log(item);
      if(this.items[1]) {
        this.items[1].x = this.x+16;
        this.items[1].y = this.y;
        this._game.elements.all.push(new this._game.entities['item'](this.items[1], this._game));
      }
      this.items[1]=this.items[0];
      this.items[0]=item;
      this._game.input.action = false;
    //}
  }
  //----------------------------------------------------------------------
  collide(element) {
    if (element.damage > 0 && (element.family === 'enemies' || element.family === 'traps')) {
      this.hit(element.damage);
    }
  }
  //----------------------------------------------------------------------
  shoot() {
    this.canShoot = false;
    this.force.x = 0;
    this.animOffset = 64;
    this._game.elements.add('player_bullet',{
      x: this.direction === this.DIR.RIGHT ? this.x + this.width : this.x - 12,
      y: this.y + 21,
      direction: this.direction
    });
    this.shootTimeout = setTimeout(() => {
      this.canShoot = true;
      this.animOffset = 0;
    }, this.shootDelay);
    //Sound.shoot.play();
  }
  //----------------------------------------------------------------------
  throw() {
    this.canShoot = false;
    this.animOffset = 64;
    this._game.elements.add('grenade', {
      x: this.direction === this.DIR.RIGHT ? this.x + this.width : this.x,
      y: this.y + 18,
      direction: this.direction
    });
    this.throwSpeed = 0;
    this.shootTimeout = setTimeout(() => {
      this.canShoot = true;
      this.animOffset = 0;
    }, this.throwDelay);
  }
  //----------------------------------------------------------------------
  exterminate() {
    //this.kill = true;
  }
});
