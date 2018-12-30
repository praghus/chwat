import ActiveElement from '../models/active-element'
import { ENTITIES_FAMILY, ENTITIES_TYPE } from '../../lib/entities'

export default class Slope extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        if (!this.points) {
            this.points = this.type === ENTITIES_TYPE.SLOPE_RIGHT
                ? [[0, this.height], [this.width, this.height], [this.width, 0]]
                : [[0, 0], [0, this.height], [this.width, this.height]]
        }
    }

    collide (element) {
        if (!this.dead && element.solid) {
            if (element.family === ENTITIES_FAMILY.ENEMIES) {
                return element.bounce()
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
