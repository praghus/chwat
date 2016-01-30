var map, elements, camera, player, renderer,
    FPS               = 60,
    ResolutionX       = 320,
    ResolutionY       = 180,
    Ratio             = 16 / 9,
    PixelScale        = 3,
    ScaleX, ScaleY,
//--------------------------------------------------------------------------
    KEY = {
      LEFT:  37,      UP:    38,      RIGHT: 39,      DOWN:   40,
      SPACE: 32,      SHOOT: 69,      THROW: 87,      ACTION: 81
    },
//--------------------------------------------------------------------------
// Dynamic lights
//--------------------------------------------------------------------------
    UseDynamicLights  = true,
    BlackOverlay      = 1,
    DarkAlpha         = 1,
    Lamp              = illuminated.Lamp,
    RectangleObject   = illuminated.RectangleObject,
    Vec2              = illuminated.Vec2,
    Lighting          = illuminated.Lighting,
    DarkMask          = illuminated.DarkMask,
    PlayerLight = new Lamp({
      position: new Vec2(0,0),
      color:    'rgba(255,255,255,0.08)',
      distance: 96,
      samples:  1,
      radius:   8
    }),
//-------------------------------------------------------------------------
// SAT
//-------------------------------------------------------------------------
    V = SAT.Vector, P = SAT.Polygon,
//-------------------------------------------------------------------------
// FPSMeter
//-------------------------------------------------------------------------
  fpsmeter = new FPSMeter({
    decimals: 0, graph: true, theme: 'dark', position: 'fixed',
    top: 'auto', left: 'auto', bottom: '5px', right: '5px'
  }),
//--------------------------------------------------------------------------
// Images
//--------------------------------------------------------------------------
    IMAGES = [
      'player',       'tiles',        'foretiles',	  'font',
      'shadows',      'containers',   'live',         'bg2',
      'bg3',          'bg4',          'gloom',        'torch_light',
      'enemy_blob',   'enemy_tank',   'skeleton',     'enemy_spider',
      'haunebu',      'explosion1',   'explosion2',   'dark_mask',
      'enemy_bullet', 'coin',	        'player_bullet','grenade',
      'water',        'lava',         'crush',        'crusher',
      'torch',        'item',         'paddle',       'phantom',
      'lava_glow',    'light',		    'rock',			    'spear',
      'saw',			    'player_light'
    ];
//--------------------------------------------------------------------------
  function setup(images, level) {
    map      = new Map(level);
    camera   = new Camera();
    elements = new Elements(level);
    renderer = new Renderer(images);
    renderer.msg(map.name,100);
    //----------------------------------------------------------------------
    // DAT.GUI
    //----------------------------------------------------------------------
    /*var f1, f2, f3, gui = new dat.GUI();

    dat.GUI.prototype.removeFolder = function(name) {
      var folder = this.__folders[name];
      if (!folder) {
        return;
      }
      folder.close();
      this.__ul.removeChild(folder.domElement.parentNode);
      delete this.__folders[name];
      this.onResize();
    };

    dat.GUI.prototype.gameData = function(){
      if (f1) { gui.removeFolder('Player'); }
      if (f2) { gui.removeFolder('Forces'); }
      if (f3) { gui.removeFolder('World'); }
      f1 = gui.addFolder('Player');
      f2 = gui.addFolder('Forces');
      f3 = gui.addFolder('World');
      f1.add(renderer,'dynamicLights');
      f1.add(player, 'godMode');
      f1.add(player, 'maxSpeed');
      f1.add(player, 'x').listen();
      f1.add(player, 'y').listen();
      f1.add(player, 'exterminate');
      f2.add(player.force, 'x').listen();
      f2.add(player.force, 'y').listen();
      f3.add(map, 'gravity', 0, 2);
      f3.add(camera, 'x').listen();
      f3.add(camera, 'y').listen();
      f3.add(camera, 'center');
      f3.add(camera, 'shake');
      //f1.open();
      //f2.open();
    };
    gui.gameData();*/
  }
  //--------------------------------------------------------------------------
  function update(dt) {
    elements.update(dt);
    camera.update(dt);
    player.update(dt);
  }
  //--------------------------------------------------------------------------
  function render(dt) {
    renderer.render(dt);
  }
  //--------------------------------------------------------------------------
  function resizeViewport() {
    var gameArea  = document.getElementById('game'),
        canvas    = document.getElementById('canvas'),
        newWidth  = window.innerWidth,//  < MaxWidth  ? window.innerWidth  : MaxWidth,
        newHeight = window.innerHeight,// < MaxHeight ? window.innerHeight : MaxHeight,
        newRatio  = newWidth / newHeight;

    PixelScale = window.innerWidth / 240;
    Ratio = window.innerWidth / window.innerHeight;
    ResolutionX = Math.round(window.innerWidth / PixelScale);
    ResolutionY = Math.round(window.innerHeight / PixelScale);
    gameArea.style.transform = 'none';
    if (newRatio > Ratio) {
      newWidth = newHeight * Ratio;
    } else {
      newHeight = newWidth / Ratio;
    }
    gameArea.style.width = newWidth + 'px';
    gameArea.style.height = newHeight + 'px';
    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    ScaleX = Math.round(newWidth  / ResolutionX);
    ScaleY = Math.round(newHeight / ResolutionY);
    canvas.width = ScaleX * ResolutionX;
    canvas.height = ScaleY * ResolutionY;
  }
  function resizeGame(){
    resizeViewport();
    camera.center();
  }
//--------------------------------------------------------------------------
(function(){
  resizeViewport();
  Game.Load.images(IMAGES, function(images) {
    Game.Load.json("assets/levels/main.json", function(level) {
      setup(images, level);
      Game.run({
        update: update,
        render: render
      });
      Dom.on(document, 'keydown', function(ev) { return Game.onkey(ev, ev.keyCode, true);  }, false);
      Dom.on(document, 'keyup',   function(ev) { return Game.onkey(ev, ev.keyCode, false); }, false);

      var leftPad = new Hammer(document.getElementById('trackpad-left'), {})
        , rightPad = new Hammer(document.getElementById('trackpad-right'), {});

      leftPad.get('pan').set({threshold: 3});
      rightPad.get('tap').set({pointers: 1,threshold: 5, time: 150});
      //rightPad.get('press').set({event: 'press',pointers: 1,threshold: 5,time: 150});

      leftPad.on('pan', function(ev){
        console.log('l', ev);
        switch(ev.direction){
          case 2: Game.input.left = !Game.input.right; break;
          case 4: Game.input.right = !Game.input.left; break;
          case 8:
            if(ev.distance > 100) {
              Game.input.up = true;
              setTimeout(function(){Game.input.up=false;}, 200);
            }
            break;
          case 16:
              if(ev.distance > 100) {
                setTimeout(function(){Game.input.down=false;}, 200);
                Game.input.down = true;
              }
            break;
        }
      });
      leftPad.on('panend', function(ev){
        Game.input.left = false;
        Game.input.right = false;
        Game.input.up = false;
        Game.input.down = false;
      });

      rightPad.on('tap', function(ev){
        console.log('r', ev.type);
        Game.input.shoot = true;
        setTimeout(function(){Game.input.shoot=false;}, 200);
      });

      window.addEventListener('resize', resizeGame, false);
      window.addEventListener('orientationchange', resizeGame, false);
      document.ontouchmove = function(event){event.preventDefault();};
      resizeGame();
    });
  });
}());

