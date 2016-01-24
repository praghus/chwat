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
  //------------------------------------------------------------------------
  msg: function (txt, iter) {
    this.message = {dispCount: 0, dispIter: iter, txt: txt};
  },
  //------------------------------------------------------------------------
  fontPrint: function (FontText, FontX, FontY) {
    FontText = FontText.toUpperCase();
    if (FontX == -1) FontX = (ResolutionX - FontText.length * 8) / 2;
    if (FontY == -1) FontY = (ResolutionY - 8) / 2;
    for (var i = 0; i < FontText.length; i++) {
      var chr = FontText.charCodeAt(i);
      this.ctx.drawImage(this.images.font, ((chr) % 16) * 16, Math.ceil(((chr + 1) / 16) - 1) * 16, 16, 16, FontX + (i * 8), FontY, 8, 8);
    }
  },
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
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
  //------------------------------------------------------------------------
  renderPlayer: function (ctx) {
    player.render(ctx, this.images.player);
  },
  //------------------------------------------------------------------------
  renderElements: function (ctx) {
    var all = elements.all;
    all.forEach(function (Obj, i, all) {
      Obj.render(ctx, renderer.images[Obj.type]);
    });
  },
  //------------------------------------------------------------------------
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
