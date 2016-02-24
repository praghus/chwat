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
    this.lightmask = [];
    $.save();
    $.scale(scale.x, scale.y);
    $.clearRect(0, 0, x, y);
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
    const { $, images } = this._game;
    let  y = Math.floor(this._game.camera.y % this._game.map.spriteSize);
    let _y = Math.floor(-this._game.camera.y / this._game.map.spriteSize);
    while (y < this._game.resolution.y) {
      let x = Math.floor(this._game.camera.x % this._game.map.spriteSize), _x = Math.floor(-this._game.camera.x / this._game.map.spriteSize);
      while (x < this._game.resolution.x) {
        const tile = this._game.map.data.ground[_x][_y], back = this._game.map.data.back[_x][_y];
        if (tile > 1 || back > 1) {
          // dynamic lights
          if (tile > 256 && this.dynamicLights) {
            this.lightmask.push(new illuminated.RectangleObject({
              topleft: new illuminated.Vec2(x, y),
              bottomright: new illuminated.Vec2(x + this._game.map.spriteSize, y + this._game.map.spriteSize)
            }));
          }
          if (back > 1) {
            $.drawImage(images.tiles, (((back - 1) % this._game.map.spriteCols )) * this._game.map.spriteSize, (Math.ceil(back / this._game.map.spriteCols) - 1) * this._game.map.spriteSize, this._game.map.spriteSize, this._game.map.spriteSize, x, y, this._game.map.spriteSize, this._game.map.spriteSize);
          }
          if (tile > 1) {
            $.drawImage(images.tiles, (((tile - 1) % this._game.map.spriteCols )) * this._game.map.spriteSize, (Math.ceil(tile / this._game.map.spriteCols) - 1) * this._game.map.spriteSize, this._game.map.spriteSize, this._game.map.spriteSize, x, y, this._game.map.spriteSize, this._game.map.spriteSize);
          }
          // calculate shadow
          if (back > 1 && tile === 0) {
            var shadow = 0;
            if (_x > 0 && _y > 0 && this._game.map.isShadowCaster(_x - 1, _y) && this._game.map.isShadowCaster(_x - 1, _y - 1) && this._game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 6;
            }
            else if (_x > 0 && _y > 0 && this._game.map.isShadowCaster(_x - 1, _y - 1) && this._game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 5;
            }
            else if (_x > 0 && _y > 0 && this._game.map.isShadowCaster(_x - 1, _y) && this._game.map.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 4;
            }
            else if (_x > 0 && this._game.map.isShadowCaster(_x - 1, _y)) {
              shadow = 1;
            }
            else if (_y > 0 && this._game.map.isShadowCaster(_x, _y - 1)) {
              shadow = 2;
            }
            else if (_x > 0 && _y > 0 && this._game.map.isShadowCaster(_x - 1, _y - 1)) {
              shadow = 3;
            }
            if (shadow > 0) {
              $.drawImage(images.shadows, (shadow - 1) * this._game.map.spriteSize, 0, this._game.map.spriteSize, this._game.map.spriteSize, x, y, this._game.map.spriteSize, this._game.map.spriteSize);
            }
          }
        }
        x += this._game.map.spriteSize;
        _x++;
      }
      y += this._game.map.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround() {
    const { $, images } = this._game;
    let  y = Math.floor(this._game.camera.y % this._game.map.spriteSize);
    let _y = Math.floor(-this._game.camera.y / this._game.map.spriteSize);
    while (y < this._game.resolution.y) {
      let x = Math.floor(this._game.camera.x % this._game.map.spriteSize), _x = Math.floor(-this._game.camera.x / this._game.map.spriteSize);
      while (x < this._game.resolution.x) {
        let tile = this._game.map.data.fore[_x][_y], dark = this._game.map.data.mask[_x][_y];
        if (tile > 0) {
          $.drawImage(images.tiles, (((tile - 1) % this._game.map.spriteCols )) * this._game.map.spriteSize, (Math.ceil(tile / this._game.map.spriteCols) - 1) * this._game.map.spriteSize, this._game.map.spriteSize, this._game.map.spriteSize, x, y, this._game.map.spriteSize, this._game.map.spriteSize);
        }
        if (dark === 0 && this._game.player.inDark > 0 && !this._game.camera.underground) {
          $.fillStyle = "black";
          $.fillRect(x, y, this._game.map.spriteSize, this._game.map.spriteSize);
        }
        x += this._game.map.spriteSize;
        _x++;
      }
      y += this._game.map.spriteSize;
      _y++;
    }
  }
  //------------------------------------------------------------------------
  renderForeGround2() {
    const { $, images, camera, map, resolution } = this._game;
    let  y = Math.floor(camera.y % map.spriteSize);
    let _y = Math.floor(-camera.y / map.spriteSize);
    while (y < resolution.y) {
      let x = Math.floor(camera.x % map.spriteSize), _x = Math.floor(-camera.x / map.spriteSize);
      while (x < resolution.x) {
        let tile = map.data.fore2[_x][_y];
        if (tile > 0) {
          $.drawImage(images.tiles, (((tile - 1) % map.spriteCols )) * map.spriteSize, (Math.ceil(tile / map.spriteCols) - 1) * map.spriteSize, map.spriteSize, map.spriteSize, x, y, map.spriteSize, map.spriteSize);
        }
        x += map.spriteSize;
        _x++;
      }
      y += map.spriteSize;
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
    for (let i = 0; i < 2; i++) {
      const item = this._game.player.items[i];
      if (item && item.type === "item") {
        $.drawImage(images.item, parseInt(item.properties.frame) * item.width, 0, item.width, item.height, (this._game.resolution.x - 43) + (i * 20), this._game.resolution.y - 23, item.width, item.height);
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

