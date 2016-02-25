//==========================================================================
// Map
//--------------------------------------------------------------------------
class World {
  constructor(game) {
    const data = game.data;
    const backData  = data.layers[0].data;
    const mainData  = data.layers[1].data;
    const foreData  = data.layers[3].data;
    const fore2Data = data.layers[4].data;

    this.width = parseInt(data.width);
    this.height = parseInt(data.height);
    this.gravity = 0.3;//20 * 9.8 * 4;  //parseInt(data.properties.Gravity);
    this.surface = parseInt(data.properties.SurfaceLevel);
    this.name = data.properties.Title;
    this.spriteSize = 16;
    this.spriteCols = 32;
    this.data = { back: [], ground: [], mask: [], fore: [], fore2: []};

    for (let i = 0; i < this.width; i++) {
      this.data.back[i] = [];
      this.data.ground[i] = [];
      this.data.mask[i] = [];
      this.data.fore[i] = [];
      this.data.fore2[i] = [];
    }

    let j = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.data.ground[x][y] = mainData[j];
        this.data.back[x][y] = backData[j];
        this.data.fore[x][y] = foreData[j];
        this.data.fore2[x][y] = fore2Data[j];
        this.data.mask[x][y] = 0;
        j++;
      }
    }
  }
  //----------------------------------------------------------------------
  inRange(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
  //----------------------------------------------------------------------
  get(l, x, y) {
    if(!this.inRange(x, y)){
      return false;
    }
    return this.data[l][x][y];
  }
  //----------------------------------------------------------------------
  tileData(x, y) {
    return {
      x     : this.spriteSize * x,
      y     : this.spriteSize * y,
      width : this.spriteSize,
      height: this.spriteSize,
      type  : this.get('ground', x, y),
      solid : this.isSolid(x, y)
    };
  }
  //----------------------------------------------------------------------
  isSolid(x, y) {
    if(!this.inRange(x, y)){
      return true;
    }
    return this.data.ground[x][y] > 32 * 8;
  }
  //----------------------------------------------------------------------
  isShadowCaster(x, y){
    if(!this.inRange(x, y)){
      return false;
    }
    return this.data.ground[x][y] > 32 * 8 || this.data.ground[x][y] === 1;
  }
  //----------------------------------------------------------------------
  addMask(obj) {
    let x = Math.round(obj.x / this.spriteSize) - 1,
        y = Math.round(obj.y / this.spriteSize) - 1,
        w = Math.round(obj.width / this.spriteSize) + 2,
        h = Math.round(obj.height / this.spriteSize) + 2;
    for (var _y = y; _y < y + h; _y++) {
      for (var _x = x; _x < x + w; _x++) {
        this.data.mask[_x][_y] = 1;
      }
    }
  }
}
