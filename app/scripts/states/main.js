game.addState('main', class extends State {
  constructor(game) {
    super(game);
  }
  init(){
    game.renderer.msg(game.world.name, 100);
  }
  update() {
    game.elements.update();
    game.camera.update();
    game.player.update();
  }
});
