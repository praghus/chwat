import ActiveElement from '../models/active-element'
import { ENTITIES_FAMILY, ENTITIES_TYPE } from '../../lib/entities'
import { COLORS } from '../../lib/constants'

export default class Slope extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        this.triangle = []
        this.color = COLORS.SPIDER_WEB
        if (!this.points) {
            this.points = this.type === ENTITIES_TYPE.SLOPE_RIGHT
                ? [[0, this.height], [this.width, this.height], [this.width, 0]]
                : [[0, 0], [0, this.height], [this.width, this.height]]
        }
        else {
            const minX = Math.min.apply(Math, this.points.map((row) => Math.min(row[0])))
            const minY = Math.min.apply(Math, this.points.map((row) => Math.min(row[1])))
            const maxX = Math.max.apply(Math, this.points.map((row) => Math.max(row[0])))
            const maxY = Math.max.apply(Math, this.points.map((row) => Math.max(row[1])))
            this.bounds = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            }
            this.width = this.bounds.width
            this.height = this.bounds.height
        }
    }

    collide (element) {
        if (!this.dead && element.solid) {
            if (element.family === ENTITIES_FAMILY.ENEMIES) {
                return element.bounce()
            }
            const posX = Math.ceil(element.x + (element.width / 2))
            for (let p = 0; p < this.points.length - 1; p++) {
                if ((
                    this.points[p][0] + this.x < posX &&
                    this.points[p + 1][0] + this.x >= posX
                ) || (
                    this.points[p][0] + this.x >= posX &&
                    this.points[p + 1][0] + this.x < posX
                )) {
                    this.triangle = [
                        [this.points[p][0] + this.x, this.points[p][1] + this.y],
                        [this.points[p + 1][0] + this.x, this.points[p + 1][1] + this.y]
                    ]
                    // this.triangle.push(this.triangle[0][1] < this.triangle[1][1]
                    //     ? [this.points[p][0] + this.x, this.points[p + 1][1] + this.y] // slope down (left)
                    //     : [this.points[p + 1][0] + this.x, this.points[p][1] + this.y] // slope up (right)
                    // )

                    const tx = Math.min(this.triangle[0][0], this.triangle[1][0])
                    const ty = Math.min(this.triangle[0][1], this.triangle[1][1])
                    const tw = Math.abs(this.triangle[1][0] - this.triangle[0][0])
                    const th = Math.abs(this.triangle[1][1] - this.triangle[0][1])
                    const [ calculatedX, calculatedY ] = [posX, ty - element.height]
                    const delta = th / tw
                    // console.info(tx, ty, tw, th)

                    let expectedY
                    if ((
                        this.triangle[0][0] < this.triangle[1][0] &&
                        this.triangle[0][1] < this.triangle[1][1]
                    ) || (
                        this.triangle[0][0] > this.triangle[1][0] &&
                        this.triangle[0][1] > this.triangle[1][1]

                    )) {
                        expectedY = calculatedY + (calculatedX - tx) * delta
                    }
                    else {
                        expectedY = calculatedY + th - (calculatedX - tx) * delta
                    }

                    if (expectedY + element.height > element.y - element.height) {
                        if (element.y >= expectedY && !element.jump) {
                            element.y = expectedY
                            element.force.y = 0
                            element.fall = false
                            element.onFloor = true
                        }
                    }
                    break
                }
            }
        }
        // else if (!this.dead && element.solid) {
        //     if (element.family === ENTITIES_FAMILY.ENEMIES) {
        //         return element.bounce()
        //     }
        //     const { x, width } = element.getBounds()
        //     const [ calculatedX, calculatedY ] = [element.x + x, this.y - element.height]
        //     const delta = this.height / this.width

        //     const expectedY = this.type === ENTITIES_TYPE.SLOPE_RIGHT
        //         ? calculatedY + this.height - (calculatedX + width - this.x) * delta
        //         : calculatedY + (calculatedX - this.x) * delta

        //     if (expectedY + element.height > element.y - element.height) {
        //         if (element.y >= expectedY && !element.jump) {
        //             element.y = expectedY
        //             element.force.y = 0
        //             element.fall = false
        //             element.onFloor = true
        //         }
        //     }

        //     else if (element.force.y === 0) {
        //         element.force.y += 1
        //     }
        // }
    }
}
