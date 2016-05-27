//==========================================================================
// GAME ELEMENTS
//--------------------------------------------------------------------------
class Elements
{
  constructor(game) {
    this._game = game;
    this.all = [];
    this.lights = [];
    this.createElements(this._game.data.layers[3].objects);
  }
  //------------------------------------------------------------------------
  update() {
    let { all } = this;
    all.forEach((elem, i) => {
      if (elem.dead) {
        this._game.elements.all[i] = this._game.elements.all[this._game.elements.all.length - 1];
        this._game.elements.all.length--;
      } else {
        elem.update();
      }
    });
    for (let j = 0; j < all.length; j++) {
      all[j].overlapTest(this._game.player);
      for (let k = j + 1; k < all.length; k++) {
        all[j].overlapTest(all[k]);
      }
    }
  }
  //------------------------------------------------------------------------
  getById(id){
    return this.all.find((x) => x.id === id);
  }
  //------------------------------------------------------------------------
  clearInRange(rect) {
    let { all } = this;
    //let rect = { x: x, y: y, width: w, height: h };
    for (let j = 0; j < all.length; j++) {
      let obj = all[j];
      if (!obj.dead && this._game.m.overlap(obj, rect)) {
        obj.dead = true;
      }
    }
  }
  //------------------------------------------------------------------------
  add(type, obj) {
    if (this._game.entities[type]) {
      this.all.push(new this._game.entities[type](obj, this._game));
    }
  }
  //------------------------------------------------------------------------
  createElements(source) {
    for (let i = 0; i < source.length; i++) {
      let obj = source[i];
      if (this._game.entities[obj.type]) {
        switch (obj.type) {
          case 'player':
            this._game.player = new this._game.entities[obj.type](obj, this._game);
            break;
          default:
            this.add(obj.type, obj);
            break;
        }
      }
    }
  }
}
