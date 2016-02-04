var FPS               = 60,
    ResolutionX       = 320,
    ResolutionY       = 180,
    Ratio             = 16 / 9,
    PixelScale        = 3,
    ScaleX            = 4,
    ScaleY            = 4,
//--------------------------------------------------------------------------
    map, elements, camera, player, renderer,
//--------------------------------------------------------------------------
    KEY = {
      LEFT:  37,      UP:    38,      RIGHT: 39,      DOWN:   40,
      SPACE: 32,      SHOOT: 69,      THROW: 87,      ACTION: 81
    },
    DIR = {
      UP: 0, RIGHT: 1, BOTTOM: 2, LEFT: 3
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
//--------------------------------------------------------------------------
// Images
//--------------------------------------------------------------------------
    IMAGES = [
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
  function setup(images, level) {
    map      = new Mapa(level);
    camera   = new Camera();
    elements = new Elements(level.layers[2].objects);
    renderer = new Renderer(images);
    renderer.msg(map.name,100);
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
    if (newRatio > Ratio) {
      newWidth = newHeight * Ratio;
    } else {
      newHeight = newWidth / Ratio;
    }
    gameArea.style.transform = 'none';
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
  var g1 = 'background-color: #444444;';
  var g2 = 'background-color: #333333;';
  var g3 = 'color:#CCCCCC;font-weight:bold; background-color: #222222;';
  console.log("%c %c %c | -NIHIL- | %c %c ", g1, g2, g3, g2, g1);

  resizeViewport();
  Game.Load.images(IMAGES, function(images) {
    Game.Load.json("assets/levels/main.json", function(level) {
      setup(images, level);
      Game.run({
        update: update,
        render: render
      });
      Dom.on(document, 'keydown', function(ev) { return Game.onKey(ev, ev.keyCode, true);  }, false);
      Dom.on(document, 'keyup',   function(ev) { return Game.onKey(ev, ev.keyCode, false); }, false);

      var lPad = new Hammer(document.getElementById('trackpad-left'), {}),
          rPad = new Hammer(document.getElementById('trackpad-right'), {});

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
        setTimeout(function(){Game.input.shoot=false;}, 200);
      });

      window.addEventListener('resize', resizeGame, false);
      window.addEventListener('orientationchange', resizeGame, false);

      // prevent bumping effect on mobile browsers
      document.ontouchmove = function(event){event.preventDefault();};

      resizeGame();
    });
  });
}());

