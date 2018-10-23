import Entity from '../entity'
import { ENTITIES_FAMILY, ENTITIES_TYPE } from '../../lib/entities'

export default class Slope extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        if (this.type === ENTITIES_TYPE.SLOPE_RIGHT) {
            this.vectorMask = [
                {x: 0, y: this.height},
                {x: 0, y: 0},
                {x: this.width, y: 0}
            ]
        }
        else {
            this.vectorMask = [
                {x: 0, y: 0},
                {x: this.width, y: 0},
                {x: this.width, y: this.height}
            ]
        }
    }

    collide (element) {
        if (!this.dead && element.solid) {
            if (element.family === ENTITIES_FAMILY.ENEMIES) {
                element.bounce()
                return
            }
            const { x, width } = element.getBounds()
            const [ calculatedX, calculatedY ] = [element.x + x, this.y - element.height]
            const delta = this.height / this.width
            const expectedY = this.type === ENTITIES_TYPE.SLOPE_RIGHT
                ? calculatedY + this.height - (calculatedX + width - this.x) * delta
                : calculatedY + (calculatedX - this.x) * delta
            if (expectedY + element.height > element.y - element.height) {
                if (element.y >= expectedY && !element.jump) {
                    element.y = expectedY
                    element.force.y = 0
                    element.fall = false
                    element.onFloor = true
                }
            }

            else if (element.force.y === 0) {
                element.force.y += 1
            }
        }
    }
}
