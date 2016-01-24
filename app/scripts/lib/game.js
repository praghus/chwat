//=========================================================================
// VRIL
//-------------------------------------------------------------------------
'use strict';

//-------------------------------------------------------------------------
// POLYFILLS
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//-------------------------------------------------------------------------
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    }
}
//-------------------------------------------------------------------------
// SIMPLE CLASS CREATION
//-------------------------------------------------------------------------
var Class = {
  create: function (prototype) { // create a simple javascript 'class' (a constructor function with a prototype)
    var ctor = function () {
      if (this.initialize) return this.initialize.apply(this, arguments);
    };
    ctor.prototype = prototype || {}; // instance methods
    return ctor;
  }
}
//-------------------------------------------------------------------------
// SIMPLE DOM UTILITIES
//-------------------------------------------------------------------------
var Dom = {
  get: function (id) {
    return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id);
  },
  set: function (id, html) {
    Dom.get(id).innerHTML = html;
  },
  on: function (ele, type, fn, capture) {
    Dom.get(ele).addEventListener(type, fn, capture);
  },
  un: function (ele, type, fn, capture) {
    Dom.get(ele).removeEventListener(type, fn, capture);
  },
  show: function (ele, type) {
    Dom.get(ele).style.display = (type || 'block');
  }
}
//-------------------------------------------------------------------------
// SAT
//-------------------------------------------------------------------------
var V = SAT.Vector, P = SAT.Polygon;
//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------
var Game = {
  run: function (options) {
    var now,
      dt = 0,
      last = Game.Math.timestamp(),
      step = 1 / options.fps,
      update = options.update,
      render = options.render,
      fpsmeter = new FPSMeter(options.fpsmeter || {decimals: 0, graph: true, theme: 'dark', left: '5px'});

    function frame() {
      fpsmeter.tickStart();
      now = Game.Math.timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while (dt > step) {
        dt = dt - step;
        update(step);
      }
      render(dt);
      last = now;
      fpsmeter.tick();
      requestAnimationFrame(frame, options.canvas);
    }

    frame();
  },
  animate: function (fps, entity, animation) {
    animation = animation || entity.animation;
    entity.animFrame = entity.animFrame || 0;
    entity.animCount = entity.animCount || 0;
    if (entity.animation != animation) {
      entity.animation = animation;
      entity.animFrame = 0;
      entity.animCount = 0;
    }
    else if (++(entity.animCount) == Math.round(fps / animation.fps)) {
      if (entity.animFrame <= entity.animation.frames && animation.loop)
        entity.animFrame = Game.Math.normalize(entity.animFrame + 1, 0, entity.animation.frames);
      entity.animCount = 0;
    }
  }
};
//-------------------------------------------------------------------------
// CANVAS UTILITIES
//-------------------------------------------------------------------------
Game.Canvas = {
  create: function (width, height) {
    return this.init(document.createElement('canvas'), width, height);
  },
  init: function (canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
  render: function (width, height, render, canvas) { // http://kaioa.com/node/103
    canvas = canvas || this.create(width, height);
    render(canvas.getContext('2d'), width, height);
    return canvas;
  }
};
//-------------------------------------------------------------------------
// ASSET LOADING UTILITIES
//-------------------------------------------------------------------------
Game.Load = {
  images: function (names, callback) {
    var n, name,
      result = {},
      count = names.length,
      onload = function () {
        if (--count == 0) callback(result);
      };
    for (n = 0; n < names.length; n++) {
      name = names[n];
      result[name] = document.createElement('img');
      Dom.on(result[name], 'load', onload);
      result[name].src = "assets/" + name + ".png";
    }
  },
  json: function (url, onsuccess) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if ((request.readyState == 4) && (request.status == 200))
        onsuccess(JSON.parse(request.responseText));
    }
    request.open("GET", url + ".json", true);
    request.send();
  }
};
//-------------------------------------------------------------------------
// MATH UTILITIES
//-------------------------------------------------------------------------
Game.Math = {
  lerp: function (n, dn, dt) {
    return n + (dn * dt);
  },
  timestamp: function () {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  },
  bound: function (x, min, max) {
    return Math.max(min, Math.min(max, x));
  },
  between: function (n, min, max) {
    return ((n >= min) && (n <= max));
  },
  brighten: function (hex, percent) {
    var a = Math.round(255 * percent / 100),
      r = a + parseInt(hex.substr(1, 2), 16),
      g = a + parseInt(hex.substr(3, 2), 16),
      b = a + parseInt(hex.substr(5, 2), 16);

    r = r < 255 ? (r < 1 ? 0 : r) : 255;
    g = g < 255 ? (g < 1 ? 0 : g) : 255;
    b = b < 255 ? (b < 1 ? 0 : b) : 255;

    return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
  },
  darken: function (hex, percent) {
    return this.brighten(hex, -percent);
  },
  normalize: function (n, min, max) {
    while (n < min)
      n += (max - min);
    while (n >= max)
      n -= (max - min);
    return n;
  },
  rgbToHex: function (r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  },
  overlap: function (a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  },
  normalizeAngle180: function (angle) {
    return this.normalize(angle, -180, 180);
  },
  normalizeAngle360: function (angle) {
    return this.normalize(angle, 0, 360);
  },
  random: function (min, max) {
    return (min + (Math.random() * (max - min)));
  },
  randomInt: function (min, max) {
    return Math.round(this.random(min, max));
  },
  randomChoice: function (choices) {
    return choices[this.randomInt(0, choices.length - 1)];
  }
};

//==========================================================================
// Map
//--------------------------------------------------------------------------
var Map = Class.create({
  initialize: function (level) {
    this.width = parseInt(level.width);
    this.height = parseInt(level.height);
    this.gravity = 0.3;//20 * 9.8 * 4;  //parseInt(level.properties.Gravity);
    this.surface = parseInt(level.properties.SurfaceLevel);
    this.name = level.properties.Title;
    this.spriteSize = 16;
    this.spriteCols = 32;
    this.data = {back: [], ground: [], mask: [], fore: [], fore2: []}
    for (var i = 0; i < this.width; i++) {
      this.data.back[i] = new Array(this.height);
      this.data.ground[i] = new Array(this.height);
      this.data.mask[i] = new Array(this.height);
      this.data.fore[i] = new Array(this.height);
      this.data.fore2[i] = new Array(this.height);
    }
    var j = 0,
      backData = level.layers[1].data,
      mainData = level.layers[2].data,
      foreData = level.layers[4].data,
      fore2Data = level.layers[5].data;

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        this.data.ground[x][y] = mainData[j];
        this.data.back[x][y] = backData[j];
        this.data.fore[x][y] = foreData[j];
        this.data.fore2[x][y] = fore2Data[j];
        this.data.mask[x][y] = 0;
        j++;
      }
    }
  },
  //----------------------------------------------------------------------
  get: function (_l, _x, _y) {
    if (_x < 0 || _y < 0 || _x > this.width || _y > this.height) return false;
    else return this.data[_l][_x][_y];
  },
  //----------------------------------------------------------------------
  tileData: function (_x, _y) {
    if (_x < 0 || _y < 0 || _x > this.width - 1 || _y > this.height - 1) return false;
    else return {
      x: _x * this.spriteSize, y: _y * this.spriteSize,
      width: this.spriteSize, height: this.spriteSize,
      type: this.data.ground[_x][_y], solid: this.isSolid(_x, _y)
    };
  },
  //----------------------------------------------------------------------
  isSolid: function (_x, _y) {
    if (_x >= 0 && _x < this.data.ground.length &&
      _y >= 0 && _y < this.data.ground[_x].length)
      return this.data.ground[_x][_y] > 32 * 8;
    else
      return true;
  },
  //----------------------------------------------------------------------
  isShadowCaster: function (_x, _y) {
    if (_x >= 0 && _x < this.data.ground.length &&
      _y >= 0 && _y < this.data.ground[_x].length)
      return this.data.ground[_x][_y] > 32 * 8 || this.data.ground[_x][_y] == 1;
    else
      return false;
  },
  //----------------------------------------------------------------------
  addMask: function (obj) {
    var x = Math.round(obj.x / map.spriteSize) - 1,
      y = Math.round(obj.y / map.spriteSize) - 1,
      w = Math.round(obj.width / map.spriteSize) + 2,
      h = Math.round(obj.height / map.spriteSize) + 2;
    for (var _y = y; _y < y + h; _y++) {
      for (var _x = x; _x < x + w; _x++) {
        this.data.mask[_x][_y] = 1;
      }
    }
  }
});
//==========================================================================
// Camera
//--------------------------------------------------------------------------
var Camera = Class.create({
  initialize: function () {
    this.x = 0;
    this.y = 0;
    this.underground = false;
    this.rector = 2;
    this.a = 1;
  },
  //----------------------------------------------------------------------
  update: function (dt) {
    if ((player.x + this.x > ResolutionX / 2 && player.force.x > 0) ||
      (player.x + this.x < ResolutionX / 2 && player.force.x < 0))
      this.x -= Math.floor(player.force.x);
    /*else if (player.force.x==0){
     this.x = -(player.x - (ResolutionX / 2));
     /*if (player.x + this.x > ResolutionX / 2) this.x -= 5;
     if (player.x + this.x < ResolutionX / 2) this.x += 5;*/
    //}
    if (this.x > 0) this.x = 0;
    if (this.x - ResolutionX < -map.width * map.spriteSize) this.x = (-map.width * map.spriteSize) + ResolutionX;

    this.y = -((player.y + player.height) - (ResolutionY / 2));

    if (this.y > 0) this.y = 0;
    if (this.y < -map.height * map.spriteSize) this.y = (-map.height * map.spriteSize) / 2;
    // above surface

    if (Math.round((player.y + (player.height / 2)) / map.spriteSize) < map.surface) {
      this.underground = false;
      if ((this.y - ResolutionY) < -map.surface * map.spriteSize)
        this.y = (-map.surface * map.spriteSize) + ResolutionY;
    } else {
      // under surface
      this.underground = true;
      if ((this.y) >= -map.surface * map.spriteSize)
        this.y = (-map.surface * map.spriteSize);
    }
    // shake
    if (this.rector != 2) {
      if (this.a == 1) camera.y = camera.y + this.rector;
      else if (this.a == 2) camera.x = camera.x + this.rector;
      else if (this.a == 3) camera.y = camera.y - this.rector;
      else camera.x = camera.x - this.rector;
      this.a < 4 ? this.a++ : this.a = 1;
    }
  },
  //----------------------------------------------------------------------
  center: function () {
    this.x = -(player.x - (ResolutionX / 2));
    this.y = -((player.y + player.height) - (ResolutionY / 2));
  },
  //----------------------------------------------------------------------
  shake: function () {
    if (this.rector < 0) {
      this.rector = 2;
      return;
    }
    this.rector -= .2;
    setTimeout(function (thisObj) {
      thisObj.shake()
    }, 50, this);
  }
});
//==========================================================================
// RENDERER
//--------------------------------------------------------------------------
var Renderer = Class.create({
  initialize: function (images) {
    this.dynamicLights = UseDynamicLights;
    this.lightSpots = [];
    this.images = images;
    this.message = {dispCount: 0, dispIter: 0, txt: ''};
    this.lightmask = [];
    this.canvas = document.getElementById('canvas');//Game.Canvas.init(Dom.get('canvas'), ResolutionX, ResolutionY);
    this.ctx = this.canvas.getContext('2d');//this.canvas.getContext('2d');
  },
  //-----------------------------------------------------------------------
  msg: function (txt, iter) {
    this.message = {dispCount: 0, dispIter: iter, txt: txt};
  },
  //----------------------------------------------------------------------
  fontPrint: function (FontText, FontX, FontY) {
    FontText = FontText.toUpperCase();
    if (FontX == -1) FontX = (ResolutionX - FontText.length * 8) / 2;
    if (FontY == -1) FontY = (ResolutionY - 8) / 2;
    for (var i = 0; i < FontText.length; i++) {
      var chr = FontText.charCodeAt(i);
      this.ctx.drawImage(this.images.font, ((chr) % 16) * 16, Math.ceil(((chr + 1) / 16) - 1) * 16, 16, 16, FontX + (i * 8), FontY, 8, 8);
    }
  },
  //----------------------------------------------------------------------
  render: function (dt) {
    //this.ctx.mozImageSmoothingEnabled = false;
    //this.ctx.webkitImageSmoothingEnabled = false;
    //this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.lightmask = [];
    this.ctx.save();
    this.ctx.scale(this.scaleX, this.scaleY);
    this.ctx.clearRect(0, 0, ResolutionX, ResolutionY);
    this.renderBack(this.ctx);
    this.renderGround(this.ctx);
    this.renderPlayer(this.ctx);
    this.renderElements(this.ctx);
    this.renderForeGround(this.ctx);
    if (camera.underground || player.inDark > 0)
      this.renderLightingEffect(this.ctx);

    this.renderForeGround2(this.ctx);
    if (BlackOverlay > 0) {
      this.ctx.globalAlpha = BlackOverlay;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(-1, -1, ResolutionX + 1, ResolutionY + 1);
      BlackOverlay -= 0.01;
      this.ctx.globalAlpha = 1;
    }
    if (this.message.dispCount < this.message.dispIter) {
      this.fontPrint(this.message.txt, -1, -1);
      this.message.dispCount++;
    }
    this.renderScore(this.ctx);
    this.ctx.restore();
  },
  //----------------------------------------------------------------------
  renderLightingEffect: function (ctx) {
    var all = elements.lights;
    all.forEach(function (Obj, i, all) {
      Obj.render(ctx, renderer.images[Obj.type]);
    });
    if (this.dynamicLights) {
      PlayerLight.position = new Vec2(player.x + 8 + camera.x, player.y + 16 + camera.y);
      var lighting = new Lighting({light: PlayerLight, objects: this.lightmask});
      var darkmask = new DarkMask({lights: [PlayerLight]});
      lighting.compute(ResolutionX, ResolutionY);
      darkmask.compute(ResolutionX, ResolutionY);
      ctx.globalCompositeOperation = "lighter";
      lighting.render(ctx);
      ctx.globalCompositeOperation = "source-over";
      darkmask.render(ctx);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(
        this.images.light,
        -320 + Math.floor(player.x + (player.width / 2) + camera.x),
        -320 + Math.floor(player.y + (player.height / 2) + camera.y) - (player.height / 2)
      );
    }

  },
  //----------------------------------------------------------------------
  renderBack: function (ctx) {
    if (!camera.underground) {
      ctx.fillStyle = '#73C3FF';
      ctx.fillRect(0, 0, ResolutionX, ResolutionY);
      ctx.drawImage(this.images.bg2, (camera.x / 15), 275 + (camera.y / 2));
      ctx.drawImage(this.images.bg3, (camera.x / 10), 100 + (camera.y / 2));
      ctx.drawImage(this.images.bg4, -50 + (camera.x / 5), 16 + (camera.y / 2));
    } else {
      ctx.clearRect(0, 0, ResolutionX, ResolutionY);
    }
  },
  //----------------------------------------------------------------------
  renderGround: function (ctx) {
    var y = Math.floor(camera.y % map.spriteSize), _y = Math.floor(-camera.y / map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(camera.x % map.spriteSize), _x = Math.floor(-camera.x / map.spriteSize);
      while (x < ResolutionX) {
        var tile = map.data.ground[_x][_y], back = map.data.back[_x][_y];
        if (tile > 1 || back > 1) {
          // dynamic lights
          if (tile > 256 && this.dynamicLights)
            this.lightmask.push(new RectangleObject({
              topleft: new Vec2(x, y),
              bottomright: new Vec2(x + map.spriteSize, y + map.spriteSize)
            }));
          if (back > 1)
            ctx.drawImage(this.images.tiles, (((back - 1) % map.spriteCols )) * map.spriteSize, (Math.ceil(back / map.spriteCols) - 1) * map.spriteSize, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
          if (tile > 1)
            ctx.drawImage(this.images.tiles, (((tile - 1) % map.spriteCols )) * map.spriteSize, (Math.ceil(tile / map.spriteCols) - 1) * map.spriteSize, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
          // calculate shadow
          if (back > 1 && tile == 0) {
            var shadow = 0;
            if (_x > 0 && _y > 0 && map.isShadowCaster(_x - 1, _y) && map.isShadowCaster(_x - 1, _y - 1) && map.isShadowCaster(_x, _y - 1))
              shadow = 6;
            else if (_x > 0 && _y > 0 && map.isShadowCaster(_x - 1, _y - 1) && map.isShadowCaster(_x, _y - 1))
              shadow = 5;
            else if (_x > 0 && _y > 0 && map.isShadowCaster(_x - 1, _y) && map.isShadowCaster(_x - 1, _y - 1))
              shadow = 4;
            else if (_x > 0 && map.isShadowCaster(_x - 1, _y))
              shadow = 1;
            else if (_y > 0 && map.isShadowCaster(_x, _y - 1))
              shadow = 2;
            else if (_x > 0 && _y > 0 && map.isShadowCaster(_x - 1, _y - 1))
              shadow = 3;
            if (shadow > 0)
              ctx.drawImage(this.images.shadows, (shadow - 1) * map.spriteSize, 0, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
          }
        }
        x += map.spriteSize;
        _x++;
      }
      y += map.spriteSize;
      _y++;
    }
  },
  //----------------------------------------------------------------------
  renderForeGround: function (ctx) {
    var y = Math.floor(camera.y % map.spriteSize), _y = Math.floor(-camera.y / map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(camera.x % map.spriteSize), _x = Math.floor(-camera.x / map.spriteSize);
      while (x < ResolutionX) {
        var tile = map.data.fore[_x][_y], dark = map.data.mask[_x][_y];
        if (tile > 0)
          ctx.drawImage(this.images.tiles, (((tile - 1) % map.spriteCols )) * map.spriteSize, (Math.ceil(tile / map.spriteCols) - 1) * map.spriteSize, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
        if (dark == 0 && player.inDark > 0 && !camera.underground) {
          ctx.fillStyle = "black";
          ctx.fillRect(x, y, map.spriteSize, map.spriteSize);
        }
        x += map.spriteSize;
        _x++;
      }
      y += map.spriteSize;
      _y++;
    }
  },
  //----------------------------------------------------------------------
  renderForeGround2: function (ctx) {
    var y = Math.floor(camera.y % map.spriteSize), _y = Math.floor(-camera.y / map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(camera.x % map.spriteSize), _x = Math.floor(-camera.x / map.spriteSize);
      while (x < ResolutionX) {
        var tile = map.data.fore2[_x][_y];
        if (tile > 0)
          ctx.drawImage(this.images.tiles, (((tile - 1) % map.spriteCols )) * map.spriteSize, (Math.ceil(tile / map.spriteCols) - 1) * map.spriteSize, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
        x += map.spriteSize;
        _x++;
      }
      y += map.spriteSize;
      _y++;
    }
  },
  //----------------------------------------------------------------------
  renderPlayer: function (ctx) {
    player.render(ctx, this.images.player);
  },
  //----------------------------------------------------------------------
  renderElements: function (ctx) {
    var all = elements.all;
    all.forEach(function (Obj, i, all) {
      Obj.render(ctx, renderer.images[Obj.type]);
    });
  },
  //----------------------------------------------------------------------
  renderScore: function (ctx) {
    ctx.drawImage(this.images.live, 0, 10, Math.round(player.maxEnergy / 10) * 11, 10, 5, 5, Math.round(player.maxEnergy / 10) * 11, 10);
    ctx.drawImage(this.images.live, 0, 0, (player.energy / 10) * 11, 10, 5, 5, (player.energy / 10) * 11, 10);
    ctx.drawImage(this.images.coin, 0, 0, 8, 8, ResolutionX - 16, 7, 8, 8);
    ctx.drawImage(this.images.containers, 0, 0, 40, 20, ResolutionX - 45, ResolutionY - 25, 40, 20);
    var cc = '' + parseInt(player.coinCollect);
    this.fontPrint(cc, ResolutionX - (16 + (cc.length * 8)), 8);
    for (var i = 0; i < 2; i++) {
      var item = player.items[i];
      if (item && item.type == "item") {
        ctx.drawImage(this.images.item, parseInt(item.properties.frame) * item.width, 0, item.width, item.height, (ResolutionX - 43) + (i * 20), ResolutionY - 23, item.width, item.height);
      }
    }

  }
});
//==========================================================================
// GAME ELEMENTS
//--------------------------------------------------------------------------
var Elements = Class.create({
  initialize: function (level) {
    this.all = [];
    this.lights = [];
    this.createElements(level.layers[3].objects);
  },
  //----------------------------------------------------------------------
  update: function (dt) {
    var all = this.all;
    all.forEach(function (Obj, i, all) {
      if (Obj.dead) {
        elements.all[i] = elements.all[elements.all.length - 1];
        elements.all.length--;
      } else Obj.update();
    });
    for (var i = 0; i < all.length; i++) {
      all[i].overlapTest(player);
      for (var j = i + 1; j < all.length; j++) {
        all[i].overlapTest(all[j]);
      }
    }
  },
  //----------------------------------------------------------------------
  add: function (obj) {
    this.all.push(obj);
  },
  //----------------------------------------------------------------------
  createElements: function (source) {
    for (var i = 0; i < source.length; i++) {
      var obj = source[i];
      switch (obj.type) {
        case 'player':
          player = new Player(obj);
          break;
        case 'coin':
          this.all.push(new Coin(obj));
          break;
        case 'enemy_blob':
          this.all.push(new EnemyBlob(obj));
          break;
        case 'enemy_tank':
          this.all.push(new EnemyTank(obj));
          break;
        case 'phantom':
          this.all.push(new Phantom(obj));
          break;
        case 'gloom':
          this.all.push(new Gloom(obj));
          break;
        case 'ladder':
          this.all.push(new Ladder(obj));
          break;
        case 'item':
          this.all.push(new Item(obj));
          break;
        case 'slope_left':
          this.all.push(new SlopeLeft(obj));
          break;
        case 'slope_right':
          this.all.push(new SlopeRight(obj));
          break;
        case 'jump_through':
          this.all.push(new JumpThrough(obj));
          break;
        case 'paddle':
          this.all.push(new Paddle(obj));
          break;
        case 'rock':
          this.all.push(new Rock(obj));
          break;
        case 'crush':
          this.all.push(new Crush(obj));
          break;
        case 'crusher':
          this.all.push(new Crusher(obj));
          break;
        case 'trigger':
          this.all.push(new Trigger(obj));
          break;
        case 'grenades':
          this.all.push(new GrenadesTrap(obj));
          break;
        case 'spear':
          this.all.push(new Spear(obj));
          break;
        case 'saw':
          this.all.push(new Saw(obj));
          break;
        case 'dark_mask':
          this.all.push(new Dark(obj));
          map.addMask(obj);
          break;
        case 'water':
          this.all.push(new Water(obj));
          break;
        case 'lava':
          this.all.push(new Lava(obj));
          break;
        case 'torch':
          this.lights.push(new Torch(obj));
          break;
      }
    }
  }
});
//==========================================================================
// ACTIVE ELEMENT PROTOTYPE
//--------------------------------------------------------------------------
var ActiveElement = Class.create({
  initialize: function (obj) {
    this.PlayerM = 0;
    this.x = obj.x;
    this.y = obj.y;
    this.width = obj.width;
    this.height = obj.height;
    this.type = obj.type;
    this.properties = obj.properties;
    this.family = "elements";
    this.force = {x: 0, y: 0};
    this.direction = 0;
    this.speed = 0;
    this.maxSpeed = 0;
    this.energy = 0;
    this.maxEnergy = 0;
    this.jumpHold = 0;
    this.jumpDelay = 0;
    this.doJump = false;
    this.canShoot = false;
    this.canJump = false;
    this.awake = false;
    this.dead = false;
    this.fall = false;
    this.kill = false;
    this.onFloor = false;
    this.solid = false;
    this.shadowCaster = false
    this.visible = true;
    this.explode = null;
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
  },
  //----------------------------------------------------------------------
  draw: function (ctx, image) {
    // energy indicator
    if (this.energy > 0) {
      var p = (this.energy / this.maxEnergy);
      ctx.globalAlpha = .6;
      ctx.fillStyle = 'black';
      ctx.fillRect(-1 + this.x + camera.x, -11 + this.y + camera.y, this.width + 2, 3);
      ctx.fillStyle = p > .5 ? "rgb(165, 213, 255)" : "rgb(255,0,0)";
      ctx.fillRect(this.x + camera.x, -10 + this.y + camera.y, this.width * p, 1);
      ctx.globalAlpha = 1;
    }
    //renderer.fontPrint(''+this.PlayerM.toFixed(2), this.x+camera.x, -20+this.y+camera.y);
    if (this.shadowCaster && renderer.dynamicLights) {
      renderer.lightmask.push(new RectangleObject({
        topleft: new Vec2(this.x + camera.x, this.y + camera.y),
        bottomright: new Vec2(this.x + this.width + camera.x, this.y + this.height + camera.y)
      }));
    }
    if (this.animation) ctx.drawImage(image,
      this.animation.x + (this.animFrame * this.animation.w), this.animation.y + this.animOffset,
      this.animation.w, this.animation.h,
      Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.animation.w, this.animation.h);
    else ctx.drawImage(image,
      this.animFrame * this.width, 0, this.width, this.height,
      Math.floor(this.x + camera.x), Math.floor(this.y + camera.y), this.width, this.height);
  },
  //----------------------------------------------------------------------
  update: function () {

  },
  //----------------------------------------------------------------------
  render: function (ctx, image) {
    if (this.visible && this.onScreen()) this.draw(ctx, image);
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
    if (this.family == "enemies") {
      this.force.x += -(this.force.x * 4);
      this.force.y = -2;
      this.energy -= s;
      if (this.energy <= 0) {
        //Sound.dead1.play();
        Explosion1(this.x, this.y);
        this.dead = true;
        elements.add(new Coin({x: this.x + 8, y: this.y}));
      }
    }
  },
  //----------------------------------------------------------------------
  seesPlayer: function () {
    this.PlayerM = ((player.y + player.height) - (this.y + this.height)) / (player.x - this.x);
    if (!player.canHurt) return false;
    if (this.PlayerM > -0.15 && this.PlayerM < 0.15) {
      var steps = Math.abs(Math.floor(player.x / map.spriteSize) - Math.floor(this.x / map.spriteSize)),
        from = player.x < this.x ? Math.floor(player.x / map.spriteSize) : Math.floor(this.x / map.spriteSize);
      for (var X = from; X < from + steps; X++) {
        if (map.isSolid(X, Math.round(this.y / map.spriteSize)))
          return false;
      }
      return true;
    }
    return false;
  },
  //----------------------------------------------------------------------
  animate: function () {
    Game.animate(FPS, this, this.animation);
  },
  //----------------------------------------------------------------------
  move: function () {
    if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed;
    if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed;
    var expectedX = this.x + this.force.x,
      expectedY = this.y + this.force.y,
      PX = Math.floor(expectedX / map.spriteSize),
      PY = Math.floor(expectedY / map.spriteSize),
      PW = Math.floor((expectedX + this.width) / map.spriteSize),
      PH = Math.floor((expectedY + this.height) / map.spriteSize),
      nearMatrix = [], hole = false;

    for (var x = PX; x <= PW; x++)
      for (var y = PY; y <= PH; y++)
        nearMatrix.push(map.tileData(x, y));

    // dla x-a
    for (var i = 0; i < nearMatrix.length; i++) {
      var c = {x: this.x + this.force.x, y: this.y, width: this.width, height: this.height}
      if (nearMatrix[i].solid && Game.Math.overlap(c, nearMatrix[i])) {
        if (this.force.x < 0) this.force.x = nearMatrix[i].x + nearMatrix[i].width - this.x
        else if (this.force.x > 0) this.force.x = nearMatrix[i].x - this.x - this.width
      }
    }
    //(SAT.testPolygonPolygon(this.getMask(), obj.getMask()))
    this.x += this.force.x;
    for (var i = 0; i < nearMatrix.length; i++) {
      var c = {x: this.x, y: this.y + this.force.y, width: this.width, height: this.height}
      if (nearMatrix[i].solid && Game.Math.overlap(c, nearMatrix[i])) {
        if (this.force.y < 0) this.force.y = nearMatrix[i].y + nearMatrix[i].height - this.y
        else if (this.force.y > 0) this.force.y = nearMatrix[i].y - this.y - this.height;
      }
    }
    this.y += this.force.y;
    this.onFloor = expectedY > this.y;
    if (this.onFloor) {
      this.force.y *= -0.8;
      this.doJump = false;
      this.fall = false;
      this.canJump = true;
    }
    if (expectedY < this.y)
      this.doJump = false;
    if ((this.direction == 0 && !map.isSolid(PX, PH)) ||
      (this.direction == 1 && !map.isSolid(PW, PH))) {
      hole = true;
    }
    return {x: expectedX == this.x, y: expectedY == this.y, hole: hole};
  },
});
//==========================================================================
// PLAYER
//--------------------------------------------------------------------------
var Player = function () {
  ActiveElement.apply(this, arguments);
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
    DEAD_LEFT: {x: 480, y: 128, w: 32, h: 64, frames: 1, fps: 15, loop: false},
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
Player.prototype = ActiveElement.prototype;
Player.prototype.constructor = Player;
//--------------------------------------------------------------------------
// Player stone
//--------------------------------------------------------------------------
var PlayerStone = function (obj, dir) {
  ActiveElement.apply(this, arguments);
  this.family = "bullets"
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
PlayerStone.prototype = ActiveElement.prototype;
PlayerStone.prototype.constructor = PlayerStone;
//--------------------------------------------------------------------------
// Player bullet
//--------------------------------------------------------------------------
var PlayerBullet = function (obj, dir) {
  ActiveElement.apply(this, arguments);
  this.family = "bullets"
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
  }
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
PlayerBullet.prototype = ActiveElement.prototype;
PlayerBullet.prototype.constructor = PlayerBullet;
//--------------------------------------------------------------------------
// Coin
//--------------------------------------------------------------------------
var Coin = function () {
  ActiveElement.apply(this, arguments);
  this.family = "items"
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
Coin.prototype = ActiveElement.prototype;
Coin.prototype.constructor = Coin;
//--------------------------------------------------------------------------
// Item
//--------------------------------------------------------------------------
var Item = function () {
  ActiveElement.apply(this, arguments);
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
  }
  this.update = function () {
    if (this.onScreen()) {
      this.force.y += map.gravity;
      this.move();
    }
  }
};
Item.prototype = ActiveElement.prototype;
Item.prototype.constructor = Item;
//--------------------------------------------------------------------------
// Trigger
//--------------------------------------------------------------------------
var Trigger = function () {
  ActiveElement.apply(this, arguments);
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
Trigger.prototype = ActiveElement.prototype;
Trigger.prototype.constructor = Trigger;
//--------------------------------------------------------------------------
// Jump through
//--------------------------------------------------------------------------
var JumpThrough = function () {
  ActiveElement.apply(this, arguments);
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
JumpThrough.prototype = ActiveElement.prototype;
JumpThrough.prototype.constructor = JumpThrough;
//--------------------------------------------------------------------------
// Slope left
//--------------------------------------------------------------------------
var SlopeLeft = function () {
  ActiveElement.apply(this, arguments);
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
SlopeLeft.prototype = ActiveElement.prototype;
SlopeLeft.prototype.constructor = SlopeLeft;
//--------------------------------------------------------------------------
// Slope right
//--------------------------------------------------------------------------
var SlopeRight = function () {
  ActiveElement.apply(this, arguments);
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
SlopeRight.prototype = ActiveElement.prototype;
SlopeRight.prototype.constructor = SlopeRight;
//--------------------------------------------------------------------------
// Ladder
//--------------------------------------------------------------------------
var Ladder = function () {
  ActiveElement.apply(this, arguments);
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
Ladder.prototype = ActiveElement.prototype;
Ladder.prototype.constructor = Ladder;
//--------------------------------------------------------------------------
// Paddle
//--------------------------------------------------------------------------
var Paddle = function () {
  ActiveElement.apply(this, arguments);
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
Paddle.prototype = ActiveElement.prototype;
Paddle.prototype.constructor = Paddle;
//--------------------------------------------------------------------------
// Rock
//--------------------------------------------------------------------------
var Rock = function () {
  ActiveElement.apply(this, arguments);
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
Rock.prototype = ActiveElement.prototype;
Rock.prototype.constructor = Rock;
//--------------------------------------------------------------------------
// Crush
//--------------------------------------------------------------------------
var Crush = function () {
  ActiveElement.apply(this, arguments);
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
Crush.prototype = ActiveElement.prototype;
Crush.prototype.constructor = Crush;
//--------------------------------------------------------------------------
// Crusher
//--------------------------------------------------------------------------
var Crusher = function () {
  ActiveElement.apply(this, arguments);
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
Crusher.prototype = ActiveElement.prototype;
Crusher.prototype.constructor = Crusher;
//--------------------------------------------------------------------------
// Shooting tank
//--------------------------------------------------------------------------
var EnemyTank = function () {
  ActiveElement.apply(this, arguments);
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
EnemyTank.prototype = ActiveElement.prototype;
EnemyTank.prototype.constructor = EnemyTank;
//--------------------------------------------------------------------------
// Enemy bullet
//--------------------------------------------------------------------------
var EnemyBullet = function (obj, dir) {
  ActiveElement.apply(this, arguments);
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
EnemyBullet.prototype = ActiveElement.prototype;
EnemyBullet.prototype.constructor = EnemyBullet;
//--------------------------------------------------------------------------
// Blob
//--------------------------------------------------------------------------
var EnemyBlob = function () {
  ActiveElement.apply(this, arguments);
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
EnemyBlob.prototype = ActiveElement.prototype;
EnemyBlob.prototype.constructor = EnemyBlob;
//--------------------------------------------------------------------------
// Phantom
//--------------------------------------------------------------------------
var Phantom = function () {
  ActiveElement.apply(this, arguments);
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
Phantom.prototype = ActiveElement.prototype;
Phantom.prototype.constructor = Phantom;
//--------------------------------------------------------------------------
// Gloom
//--------------------------------------------------------------------------
var Gloom = function () {
  ActiveElement.apply(this, arguments);
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
Gloom.prototype = ActiveElement.prototype;
Gloom.prototype.constructor = Gloom;
//--------------------------------------------------------------------------
// Torch
//--------------------------------------------------------------------------
var Torch = function () {
  ActiveElement.apply(this, arguments);
  this.draw = function (ctx, image) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = .7 + Math.random() * .2;
    ctx.drawImage(image, Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
};
Torch.prototype = ActiveElement.prototype;
Torch.prototype.constructor = Torch;
//--------------------------------------------------------------------------
// Dark Mask
//--------------------------------------------------------------------------
var Dark = function () {
  ActiveElement.apply(this, arguments);
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
Dark.prototype = ActiveElement.prototype;
Dark.prototype.constructor = Dark;
//--------------------------------------------------------------------------
// Water
//--------------------------------------------------------------------------
var Water = function () {
  ActiveElement.apply(this, arguments);
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
Water.prototype = ActiveElement.prototype;
Water.prototype.constructor = Water;
//--------------------------------------------------------------------------
// Saw
//--------------------------------------------------------------------------
var Saw = function () {
  ActiveElement.apply(this, arguments);
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
Saw.prototype = ActiveElement.prototype;
Saw.prototype.constructor = Saw;
//--------------------------------------------------------------------------
// GrenadesTrap
//--------------------------------------------------------------------------
var GrenadesTrap = function () {
  ActiveElement.apply(this, arguments);
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
GrenadesTrap.prototype = ActiveElement.prototype;
GrenadesTrap.prototype.constructor = GrenadesTrap;
//--------------------------------------------------------------------------
// Grenade
//--------------------------------------------------------------------------
var Grenade = function (obj) {
  ActiveElement.apply(this, arguments);
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
Grenade.prototype = ActiveElement.prototype;
Grenade.prototype.constructor = Grenade;
//--------------------------------------------------------------------------
// Spear
//--------------------------------------------------------------------------
var Spear = function () {
  ActiveElement.apply(this, arguments);
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
Spear.prototype = ActiveElement.prototype;
Spear.prototype.constructor = Spear;

//--------------------------------------------------------------------------
// Lava
//--------------------------------------------------------------------------
var Lava = function () {
  ActiveElement.apply(this, arguments);
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
Lava.prototype = ActiveElement.prototype;
Lava.prototype.constructor = Lava;
//--------------------------------------------------------------------------
// Lava stone
//--------------------------------------------------------------------------
var LavaStone = function (obj, dir) {
  ActiveElement.apply(this, arguments);
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
LavaStone.prototype = ActiveElement.prototype;
LavaStone.prototype.constructor = LavaStone;
//--------------------------------------------------------------------------
// Explosions
//--------------------------------------------------------------------------
var Explosion = function () {
  ActiveElement.apply(this, arguments);
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
Explosion.prototype = ActiveElement.prototype;
Explosion.prototype.constructor = Explosion;
//--------------------------------------------------------------------------
var Explosion2 = function () {
  ActiveElement.apply(this, arguments);
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
Explosion2.prototype = ActiveElement.prototype;
Explosion2.prototype.constructor = Explosion2;
//==========================================================================
// Particles
//--------------------------------------------------------------------------
var Particle = function () {
  ActiveElement.apply(this, arguments);
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
Particle.prototype = ActiveElement.prototype;
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
//==========================================================================

