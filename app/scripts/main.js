const
//--------------------------------------------------------------------------
    KEY = {
      LEFT:  37,      UP:    38,      RIGHT: 39,      DOWN:   40,
      SPACE: 32,      SHOOT: 69,      THROW: 87,      ACTION: 81
    },
    DIR = {
      UP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3
    },
//--------------------------------------------------------------------------
// Images
//--------------------------------------------------------------------------
    Assets = [
      'player',       'tiles',        'foretiles',	  'font',
      'shadows',      'live',         'bg2',          'bg3',
      'bg4',          'enemy_blob',   'enemy_tank',   'explosion1',
      'explosion2',   'dark_mask',    'item',         'paddle',
      'enemy_bullet', 'coin',	        'player_bullet','grenade',
      'water',        'lava',         'crush',        'crusher',
      'lava_glow',    'light',		    'rock',			    'spear',
      'saw',			    'player_light'
    ];
//--------------------------------------------------------------------------

  const g1 = 'background-color: #444444;';
  const g2 = 'background-color: #333333;';
  const g3 = 'color:#CCCCCC;font-weight:bold; background-color: #222222;';
  console.log("%c %c %c | -NIHIL- | %c %c ", g1, g2, g3, g2, g1);

  Game.resizeViewport();
  Game.Load.images(Assets, function(images) {
    Game.Load.json("assets/levels/main.json", (level)=> {

      Game.map      = new Map(level);
      Game.camera   = new Camera();
      Game.elements = new Elements(level.layers[2].objects);
      Game.renderer = new Renderer(images);
      Game.renderer.msg(Game.map.name,100);
      Game.run({
        update: ()=> {
          Game.elements.update();
          Game.camera.update();
          Game.player.update();
        },
        render: ()=> Game.renderer.render()
      });
      Dom.on(document, 'keydown', function(ev) { return Game.onKey(ev, ev.keyCode, true);  }, false);
      Dom.on(document, 'keyup',   function(ev) { return Game.onKey(ev, ev.keyCode, false); }, false);

      let lPad = new Hammer(document.getElementById('trackpad-left'), {});
      let rPad = new Hammer(document.getElementById('trackpad-right'), {});

      lPad.get('pan').set({threshold: 3});
      rPad.get('pan').set({threshold: 5});
      rPad.get('tap').set({pointers: 1,threshold: 5, time: 150});
      lPad.on('pan', function(ev){
        switch(ev.additionalEvent){
          case 'panleft': Game.input.left = !Game.input.right; break;
          case 'panright': Game.input.right = !Game.input.left; break;
        }
      }).on('panend', function(){
        Game.input.left = false;
        Game.input.right = false;
      });
      rPad.on('pan', function(ev) {
        switch(ev.additionalEvent) {
          case 'panup': Game.input.up = true; break;
          case 'pandown': Game.input.down = true; break;
        }
      }).on('panend', function() {
        Game.input.up = false;
        Game.input.down = false;
      });
      rPad.on('tap', function(){
        Game.input.shoot = true;
        setTimeout(()=> Game.input.shoot=false, 200);
      });

      window.addEventListener('resize', Game.resizeGame, false);
      window.addEventListener('orientationchange', Game.resizeGame, false);
      // prevent bumping effect on mobile browsers
      document.ontouchmove = function(event){event.preventDefault();};

      Game.resizeGame();
    });
  });

  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  }



