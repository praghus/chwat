//--------------------------------------------------------------------------
// Torch
//--------------------------------------------------------------------------
Game.Entities['torch'] = function () {
  Entity.apply(this, arguments);
  this.draw = function (ctx, image) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .7 + Math.random() * .2;
    ctx.drawImage(image, Math.floor(this.x + camera.x), Math.floor(this.y + camera.y));
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
};
Class.extend(Game.Entities['torch'], Entity);
