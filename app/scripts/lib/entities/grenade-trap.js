//--------------------------------------------------------------------------
// GrenadesTrap
//--------------------------------------------------------------------------
Game.Entities['grenades_trap'] = function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.visible = false;
  this.canShoot = true;
  this.shootDelay = 1000;
  this.shootTimeout = null;
  this.shoot = function () {
    elements.add(new Grenade({x: this.x + Math.random() * this.width, y: this.y}));
    this.shootTimeout = setTimeout(function () {this.canShoot = true;}.bind(this), this.shootDelay);
    this.canShoot = false;
  };
  this.update = function () {
    if (this.onScreen()) {
      if (this.canShoot) {
        this.shoot();
      }
    }
  };
};
Class.extend(Game.Entities['grenades_trap'], Entity);
