import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Torch extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 32
        this.height = 32
        this.animations = {
            SMALL: {x: 0, y: 0, w: 32, h: 32, frames: 8, fps: 24, loop: true},
            BIG: {x: 0, y: 32, w: 32, h: 32, frames: 8, fps: 24, loop: true}
        }
        this.animation = this.type === ENTITIES_TYPE.TORCH_BIG
            ? this.animations.BIG
            : this.animations.SMALL
        this.animFrame = Math.round(Math.random() * 8)
    }

    update () {
        if (this.onScreen()) {
            this.animate()
        }
    }
}
