//==========================================================================
// RENDERER
//--------------------------------------------------------------------------
class Renderer
{
  constructor(game) {
    this._game = game;
    this.BlackOverlay = 1;
    this.DarkAlpha = 1;
    this.dynamicLights = true;
    this.message = { dispCount: 0, dispIter: 0, txt: '' };
    this.lightmask = [];
    this.PlayerLight = new illuminated.Lamp({
      position  : new illuminated.Vec2(0,0),
      color     : 'rgba(255,255,255,0.1)',
      distance  : 96,
      samples   : 1,
      radius    : 8
    });
  }
  //------------------------------------------------------------------------
  render() {
    const { $ } = this._game;
    const { x, y, scale } = this._game.resolution;
    $.mozImageSmoothingEnabled = false;
    $.webkitImageSmoothingEnabled = false;
    $.msImageSmoothingEnabled = false;
    $.imageSmoothingEnabled = false;
    $.save();
    $.scale(scale.x, scale.y);
    $.clearRect(0, 0, x, y);
    this.lightmask = [];
    this.renderBack();
    this.renderGround();
    this.renderPlayer();
    this.renderElements();
    this.renderForeGround();
    if (this._game.camera.underground || this._game.player.inDark > 0) {
      this.renderLightingEffect();
    }
    this.renderForeGround2();
    if (this.BlackOverlay > 0) {
      $.globalAlpha = this.BlackOverlay;
      $.fillStyle = 'black';
      $.fillRect(-1, -1, x + 1, y + 1);
      $.globalAlpha = 1;
      this.BlackOverlay -= 0.01;
    }
    if (this.message.dispCount < this.message.dispIter) {
      this.fontPrint(this.message.txt, -1, -1);
      this.message.dispCount++;
    }
    this.renderScore();
    $.restore();
  }
  //------------------------------------------------------------------------
  renderLightingEffect() {
    const { $, images } = this._game;
    /*let   { lights } = this._game.elements;
    lights.forEach((elem)=> {
      elem.render($, this._game.renderer.images[elem.type]);
    });*/
    if (this.dynamicLights) {
      this.PlayerLight.position = new illuminated.Vec2(this._game.player.x + 8 + this._game.camera.x, this._game.player.y + 16 + this._game.camera.y);
      let lighting = new illuminated.Lighting({light: this.PlayerLight, objects: this.lightmask});
      let darkmask = new illuminated.DarkMask({lights: [this.PlayerLight]});
      lighting.compute(this._game.resolution.x, this._game.resolution.y);
      darkmask.compute(this._game.resolution.x, this._game.resolution.y);
      $.globalCompositeOperation = 'lighter';
      lighting.render($);
      $.globalCompositeOperation = 'source-over';
      darkmask.render($);
    } else {
      $.globalCompositeOperation = 'source-over';
      $.drawImage(
        images.light,
        -320 + Math.floor(this._game.player.x + (this._game.player.width / 2) + this._game.camera.x),
        -320 + Math.floor(this._game.player.y + (this._game.player.height / 2) + this._game.camera.y) - (this._game.player.height / 2)
      );
    }
  }
  //------------------------------------------------------------------------
  renderBack() {
    const { $, images } = this._game;
    if (!this._game.camera.underground) {
      $.fillStyle = '#73C3FF';
      $.fillRect(0, 0, this._game.resolution.x, this._game.resolution.y);
      $.drawImage(images.bg2, (this._game.camera.x / 15), 275 + (this._game.camera.y / 2));
      $.drawImage(images.bg3, (this._game.camera.x / 10), 100 + (this._game.camera.y / 2));
      $.drawImage(images.bg4, -50 + (this._game.camera.x / 5), 16 + (this._game.camera.y / 2));
    } else {
      $.clearRect(0, 0, this._game.resolution.x, this._game.resolution.y);
    }
  }
  //------------------------------------------------------------------------
  renderGround() {
    const { $, images, world } = this._game;
    let  y = Math.floor(this._game.camera.y % this._game.world.spriteSize);
    let _y = Math.floor(-this._game.camera.y / this._game.world.spriteSize);
    while (y < this._game.resolution.y) {
      let  x = Math.floor(this._game.camera.x % this._game.world.spriteSize);
      let _x = Math.floor(-this._game.camera.x / this._game.world.spriteSize);
      while (x < this._game.resolution.x) {
        const tile = world.get('ground', _x, _y);
        const back = world.get('back', _x, _y);
        if (tile > 1 || back > 1) {
          // dynamic lights
          if (tile > 256 && this.dynamicLights) {
            this.lightmask.push(new illuminated.RectangleObject({
              topleft: new illuminated.Vec2(x, y),
              bottomright: new illuminated.Vec2(x + this._game.world.spriteSize, y + this._game.world.spriteSize)
            }));
          }
          if (back > 1) {
            $.drawImage(images.tiles, (((back - 1) % this._game.world.spriteCols )) * this._game.world.spriteSize, (Math.ceil(back / this._game.world.spriteCols) - 1) * this._game.world.spriteSize, this._game.world.spriteSize, this._game.world.spriteSize, x, y, this._game.world.spriteSize, this._game.world.spriteSize);
          }
          if (tile > 1) {
            $.drawImage(images.tiles, (((tile - 1) % this._game.world.spriteCols )) * this._game.world.spriteSize, (Math.ceil(tile / this._game.world.spriteCols) - 1) * this._game.world.spriteSize, this._game.world.spriteSize, this._game.world.spriteSize, x, y, this._game.world.spriteSize, this._game.world.spriteSize);
          }
          // calculate shadow
          if (back > 1 && tile === 0) {
            var shadow = 0;
            if (_x > 0 && _y > 0 && this._game.world.isShadowCaster(_x - 1, _y) && this._game.world.isShadowCaster(_x - 1, _y - 1) && this._game.world.isShadowCaster(_x, _y - 1)) {
              shadow = 6;
            }
            else if (_x > 0 && _y > 0 && this._game.world.isShadowCaster(_x - 1, _y - 1) && this._game.world.isShadowCaster(_x, _y - 1)) {
              shadow = 5;
            }
            else if (_x > 0 && _y > 0 && this._game.world.isShadowCaster(_x - 1, _y) && this._game.world.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 4;
            }
            else if (_x > 0 && this._game.world.isShadowCaster(_x - 1, _y)) {
              shadow = 1;
            }
            else if (_y > 0 && this._game.world.isShadowCaster(_x, _y - 1)) {
              shadow = 2;
            }
            else if (_x > 0 && _y > 0 && this._game.world.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 3;
            }
            if (shadow > 0) {
              $.drawImage(images.shadows, (shadow - 1) * this._game.world.spriteSize, 0, this._game.world.spriteSize, this._game.world.spriteSize, x, y, this._game.world.spriteSize, this._game.world.spriteSize);
            }
          }
        }
        x += this._game.world.spriteSize;
        _x++;
      }
      y += this._game.world.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround() {
    const { $, images, world } = this._game;
    let  y = Math.floor(this._game.camera.y % this._game.world.spriteSize);
    let _y = Math.floor(-this._game.camera.y / this._game.world.spriteSize);
    while (y < this._game.resolution.y) {
      let  x = Math.floor(this._game.camera.x % this._game.world.spriteSize);
      let _x = Math.floor(-this._game.camera.x / this._game.world.spriteSize);
      while (x < this._game.resolution.x) {
        const tile = world.get('fore', _x, _y);
        const dark = world.get('mask', _x, _y);
        if (tile > 0) {
          $.drawImage(images.tiles, (((tile - 1) % this._game.world.spriteCols )) * this._game.world.spriteSize, (Math.ceil(tile / this._game.world.spriteCols) - 1) * this._game.world.spriteSize, this._game.world.spriteSize, this._game.world.spriteSize, x, y, this._game.world.spriteSize, this._game.world.spriteSize);
        }
        if (dark === 0 && this._game.player.inDark > 0 && !this._game.camera.underground) {
          $.fillStyle = "black";
          $.fillRect(x, y, this._game.world.spriteSize, this._game.world.spriteSize);
        }
        x += this._game.world.spriteSize;
        _x++;
      }
      y += this._game.world.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround2() {
    const { $, images, camera, world, resolution } = this._game;
    let  y = Math.floor(camera.y % world.spriteSize);
    let _y = Math.floor(-camera.y / world.spriteSize);
    while (y < resolution.y) {
      let  x = Math.floor(camera.x % world.spriteSize);
      let _x = Math.floor(-camera.x / world.spriteSize);
      while (x < resolution.x) {
        const tile = world.get('fore2', _x, _y);
        if (tile > 0) {
          $.drawImage(images.tiles, (((tile - 1) % world.spriteCols )) * world.spriteSize, (Math.ceil(tile / world.spriteCols) - 1) * world.spriteSize, world.spriteSize, world.spriteSize, x, y, world.spriteSize, world.spriteSize);
        }
        x += world.spriteSize;
        _x++;
      }
      y += world.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderPlayer() {
    const { $, images, player } = this._game;
    player.render($, images.player);
  }
  //------------------------------------------------------------------------
  renderElements() {
    const { $, images } = this._game;
    let { all } = this._game.elements;
    all.forEach((elem) => elem.render($, images[elem.type]));
  }
  //------------------------------------------------------------------------
  renderScore() {
    const { $, images } = this._game;
    $.drawImage(images.live, 0, 10, Math.round(this._game.player.maxEnergy / 10) * 11, 10, 5, 5, Math.round(this._game.player.maxEnergy / 10) * 11, 10);
    $.drawImage(images.live, 0, 0, (this._game.player.energy / 10) * 11, 10, 5, 5, (this._game.player.energy / 10) * 11, 10);
    $.drawImage(images.coin, 0, 0, 8, 8, this._game.resolution.x - 16, 7, 8, 8);
    let cc = '' + parseInt(this._game.player.coinCollect);
    this.fontPrint(cc, this._game.resolution.x - (16 + (cc.length * 8)), 8);
    for (let i in this._game.player.items) {
      let item = this._game.player.items[i];
      if (item && item.properties) {
        $.drawImage(images.item, parseInt(item.properties.frame) * item.width, 0, item.width, item.height, 4 + (i++ * 20), this._game.resolution.y - 20, item.width, item.height);
      }
    }
  }
  //------------------------------------------------------------------------
  msg(txt, iter) {
    this.message = { dispCount: 0, dispIter: iter, txt: txt };
  }
  //------------------------------------------------------------------------
  fontPrint(FontText, FontX, FontY) {
    const { $, images } = this._game;
    FontText = FontText.toUpperCase();
    if (FontX === -1) {
      FontX = (this._game.resolution.x - FontText.length * 8) / 2;
    }
    if (FontY === -1) {
      FontY = (this._game.resolution.y - 8) / 2;
    }
    for (let i = 0; i < FontText.length; i++) {
      const chr = FontText.charCodeAt(i);
      $.drawImage(images.font, ((chr) % 16) * 16, Math.ceil(((chr + 1) / 16) - 1) * 16, 16, 16, FontX + (i * 8), FontY, 8, 8);
    }
  }
}

