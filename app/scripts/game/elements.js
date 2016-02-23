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
    var all = this.all;
    all.forEach(function (Obj, i, all) {
      if (Obj.dead) {
        Game.elements.all[i] = Game.elements.all[Game.elements.all.length - 1];
        Game.elements.all.length--;
      } else {
        Obj.update();
      }
    });
    for (var j = 0; j < all.length; j++) {
      all[j].overlapTest(player);
      for (var k = j + 1; k < all.length; k++) {
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
    for (var i = 0; i < source.length; i++) {
      var obj = source[i];
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
