const Game = {
  fps       : 60,
  debug     : true,
  entities  : {},
  map       : {},
  elements  : {},
  camera    : {},
  player    : {},
  renderer  : {},
  fpsmeter  : {},
  resolution: {
    x: 320,
    y: 180,
    r: 16 / 9,
    scale: {
      x: 4,
      y: 4,
      pixel: 3
    }
  },
  input: {
    left: false, right: false, up: false, down: false,
    jump: false, shoot: false, action: false, throw: false
  },
  run: function (options) {
    let now,
        dt = 0,
        last = Game.Math.timestamp(),
        step = 1 / Game.fps,
        update = options.update,
        render = options.render;
    if (Game.debug) {
      new DAT();
      Game.fpsmeter = new FPSMeter({
        decimals: 0,
        graph: true,
        theme: 'dark',
        position: 'fixed',
        top: 'auto',
        left: 'auto',
        bottom: '5px',
        right: '5px'
      });
    }
    function frame() {
      if (Game.debug) {
        Game.fpsmeter.tickStart();
      }
      now = Game.Math.timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while (dt > step) {
        dt = dt - step;
        update(step);
      }
      render(dt);
      last = now;
      if (Game.debug) {
        Game.fpsmeter.tick();
      }
      requestAnimationFrame(frame);
    }
    frame();
  },
  addEntity: function (id, obj) {
    this.entities[id] = obj;
  },
  onKey: function (ev, key, pressed) {
    switch (key) {
      case KEY.LEFT   : this.input.left   = pressed; break;
      case KEY.RIGHT  : this.input.right  = pressed; break;
      case KEY.THROW  : this.input.throw  = pressed; break;
      case KEY.SHOOT  : this.input.shoot  = pressed; break;
      case KEY.SPACE  :
      case KEY.UP     : this.input.up     = pressed; break;
      case KEY.DOWN   : this.input.down   = pressed; break;
    }
    ev.preventDefault();
    return false;
  },
  resizeViewport: function () {
    const gameArea = document.getElementById('game');
    const canvas = document.getElementById('canvas');
    let newWidth = window.innerWidth;//  < MaxWidth  ? window.innerWidth  : MaxWidth,
    let newHeight = window.innerHeight;// < MaxHeight ? window.innerHeight : MaxHeight,
    let newRatio = newWidth / newHeight;

    Game.resolution.scale.pixel = window.innerWidth / 240;
    Game.resolution.r = window.innerWidth / window.innerHeight;
    Game.resolution.x = Math.round(window.innerWidth / Game.resolution.scale.pixel);
    Game.resolution.y = Math.round(window.innerHeight / Game.resolution.scale.pixel);
    if (newRatio > Game.resolution.r) {
      newWidth = newHeight * Game.resolution.r;
    } else {
      newHeight = newWidth / Game.resolution.r;
    }
    gameArea.style.transform = 'none';
    gameArea.style.width = newWidth + 'px';
    gameArea.style.height = newHeight + 'px';
    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    Game.resolution.scale.x = Math.round(newWidth / Game.resolution.x);
    Game.resolution.scale.y = Math.round(newHeight / Game.resolution.y);
    canvas.width = Game.resolution.scale.x * Game.resolution.x;
    canvas.height = Game.resolution.scale.y * Game.resolution.y;
  },
  resizeGame: function () {
    Game.resizeViewport();
    Game.camera.center();
  },
//-------------------------------------------------------------------------
// ASSET PRELOADING
//-------------------------------------------------------------------------
  Init: function(params){
    const d = Promise.defer();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function progress(perc) {
      ctx.save();
      ctx.scale(Game.resolution.scale.x, Game.resolution.scale.y);
      ctx.clearRect(0, 0, Game.resolution.x, Game.resolution.y);
      ctx.fillStyle = '#000000';
      ctx.fillRect(((Game.resolution.x - 100) / 2) - 2, (Game.resolution.y / 2) - 7, 104, 9);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((Game.resolution.x - 100) / 2, (Game.resolution.y / 2) - 5, 100, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((Game.resolution.x - 100) / 2, (Game.resolution.y / 2) - 5, 100 * (perc / 100), 5);
      ctx.restore();
    }

    function getImages(names) {
      const d = Promise.defer();
      let n, name, count = names.length, loaded = 0, result = {};
      const onload = () => {
        progress(++loaded * (100 / names.length));
        if (--count === 0) {
          d.resolve(result);
        }
      };

      for (n = 0; n < names.length; n++) {
        name = names[n];
        result[name] = document.createElement('img');
        Dom.on(result[name], 'load', onload);
        result[name].src = "assets/images/" + name + ".png";
      }
      return d.promise;
    }

    function getJSON(url) {
      const xhr = new XMLHttpRequest();
      const d = Promise.defer();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            d.resolve(JSON.parse(xhr.responseText));
          } else {
            d.reject(xhr.responseText);
          }
        }
      };
      xhr.open('GET', url);
      xhr.send();
      return d.promise;
    }

    getJSON(params.data).then(level => {
      Game.map      = new Map(level);
      Game.camera   = new Camera();
      Game.elements = new Elements(level.layers[2].objects);
      return getImages(params.assets);
    }).then( images => {
      Game.renderer = new Renderer(images);
      d.resolve(Game);
    }).catch(function(error) {
      console.log(error);
    });

    Game.resizeViewport();
    progress(0);

    return d.promise;
  },
//-------------------------------------------------------------------------
// MATH UTILITIES
//-------------------------------------------------------------------------
  Math: {
    indexOf: function (array, searchElement) {
      for (var i = 0, l = array.length; i < l; i++) {
        if (searchElement === array[i]) {
          return i;
        }
      }
      return -1;
    },
    lerp: function (n, dn, dt) {
      return n + (dn * dt);
    },
    timestamp: function () {
      return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    },
    bound: function (x, min, max) {
      return Math.max(min, Math.min(max, x));
    },
    between: function (n, min, max) {
      return ((n >= min) && (n <= max));
    },
    brighten: function (hex, percent) {
      var a = Math.round(255 * percent / 100),
        r = a + parseInt(hex.substr(1, 2), 16),
        g = a + parseInt(hex.substr(3, 2), 16),
        b = a + parseInt(hex.substr(5, 2), 16);

      r = r < 255 ? (r < 1 ? 0 : r) : 255;
      g = g < 255 ? (g < 1 ? 0 : g) : 255;
      b = b < 255 ? (b < 1 ? 0 : b) : 255;

      return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
    },
    darken: function (hex, percent) {
      return this.brighten(hex, -percent);
    },
    normalize: function (n, min, max) {
      while (n < min) {
        n += (max - min);
      }
      while (n >= max) {
        n -= (max - min);
      }
      return n;
    },
    rgbToHex: function (r, g, b) {
      if (r > 255 || g > 255 || b > 255) {
        throw "Invalid color component";
      }
      return ((r < 16) || (g < 8) || b).toString(16);
    },
    overlap: function (a, b) {
      return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    },
    normalizeAngle180: function (angle) {
      return this.normalize(angle, -180, 180);
    },
    normalizeAngle360: function (angle) {
      return this.normalize(angle, 0, 360);
    },
    random: function (min, max) {
      return (min + (Math.random() * (max - min)));
    },
    randomInt: function (min, max) {
      return Math.round(this.random(min, max));
    },
    randomChoice: function (choices) {
      return choices[this.randomInt(0, choices.length - 1)];
    }
  }
};

//-------------------------------------------------------------------------
// DAT.GUI
//-------------------------------------------------------------------------
class DAT {
  constructor() {
    let f1, f2, f3, gui = new dat.GUI();

    dat.GUI.prototype.removeFolder = function (name) {
      var folder = this.__folders[name];
      if (!folder) {
        return;
      }
      folder.close();
      this.__ul.removeChild(folder.domElement.parentNode);
      delete this.__folders[name];
      this.onResize();
    };

    dat.GUI.prototype.gameData = function () {
      if (f1) {
        gui.removeFolder('Player');
      }
      if (f2) {
        gui.removeFolder('Forces');
      }
      if (f3) {
        gui.removeFolder('World');
      }
      f1 = gui.addFolder('Player');
      f2 = gui.addFolder('Forces');
      f3 = gui.addFolder('World');
      f1.add(Game.renderer, 'dynamicLights');
      f1.add(Game.player, 'godMode');
      f1.add(Game.player, 'maxSpeed');
      f1.add(Game.player, 'x').listen();
      f1.add(Game.player, 'y').listen();
      f1.add(Game.player, 'exterminate');
      f2.add(Game.player.force, 'x').listen();
      f2.add(Game.player.force, 'y').listen();
      f3.add(Game.map, 'gravity', 0, 2);
      f3.add(Game.camera, 'x').listen();
      f3.add(Game.camera, 'y').listen();
      f3.add(Game.camera, 'center');
      f3.add(Game.camera, 'shake');
      //f1.open();
      //f2.open();
    };
    gui.gameData();
  }
}
window.Game = window.Game || Game;
