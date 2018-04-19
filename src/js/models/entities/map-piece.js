import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class MapPiece extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
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

    draw (ctx) {
        if (this.onScreen() && this.visible) {
            const { camera, debug, fontPrint } = this._scene
            super.draw(ctx)
            // don't display name in debug mode coz it's already displayed.
            if (!debug) {
                fontPrint('fragment\n of map',
                    this.x + camera.x - 12,
                    this.y + camera.y - 8,
                )(ctx)
            }
        }
    }

    collide (element) {
        const { player } = this._scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            this.dead = true
            player.mapPieces += 1
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
