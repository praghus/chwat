import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS } from '../../lib/constants'

export default class JumpThrough extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
    }

    collide (element) {
        const { input, player } = this._scene
        if (element.force.y > 0 && element.y + element.height <= this.y + this.height) {
            element.y = this.y - element.height
            element.force.y = this.y - element.y - element.height
            element.onFloor = true
            element.doJump = false
            element.fall = false

            if (element.type === ENTITIES_TYPE.PLAYER) {
                if (input[INPUTS.INPUT_DOWN]) {
                    player.y += this.height
                }
            }
        }
    }
}
