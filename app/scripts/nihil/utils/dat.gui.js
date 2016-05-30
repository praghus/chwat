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
      f1.add(game.state, 'dynamicLights');
      f1.add(game.player, 'godMode');
      f1.add(game.player, 'maxSpeed');
      f1.add(game.player, 'x').listen();
      f1.add(game.player, 'y').listen();
      f1.add(game.player, 'exterminate');
      f2.add(game.player.force, 'x').listen();
      f2.add(game.player.force, 'y').listen();
      f3.add(game.world, 'gravity', 0, 2);
      f3.add(game.camera, 'x').listen();
      f3.add(game.camera, 'y').listen();
      f3.add(game.camera, 'center');
      f3.add(game.camera, 'shake');
      //f1.open();
      //f2.open();
    };
    gui.gameData();
  }
}
