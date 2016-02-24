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

  const g1 = 'background-color: #444444;';
  const g2 = 'background-color: #333333;';
  const g3 = 'color:#CCCCCC;font-weight:bold; background-color: #222222;';
  console.log("%c %c %c | -NIHIL- | %c %c ", g1, g2, g3, g2, g1);

window.onload = ()=>
{
  Game.Init({data: "assets/levels/main.json", assets: Images}).then(()=> {
    Game.renderer.msg(Game.map.name, 100);
    Game.run({
      update: ()=> {
        Game.elements.update();
        Game.camera.update();
        Game.player.update();
      },
      render: ()=> Game.renderer.render()
    });

    function onKey(ev, key, pressed) {
      switch (key) {
        case KEY.LEFT   :Game.input.left = pressed;break;
        case KEY.RIGHT  :Game.input.right = pressed;break;
        case KEY.THROW  :Game.input.throw = pressed;break;
        case KEY.SHOOT  :Game.input.shoot = pressed;break;
        case KEY.SPACE  :
        case KEY.UP     :Game.input.up = pressed;break;
        case KEY.DOWN   :Game.input.down = pressed;break;
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
        case 'panleft':
          Game.input.left = !Game.input.right;
          break;
        case 'panright':
          Game.input.right = !Game.input.left;
          break;
      }
    }).on('panend', () => {
      Game.input.left = false;
      Game.input.right = false;
    });

    rPad.on('pan', ev => {
      switch (ev.additionalEvent) {
        case 'panup':
          Game.input.up = true;
          break;
        case 'pandown':
          Game.input.down = true;
          break;
      }
    }).on('panend', () => {
      Game.input.up = false;
      Game.input.down = false;
    });

    rPad.on('tap', () => {
      Game.input.shoot = true;
      setTimeout(()=> Game.input.shoot = false, 200);
    });

    Dom.on(window, 'resize', Game.resizeGame, false);
    Dom.on(window, 'orientationchange', Game.resizeGame, false);

    Dom.on(document, 'keydown', ev => onKey(ev, ev.keyCode, true), false);
    Dom.on(document, 'keyup', ev => onKey(ev, ev.keyCode, false), false);

    // prevent bumping effect on mobile browsers
    Dom.on(document, 'ontouchmove', event => event.preventDefault(), false);

    Game.resizeGame();
  });
};


