//-------------------------------------------------------------------------
// POLYFILLS
//-------------------------------------------------------------------------
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
}
//-------------------------------------------------------------------------
// FPSMeter
//-------------------------------------------------------------------------
let FPS = 60,
    ResolutionX = 320,
    ResolutionY = 180,
    Ratio = 16 / 9,
    PixelScale = 3,
    ScaleX = 4,
    ScaleY = 4;
//-------------------------------------------------------------------------
// SIMPLE DOM UTILITIES
//-------------------------------------------------------------------------
const Dom = {
  get: function (id) {
    return ((id instanceof HTMLElement) || (id === document)) ? id : document.getElementById(id);
  },
  set: function (id, html) {
    Dom.get(id).innerHTML = html;
  },
  on: function (ele, type, fn, capture) {
    Dom.get(ele).addEventListener(type, fn, capture);
  },
  un: function (ele, type, fn, capture) {
    Dom.get(ele).removeEventListener(type, fn, capture);
  },
  show: function (ele, type) {
    Dom.get(ele).style.display = (type || 'block');
  }
};
//=========================================================================
let Game = {
  input: {
    left: false, right: false, up: false, down: false,
    jump: false, shoot: false, action: false, throw: false
  },
  entities: {},
  map: {},
  elements: {},
  camera: {},
  player: {},
  renderer: {},
  fpsmeter: new FPSMeter({
    decimals  : 0,
    graph     : true,
    theme     : 'dark',
    position  : 'fixed',
    top       : 'auto',
    left      : 'auto',
    bottom    : '5px',
    right     : '5px'
  }),
  run: function (options) {
    var now,
      dt = 0,
      last = Game.Math.timestamp(),
      step = 1 / FPS,
      update = options.update,
      render = options.render;



    function frame() {
      Game.fpsmeter.tickStart();
      now = Game.Math.timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while (dt > step) {
        dt = dt - step;
        update(step);
      }
      render(dt);
      last = now;
      Game.fpsmeter.tick();
      requestAnimationFrame(frame);
    }

    frame();
  },
  addEntity: function (id, obj) {
    this.entities[id] = obj;
    //Class.extend(this.entities[id], Entity);
  },
  onKey: function (ev, key, pressed) {
    switch (key) {
      case KEY.LEFT:
        this.input.left = pressed;
        ev.preventDefault();
        return false;
      case KEY.RIGHT:
        this.input.right = pressed;
        ev.preventDefault();
        return false;
      case KEY.THROW:
        this.input.throw = pressed;
        ev.preventDefault();
        return false;
      case KEY.SHOOT:
        this.input.shoot = pressed;
        ev.preventDefault();
        return false;
      case KEY.SPACE:
      case KEY.UP:
        this.input.up = pressed;
        ev.preventDefault();
        return false;
      case KEY.DOWN:
        this.input.down = pressed;
        ev.preventDefault();
        return false;
    }
  },
  resizeViewport: function () {
    var gameArea = document.getElementById('game'),
      canvas = document.getElementById('canvas'),
      newWidth = window.innerWidth,//  < MaxWidth  ? window.innerWidth  : MaxWidth,
      newHeight = window.innerHeight,// < MaxHeight ? window.innerHeight : MaxHeight,
      newRatio = newWidth / newHeight;

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
    ScaleX = Math.round(newWidth / ResolutionX);
    ScaleY = Math.round(newHeight / ResolutionY);
    canvas.width = ScaleX * ResolutionX;
    canvas.height = ScaleY * ResolutionY;
  },
  resizeGame: function () {
    Game.resizeViewport();
    Game.camera.center();
  },
//-------------------------------------------------------------------------
// ASSET LOADING UTILITIES
//-------------------------------------------------------------------------
  Load: {
    progress: function (ctx, perc) {
      ctx.save();
      ctx.scale(ScaleX, ScaleY);
      ctx.clearRect(0, 0, ResolutionX, ResolutionY);
      ctx.fillStyle = '#000000';
      ctx.fillRect(((ResolutionX - 100) / 2) - 2, (ResolutionY / 2) - 7, 104, 9);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((ResolutionX - 100) / 2, (ResolutionY / 2) - 5, 100, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((ResolutionX - 100) / 2, (ResolutionY / 2) - 5, 100 * (perc / 100), 5);
      ctx.restore();
    },
    images: function (names, callback) {
      var n,
        name,
        result = {},
        count = names.length,
        loaded = 0,
        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        onload = function () {
          Game.Load.progress(ctx, ++loaded * (100 / names.length));
          if (--count === 0) {
            callback(result);
          }
        };
      for (n = 0; n < names.length; n++) {
        name = names[n];
        result[name] = document.createElement('img');
        Dom.on(result[name], 'load', onload);
        result[name].src = "assets/images/" + name + ".png";
      }
    },
    json: function (url, onsuccess) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if ((request.readyState === 4) && (request.status === 200)) {
          onsuccess(JSON.parse(request.responseText));
        }
      };
      request.open("GET", url, true);
      request.send();
    }
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
