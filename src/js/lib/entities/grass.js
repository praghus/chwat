import ActiveElement from '../models/active-element'

export default class Grass extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.animations = {
            wave: {x: 0, y: 0, w: 64, h: 64, frames: 64, fps: 25, loop: true}
        }
    }

    update () {
        if (this.onScreen()) {
            this.animate(this.animations.wave)
        }
    }
}
