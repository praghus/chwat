//==========================================================================
// GAME ELEMENTS
//--------------------------------------------------------------------------
class Elements
{
  constructor(elementsLayer, game) {
    this._game = game;
    this.all = [];
    this.lights = [];
    this.createElements(elementsLayer);
  }
  //------------------------------------------------------------------------
  update() {
    let { all } = this;
    all.forEach(function (Obj, i, all) {
      if (Obj.dead) {
        this._game.elements.all[i] = this._game.elements.all[Game.elements.all.length - 1];
        this._game.elements.all.length--;
      } else {
        Obj.update();
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
