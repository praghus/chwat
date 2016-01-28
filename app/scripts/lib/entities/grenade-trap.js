//--------------------------------------------------------------------------
// GrenadesTrap
//--------------------------------------------------------------------------
var GrenadesTrap = function () {
  Entity.apply(this, arguments);
  this.family = 'traps';
  this.visible = false;
  this.canShoot = true;
  this.shootDelay = 1000;
  this.shootTimeout = null;
  this.shoot = function () {
    elements.add(new Grenade({x: this.x + Math.random() * this.width, y: this.y}));
    this.shootTimeout = setTimeout(function (thisObj) {
      thisObj.canShoot = true;
    }, this.shootDelay, this);
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
GrenadesTrap.prototype = Entity.prototype;
GrenadesTrap.prototype.constructor = GrenadesTrap;
