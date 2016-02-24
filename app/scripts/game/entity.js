//==========================================================================
// ACTIVE ELEMENT PROTOTYPE
//--------------------------------------------------------------------------
class Entity
{
  constructor (obj) {
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
    this.DIR = { UP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3},
    this.vectorMask = [
      new SAT.Vector(0, 0),
      new SAT.Vector(this.width, 0),
      new SAT.Vector(this.width, this.height),
      new SAT.Vector(0, this.height)
    ];
    //Dom.on(this, 'click', function(ev) { console.log(this);  }, false);
  }
  //----------------------------------------------------------------------
  draw(ctx, image) {
    if (this.shadowCaster && Game.renderer.dynamicLights) {
      Game.renderer.lightmask.push(new illuminated.RectangleObject({
        topleft: new illuminated.Vec2(this.x + Game.camera.x, this.y + Game.camera.y),
        bottomright: new illuminated.Vec2(this.x + this.width + Game.camera.x, this.y + this.height + Game.camera.y)
      }));
    }
    if (this.animation) {
      ctx.drawImage(image,
        this.animation.x + (this.animFrame * this.animation.w), this.animation.y + this.animOffset,
        this.animation.w, this.animation.h,
        Math.floor(this.x + Game.camera.x), Math.floor(this.y + Game.camera.y),
        this.animation.w, this.animation.h
      );
    }
    else {
      ctx.drawImage(image,
        this.animFrame * this.width, 0, this.width, this.height,
        Math.floor(this.x + Game.camera.x), Math.floor(this.y + Game.camera.y),
        this.width, this.height
      );
    }
  }
  //----------------------------------------------------------------------
  update() {

  }
  //----------------------------------------------------------------------
  render(ctx, image) {
    if (this.visible && this.onScreen()) {
      this.draw(ctx, image);
    }
  }
  //----------------------------------------------------------------------
  getMask() {
    return new SAT.Polygon(new SAT.Vector(this.x, this.y), this.vectorMask);
  }
  //----------------------------------------------------------------------
  overlapTest(obj) {
    if (!this.dead && Game.m.overlap(this, obj) && (this.onScreen() || this.awake)) {
      // poligon collision checking
      if (SAT.testPolygonPolygon(this.getMask(), obj.getMask())) {
        this.collide(obj);
        obj.collide(this);
      }
    }
  }
  //----------------------------------------------------------------------
  collide(element) {
    //console.log("Object "+element.type+" collide with "+this.type);
  }
  //----------------------------------------------------------------------
  onScreen() {
    return this.x + this.width + Game.map.spriteSize > -Game.camera.x &&
      this.x - Game.map.spriteSize < -Game.camera.x + Game.resolution.x &&
      this.y - Game.map.spriteSize < -Game.camera.y + Game.resolution.y &&
      this.y + this.height + Game.map.spriteSize > -Game.camera.y;
  }
  //----------------------------------------------------------------------
  hit(s) {
    if (this.family === "enemies") {
      this.force.x += -(this.force.x * 4);
      this.force.y = -2;
      this.energy -= s;
      if (this.energy <= 0) {
        //Sound.dead1.play();
        Explosion1(this.x, this.y);
        this.dead = true;
        Game.elements.add('coin', {x: this.x + 8, y: this.y});
      }
    }
  }
  //----------------------------------------------------------------------
  seesPlayer() {
    this.PlayerM = ((Game.player.y + Game.player.height) - (this.y + this.height)) / (Game.player.x - this.x);
    if (!Game.player.canHurt) {
      return false;
    }
    if (this.PlayerM > -0.15 && this.PlayerM < 0.15) {
      var steps = Math.abs(Math.floor(Game.player.x / Game.map.spriteSize) - Math.floor(this.x / Game.map.spriteSize)),
        from = Game.player.x < this.x ? Math.floor(Game.player.x / Game.map.spriteSize) : Math.floor(this.x / Game.map.spriteSize);
      for (var X = from; X < from + steps; X++) {
        if (Game.map.isSolid(X, Math.round(this.y / Game.map.spriteSize))) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  //----------------------------------------------------------------------
  animate(animation) {
    var entity = this;
    animation = animation || entity.animation;
    entity.animFrame = entity.animFrame || 0;
    entity.animCount = entity.animCount || 0;
    if (entity.animation !== animation) {
      entity.animation = animation;
      entity.animFrame = 0;
      entity.animCount = 0;
    }
    else if (++(entity.animCount) === Math.round(Game.fps / animation.fps)) {
      if (entity.animFrame <= entity.animation.frames && animation.loop) {
        entity.animFrame = Game.m.normalize(entity.animFrame + 1, 0, entity.animation.frames);
      }
      entity.animCount = 0;
    }
  }
  //----------------------------------------------------------------------
  move() {
    if (this.force.x > this.maxSpeed) {
      this.force.x = this.maxSpeed;
    }
    if (this.force.x < -this.maxSpeed) {
      this.force.x = -this.maxSpeed;
    }

    this.expectedX = this.x + this.force.x;
    this.expectedY = this.y + this.force.y;

    var PX = Math.floor(this.expectedX / Game.map.spriteSize),
        PY = Math.floor(this.expectedY / Game.map.spriteSize),
        PW = Math.floor((this.expectedX + this.width) / Game.map.spriteSize),
        PH = Math.floor((this.expectedY + this.height) / Game.map.spriteSize),
        nearMatrix = [];

    for (var y = PY; y <= PH; y++){
      for (var x = PX; x <= PW; x++){
        nearMatrix.push(Game.map.tileData(x, y));
      }
    }

    // dla x-a
    for (var i = 0; i < nearMatrix.length; i++) {
      var c1 = {x: this.x + this.force.x, y: this.y, width: this.width, height: this.height};
      if (nearMatrix[i].solid && Game.m.overlap(c1, nearMatrix[i])) {
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
      if (nearMatrix[j].solid && Game.m.overlap(c2, nearMatrix[j])) {
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
    this.onLeftEdge = !Game.map.isSolid(PX, PH);
    this.onRightEdge = !Game.map.isSolid(PW, PH);

    //return {x: expectedX === this.x, y: expectedY === this.y};
  }
}
