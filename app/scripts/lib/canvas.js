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
  render: function (width, height, render, canvas) {
    canvas = canvas || this.create(width, height);
    render(canvas.getContext('2d'), width, height);
    return canvas;
  }
};
