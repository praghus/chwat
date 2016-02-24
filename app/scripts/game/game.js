class GameController
{
  constructor() {
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
      scale: { x: 4, y: 4, pixel: 3 }
    };
    this.input = {
      left: false, right: false, up: false, down: false,
      jump: false, shoot: false, action: false, throw: false
    };
    this.m = new MathUtils();
  }

  run(options) {
    let now;
    let dt = 0;
    let last = this.m.timestamp();
    let step = 1 / this.fps;

    const update = options.update;
    const render = options.render;

    if (this.debug) {
      new DAT();
      this.fpsmeter = new FPSMeter({
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
      if (this.debug) {
        this.fpsmeter.tickStart();
      }
      now = this.m.timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while (dt > step) {
        dt = dt - step;
        update(step);
      }
      render(dt);
      last = now;
      if (this.debug) {
        this.fpsmeter.tick();
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

    this.resolution.scale.pixel = window.innerWidth / 240;
    this.resolution.r = window.innerWidth / window.innerHeight;
    this.resolution.x = Math.round(window.innerWidth / this.resolution.scale.pixel);
    this.resolution.y = Math.round(window.innerHeight / this.resolution.scale.pixel);
    if (newRatio > this.resolution.r) {
      newWidth = newHeight * this.resolution.r;
    } else {
      newHeight = newWidth / this.resolution.r;
    }
    gameArea.style.transform = 'none';
    gameArea.style.width = newWidth + 'px';
    gameArea.style.height = newHeight + 'px';
    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    this.resolution.scale.x = Math.round(newWidth / this.resolution.x);
    this.resolution.scale.y = Math.round(newHeight / this.resolution.y);
    canvas.width = this.resolution.scale.x * this.resolution.x;
    canvas.height = this.resolution.scale.y * this.resolution.y;
  }

  resizeGame() {
    this.resizeViewport();
    this.camera.center();
  }

//-------------------------------------------------------------------------
// ASSET PRELOADING
//-------------------------------------------------------------------------
  Init(params){
    const d = Promise.defer();
    const $ = document.getElementById('canvas').getContext('2d');

    const progress = (perc)=> {
      const {x, y, scale} = this.resolution;
      $.save();
      $.scale(scale.x, scale.y);
      $.clearRect(0, 0, x, y);
      $.fillStyle = '#000000';
      $.fillRect(((x - 100) / 2) - 2, (y / 2) - 7, 104, 9);
      $.fillStyle = '#FFFFFF';
      $.fillRect((x - 100) / 2, (y / 2) - 5, 100, 5);
      $.fillStyle = '#000000';
      $.fillRect((x - 100) / 2, (y / 2) - 5, 100 * (perc / 100), 5);
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
      this.map      = new Map(level);
      this.camera   = new Camera();
      this.elements = new Elements(level.layers[2].objects);
      return getImages(params.assets);
    }).then( images => {
      this.renderer = new Renderer(images, $);
      d.resolve(Game);
    }).catch(function(error) {
      console.log(error);
    });

    this.resizeViewport();
    progress(0);

    return d.promise;
  }
}

window.Game = window.Game || new GameController();
