import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/entities'

export default class MapPiece extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.types = {
            piece1: {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            piece2: {x: 16, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            piece3: {x: 32, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            piece4: {x: 0, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            piece5: {x: 16, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false},
            piece6: {x: 32, y: 16, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.types[this.properties.id]
    }

    collide (element) {
        const { player } = this._scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            this.dead = true
            player.collectMapPiece(this)
        }
    }

    update () {
        const { gravity } = this._scene.world
        if (this.onScreen()) {
            this.force.y += gravity
            this.move()
        }
    }
}
