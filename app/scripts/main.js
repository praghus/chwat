var map, elements, camera, player, renderer,
    FPS              = 60,
    ResolutionX      = 320,
    ResolutionY      = 180,
    Ratio            = 16 / 9,
    PAUSE            = false,
//--------------------------------------------------------------------------
    KEY = {
      LEFT:  37,      UP:    38,      RIGHT: 39,      DOWN:   40,
      SPACE: 32,      SHOOT: 69,      THROW: 87,      ACTION: 81
    },
//--------------------------------------------------------------------------
// Dynamic lights
//--------------------------------------------------------------------------
    UseDynamicLights = true,
    BlackOverlay     = 1,
    DarkAlpha        = 1,
    Lamp             = illuminated.Lamp,
    RectangleObject  = illuminated.RectangleObject,
    Vec2             = illuminated.Vec2,
    Lighting         = illuminated.Lighting,
    DarkMask         = illuminated.DarkMask,
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
//--------------------------------------------------------------------------
// Images
//--------------------------------------------------------------------------
    IMAGES = [
      'player',       'tiles',        'foretiles',	  'font',
      'shadows',      'containers',   'live',         'bg2',
      'bg3',          'bg4',          'gloom',        'torch_light',
      'enemy_blob',   'enemy_tank',   'skeleton',     'enemy_spider',
      'haunebu',      'explosion1',   'explosion2',   'dark_mask',
      'enemy_bullet', 'coin',	        'player_bullet','stone',
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
    var f1, f2, f3, gui = new dat.GUI();
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
    gui.gameData();
  }
  //--------------------------------------------------------------------------
  function update(dt) {
    if (!PAUSE){
      elements.update(dt);
      camera.update(dt);
      player.update(dt);
    }
  }
  //--------------------------------------------------------------------------
  function render(dt) {
    renderer.render(dt);
  }
  //--------------------------------------------------------------------------
  function ontouch(ev, pressed) {
    console.log(ev);
    player.input.up = pressed;
  }
  //--------------------------------------------------------------------------
  function onkey(ev, key, pressed) {
    switch(key) {
      case KEY.LEFT:   player.input.left   = pressed; ev.preventDefault(); return false;
      case KEY.RIGHT:  player.input.right  = pressed; ev.preventDefault(); return false;
      case KEY.UP:     player.input.up     = pressed; ev.preventDefault(); return false;
      case KEY.DOWN:   player.input.down   = pressed; ev.preventDefault(); return false;
      case KEY.THROW:  player.input.throw  = pressed; ev.preventDefault(); return false;
      case KEY.SHOOT:  player.input.shoot  = pressed; ev.preventDefault(); return false;
      case KEY.ACTION:
        player.input.action          = pressed && player.input.actionAvailable;
        player.input.actionAvailable = !pressed;
        break;
      case KEY.SPACE:  if (!pressed) { PAUSE = !PAUSE; ev.preventDefault(); } break;
    }
  }
  //--------------------------------------------------------------------------
  function resizeGame() {
    var gameArea  = document.getElementById('game'),
      canvas    = document.getElementById('canvas'),
      newWidth  = window.innerWidth,//  < MaxWidth  ? window.innerWidth  : MaxWidth,
      newHeight = window.innerHeight,// < MaxHeight ? window.innerHeight : MaxHeight,
      newRatio  = newWidth / newHeight;

    if (newRatio > Ratio) {
      newWidth = newHeight * Ratio;
      gameArea.style.height = newHeight + 'px';
      gameArea.style.width  = newWidth + 'px';
    } else {
      newHeight = newWidth / Ratio;
      gameArea.style.width  = newWidth + 'px';
      gameArea.style.height = newHeight + 'px';
    }
    gameArea.style.marginTop  = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    renderer.scaleX = Math.round(newWidth  / ResolutionX);
    renderer.scaleY = Math.round(newHeight / ResolutionY);
    canvas.width    = renderer.scaleX * ResolutionX;
    canvas.height   = renderer.scaleY * ResolutionY;
  }
//--------------------------------------------------------------------------
(function(){
  Game.Load.images(IMAGES, function(images) {
    Game.Load.json("assets/levels/main", function(level) {
      setup(images, level);
      Game.run({
        update: update,
        render: render
      });
      Dom.on(document,      'keydown',    function(ev) { return onkey(ev, ev.keyCode, true);  }, false);
      Dom.on(document,      'keyup',      function(ev) { return onkey(ev, ev.keyCode, false); }, false);
      Dom.on('canvas',      'touchstart', function(ev) { return ontouch(ev, true); }, false);
      Dom.on('canvas',      'touchmove',  function(ev) { return ontouch(ev, true); }, true);
      Dom.on('canvas',      'touchend',   function(ev) { return ontouch(ev, false); }, false);
      Dom.on('ctrl_left',   'touchstart', function(ev) { return onkey(ev, KEY.LEFT, true); }, false);
      Dom.on('ctrl_left',   'touchend',   function(ev) { return onkey(ev, KEY.LEFT, false); }, false);
      Dom.on('ctrl_right',  'touchstart', function(ev) { return onkey(ev, KEY.RIGHT, true); }, false);
      Dom.on('ctrl_right',  'touchend',   function(ev) { return onkey(ev, KEY.RIGHT, false); }, false);
      window.addEventListener('resize', resizeGame, false);
      window.addEventListener('orientationchange', resizeGame, false);
      document.getElementById("preloader").style.display = "none";
      resizeGame();
      camera.center();
    });
  });
}());

