//==========================================================================
// ACTIVE ELEMENT PROTOTYPE
//--------------------------------------------------------------------------
var Entity = Class.create({
  initialize: function (obj) {
    this.PlayerM = 0;
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width;
    this.height = obj.height;
    this.type = obj.type;
    this.properties = obj.properties;
    this.direction = obj.direction;
    this.family = 'elements';
    this.force = {x: 0, y: 0};
    this.speed = 0;
    this.maxSpeed = 1;
    this.energy = 0;
    this.maxEnergy = 0;
    this.doJump = false;
    this.canShoot = false;
    this.canJump = false;
    this.awake = false;
    this.dead = false;
    this.fall = false;
    this.onFloor = false;
    this.solid = false;
    this.shadowCaster = false;
    this.visible = true;
    this.animation = null;
    this.animOffset = 0;
    this.animFrame = 0;
    this.animCount = 0;
    this.vectorMask = [
      new V(0, 0),
      new V(this.width, 0),
      new V(this.width, this.height),
      new V(0, this.height)
    ];

    //Dom.on(this, 'click', function(ev) { console.log(this);  }, false);
  },
  //----------------------------------------------------------------------
  draw: function (ctx, image) {
    if (this.shadowCaster && renderer.dynamicLights) {
      renderer.lightmask.push(new RectangleObject({
        topleft: new Vec2(this.x + camera.x, this.y + camera.y),
        bottomright: new Vec2(this.x + this.width + camera.x, this.y + this.height + camera.y)
      }));
    }
    if (this.animation) {
      ctx.drawImage(image,
        this.animation.x + (this.animFrame * this.animation.w), this.animation.y + this.animOffset,
        this.animation.w, this.animation.h,
        Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.animation.w, this.animation.h);
    }
    else {
      console.log(image);
      ctx.drawImage(image,
        this.animFrame * this.width, 0, this.width, this.height,
        Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.width, this.height);
    }
  },
  //----------------------------------------------------------------------
  update: function () {

  },
  //----------------------------------------------------------------------
  render: function (ctx, image) {
    if (this.visible && this.onScreen()) {
      this.draw(ctx, image);
    }
  },
  //----------------------------------------------------------------------
  getMask: function () {
    return new P(new V(this.x, this.y), this.vectorMask);
  },
  //----------------------------------------------------------------------
  overlapTest: function (obj) {
    if (!this.dead && Game.Math.overlap(this, obj) && (this.onScreen() || this.awake)) {
      // poligon collision checking
      if (SAT.testPolygonPolygon(this.getMask(), obj.getMask())) {
        this.collide(obj);
        obj.collide(this);
      }
    }
  },
  //----------------------------------------------------------------------
  collide: function (element) {
    //console.log("Object "+element.type+" collide with "+this.type);
  },
  //----------------------------------------------------------------------
  onScreen: function () {
    return this.x + this.width + map.spriteSize > -camera.x &&
      this.x - map.spriteSize < -camera.x + ResolutionX &&
      this.y - map.spriteSize < -camera.y + ResolutionY &&
      this.y + this.height + map.spriteSize > -camera.y;
  },
  //----------------------------------------------------------------------
  hit: function (s) {
    if (this.family === "enemies") {
      this.force.x += -(this.force.x * 4);
      this.force.y = -2;
      this.energy -= s;
      if (this.energy <= 0) {
        //Sound.dead1.play();
        Explosion1(this.x, this.y);
        this.dead = true;
        elements.add('coin', {x: this.x + 8, y: this.y});
      }
    }
  },
  //----------------------------------------------------------------------
  seesPlayer: function () {
    this.PlayerM = ((player.y + player.height) - (this.y + this.height)) / (player.x - this.x);
    if (!player.canHurt) {
      return false;
    }
    if (this.PlayerM > -0.15 && this.PlayerM < 0.15) {
      var steps = Math.abs(Math.floor(player.x / map.spriteSize) - Math.floor(this.x / map.spriteSize)),
        from = player.x < this.x ? Math.floor(player.x / map.spriteSize) : Math.floor(this.x / map.spriteSize);
      for (var X = from; X < from + steps; X++) {
        if (map.isSolid(X, Math.round(this.y / map.spriteSize))) {
          return false;
        }
      }
      return true;
    }
    return false;
  },
  //----------------------------------------------------------------------
  animate: function (animation) {
    var entity = this;
    animation = animation || entity.animation;
    entity.animFrame = entity.animFrame || 0;
    entity.animCount = entity.animCount || 0;
    if (entity.animation !== animation) {
      entity.animation = animation;
      entity.animFrame = 0;
      entity.animCount = 0;
    }
    else if (++(entity.animCount) === Math.round(FPS / animation.fps)) {
      if (entity.animFrame <= entity.animation.frames && animation.loop) {
        entity.animFrame = Game.Math.normalize(entity.animFrame + 1, 0, entity.animation.frames);
      }
      entity.animCount = 0;
    }
  },
  //----------------------------------------------------------------------
  move: function () {
    if (this.force.x > this.maxSpeed) {
      this.force.x = this.maxSpeed;
    }
    if (this.force.x < -this.maxSpeed) {
      this.force.x = -this.maxSpeed;
    }

    this.expectedX = this.x + this.force.x;
    this.expectedY = this.y + this.force.y;

    var PX = Math.floor(this.expectedX / map.spriteSize),
        PY = Math.floor(this.expectedY / map.spriteSize),
        PW = Math.floor((this.expectedX + this.width) / map.spriteSize),
        PH = Math.floor((this.expectedY + this.height) / map.spriteSize),
        nearMatrix = [];

    for (var x = PX; x <= PW; x++){
      for (var y = PY; y <= PH; y++){
        nearMatrix.push(map.tileData(x, y));
      }
    }

    // dla x-a
    for (var i = 0; i < nearMatrix.length; i++) {
      var c1 = {x: this.x + this.force.x, y: this.y, width: this.width, height: this.height};
      if (nearMatrix[i].solid && Game.Math.overlap(c1, nearMatrix[i])) {
        if (this.force.x < 0) {
          this.force.x = nearMatrix[i].x + nearMatrix[i].width - this.x;
        }
        else if (this.force.x > 0) {
          this.force.x = nearMatrix[i].x - this.x - this.width;
        }
      }
    }
    //(SAT.testPolygonPolygon(this.getMask(), obj.getMask()))
    this.x += this.force.x;
    for (var j = 0; j < nearMatrix.length; j++) {
      var c2 = {x: this.x, y: this.y + this.force.y, width: this.width, height: this.height};
      if (nearMatrix[j].solid && Game.Math.overlap(c2, nearMatrix[j])) {
        if (this.force.y < 0) {
          this.force.y = nearMatrix[j].y + nearMatrix[j].height - this.y;
        }
        else if (this.force.y > 0) {
          this.force.y = nearMatrix[j].y - this.y - this.height;
        }
      }
    }
    this.y += this.force.y;
    this.onFloor = this.expectedY > this.y;
    this.onLeftEdge = !map.isSolid(PX, PH);
    this.onRightEdge = !map.isSolid(PW, PH);

    //return {x: expectedX === this.x, y: expectedY === this.y};
  }
});
