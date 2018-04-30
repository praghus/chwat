import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS } from '../../lib/constants'

export default class Bridge extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.animations = {
            UP: {x: 0, y: 0, w: 160, h: 80, frames: 1, fps: 0, loop: false},
            DOWN: {x: 0, y: 80, w: 160, h: 80, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.UP
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            const { input } = this._scene
            const expectedY = (this.y - element.height) + (this.height - 16)

            if (element.y >= expectedY && !element.jump) {
                element.y = expectedY
                element.force.y = 0
                element.fall = false
                element.onFloor = true
            }
            else if (element.force.y === 0) {
                element.force.y += 1
            }

            if (element.type === ENTITIES_TYPE.PLAYER && element.canMove() && input[INPUTS.INPUT_UP]) {
                element.doJump = true
            }
        }
    }

    update () {
        if (this.activated && !this.dead) {
            this.animation = this.animations.DOWN
        }
    }
}
