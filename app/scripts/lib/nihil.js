//------------------------------------------------------------------------------
// NIHIL
//------------------------------------------------------------------------------
window.nihil = window.nihil || {};
//------------------------------------------------------------------------------
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
          };
})();
(function() {
  'use strict';
  var g1 = 'background-color: #444444;';
  var g2 = 'background-color: #333333;';
  var g3 = 'color:#CCCCCC;font-weight:bold; background-color: #222222;';
  console.log("%c %c %c | -NIHIL- | %c %c ", g1, g2, g3, g2, g1);
}());
//------------------------------------------------------------------------------
// INIT
//------------------------------------------------------------------------------
(function() {
	'use strict';
  nihil.init = function(element, bgcolor, x, y, r, f){
    this.dom = new nihil.Dom();
    this.utils = new nihil.Utils();
    this.class = new nihil.Class();
    this.renderer = new nihil.Renderer(element, bgcolor, x, y, r, f);
    this.timestamp = function() {
      return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    };
    this.log = function(msg) { console.log(msg); };
    this.assets = {};
  };
}());

(function(){
  'use strict';
  function Loop(callback, fpsmeter) {
    var now, dt = 0,
        last = nihil.timestamp(),
        step = 1 / nihil.renderer.fps;
    function frame() {
      if (fpsmeter) {
        fpsmeter.tickStart();
      }
      now = nihil.timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while(dt > step) {
        dt = dt - step;
        callback(step);
      }
      nihil.renderer.render(dt);
      last = now;
      if (fpsmeter) {
        fpsmeter.tick();
      }
      requestAnimationFrame(frame);
    }
    frame();
  }
  nihil.Loop = Loop;
}());

//------------------------------------------------------------------------------
// SIMPLE CLASS CREATION
//------------------------------------------------------------------------------
(function() {
  function Class() {}
  var p = Class.prototype;

  /**
   * create a simple javascript 'class' (a constructor function with a prototype)
   */
  p.create = function(prototype) {
    var ctor = function() {
      if (this.initialize) {
        return this.initialize.apply(this, arguments);
      }
    };
    ctor.prototype = prototype || {};
    return ctor;
  };

  p.extend = function(subclass, superclass) {
  	function o() { this.constructor = subclass; }
  	o.prototype = superclass.prototype;
  	return (subclass.prototype = new o());
  };
  nihil.Class = Class;
}());
//------------------------------------------------------------------------------
// SIMPLE DOM UTILITIES
//------------------------------------------------------------------------------
(function() {
	'use strict';

  function Dom() {}
  var p = Dom.prototype;

  p.get = function(id) { return (
    (id instanceof HTMLElement) || (id === document || id === window)
  ) ? id : document.getElementById(id); };
  p.set = function(id, html) {
    this.get(id).innerHTML = html;
  };
  p.on = function(ele, type, fn, capture) {
    this.get(ele).addEventListener(type, fn, capture);
  };
  p.un = function(ele, type, fn, capture) {
    this.get(ele).removeEventListener(type, fn, capture);
  };
  nihil.Dom = Dom;
}());

//------------------------------------------------------------------------------
// ASSET LOADING UTILITIES
//------------------------------------------------------------------------------
(function() {
	'use strict';

  function Preloader(assets, callback) {
    this._get(assets, callback);
  }

  var p = Preloader.prototype;

  p._get = function(assets, callback){
    var n, id,
        count  = assets.length,
        onload = function() {
          if (--count === 0) { callback(); }
        };
    for(n = 0 ; n < assets.length ; n++) {
      id = assets[n].id;
      nihil.assets[id] = document.createElement('img');
      nihil.dom.on(nihil.assets[id], 'load', onload);
      nihil.assets[id].src = assets[n].path;
    }
  };
  nihil.Preloader = Preloader;
}());
//------------------------------------------------------------------------------
// STAGE
//------------------------------------------------------------------------------
(function() {
	'use strict';
  function Stage() {}
  var p = Stage.prototype;
}());
//------------------------------------------------------------------------------
// RENDERER
//------------------------------------------------------------------------------
(function() {
	'use strict';

  function Renderer(element, bgcolor, x, y, r, f) {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.bgcolor = bgcolor;
    this.ratio = r;
    this.fps = f;
    this.resolutionX = x;
    this.resolutionY = y;
    this.scaleX = 0;
    this.scaleY = 0;
  }

  var p = Renderer.prototype;

  p.setScale = function(x,y) {
    this.scaleX = x;
    this.scaleY = y;
    this.canvas.width  = this.scaleX * this.resolutionX;
    this.canvas.height = this.scaleY * this.resolutionY;
    nihil.log([this.scaleX,this.scaleY]);
  };

  p.render = function(dt) {
   this.ctx.imageSmoothingEnabled = false;
   this.lightmask = [];
   this.ctx.save();
   this.ctx.scale(this.scaleX,this.scaleY);
   this.ctx.clearRect(0, 0, this.resolutionX, this.resolutionY);
   this.ctx.fillStyle = this.bgcolor;
   this.ctx.fillRect(0, 0, this.resolutionX, this.resolutionY);
   // Stages render here
   nihil.renderer.fontPrint("-NIHIL-", -1, -1);
   this.ctx.restore();
 };

  p.fontPrint = function(FontText, FontX, FontY){
    if (FontX === -1) { FontX = (this.resolutionX - FontText.length * 16) / 2; }
    if (FontY === -1) { FontY = (this.resolutionY - 16) / 2; }
    for (var i = 0; i < FontText.length; i++) {
      var chr = FontText.charCodeAt(i);
      this.ctx.drawImage(nihil.assets.font, ((chr)%16)*16, Math.ceil(((chr+1)/16)-1)*16, 16, 16, FontX + (i * 16), FontY, 16, 16);
    }
  };

  nihil.Renderer = Renderer;
}());
//==============================================================================
(function() {
	'use strict';

  function Entities() {}
  var p = Entities.prototype;

  p.animate = function(fps, entity, animation) {
    animation = animation || entity.animation;
    entity.animFrame = entity.animFrame || 0;
    entity.animCount = entity.animCount || 0;
    if (entity.animation !== animation) {
      entity.animation = animation;
      entity.animFrame = 0;
      entity.animCount = 0;
    }
    else if (++(entity.animCount) === Math.round(fps/animation.fps)) {
      if (entity.animFrame <= entity.animation.frames && animation.loop) {
        entity.animFrame = Game.Math.normalize(entity.animFrame + 1, 0, entity.animation.frames);
      }
      else if (entity.animFrame < entity.animation.frames-1){
        entity.animFrame += 1;
      }
      entity.animCount = 0;
    }
  };
  nihil.Entities = Entities;
}());
//------------------------------------------------------------------------------
// UTILS
//------------------------------------------------------------------------------
(function() {
	'use strict';

  function Utils() {}
  var p = Utils.prototype;

  p.indexOf = function (array, searchElement) {
  	for (var i = 0,l=array.length; i < l; i++) {
  		if (searchElement === array[i]) { return i; }
  	}
  	return -1;
  };
  p.lerp = function(n, dn, dt) { return n + (dn * dt); };
  p.bound = function(x, min, max) {
    return Math.max(min, Math.min(max, x));
  };
  p.between = function(n, min, max) {
    return ((n >= min) && (n <= max));
  };
  p.brighten = function(hex, percent) {
    var a = Math.round(255 * percent/100),
        r = a + parseInt(hex.substr(1, 2), 16),
        g = a + parseInt(hex.substr(3, 2), 16),
        b = a + parseInt(hex.substr(5, 2), 16);

    r = r<255?(r<1?0:r):255;
    g = g<255?(g<1?0:g):255;
    b = b<255?(b<1?0:b):255;
    return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
  };
  p.darken = function(hex, percent) {
    return this.brighten(hex, -percent);
  };
  p.lineDistance = function(point1, point2) {
    var xs = 0, ys = 0;
    xs = point2.x - point1.x;
    xs = xs * xs;
    ys = point2.y - point1.y;
    ys = ys * ys;
    return Math.sqrt( xs + ys );
  };
  p.normalize = function(n, min, max) {
    while (n < min)   { n += (max-min); }
    while (n >= max)  { n -= (max-min); }
    return n;
  };
  p.rgbToHex = function(r, g, b) {
    if (r > 255 || g > 255 || b > 255) { throw "Invalid color component"; }
    return ((r < 16) || (g < 8) || b).toString(16);
  };
  p.overlap = function (a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  };
  p.normalizeAngle180 = function(angle) {
    return this.normalize(angle, -180, 180);
  };
  p.normalizeAngle360 = function(angle) {
    return this.normalize(angle, 0, 360);
  };
  p.random = function(min, max) {
    return (min + (Math.random() * (max - min)));
  };
  p.randomInt = function(min, max) {
    return Math.round(this.random(min, max));
  };
  p.randomChoice = function(choices) {
    return choices[this.randomInt(0, choices.length-1)];
  };
  nihil.Utils = Utils;
}());
