//==========================================================================
// Particles
//--------------------------------------------------------------------------
Game.addEntity('particles', function () {
  Entity.apply(this, arguments);
  this.family = 'particles';
  this.life = Math.random() * 30 + 30;
  //this.speed = Math.random() * 2;
  this.maxSpeed = 0.5 + Math.random();
  this.dead = false;
  switch (this.type) {
    case 'shoot_particles':
      this.force = {
        x: Math.random() * 2 - 1,
        y: Math.random() * -4 - 2
      };
      break;
    default:
      var dir = Math.random() * 2 * Math.PI;
      this.force = {
        x: Math.cos(dir) * this.maxSpeed,
        y: Math.sin(dir) * this.maxSpeed
      };
      break;
  }
  this.overlapTest = function (obj) {
    if (!this.dead && Game.Math.overlap(this, obj)) {
      this.collide(obj);
      obj.collide(this);
    }
  };
  this.update = function () {
    if (!this.dead) {
      this.force.y += map.gravity;
      var m = this.move();
      if (!m.y || !m.x) {
        this.force.y *= -0.8;
        this.force.x *= 0.9;
      }
      this.life--;
    }
    if (this.life < 0) {
      this.dead = true;
    }
  };
  this.draw = function (ctx) {
    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.rect(this.x + camera.x, this.y + camera.y, this.width, this.height);
    ctx.fill();
    ctx.closePath();
  };
});
//--------------------------------------------------------------------------
function ShootExplosion(x, y, color) {
  var particle_count = 5 + parseInt(Math.random() * 5);
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random());
    elements.add('particles', {
      x: x,
      y: y,
      width: r,
      height: r,
      type: 'shoot_particle',
      properties: {color: color}
    });
  }
}
function GrenadeExplosion(x, y) {
  var particle_count = 10 + parseInt(Math.random() * 5);
  elements.add('explosion',{x: x - 16, y: y - 58});
  camera.shake();
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random());
    elements.add('particles', {
      x: x,
      y: y,
      width: r,
      height: r,
      type: 'shoot_particle',
      properties: {color: 'rgb(100,100,100)'}
    });
  }
}
function Explosion1(x, y) {
  var particle_count = 5 + parseInt(Math.random() * 10);
  for (var i = 0; i < particle_count; i++) {
    var r = (1 + Math.random() * 2);
    elements.add('particles', {
      x: x + 8,
      y: y,
      width: r,
      height: r,
      properties: {color: 'rgb(255,100,100)'}
    });
  }
}

