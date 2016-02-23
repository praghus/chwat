//==========================================================================
// PLAYER
//--------------------------------------------------------------------------
Game.addEntity('player', class extends Entity {
  constructor(obj) {
    super(obj);
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
    this.items = new Array(2);
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
  draw(ctx, image) {
    if ((Game.camera.underground || Game.player.inDark > 0) && !Game.renderer.dynamicLights) {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(Game.renderer.images.player_light,
        -128 + Math.floor(Game.player.x + (Game.player.width / 2) + Game.camera.x),
        -128 + Math.floor(Game.player.y + (Game.player.height / 2) + Game.camera.y)
      );
      ctx.globalCompositeOperation = "source-over";
    }
    if (!this.canHurt && !this.dead) {
      ctx.globalAlpha = 0.2;
    }
    ctx.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), Game.player.animation.y + this.animOffset,
      this.animation.w, this.animation.h,
      Math.floor(this.x + Game.camera.x) - 8, Math.floor(this.y + Game.camera.y) - 5, this.animation.w, this.animation.h
    );
    if (!this.canHurt && !this.dead) {
      ctx.globalAlpha = 1;
    }
  }
  //----------------------------------------------------------------------
  update() {
    //if (this.godMode) this.kill = false;
    if (!this.dead) {
      if (Game.input.left) {
        this.force.x -= this.speed;
        this.direction = DIR.LEFT;
      }
      if (Game.input.right) {
        this.force.x += this.speed;
        this.direction = DIR.RIGHT;
      }
      if (this.canJump && Game.input.up) {
        this.doJump = true;
        this.force.y = -7;
        this.canJump = false;
        //Sound.jump.play();
      }
      if (Game.input.down && !this.fall && this.force.y === 0) {
        this.fall = true;
        this.fallTimeout = setTimeout(() => this.fall = false, 400);
      }
      if (Game.input.shoot && this.canShoot) {
        this.shoot();
      }
      if (Game.input.throw && this.canShoot && this.throwSpeed < this.throwMaxSpeed) {
        this.throwSpeed += 0.5;
      }
      if (this.throwSpeed > 0 && !Game.input.throw) {
        this.throw();
      }
      if (Game.input.action) {
        this.get(null);
        Game.input.action = false;
      }
      // slow down
      if (!Game.input.left && !Game.input.right && this.force.x !== 0) {
        this.force.x += this.direction === DIR.RIGHT ? -this.speed : this.speed;
        if (this.direction === DIR.LEFT && this.force.x > 0 || this.direction === DIR.RIGHT && this.force.x < 0) {
          this.force.x = 0;
        }
      }
    }
    this.force.y += Game.map.gravity;
    this.move();

    if (this.onFloor) {
      this.force.y *= -0.8;
      this.doJump = false;
      this.fall = false;
      this.canJump = true;
    }
    if (this.expectedY < this.y) {
      this.doJump = false;
    }

    if (this.dead) {
      this.animate(this.direction === DIR.RIGHT ? this.animations.DEAD_RIGHT : this.animations.DEAD_LEFT);
    }
    else if (this.doJump || this.fall) {
      if (this.force.y < 0) {
        this.animate(this.direction === DIR.RIGHT ? this.animations.JUMP_RIGHT : this.animations.JUMP_LEFT);
      }
      else {
        this.animate(this.direction === DIR.RIGHT ? this.animations.FALL_RIGHT : this.animations.FALL_LEFT);
      }
    } else if (this.force.x !== 0) {
      this.animate(this.direction === DIR.RIGHT ? this.animations.RIGHT : this.animations.LEFT);
    }
    else {
      this.animate(this.direction === DIR.RIGHT ? this.animations.STAND_RIGHT : this.animations.STAND_LEFT);
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
    setTimeout(() => this.canHurt = true, 1000);
  }
  //----------------------------------------------------------------------
  canUse(id) {
    if (this.items[0] && this.items[0].properties.id === id) {
      this.items[0] = this.items[1];
      this.items[1] = null;
      return true;
    }
    if (this.items[1] && this.items[1].properties.id === id) {
      this.items[1] = null;
      return true;
    }
    return this.godMode; //false;
  }
  //----------------------------------------------------------------------
  get(item) {
    if (this.items[1] && this.items[1].type === 'item') {
      var obj = this.items[1];
      obj.x = this.x;
      obj.y = (this.y + this.height) - obj.height;
      Game.elements.add(new Item(obj));
    }
    this.items[1] = this.items[0];
    this.items[0] = item;
    this.action = false;
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
    Game.elements.add('player_bullet',{
      x: this.direction === DIR.RIGHT ? this.x + this.width : this.x - 12,
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
    Game.elements.add('grenade', {
      x: this.direction === DIR.RIGHT ? this.x + this.width : this.x,
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