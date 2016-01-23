(function(){
  'use strict';
  var nihil = window.nihil,
      assets = [{id: 'font', path: 'assets/font.png'}],
      fpsmeter = new FPSMeter({ decimals: 0, graph: true, theme: 'dark', position: 'absolute', top:'auto', left: 'auto', bottom: '5px', right: '5px' });


  var resize = function() {
    var gameArea  = nihil.dom.get('game'),
      newWidth  = window.innerWidth-100,//  < MaxWidth  ? window.innerWidth  : MaxWidth,
      newHeight = window.innerHeight-100,// < MaxHeight ? window.innerHeight : MaxHeight,
      newRatio  = newWidth / newHeight;

    if (newRatio > nihil.renderer.ratio) {
      newWidth = newHeight * nihil.renderer.ratio;
      gameArea.style.height = newHeight + 'px';
      gameArea.style.width  = newWidth + 'px';
    } else {
      newHeight = newWidth / nihil.renderer.ratio;
      gameArea.style.width  = newWidth + 'px';
      gameArea.style.height = newHeight + 'px';
    }
    gameArea.style.marginTop  = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    nihil.renderer.setScale(Math.round(newWidth/nihil.renderer.resolutionX),Math.round(newHeight / nihil.renderer.resolutionY));
  };

  nihil.init('canvas', '#191321', 320, 240, 4 / 3, 60);
  nihil.preloader = new nihil.Preloader(assets, function(){
    nihil.log('Assets loaded');
    var mainLoop = new nihil.Loop(function(step){
    }, fpsmeter);
    resize();
    nihil.dom.on(window, 'resize', resize, false);
  });

}());
