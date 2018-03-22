import SAT from 'sat'
import Entity from '../entity'
import { ENTITIES_FAMILY, ENTITIES_TYPE, INPUTS } from '../../lib/constants'

export default class Slope extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        if (this.type === ENTITIES_TYPE.SLOPE_RIGHT) {
            this.vectorMask = [
                new SAT.Vector(0, this.height),
                new SAT.Vector(0, 0),
                new SAT.Vector(this.width, 0)
            ]
        }
        else {
            this.vectorMask = [
                new SAT.Vector(0, 0),
                new SAT.Vector(this.width, 0),
                new SAT.Vector(this.width, this.height)
            ]
        }
    }

    collide (element) {
        if (!this.dead && element.solid) {
            if (element.family === ENTITIES_FAMILY.ENEMIES) {
                element.bounce()
                return
            }
            const { input } = this._scene
            const { x, width } = element.getBounds()
            const [ calculatedX, calculatedY ] = [element.x + x, this.y - element.height]
            const delta = this.height / this.width
            const expectedY = this.type === ENTITIES_TYPE.SLOPE_RIGHT
                ? calculatedY + this.height - (calculatedX + width - this.x) * delta
                : calculatedY + (calculatedX - this.x) * delta

            if (element.y >= expectedY && !element.jump) {
                element.y = expectedY
                element.force.y = 0
                element.fall = false
                element.onFloor = true
            }
            else if (element.force.y === 0) {
                element.force.y += 1
            }

            if (element.type === ENTITIES_TYPE.PLAYER && input[INPUTS.INPUT_UP]) {
                element.doJump = true
            }
        }
    }
}
