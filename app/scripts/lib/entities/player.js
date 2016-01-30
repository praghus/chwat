//==========================================================================
// PLAYER
//--------------------------------------------------------------------------
Game.addEntity('player', function () {
  Entity.apply(this, arguments);
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
  this.fallTimeout = null;
  this.hurtTimeout = null;
  this.shoots = [];
  this.items = new Array(2);
  this.savedPos = {x: this.x, y: this.y};
  this.animations = {
    RIGHT: {x: 0, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
    JUMP_RIGHT: {x: 256, y: 16, w: 32, h: 48, frames: 5, fps: 15, loop: false},
    FALL_RIGHT: {x: 320, y: 16, w: 32, h: 48, frames: 2, fps: 15, loop: false},
    STAND_RIGHT: {x: 448, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
    STAND_LEFT: {x: 480, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
    FALL_LEFT: {x: 512, y: 16, w: 32, h: 48, frames: 2, fps: 15, loop: false},
    JUMP_LEFT: {x: 576, y: 16, w: 32, h: 48, frames: 4, fps: 15, loop: false},
    LEFT: {x: 704, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
    DEAD_RIGHT: {x: 448, y: 128, w: 32, h: 64, frames: 1, fps: 15, loop: false},
    DEAD_LEFT: {x: 480, y: 128, w: 32, h: 64, frames: 1, fps: 15, loop: false}
  };
  this.animation = this.animations.STAND_RIGHT;

  //----------------------------------------------------------------------
  this.draw = function (ctx, image) {
    if ((camera.underground || player.inDark > 0) && !renderer.dynamicLights) {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(renderer.images.player_light,
        -128 + Math.floor(player.x + (player.width / 2) + camera.x),
        -128 + Math.floor(player.y + (player.height / 2) + camera.y)
      );
      ctx.globalCompositeOperation = "source-over";
    }
    if (!this.canHurt && !this.dead) {
      ctx.globalAlpha = 0.2;
    }
    ctx.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), player.animation.y + this.animOffset,
      this.animation.w, this.animation.h,
      Math.floor(this.x + camera.x) - 8, Math.floor(this.y + camera.y) - 5, this.animation.w, this.animation.h);
    if (!this.canHurt && !this.dead) ctx.globalAlpha = 1;
  };
  //----------------------------------------------------------------------
  this.update = function () {
    //if (this.godMode) this.kill = false;

    if (!this.dead) {
      if (Game.input.left) {
        this.force.x -= this.speed;
        this.direction = 0;
      }
      if (Game.input.right) {
        this.force.x += this.speed;
        this.direction = 1;
      }
      if (this.canJump && Game.input.up) {
        this.doJump = true;
        this.force.y = -7;
        this.canJump = false;
        //Sound.jump.play();
      }
      if (Game.input.down && !this.fall && this.force.y == 0) {
        this.fall = true;
        this.fallTimeout = setTimeout(function () {this.fall = false;}.bind(this), 400);
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
      if (!Game.input.left && !Game.input.right && this.force.x != 0) {
        this.force.x += this.direction == 1 ? -this.speed : this.speed;
        if (this.direction == 0 && this.force.x > 0 ||
          this.direction == 1 && this.force.x < 0)
          this.force.x = 0;
      }
    }
    this.force.y += map.gravity;


    this.move();
    if (this.dead) {
      this.animate(this.direction == 1 ? this.animations.DEAD_RIGHT : this.animations.DEAD_LEFT);
    }
    else if (this.doJump || this.fall) {
      if (this.force.y < 0) {
        this.animate(this.direction == 1 ? this.animations.JUMP_RIGHT : this.animations.JUMP_LEFT);
      }
      else {
        this.animate(this.direction == 1 ? this.animations.FALL_RIGHT : this.animations.FALL_LEFT);
      }
    } else if (this.force.x != 0) {
      this.animate(this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    }
    else {
      this.animate(this.direction == 1 ? this.animations.STAND_RIGHT : this.animations.STAND_LEFT);
    }
    // recover energy while standing
    /*if (this.force.x == 0 && this.force.y == 0 && this.energy < this.maxEnergy)
      this.energy += 0.01;*/

  };
  //----------------------------------------------------------------------
  this.hit = function (s) {
    if (this.godMode || !this.canHurt) return;
    this.energy -= s;
    this.force.y -= 3;
    this.canHurt = false;
    if (this.energy <= 0 && !this.dead) this.kill = true;
    this.hurtTimeout = setTimeout(function () {this.canHurt = true;}.bind(this), 1000);
  };
  //----------------------------------------------------------------------
  this.canUse = function (id) {
    if (this.items[0] && this.items[0].properties.id == id) {
      this.items[0] = this.items[1];
      this.items[1] = null;
      return true;
    }
    if (this.items[1] && this.items[1].properties.id == id) {
      this.items[1] = null;
      return true;
    }
    return this.godMode; //false;
  };
  //----------------------------------------------------------------------
  this.get = function (item) {
    if (this.items[1] && this.items[1].type == 'item') {
      var obj = this.items[1];
      obj.x = this.x;
      obj.y = (this.y + this.height) - obj.height;
      elements.add(new Item(obj));
    }
    this.items[1] = this.items[0];
    this.items[0] = item;
    this.action = false;
  };
  //----------------------------------------------------------------------
  this.collide = function (element) {
    if (element.damage > 0 && (
        element.family === 'enemies' ||
        element.family === 'traps'
      )) this.hit(element.damage);
  };
  //----------------------------------------------------------------------
  this.shoot = function () {
    this.canShoot = false;
    this.force.x = 0;
    this.animOffset = 64;
    elements.add('player_bullet',{
      x: this.direction == 1 ? this.x + this.width : this.x - 12,
      y: this.y + 21,
      direction: this.direction
    });
    this.shootTimeout = setTimeout(function () {
      this.canShoot = true;
      this.animOffset = 0;
    }.bind(this), this.shootDelay);
    //Sound.shoot.play();
  };
  //----------------------------------------------------------------------
  this.throw = function () {
    this.canShoot = false;
    this.animOffset = 64;
    elements.add('player_stone', {
      x: this.direction == 1 ? this.x + this.width : this.x,
      y: this.y + 18,
      direction: this.direction
    });
    this.throwSpeed = 0;
    this.shootTimeout = setTimeout(function () {
      this.canShoot = true;
      this.animOffset = 0;
    }.bind(this), this.throwDelay);
  };
  //----------------------------------------------------------------------
  this.exterminate = function () {
    this.kill = true;
  }
});
