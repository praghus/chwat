//-------------------------------------------------------------------------
// MATH UTILITIES
//-------------------------------------------------------------------------
class MathUtils
{
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
