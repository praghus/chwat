import ActiveElement from '../models/active-element'

export default class Flag extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.activated = false
        this.animation = {x: 0, y: 0, w: 64, h: 100, frames: 8, fps: 8, loop: true}
    }

    update () {
        if (this.onScreen()) {
            this.animate()
        }
        if (this.activated) this.kill()
    }
}
