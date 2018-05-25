import Entity from '../entity'

export default class Grass extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.animation = {x: 0, y: 0, w: 64, h: 64, frames: 64, fps: 25, loop: true}
    }

    update () {
        if (this.onScreen()) {
            this.animate()
        }
    }
}
