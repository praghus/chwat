class GameController  {
  constructor(elem) {
    this.container = elem;
    this.$ = document.getElementById('canvas').getContext('2d');
    this.fps = 60;
    this.debug = true;
    this.entities = {};
    this.map = {};
    this.elements = {};
    this.camera = {};
    this.player = {};
    this.renderer = {};
    this.fpsmeter = {};
    this.resolution = {
      x: 320,
      y: 180,
      r: 16 / 9,
      scale: {
        x: 4,
        y: 4,
        pixel: 3
      }
    };
    this.input = {
      left: false, right: false, up: false, down: false,
      jump: false, shoot: false, action: false, throw: false
    };
    this.m = new MathUtils();
  }

  run(options) {
    let now,
        dt = 0,
        last = Game.m.timestamp(),
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
    const frame = ()=> {
      if (Game.debug) {
        Game.fpsmeter.tickStart();
      }
      now = Game.m.timestamp();
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
    };
    frame();
  }

  addEntity(id, obj) {
    this.entities[id] = obj;
  }

  resizeViewport() {
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
  }

  resizeGame() {
    Game.resizeViewport();
    Game.camera.center();
  }

//-------------------------------------------------------------------------
// ASSET PRELOADING
//-------------------------------------------------------------------------
  Init(params){
    const d = Promise.defer();
    const $ = document.getElementById('canvas').getContext('2d');

    const progress = (perc)=> {
      $.save();
      $.scale(Game.resolution.scale.x, Game.resolution.scale.y);
      $.clearRect(0, 0, Game.resolution.x, Game.resolution.y);
      $.fillStyle = '#000000';
      $.fillRect(((Game.resolution.x - 100) / 2) - 2, (Game.resolution.y / 2) - 7, 104, 9);
      $.fillStyle = '#FFFFFF';
      $.fillRect((Game.resolution.x - 100) / 2, (Game.resolution.y / 2) - 5, 100, 5);
      $.fillStyle = '#000000';
      $.fillRect((Game.resolution.x - 100) / 2, (Game.resolution.y / 2) - 5, 100 * (perc / 100), 5);
      $.restore();
    };

    const getImages = (names)=> {
      const d = Promise.defer();
      let name, count = names.length, loaded = 0, result = {};
      const onload = () => {
        progress(++loaded * (100 / names.length));
        if (--count === 0) {
          d.resolve(result);
        }
      };
      for (let n = 0; n < names.length; n++) {
        name = names[n];
        result[name] = document.createElement('img');
        Dom.on(result[name], 'load', onload);
        result[name].src = "assets/images/" + name + ".png";
      }
      return d.promise;
    };

    const getJSON = (url)=> {
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
    };

    getJSON(params.data).then(level => {
      Game.map      = new Map(level);
      Game.camera   = new Camera();
      Game.elements = new Elements(level.layers[2].objects);
      return getImages(params.assets);
    }).then( images => {
      Game.renderer = new Renderer(images, $);
      d.resolve(Game);
    }).catch(function(error) {
      console.log(error);
    });

    Game.resizeViewport();
    progress(0);

    return d.promise;
  }
}


//-------------------------------------------------------------------------
// MATH UTILITIES
//-------------------------------------------------------------------------
class MathUtils {

  indexOf(array, searchElement) {
    for (var i = 0, l = array.length; i < l; i++) {
      if (searchElement === array[i]) {
        return i;
      }
    }
    return -1;
  }

  lerp(n, dn, dt) {
    return n + (dn * dt);
  }

  timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  bound(x, min, max) {
    return Math.max(min, Math.min(max, x));
  }

  between(n, min, max) {
    return ((n >= min) && (n <= max));
  }

  brighten(hex, percent) {
    var a = Math.round(255 * percent / 100),
      r = a + parseInt(hex.substr(1, 2), 16),
      g = a + parseInt(hex.substr(3, 2), 16),
      b = a + parseInt(hex.substr(5, 2), 16);

    r = r < 255 ? (r < 1 ? 0 : r) : 255;
    g = g < 255 ? (g < 1 ? 0 : g) : 255;
    b = b < 255 ? (b < 1 ? 0 : b) : 255;

    return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
  }

  darken(hex, percent) {
    return this.brighten(hex, -percent);
  }

  normalize(n, min, max) {
    while (n < min) {
      n += (max - min);
    }
    while (n >= max) {
      n -= (max - min);
    }
    return n;
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) {
      throw "Invalid color component";
    }
    return ((r < 16) || (g < 8) || b).toString(16);
  }

  overlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }


  random(min, max) {
    return (min + (Math.random() * (max - min)));
  }

  randomInt (min, max) {
    return Math.round(this.random(min, max));
  }

  randomChoice(choices) {
    return choices[this.randomInt(0, choices.length - 1)];
  }
}

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
window.Game = window.Game || new GameController();
