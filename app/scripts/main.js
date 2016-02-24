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
    'bg4',          'enemy_blob',   'enemy_tank',   'explosion1',
    'explosion2',   'dark_mask',    'item',         'paddle',
    'enemy_bullet', 'coin',	        'player_bullet','grenade',
    'water',        'lava',         'crush',        'crusher',
    'lava_glow',    'light',		    'rock',			    'spear',
    'saw',			    'player_light'
  ];
//--------------------------------------------------------------------------

  let game = new GameController();

  const g1 = 'background-color: #444444;';
  const g2 = 'background-color: #333333;';
  const g3 = 'color:#CCCCCC;font-weight:bold; background-color: #222222;';
  console.log("%c %c %c | -NIHIL- | %c %c ", g1, g2, g3, g2, g1);

window.onload = ()=>
{

  game.Init({data: "assets/levels/main.json", assets: Images}).then(()=> {
    game.renderer.msg(game.map.name, 100);
    game.run({
      update: ()=> {
        game.elements.update();
        game.camera.update();
        game.player.update();
      },
      render: ()=> game.renderer.render()
    });

    function onKey(ev, key, pressed) {
      switch (key) {
        case KEY.LEFT   :game.input.left = pressed;break;
        case KEY.RIGHT  :game.input.right = pressed;break;
        case KEY.THROW  :game.input.throw = pressed;break;
        case KEY.SHOOT  :game.input.shoot = pressed;break;
        case KEY.SPACE  :
        case KEY.UP     :game.input.up = pressed;break;
        case KEY.DOWN   :game.input.down = pressed;break;
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
        case 'panleft':game.input.left = !game.input.right;break;
        case 'panright':game.input.right = !game.input.left;break;
      }
    }).on('panend', () => {
      game.input.left = false;
      game.input.right = false;
    });

    rPad.on('pan', ev => {
      switch (ev.additionalEvent) {
        case 'panup':game.input.up = true;break;
        case 'pandown':game.input.down = true;break;
      }
    }).on('panend', () => {
      game.input.up = false;
      game.input.down = false;
    });

    rPad.on('tap', () => {
      game.input.shoot = true;
      setTimeout(()=> game.input.shoot = false, 200);
    });

    Dom.on(window, 'resize', game.resizeGame, false);
    Dom.on(window, 'orientationchange', game.resizeGame, false);

    Dom.on(document, 'keydown', ev => onKey(ev, ev.keyCode, true), false);
    Dom.on(document, 'keyup', ev => onKey(ev, ev.keyCode, false), false);

    // prevent bumping effect on mobile browsers
    Dom.on(document, 'ontouchmove', event => event.preventDefault(), false);

    game.resizeGame();
  });
};


