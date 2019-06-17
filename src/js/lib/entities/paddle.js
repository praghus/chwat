import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Paddle extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.acceleration = 0.1
        this.maxSpeed = 1
        this.activated = false
    }
    draw () {
        const { ctx, camera, world, props: { assets } } = this.game
        const { spriteSize } = world
        for (let x = 0; x < Math.round(this.width / spriteSize); x++) {
            ctx.drawImage(
                assets[this.asset],
                0, 0, spriteSize, spriteSize,
                Math.floor(this.x + camera.x) + (x * spriteSize), Math.floor(this.y + camera.y),
                spriteSize, spriteSize
            )
        }
    }

    collide (element) {
        if (!this.dead && element.solid && element.type !== ENTITIES_TYPE.BLOB) {
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
        }
    }

    update () {
        if (this.activated && !this.dead) {
            const { spriteSize } = this.game.world
            const { destY } = this.properties
            if (this.y > destY * spriteSize) {
                this.force.y -= this.acceleration
                this.move()
            }
        }
    }
}
