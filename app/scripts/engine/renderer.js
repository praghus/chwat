//==========================================================================
// RENDERER
//--------------------------------------------------------------------------
class Renderer
{
  constructor(game) {
    this._game = game;
    this.message = { txt: '', timeout: undefined };
  }
  //------------------------------------------------------------------------
  render(callback) {
    const { $ } = this._game;
    const { x, y, scale } = this._game.resolution;
    $.mozImageSmoothingEnabled = false;
    $.webkitImageSmoothingEnabled = false;
    $.msImageSmoothingEnabled = false;
    $.imageSmoothingEnabled = false;
    $.save();
    $.scale(scale.x, scale.y);
    $.clearRect(0, 0, x, y);
    callback();
    if (this.message.txt !== '') {
      this.fontPrint(this.message.txt, -1, -1);
    }
    $.restore();
  }
  //------------------------------------------------------------------------
  msg(txt, timeout) {
    this.message = {
      txt: txt,
      timeout:setTimeout(()=>this.message={ txt: '', timeout: undefined }, timeout)
    };
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
