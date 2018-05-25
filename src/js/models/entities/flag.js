import Entity from '../entity'

export default class Flag extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
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
