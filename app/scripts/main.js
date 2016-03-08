const
//--------------------------------------------------------------------------
  KEY = {
    LEFT:  37,      UP:    38,      RIGHT: 39,      DOWN:   40,
    SPACE: 32,      SHOOT: 69,      THROW: 87,      ACTION: 81
  },
//--------------------------------------------------------------------------
// Images
//--------------------------------------------------------------------------
  Images = [
    'player',       'tiles',        'foretiles',	  'font',
    'shadows',      'live',         'bg2',          'bg3',
    'bg4',          'enemy_blob',   'enemy_tank',   'enemy_bat',
    'explosion1',   'explosion2',   'dark_mask',    'item',
    'enemy_bullet', 'coin',	        'player_bullet','grenade',
    'water',        'lava',         'crusher',      'player_light',
    'lava_glow',    'light',		    'rock',			    'spear',
    'saw',			    'paddle'
  ];
//--------------------------------------------------------------------------

const game = new GameController(Dom.get('canvas'));

//--------------------------------------------------------------------------
window.onload = ()=>
{
  game.init({data: "assets/levels/main.json", assets: Images}).then(()=> {
    game.renderer.msg(game.world.name, 100);
    game.run({
      update: ()=> {
        game.elements.update();
        game.camera.update();
        game.player.update();
      },
      render: ()=> game.renderer.render()
    });

    let { input } = game.player;
    function onKey(ev, key, pressed) {
      switch (key) {
        case KEY.LEFT   : input.left = pressed; break;
        case KEY.RIGHT  : input.right = pressed; break;
        case KEY.THROW  : input.throw = pressed; break;
        case KEY.SHOOT  : input.shoot = pressed; break;
        case KEY.SPACE  :
        case KEY.UP     : input.up = pressed; break;
        case KEY.DOWN   : input.down = pressed; break;
      }
      ev.preventDefault();
      return false;
    }

    let lPad = new Hammer(Dom.get('trackpad-left'), {});
    let rPad = new Hammer(Dom.get('trackpad-right'), {});

    lPad.get('pan').set({threshold: 3});
    rPad.get('pan').set({threshold: 5});
    rPad.get('tap').set({pointers: 1, threshold: 5, time: 150});

    lPad.on('pan', ev => {
      switch (ev.additionalEvent) {
        case 'panleft'  : input.left = !input.right; break;
        case 'panright' : input.right = !input.left; break;
      }
    }).on('panend', () => {
      input.left = false;
      input.right = false;
    });

    rPad.on('pan', ev => {
      switch (ev.additionalEvent) {
        case 'panup':input.up = true;break;
        case 'pandown':input.down = true;break;
      }
    }).on('panend', () => {
      input.up = false;
      input.down = false;
    });

    rPad.on('tap', () => {
      input.shoot = true;
      setTimeout(()=> input.shoot = false, 200);
    });

    Dom.on(window, 'resize', ()=> game.resizeGame(), false);
    Dom.on(window, 'orientationchange', ()=> game.resizeGame(), false);

    Dom.on(document, 'keydown', (ev)=> onKey(ev, ev.keyCode, true), false);
    Dom.on(document, 'keyup', (ev)=> onKey(ev, ev.keyCode, false), false);

    // prevent bumping effect on mobile browsers
    Dom.on(document, 'ontouchmove', (ev)=> ev.preventDefault(), false);

    game.resizeGame();
  });
};


