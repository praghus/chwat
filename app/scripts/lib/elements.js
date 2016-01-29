//==========================================================================
// GAME ELEMENTS
//--------------------------------------------------------------------------
var Elements = Class.create({

  initialize: function (level) {
    this.all = [];
    this.lights = [];
    this.createElements(level.layers[3].objects);
  },
  //------------------------------------------------------------------------
  update: function (dt) {
    var all = this.all;
    all.forEach(function (Obj, i, all) {
      if (Obj.dead) {
        elements.all[i] = elements.all[elements.all.length - 1];
        elements.all.length--;
      } else Obj.update();
    });
    for (var j = 0; j < all.length; j++) {
      all[j].overlapTest(player);
      for (var k = j + 1; k < all.length; k++) {
        all[j].overlapTest(all[k]);
      }
    }
  },
  //------------------------------------------------------------------------
  add: function (type, params) {
    if (Game.Entities[type]) {
      this.all.push(new Game.Entities[type](params));
    }
  },
  //------------------------------------------------------------------------
  createElements: function (source) {
    for (var i = 0; i < source.length; i++) {
      var obj = source[i];
      if (Game.Entities[obj.type]) {
        switch (obj.type) {
          case 'player':
            player = new Game.Entities[obj.type](obj);
            break;
          default:
            this.add(obj.type, obj);
            break;
        }
      }
    }
  }
});
