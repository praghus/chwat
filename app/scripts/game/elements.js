//==========================================================================
// GAME ELEMENTS
//--------------------------------------------------------------------------
class Elements
{
  constructor(elementsLayer) {
    this.all = [];
    this.lights = [];
    this.createElements(elementsLayer);
  }
  //------------------------------------------------------------------------
  update() {
    let { all } = this;
    all.forEach(function (Obj, i, all) {
      if (Obj.dead) {
        Game.elements.all[i] = Game.elements.all[Game.elements.all.length - 1];
        Game.elements.all.length--;
      } else {
        Obj.update();
      }
    });
    for (let j = 0; j < all.length; j++) {
      all[j].overlapTest(Game.player);
      for (let k = j + 1; k < all.length; k++) {
        all[j].overlapTest(all[k]);
      }
    }
  }
  //------------------------------------------------------------------------
  add(type, params) {
    if (Game.entities[type]) {
      this.all.push(new Game.entities[type](params));
    }
  }
  //------------------------------------------------------------------------
  createElements(source) {
    for (let i = 0; i < source.length; i++) {
      let obj = source[i];
      if (Game.entities[obj.type]) {
        switch (obj.type) {
          case 'player':
            Game.player = new Game.entities[obj.type](obj);
            break;
          default:
            this.add(obj.type, obj);
            break;
        }
      }
    }
  }
}
