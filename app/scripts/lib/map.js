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
