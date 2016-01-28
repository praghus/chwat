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
  add: function (obj) {
    this.all.push(obj);
  },
  //------------------------------------------------------------------------
  createElements: function (source) {
    for (var i = 0; i < source.length; i++) {
      var obj = source[i];
      switch (obj.type) {
        case 'player':
          player = new Player(obj);
          break;
        case 'coin':
          this.all.push(new Coin(obj));
          break;
        case 'enemy_blob':
          this.all.push(new EnemyBlob(obj));
          break;
        case 'enemy_tank':
          this.all.push(new EnemyTank(obj));
          break;
        case 'phantom':
          this.all.push(new EnemyPhantom(obj));
          break;
        case 'gloom':
          this.all.push(new EnemyGloom(obj));
          break;
        case 'ladder':
          this.all.push(new Ladder(obj));
          break;
        case 'item':
          this.all.push(new Item(obj));
          break;
        case 'slope_left':
          this.all.push(new SlopeLeft(obj));
          break;
        case 'slope_right':
          this.all.push(new SlopeRight(obj));
          break;
        case 'jump_through':
          this.all.push(new JumpThrough(obj));
          break;
        case 'paddle':
          this.all.push(new Paddle(obj));
          break;
        case 'rock':
          this.all.push(new Rock(obj));
          break;
        case 'crush':
          this.all.push(new Crush(obj));
          break;
        case 'crusher':
          this.all.push(new Crusher(obj));
          break;
        case 'trigger':
          this.all.push(new Trigger(obj));
          break;
        case 'grenades':
          this.all.push(new GrenadesTrap(obj));
          break;
        case 'spear':
          this.all.push(new Spear(obj));
          break;
        case 'saw':
          this.all.push(new Saw(obj));
          break;
        case 'dark_mask':
          this.all.push(new Dark(obj));
          map.addMask(obj);
          break;
        case 'water':
          this.all.push(new Water(obj));
          break;
        case 'lava':
          this.all.push(new Lava(obj));
          break;
        case 'torch':
          this.lights.push(new Torch(obj));
          break;
      }
    }
  }
});
