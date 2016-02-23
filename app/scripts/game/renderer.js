//==========================================================================
// RENDERER
//--------------------------------------------------------------------------
class Renderer
{
  constructor(images) {
    this.BlackOverlay = 1;
    this.DarkAlpha = 1;
    this.dynamicLights = true;
    this.images = images;
    this.message = {dispCount: 0, dispIter: 0, txt: ''};
    this.lightmask = [];
    this.canvas = document.getElementById('canvas');//Game.Canvas.init(Dom.get('canvas'), ResolutionX, ResolutionY);
    this.ctx = this.canvas.getContext('2d');//this.canvas.getContext('2d');
    this.PlayerLight = new illuminated.Lamp({
      position  : new illuminated.Vec2(0,0),
      color     : 'rgba(255,255,255,0.1)',
      distance  : 96,
      samples   : 1,
      radius    : 8
    });
  }
  //------------------------------------------------------------------------
  msg(txt, iter) {
    this.message = { dispCount: 0, dispIter: iter, txt: txt };
  }
  //------------------------------------------------------------------------
  fontPrint(FontText, FontX, FontY) {
    FontText = FontText.toUpperCase();
    if (FontX === -1) {
      FontX = (ResolutionX - FontText.length * 8) / 2;
    }
    if (FontY === -1) {
      FontY = (ResolutionY - 8) / 2;
    }
    for (var i = 0; i < FontText.length; i++) {
      var chr = FontText.charCodeAt(i);
      this.ctx.drawImage(this.images.font, ((chr) % 16) * 16, Math.ceil(((chr + 1) / 16) - 1) * 16, 16, 16, FontX + (i * 8), FontY, 8, 8);
    }
  }
  //------------------------------------------------------------------------
  render() {
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.lightmask = [];
    this.ctx.save();
    this.ctx.scale(ScaleX, ScaleY);
    this.ctx.clearRect(0, 0, ResolutionX, ResolutionY);
    this.renderBack(this.ctx);
    this.renderGround(this.ctx);
    this.renderPlayer(this.ctx);
    this.renderElements(this.ctx);
    this.renderForeGround(this.ctx);
    if (Game.camera.underground || Game.player.inDark > 0) {
      this.renderLightingEffect(this.ctx);
    }
    this.renderForeGround2(this.ctx);
    if (this.BlackOverlay > 0) {
      this.ctx.globalAlpha = this.BlackOverlay;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(-1, -1, ResolutionX + 1, ResolutionY + 1);
      this.ctx.globalAlpha = 1;
      this.BlackOverlay -= 0.01;
    }
    if (this.message.dispCount < this.message.dispIter) {
      this.fontPrint(this.message.txt, -1, -1);
      this.message.dispCount++;
    }
    this.renderScore(this.ctx);
    this.ctx.restore();
  }
  //------------------------------------------------------------------------
  renderLightingEffect(ctx) {
    var all = Game.elements.lights;
    all.forEach(function (Obj) {
      Obj.render(ctx, Game.renderer.images[Obj.type]);
    });
    if (this.dynamicLights) {
      this.PlayerLight.position = new illuminated.Vec2(Game.player.x + 8 + Game.camera.x, Game.player.y + 16 + Game.camera.y);
      var lighting = new illuminated.Lighting({light: this.PlayerLight, objects: this.lightmask});
      var darkmask = new illuminated.DarkMask({lights: [this.PlayerLight]});
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
        -320 + Math.floor(Game.player.x + (Game.player.width / 2) + Game.camera.x),
        -320 + Math.floor(Game.player.y + (Game.player.height / 2) + Game.camera.y) - (Game.player.height / 2)
      );
    }
  }
  //------------------------------------------------------------------------
  renderBack(ctx) {
    if (!Game.camera.underground) {
      ctx.fillStyle = '#73C3FF';
      ctx.fillRect(0, 0, ResolutionX, ResolutionY);
      ctx.drawImage(this.images.bg2, (Game.camera.x / 15), 275 + (Game.camera.y / 2));
      ctx.drawImage(this.images.bg3, (Game.camera.x / 10), 100 + (Game.camera.y / 2));
      ctx.drawImage(this.images.bg4, -50 + (Game.camera.x / 5), 16 + (Game.camera.y / 2));
    } else {
      ctx.clearRect(0, 0, ResolutionX, ResolutionY);
    }
  }
  //------------------------------------------------------------------------
  renderGround(ctx) {
    var y = Math.floor(Game.camera.y % Game.map.spriteSize), _y = Math.floor(-Game.camera.y / Game.map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(Game.camera.x % Game.map.spriteSize), _x = Math.floor(-Game.camera.x / Game.map.spriteSize);
      while (x < ResolutionX) {
        var tile = Game.map.data.ground[_x][_y], back = Game.map.data.back[_x][_y];
        if (tile > 1 || back > 1) {
          // dynamic lights
          if (tile > 256 && this.dynamicLights) {
            this.lightmask.push(new illuminated.RectangleObject({
              topleft: new illuminated.Vec2(x, y),
              bottomright: new illuminated.Vec2(x + Game.map.spriteSize, y + Game.map.spriteSize)
            }));
          }
          if (back > 1) {
            ctx.drawImage(this.images.tiles, (((back - 1) % Game.map.spriteCols )) * Game.map.spriteSize, (Math.ceil(back / Game.map.spriteCols) - 1) * Game.map.spriteSize, Game.map.spriteSize, Game.map.spriteSize, x, y, Game.map.spriteSize, Game.map.spriteSize);
          }
          if (tile > 1) {
            ctx.drawImage(this.images.tiles, (((tile - 1) % Game.map.spriteCols )) * Game.map.spriteSize, (Math.ceil(tile / Game.map.spriteCols) - 1) * Game.map.spriteSize, Game.map.spriteSize, Game.map.spriteSize, x, y, Game.map.spriteSize, Game.map.spriteSize);
          }
          // calculate shadow
          if (back > 1 && tile === 0) {
            var shadow = 0;
            if (_x > 0 && _y > 0 && Game.map.isShadowCaster(_x - 1, _y) && Game.map.isShadowCaster(_x - 1, _y - 1) && Game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 6;
            }
            else if (_x > 0 && _y > 0 && Game.map.isShadowCaster(_x - 1, _y - 1) && Game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 5;
            }
            else if (_x > 0 && _y > 0 && Game.map.isShadowCaster(_x - 1, _y) && Game.map.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 4;
            }
            else if (_x > 0 && Game.map.isShadowCaster(_x - 1, _y)) {
              shadow = 1;
            }
            else if (_y > 0 && Game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 2;
            }
            else if (_x > 0 && _y > 0 && Game.map.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 3;
            }
            if (shadow > 0) {
              ctx.drawImage(this.images.shadows, (shadow - 1) * Game.map.spriteSize, 0, Game.map.spriteSize, Game.map.spriteSize, x, y, Game.map.spriteSize, Game.map.spriteSize);
            }
          }
        }
        x += Game.map.spriteSize;
        _x++;
      }
      y += Game.map.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround(ctx) {
    var y = Math.floor(Game.camera.y % Game.map.spriteSize), _y = Math.floor(-Game.camera.y / Game.map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(Game.camera.x % Game.map.spriteSize), _x = Math.floor(-Game.camera.x / Game.map.spriteSize);
      while (x < ResolutionX) {
        var tile = Game.map.data.fore[_x][_y], dark = Game.map.data.mask[_x][_y];
        if (tile > 0) {
          ctx.drawImage(this.images.tiles, (((tile - 1) % Game.map.spriteCols )) * Game.map.spriteSize, (Math.ceil(tile / Game.map.spriteCols) - 1) * Game.map.spriteSize, Game.map.spriteSize, Game.map.spriteSize, x, y, Game.map.spriteSize, Game.map.spriteSize);
        }
        if (dark === 0 && Game.player.inDark > 0 && !Game.camera.underground) {
          ctx.fillStyle = "black";
          ctx.fillRect(x, y, Game.map.spriteSize, Game.map.spriteSize);
        }
        x += Game.map.spriteSize;
        _x++;
      }
      y += Game.map.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround2(ctx) {
    var y = Math.floor(Game.camera.y % Game.map.spriteSize), _y = Math.floor(-Game.camera.y / Game.map.spriteSize);
    while (y < ResolutionY) {
      var x = Math.floor(Game.camera.x % Game.map.spriteSize), _x = Math.floor(-Game.camera.x / Game.map.spriteSize);
      while (x < ResolutionX) {
        var tile = Game.map.data.fore2[_x][_y];
        if (tile > 0) {
          ctx.drawImage(this.images.tiles, (((tile - 1) % Game.map.spriteCols )) * Game.map.spriteSize, (Math.ceil(tile / Game.map.spriteCols) - 1) * Game.map.spriteSize, Game.map.spriteSize, Game.map.spriteSize, x, y, Game.map.spriteSize, Game.map.spriteSize);
        }
        x += Game.map.spriteSize;
        _x++;
      }
      y += Game.map.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderPlayer(ctx) {
    Game.player.render(ctx, this.images.player);
  }
  //------------------------------------------------------------------------
  renderElements(ctx) {
    var all = Game.elements.all;
    all.forEach(function (Obj) {
      Obj.render(ctx, Game.renderer.images[Obj.type]);
    });
  }
  //------------------------------------------------------------------------
  renderScore(ctx) {
    ctx.drawImage(this.images.live, 0, 10, Math.round(Game.player.maxEnergy / 10) * 11, 10, 5, 5, Math.round(Game.player.maxEnergy / 10) * 11, 10);
    ctx.drawImage(this.images.live, 0, 0, (Game.player.energy / 10) * 11, 10, 5, 5, (Game.player.energy / 10) * 11, 10);
    ctx.drawImage(this.images.coin, 0, 0, 8, 8, ResolutionX - 16, 7, 8, 8);
    var cc = '' + parseInt(Game.player.coinCollect);
    this.fontPrint(cc, ResolutionX - (16 + (cc.length * 8)), 8);
    for (var i = 0; i < 2; i++) {
      var item = Game.player.items[i];
      if (item && item.type === "item") {
        ctx.drawImage(this.images.item, parseInt(item.properties.frame) * item.width, 0, item.width, item.height, (ResolutionX - 43) + (i * 20), ResolutionY - 23, item.width, item.height);
      }
    }
  }
}
