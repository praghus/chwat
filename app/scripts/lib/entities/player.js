//==========================================================================
// PLAYER
//--------------------------------------------------------------------------
var Player = function () {
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
  this.input = {
    left: false, right: false, up: false, down: false,
    jump: false, shoot: false, action: false, throw: false,
    actionAvailable: true
  };
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
    if (!this.canHurt && !this.dead) ctx.globalAlpha = 0.2;
    ctx.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), player.animation.y + this.animOffset,
      this.animation.w, this.animation.h,
      Math.floor(this.x + camera.x) - 8, Math.floor(this.y + camera.y) - 5, this.animation.w, this.animation.h);
    if (!this.canHurt && !this.dead) ctx.globalAlpha = 1;
  };
  //----------------------------------------------------------------------
  this.update = function () {
    if (this.godMode) this.kill = false;
    if (this.kill) {
      this.dead = true;
      player.kill = false;
      this.force.x = 0;
      Explosion1(player.x, player.y);
      setTimeout(function () {
        player.dead = false;
        player.x = player.savedPos.x;
        player.y = player.savedPos.y;
        player.energy = player.maxEnergy;
        camera.center();
      }, 1000);
    } else {
      if (!this.dead) {
        if (this.input.left) {
          this.force.x -= this.speed;
          this.direction = 0;
        }
        if (this.input.right) {
          this.force.x += this.speed;
          this.direction = 1;
        }
        if (this.canJump && this.input.up) {
          this.doJump = true;
          this.force.y = -7;
          this.canJump = false;
          //Sound.jump.play();
        }
        if (this.input.down && !this.fall && this.force.y == 0) {
          this.fall = true;
          this.fallTimeout = setTimeout(function (thisObj) {
            thisObj.fall = false;
          }, 400, this);
        }
        if (this.input.shoot && this.canShoot) {
          this.shoot();
        }
        if (this.input.throw && this.canShoot && this.throwSpeed < this.throwMaxSpeed) {
          this.throwSpeed += 0.5;
        }
        if (this.throwSpeed > 0 && !this.input.throw) {
          this.throw();
        }
        if (this.input.action) {
          this.get(null);
          this.input.action = false;
        }
        // slow down
        if (!this.input.left && !this.input.right && this.force.x != 0) {
          this.force.x += this.direction == 1 ? -this.speed : this.speed;
          if (this.direction == 0 && this.force.x > 0 ||
            this.direction == 1 && this.force.x < 0)
            this.force.x = 0;
        }
      }
      this.force.y += map.gravity;
      this.move();
      this.animate();
      // recover energy while standing
      if (this.force.x == 0 && this.force.y == 0 && this.energy < this.maxEnergy)
        this.energy += 0.01;
    }
  };
  //----------------------------------------------------------------------
  this.animate = function () {
    if (this.dead)
      Game.animate(FPS, this, this.direction == 1 ? this.animations.DEAD_RIGHT : this.animations.DEAD_LEFT);
    else if (this.doJump || this.fall) {
      if (this.force.y < 0) Game.animate(FPS, this, this.direction == 1 ? this.animations.JUMP_RIGHT : this.animations.JUMP_LEFT);
      else Game.animate(FPS, this, this.direction == 1 ? this.animations.FALL_RIGHT : this.animations.FALL_LEFT);
    } else if (this.force.x != 0)
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    else
      Game.animate(FPS, this, this.direction == 1 ? this.animations.STAND_RIGHT : this.animations.STAND_LEFT);
  };
  //----------------------------------------------------------------------
  this.hit = function (s) {
    if (this.godMode || !this.canHurt) return;
    this.energy -= s;
    this.force.y -= 3;
    player.canHurt = false;
    if (this.energy <= 0 && !this.dead) this.kill = true;
    this.hurtTimeout = setTimeout(function () {
      player.canHurt = true;
    }, 1000);

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
        element.family == "enemies" ||
        element.family == "traps"
      )) this.hit(element.damage);
  };
  //----------------------------------------------------------------------
  this.shoot = function () {
    this.canShoot = false;
    this.force.x = 0;
    this.animOffset = 64;
    elements.add(new PlayerBullet({
      x: player.direction == 1 ? this.x + player.width : this.x - 12,
      y: this.y + 21
    }, player.direction));
    this.shootTimeout = setTimeout(function () {
      player.canShoot = true;
      player.animOffset = 0;
    }, this.shootDelay);
    //Sound.shoot.play();
  };
  //----------------------------------------------------------------------
  this.throw = function () {
    this.canShoot = false;
    this.animOffset = 64;
    elements.add(new PlayerStone({
      x: player.direction == 1 ? this.x + player.width : this.x,
      y: this.y + 18
    }, player.direction));
    this.throwSpeed = 0;
    this.shootTimeout = setTimeout(function () {
      player.canShoot = true;
      player.animOffset = 0;
    }, this.throwDelay);
  };
  //----------------------------------------------------------------------
  this.exterminate = function () {
    this.kill = true;
  }
};
Player.prototype = Entity.prototype;
Player.prototype.constructor = Player;
//--------------------------------------------------------------------------
// Player stone
//--------------------------------------------------------------------------
var PlayerStone = function (obj, dir) {
  Entity.apply(this, arguments);
  this.family = "bullets";
  this.type = "stone";
  this.width = 4;
  this.height = 4;
  this.damage = 10;
  this.speed = player.throwSpeed + Math.abs(player.force.x);
  this.maxSpeed = 10;
  this.force = {x: 0, y: -3};
  this.direction = dir;
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      GrenadeExplosion(this.x, this.y);
    }
  }
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x) {
        this.direction = !this.direction;
        this.force.x *= -0.6;
        this.speed -= 1;
      }
      if (!m.y) this.speed -= 0.5;
      if (this.speed < 1) {
        this.dead = true;
        GrenadeExplosion(this.x, this.y);
      }
    }
  }
};
PlayerStone.prototype = Entity.prototype;
PlayerStone.prototype.constructor = PlayerStone;
//--------------------------------------------------------------------------
// Player bullet
//--------------------------------------------------------------------------
var PlayerBullet = function (obj, dir) {
  Entity.apply(this, arguments);
  this.family = "bullets";
  this.type = 'player_bullet';
  this.width = 8;
  this.height = 8;
  this.speed = 10;
  this.damage = 20;
  this.direction = dir;
  this.color = "#666666";
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      ShootExplosion(this.x, this.y, this.color);
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.direction == 0
        ? this.x -= this.speed
        : this.x += this.speed;

      if (this.x + camera.x < 0)
        this.dead = true;

      var EX = this.x, EY = this.y,
        BX = this.direction == 0 ? EX - this.speed : EX + this.speed,
        p = renderer.ctx.getImageData(BX + camera.x, EY + camera.y, 1, 1).data;

      this.color = Game.Math.brighten("#" + ("000000" + Game.Math.rgbToHex(p[0], p[1], p[2])).slice(-6), 20);
      if (Math.floor(BX / map.spriteSize) >= 0 && Math.floor(EY / map.spriteSize) >= 0) {
        if (map.isSolid(Math.floor(BX / map.spriteSize), Math.floor(EY / map.spriteSize))) {
          this.dead = true;
        }
      }
      if (this.dead) ShootExplosion(EX, EY, this.color);
    }
  }
};
PlayerBullet.prototype = Entity.prototype;
PlayerBullet.prototype.constructor = PlayerBullet;
//--------------------------------------------------------------------------
// Coin
//--------------------------------------------------------------------------
var Coin = function () {
  Entity.apply(this, arguments);
  this.family = "items";
  this.type = "coin";
  this.width = 8;
  this.height = 8;
  this.animation = {x: 0, y: 0, w: 8, h: 8, frames: 10, fps: 30, loop: true};
  this.force = {x: 0, y: -5};
  this.collide = function (element) {
    if (element.type == "player") {
      this.dead = true;
      player.coinCollect += 1;
    }
  }
  this.update = function () {
    if (this.onScreen()) {
      this.animate();
      this.force.y += map.gravity;
      this.move();
    }
  }
};
Coin.prototype = Entity.prototype;
Coin.prototype.constructor = Coin;
//--------------------------------------------------------------------------
// Item
//--------------------------------------------------------------------------
var Item = function () {
  Entity.apply(this, arguments);
  this.animFrame = parseInt(this.properties.frame);
  this.collide = function (element) {
    if (element.type == "player" && !this.dead && player.input.action) {
      player.get(this);
      player.input.action = false;
      this.dead = true;
    }
    if (element.family == "bullets" && this.properties.id == "tnt") {
      this.dead = true;
      elements.add(new Explosion2({"x": this.x - 24, "y": this.y - 110}));
    }
  };
  this.update = function () {
    if (this.onScreen()) {
      this.force.y += map.gravity;
      this.move();
    }
  }
};
Item.prototype = Entity.prototype;
Item.prototype.constructor = Item;
//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
var Trigger = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this) && !this.dead && player.input.action) {
        if (this.properties.activator == 'player' || player.canUse(this.properties.activator))
          eval(this.properties.action);
        else
          renderer.msg(this.properties.message, 50);
      }
    }
  }
};
Trigger.prototype = Entity.prototype;
Trigger.prototype.constructor = Trigger;
//--------------------------------------------------------------------------
// Jump through
//--------------------------------------------------------------------------
var JumpThrough = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.collide = function (element) {
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!player.input.up && !player.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      if (element.doJump) element.doJump = false;
      if (element.type == "player" && player.input.up) {
        player.force.y = -6;
        player.doJump = true;
      }
    }
  }
};
JumpThrough.prototype = Entity.prototype;
JumpThrough.prototype.constructor = JumpThrough;
//--------------------------------------------------------------------------
// Slope left
//--------------------------------------------------------------------------
var SlopeLeft = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.vectorMask = [
    new V(0, 0),
    new V(0, this.height),
    new V(this.width, this.height)
  ];
  this.collide = function (element) {
    var expectedY = (this.y - element.height) + (element.x - this.x) * (this.height / this.width);
    if (element.y >= expectedY) {
      element.force.y = 0;
      element.y = expectedY;
      element.doJump = false;
      if (element.type == "player" && player.input.up) element.force.y = -6;
    } else if (element.force.y == 0) {
      element.force.y += 1;
    }
  }
};
SlopeLeft.prototype = Entity.prototype;
SlopeLeft.prototype.constructor = SlopeLeft;
//--------------------------------------------------------------------------
// Slope right
//--------------------------------------------------------------------------
var SlopeRight = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.visible = false;
  this.vectorMask = [
    new V(0, this.height),
    new V(this.width, 0),
    new V(this.width, this.height)
  ];
  this.collide = function (element) {
    var expectedY = (this.y - element.height) + this.height - (((element.x + element.width) - this.x) * (this.height / this.width));
    if (element.y >= expectedY) {
      element.force.y = 0;
      element.y = expectedY;
      element.doJump = false;
      if (element.type == "player" && player.input.up) element.force.y = -6;
    } else if (element.force.y == 0) {
      element.force.y += 1;
    }
  }
};
SlopeRight.prototype = Entity.prototype;
SlopeRight.prototype.constructor = SlopeRight;
//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
var Ladder = function () {
  Entity.apply(this, arguments);
  this.visible = false;
  this.collide = function (element) {
    if (element.type == "player") {
      if (player.input.up) player.force.y = -map.gravity - 0.5;
      else player.force.y = 0.5;
      //else player.force.y = -map.gravity;
      if (!player.input.left && !player.input.right && player.x != this.x) {
        player.x = this.x;
      }
      ;
    }
  };
};
Ladder.prototype = Entity.prototype;
Ladder.prototype.constructor = Ladder;
//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
var Paddle = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.speed = 1;
  this.maxSpeed = 1;
  this.turnTimeout = null;
  this.draw = function (ctx, image) {
    for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
      ctx.drawImage(image,
        0, 0, map.spriteSize, map.spriteSize,
        Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y),
        map.spriteSize, map.spriteSize
      );
    }
  };
  this.collide = function (element) {
    if (element.force.y > 0 && element.y + element.height < this.y + this.height) {
      if (!player.input.up && !player.input.down && !element.fall) {
        element.y = (this.y ) - element.height;
        element.force.y = this.y - element.y - element.height;
      }
      element.doJump = false;
      element.x += this.force.x;
      if (element.doJump) element.doJump = false;
      if (element.type == "player") {
        camera.x = -(player.x - (ResolutionX / 2));
        if (player.input.up) {
          player.force.y = -6;
          player.doJump = true;
        }
      }
    }
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x && this.turnTimeout == null) this.turnTimeout = setTimeout(function (thisObj) {
        thisObj.direction = !thisObj.direction;
        thisObj.turnTimeout = null
      }, 300, this);
      ;
    }
  }
};
Paddle.prototype = Entity.prototype;
Paddle.prototype.constructor = Paddle;
//--------------------------------------------------------------------------
// Rock
//--------------------------------------------------------------------------
var Rock = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.speed = 0.2;
  this.maxSpeed = 2;
  this.direction = 1;
  this.damage = 100;
  this.solid = true;
  this.rotation = 0;
  this.draw = function (ctx, image) {
    var r = Math.PI / 16;
    ctx.save();
    ctx.translate(Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    ctx.translate(16, 16);
    if (this.force.x != 0)this.rotation += this.speed / 5
    ctx.rotate(this.rotation * r);
    ctx.drawImage(image, -16, -16);
    ctx.restore();
  }
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.y += map.gravity;
      if (this.onFloor && this.speed < this.maxSpeed) this.speed += 0.01;
      //if(this.force.y < 0 && this.speed > 1) this.speed -=0.25;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      this.move();
    }
  }
};
Rock.prototype = Entity.prototype;
Rock.prototype.constructor = Rock;
//--------------------------------------------------------------------------
// Crush
//--------------------------------------------------------------------------
var Crush = function () {
  Entity.apply(this, arguments);
  this.solid = true;
  this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 10, fps: 5, loop: true};
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, {
          x: this.x + player.width,
          y: this.y - 1,
          width: this.width - (player.width * 2),
          height: this.height
        })) {
        if (this.animFrame == 9) {
          for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
            var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
              PY = Math.round(this.y / map.spriteSize);
            ShootExplosion(this.x + 16, this.y + 16, "#666666");
            map.data.ground[PX][PY] = 0;
          }
          this.dead = true;
        }
        this.animate();
      }
    }
  }
};
Crush.prototype = Entity.prototype;
Crush.prototype.constructor = Crush;
//--------------------------------------------------------------------------
// Crusher
//--------------------------------------------------------------------------
var Crusher = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.damage = 1000;
  this.fall = false;
  this.rise = false;
  this.solid = true;
  this.shadowCaster = true;
  this.fallDelay = parseInt(this.properties.delay);
  this.fallTimeout = setTimeout(function (thisObj) {
    thisObj.fall = true;
  }, this.fallDelay, this);
  this.update = function () {
    if (this.onScreen()) {
      if (this.rise) this.y -= 1;
      if (this.fall) this.force.y += map.gravity;
      this.y += this.force.y;

      var ELeft = Math.floor(this.x / map.spriteSize),
        ETop = Math.floor(this.y / map.spriteSize),
        EBottom = Math.floor((this.y + this.height) / map.spriteSize);
      if (map.data.ground[ELeft][ETop] > 0) {
        this.rise = false;
        this.fallTimeout = setTimeout(function (thisObj) {
          thisObj.fall = true;
        }, this.fallDelay, this);
      }
      if (map.data.ground[ELeft][EBottom] > 0) {
        this.y = ETop * map.spriteSize;
        this.force.y = 0;
        this.fall = false;
        this.rise = true;
        camera.shake();
      }
    } else {
      this.fallTimeout = null;
    }
  }
};
Crusher.prototype = Entity.prototype;
Crusher.prototype.constructor = Crusher;
//--------------------------------------------------------------------------
// Shooting tank
//--------------------------------------------------------------------------
var EnemyTank = function () {
  Entity.apply(this, arguments);
  this.family = "enemies";
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
  this.shoot = function () {
    elements.add(new EnemyBullet({x: this.x - 17, y: this.y + 3}, 0));
    elements.add(new EnemyBullet({x: this.x + this.width + 1, y: this.y + 3}, 1));
    this.shootTimeout = setTimeout(function (thisObj) {
      thisObj.canShoot = true;
    }, this.shootDelay, this);
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      if (this.seesPlayer() && this.canShoot) {
        this.countToShoot = 40;
        this.canShoot = false;
      }
      this.force.y += map.gravity;
      if (this.countToShoot > 0) {
        this.countToShoot -= 1;
        this.force.x *= 0.8;
        if (this.countToShoot == 20) this.shoot();
      } else
        this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (m.hole) {
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x && this.onFloor) {
        this.direction = !this.direction;
        this.force.x *= -0.6;
      }
      this.animate();
    }
  }
};
EnemyTank.prototype = Entity.prototype;
EnemyTank.prototype.constructor = EnemyTank;
//--------------------------------------------------------------------------
// Enemy bullet
//--------------------------------------------------------------------------
var EnemyBullet = function (obj, dir) {
  Entity.apply(this, arguments);
  this.family = "bullets"
  this.type = "enemy_bullet";
  this.width = 8;
  this.height = 8;
  this.damage = 50;
  this.speed = 5;
  this.direction = dir;
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      ShootExplosion(this.x, this.y, "#EEEEFF");
    }
  }
  this.update = function () {
    if (!this.dead) {
      this.direction == 0
        ? this.x -= this.speed
        : this.x += this.speed;

      if (this.x + camera.x < 0)
        this.dead = true;

      var EX = this.x, EY = this.y,
        BX = this.direction == 0 ? EX - this.speed : EX + this.speed;

      if (Game.Math.overlap(player, this) && !this.dead) {
        player.hit(this.damage);
        this.dead = true;
      }
      if (Math.floor(BX / map.spriteSize) >= 0 && Math.floor(EY / map.spriteSize) >= 0) {
        if (map.isSolid(Math.floor(BX / map.spriteSize), Math.floor(EY / map.spriteSize))) {
          this.dead = true;
        }
      }
      if (this.dead)
        ShootExplosion(this.x, this.y, "#EEEEFF");
    }
  }
};
EnemyBullet.prototype = Entity.prototype;
EnemyBullet.prototype.constructor = EnemyBullet;
//--------------------------------------------------------------------------
// Blob
//--------------------------------------------------------------------------
var EnemyBlob = function () {
  Entity.apply(this, arguments);
  this.family = "enemies";
  this.maxSpeed = 1;
  this.speed = 0.1;
  this.energy = 30;
  this.maxEnergy = 30;
  this.damage = 10;
  this.tryJump = 0;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 20, h: 20, frames: 6, fps: 10, loop: true},
    LEFT: {x: 0, y: 20, w: 20, h: 20, frames: 6, fps: 10, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.y += map.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      var m = this.move();
      if ((this.PlayerM > 1.4 && this.PlayerM < 1.5) ||
        (this.PlayerM < -1.4 && this.PlayerM > -1.5))
        this.force.y -= 2;
      if (m.hole && this.onFloor) {
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x && this.onFloor) {
        if (this.PlayerM > 0.2 || this.PlayerM < -0.2)
          this.force.y -= 5;
        else
          this.direction = !this.direction;
      }
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
      this.animate();
    }
  }
};
EnemyBlob.prototype = Entity.prototype;
EnemyBlob.prototype.constructor = EnemyBlob;
//--------------------------------------------------------------------------
// Phantom
//--------------------------------------------------------------------------
var Phantom = function () {
  Entity.apply(this, arguments);
  this.family = "enemies";
  this.maxSpeed = 0.5;
  this.speed = 0.1;
  this.energy = 30;
  this.maxEnergy = 30;
  this.damage = 10;
  this.canJump = true;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 16, h: 32, frames: 2, fps: 8, loop: true},
    LEFT: {x: 32, y: 0, w: 16, h: 32, frames: 2, fps: 8, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.y += this.y > player.y ? -0.02 : 0.5;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      this.move();
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
};
Phantom.prototype = Entity.prototype;
Phantom.prototype.constructor = Phantom;
//--------------------------------------------------------------------------
// Gloom
//--------------------------------------------------------------------------
var Gloom = function () {
  Entity.apply(this, arguments);
  this.family = "enemies";
  this.maxSpeed = 0.5;
  this.speed = 0.1;
  this.energy = 100;
  this.maxEnergy = 100;
  this.damage = 10;
  this.canJump = true;
  this.solid = true;
  this.animations = {
    RIGHT: {x: 0, y: 0, w: 32, h: 32, frames: 2, fps: 8, loop: true},
    LEFT: {x: 64, y: 0, w: 32, h: 32, frames: 2, fps: 8, loop: true}
  };
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (this.seesPlayer())
        this.direction = player.x > this.x;
      else if (!m.x) {
        this.direction = !this.direction;
      }
      if (this.force.y != 0) this.force.y *= 0.8;
      Game.animate(FPS, this, this.direction == 1 ? this.animations.RIGHT : this.animations.LEFT);
    }
  }
};
Gloom.prototype = Entity.prototype;
Gloom.prototype.constructor = Gloom;
//--------------------------------------------------------------------------
// Torch
//--------------------------------------------------------------------------
var Torch = function () {
  Entity.apply(this, arguments);
  this.draw = function (ctx, image) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .7 + Math.random() * .2;
    ctx.drawImage(image, Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
};
Torch.prototype = Entity.prototype;
Torch.prototype.constructor = Torch;
//--------------------------------------------------------------------------
// Dark Mask
//--------------------------------------------------------------------------
var Dark = function () {
  Entity.apply(this, arguments);
  this.active = false;
  this.activated = false;
  this.draw = function (ctx, image) {
    for (var y = -1; y < Math.round(this.height / map.spriteSize) + 1; y++) {
      for (var x = -1; x < Math.round(this.width / map.spriteSize) + 1; x++) {
        var PX = Math.round(((this.x - map.spriteSize) + (x * map.spriteSize)) / map.spriteSize) + 1,
          PY = Math.round(((this.y - map.spriteSize) + (y * map.spriteSize)) / map.spriteSize) + 1;
        if (!map.isSolid(PX, PY)) {
          var frame = 0;
          if (x == -1 && !map.isSolid(PX - 1, PY)) frame = 1;
          if (x + 1 == Math.round(this.width / map.spriteSize) + 1 && !map.isSolid(PX + 1, PY)) frame = 2;
          if (y == -1 && !map.isSolid(PX, PY - 1)) frame = 3;
          if (y + 1 == Math.round(this.height / map.spriteSize) + 1 && !map.isSolid(PX, PY + 1)) frame = 4;
          ctx.globalAlpha = DarkAlpha;
          ctx.drawImage(image,
            frame * map.spriteSize, 0,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
          ctx.globalAlpha = 1;
        }
      }
    }
  };
  this.render = function (ctx, image) {
    if (this.onScreen() && !player.inDark && !camera.underground)
      this.draw(ctx, image);
  }
  this.update = function () {
    if (this.onScreen()) {
      if (Game.Math.overlap(player, this)) {
        this.active = true;
        if (!this.activated) {
          player.inDark += 1;
          this.activated = true;
        }
        if (DarkAlpha > 0) DarkAlpha = 0;
      } else {
        if (this.active) {
          player.inDark -= 1;
          this.activated = false;
          this.active = false;
        }
        if (DarkAlpha < 1) DarkAlpha += 0.05;
      }
    } else if (this.active) {
      player.inDark -= 1;
      this.activated = false;
      this.active = false;
    }
  };
};
Dark.prototype = Entity.prototype;
Dark.prototype.constructor = Dark;
//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
var Water = function () {
  Entity.apply(this, arguments);
  this.animation = {x: 0, y: 0, w: map.spriteSize, h: map.spriteSize, frames: 7, fps: 20, loop: true};
  this.fall = false;
  this.wave = 0;
  this.direction = 1;
  this.draw = function (ctx, image) {
    ctx.globalAlpha = .4;
    for (var y = 0; y < Math.round(this.height / map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
          PY = Math.round((this.y + (y * map.spriteSize)) / map.spriteSize);
        if (!map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * map.spriteSize, y == 0 ? y + this.wave : map.spriteSize,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
        }
        if (y + 1 == Math.round(this.height / map.spriteSize) && !map.isSolid(PX, PY + 1)) {
          this.fall = true;
        }
      }
    }
    if (this.fall) {
      this.fall = false;
      this.y += 32;
    }
    ctx.globalAlpha = 1;
  };
  this.update = function () {
    if (this.onScreen()) {
      this.animate();
      if (this.animFrame == 5)
        this.wave += this.direction == 1 ? 0.5 : -0.5;
      if (this.wave > 2 || this.wave < -2) this.direction = !this.direction;
      if (Game.Math.overlap(player, this)) {
        if (!player.input.up) player.force.y = +0.5;
        else if (player.force.y > 0 && player.y >= this.y - 16) player.force.y = -1.5;
        //if(player.y > this.y) player.kill = true;
      }
    }
  };
};
Water.prototype = Entity.prototype;
Water.prototype.constructor = Water;
//--------------------------------------------------------------------------
// Saw
//--------------------------------------------------------------------------
var Saw = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.maxSpeed = 1;
  this.speed = 0.1;
  this.damage = 100;
  this.solid = true;
  this.animation = {x: 0, y: 0, w: 48, h: 48, frames: 5, fps: 10, loop: true};
  this.collide = function (element) {
    if (element.damage > 0 && element.family != "enemies")
      this.hit(element.damage);
  };
  this.update = function () {
    if (this.onScreen())
      this.awake = true;
    if (this.awake && !this.dead) {
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (m.hole) {
        this.direction = !this.direction;
        this.force.x = 0;
      }
      if (!m.x) {
        this.direction = !this.direction;
      }
      this.animate();
    }
  }
};
Saw.prototype = Entity.prototype;
Saw.prototype.constructor = Saw;
//--------------------------------------------------------------------------
// GrenadesTrap
//--------------------------------------------------------------------------
var GrenadesTrap = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.visible = false;
  this.canShoot = true;
  this.shootDelay = 1000;
  this.shootTimeout = null;
  this.shoot = function () {
    elements.add(new Grenade({x: this.x + Math.random() * this.width, y: this.y}));
    this.shootTimeout = setTimeout(function (thisObj) {
      thisObj.canShoot = true;
    }, this.shootDelay, this);
    this.canShoot = false;
  };
  this.update = function () {
    if (this.onScreen()) {
      if (this.canShoot) {
        this.shoot();
      }
    }
  };
};
GrenadesTrap.prototype = Entity.prototype;
GrenadesTrap.prototype.constructor = GrenadesTrap;
//--------------------------------------------------------------------------
// Grenade
//--------------------------------------------------------------------------
var Grenade = function (obj) {
  Entity.apply(this, arguments);
  this.family = "bullets"
  this.type = "stone";
  this.width = 4;
  this.height = 4;
  this.damage = 10;
  this.speed = Math.random() * 3 + Math.abs(player.force.x);
  this.maxSpeed = 10;
  this.direction = Math.round(Math.random() * 2);
  this.force = {x: 0, y: 0};
  this.collide = function (element) {
    if (element.solid) {
      this.dead = true;
      GrenadeExplosion(this.x, this.y);
    }
  }
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      this.force.x = this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x) {
        this.direction = !this.direction;
        this.force.x *= -0.6;
        this.speed -= 1;
      }
      if (!m.y) this.speed -= 0.5;
      if (this.speed < 1) {
        this.dead = true;
        GrenadeExplosion(this.x, this.y);
      }
    }
  }
};
Grenade.prototype = Entity.prototype;
Grenade.prototype.constructor = Grenade;
//--------------------------------------------------------------------------
// Spear
//--------------------------------------------------------------------------
var Spear = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.damage = 20;
  this.maxHeight = map.spriteSize * 2;
  this.animation = {x: 0, y: 0, w: this.width, h: this.height, frames: 4, fps: 20, loop: true};
  this.draw = function (ctx, image) {
    //renderer.fontPrint(''+this.PlayerM.toFixed(2), this.x+camera.x, -20+this.y+camera.y);
    ctx.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), this.animation.y + this.animOffset,
      this.width, this.height,
      Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.width, this.height);
  };
  this.update = function () {
    if (this.onScreen()) {
      this.seesPlayer();
      if ((this.animFrame == 0 && Math.round(Math.random() * 20) == 0) || this.animFrame > 0) this.animate();
      if (this.PlayerM >= 0 && this.PlayerM < 4 && player.x >= this.x - player.width - map.spriteSize && player.x <= this.x + this.width + map.spriteSize) {
        if (this.height < this.maxHeight) {
          this.y -= 2;
          this.height += 2;
        }
      } else if (this.height > 8) {
        this.y += 1;
        this.height -= 1;
      }

    }
  };
};
Spear.prototype = Entity.prototype;
Spear.prototype.constructor = Spear;

//--------------------------------------------------------------------------
// Lava
//--------------------------------------------------------------------------
var Lava = function () {
  Entity.apply(this, arguments);
  this.family = "traps";
  this.damage = 1000;
  this.canShoot = true;
  this.shootDelay = 1000;
  this.shootTimeout = null;
  this.animation = {x: 0, y: 0, w: map.spriteSize, h: map.spriteSize, frames: 4, fps: 5, loop: true};
  this.draw = function (ctx, image) {
    for (var y = 0; y < Math.round(this.height / map.spriteSize); y++) {
      for (var x = 0; x < Math.round(this.width / map.spriteSize); x++) {
        var PX = Math.round((this.x + (x * map.spriteSize)) / map.spriteSize),
          PY = Math.round((this.y + (y * map.spriteSize)) / map.spriteSize);
        if (!map.isSolid(PX, PY)) {
          ctx.drawImage(image,
            this.animFrame * map.spriteSize, y == 0 ? y : map.spriteSize,
            map.spriteSize, map.spriteSize,
            Math.floor(this.x + camera.x) + (x * map.spriteSize), Math.floor(this.y + camera.y) + (y * map.spriteSize),
            map.spriteSize, map.spriteSize
          );
        }
      }
    }
  };
  this.shoot = function () {
    elements.add(new LavaStone({x: this.x + Math.random() * this.width, y: this.y}, 0));
    this.shootTimeout = setTimeout(function (thisObj) {
      thisObj.canShoot = true;
    }, this.shootDelay, this);
    this.canShoot = false;
  };
  this.update = function () {
    if (this.onScreen()) {
      if (this.canShoot) {
        this.shoot();
      }
      this.animate();
    }
  };
};
Lava.prototype = Entity.prototype;
Lava.prototype.constructor = Lava;
//--------------------------------------------------------------------------
// Lava stone
//--------------------------------------------------------------------------
var LavaStone = function (obj, dir) {
  Entity.apply(this, arguments);
  this.type = "lava_bullet";
  this.family = "traps";
  this.damage = 100;
  this.width = 4;
  this.height = 4;
  this.speed = 2;
  this.maxSpeed = 2;
  this.damage = 20;
  this.direction = Math.round(Math.random() * 2);
  this.force = {x: 0, y: -4 - Math.random() * 4};
  this.color = "rgb(200,100,0)";
  this.draw = function (ctx, image) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + camera.x, this.y + camera.y, this.width, this.height);
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      this.force.x += this.direction > 0 ? this.speed : -this.speed;
      var m = this.move();
      if (!m.x || !m.y) this.dead = true;
      if (this.dead)
        ShootExplosion(this.x, this.y, this.color);
    }
  }
};
LavaStone.prototype = Entity.prototype;
LavaStone.prototype.constructor = LavaStone;
//--------------------------------------------------------------------------
// Explosions
//--------------------------------------------------------------------------
var Explosion = function () {
  Entity.apply(this, arguments);
  this.family = "traps"
  this.type = "explosion1";
  this.width = 32;
  this.height = 60;
  this.damage = 2;
  this.animation = {x: 0, y: 0, w: 32, h: 60, frames: 15, fps: 30, loop: true};
  this.vectorMask = [
    new V(0, 0),
    new V(this.width, 0),
    new V(this.width, this.height),
    new V(0, this.height)
  ];
  this.update = function () {
    if (this.onScreen()) this.awake = true;
    if (this.awake && !this.dead) this.animate();
    if (this.animFrame > 5) this.damage = 0;
    if (this.animFrame == this.animation.frames - 1) this.dead = true;
  }
};
Explosion.prototype = Entity.prototype;
Explosion.prototype.constructor = Explosion;
//--------------------------------------------------------------------------
var Explosion2 = function () {
  Entity.apply(this, arguments);
  this.family = "traps"
  this.type = "explosion2";
  this.width = 48;
  this.height = 112;
  this.damage = 5;
  this.animation = {x: 0, y: 0, w: 48, h: 112, frames: 21, fps: 30, loop: true};
  this.vectorMask = [
    new V(0, 0),
    new V(this.width, 0),
    new V(this.width, this.height),
    new V(0, this.height)
  ];
  this.update = function () {
    if (this.onScreen()) this.awake = true;
    if (this.awake && !this.dead) this.animate();
    if (this.animFrame > 5) this.damage = 0;
    if (this.animFrame == this.animation.frames - 1) this.dead = true;
  }
};
Explosion2.prototype = Entity.prototype;
Explosion2.prototype.constructor = Explosion2;
//==========================================================================
// Particles
//--------------------------------------------------------------------------
var Particle = function () {
  Entity.apply(this, arguments);
  this.family = "particles";
  this.life = Math.random() * 30 + 30;
  //this.speed    = Math.random() * 2;
  this.maxSpeed = 0.5 + Math.random() * 1;
  this.dead = false;
  switch (this.type) {
    case "shoot_particle":
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
      }
      break;
  }
  ;
  this.overlapTest = function (obj) {
    if (!this.dead && Game.Math.overlap(this, obj)) {
      this.collide(obj);
      obj.collide(this);
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      var m = this.move();
      if (!m.y || !m.x) {
        this.force.y *= -0.8;
        this.force.x *= 0.9;
      }
      this.life--;
    }
    if (this.life < 0) this.dead = true;
  };
  this.draw = function (ctx, image) {
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.rect(this.x + camera.x, this.y + camera.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
  };
}
Particle.prototype = Entity.prototype;
Particle.prototype.constructor = Particle;
//--------------------------------------------------------------------------
function ShootExplosion(x, y, color) {
  var particle_count = 5 + parseInt(Math.random() * 5);
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random() * 1);
    elements.add(new Particle({
      "x": x,
      "y": y,
      "width": r,
      "height": r,
      type: "shoot_particle",
      "properties": {"color": color}
    }));
  }
}
function GrenadeExplosion(x, y) {
  var particle_count = 10 + parseInt(Math.random() * 5);
  elements.add(new Explosion({"x": x - 16, "y": y - 58}));
  camera.shake();
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random() * 1);
    elements.add(new Particle({
      "x": x,
      "y": y,
      "width": r,
      "height": r,
      type: "shoot_particle",
      "properties": {"color": "rgb(100,100,100)"}
    }));
  }
}
function Explosion1(x, y) {
  var particle_count = 5 + parseInt(Math.random() * 10);
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random() * 2);
    elements.add(new Particle({
      "x": x + 8,
      "y": y,
      "width": r,
      "height": r,
      type: "arc_particle",
      "properties": {"color": "rgb(255,100,100)"}
    }));
  }
}
