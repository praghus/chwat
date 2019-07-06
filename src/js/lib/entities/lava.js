import ActiveElement from '../models/active-element'
import { createLamp } from 'tiled-platformer-lib'
import { COLORS } from '../../lib/constants'

export default class Lava extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
        this.radius = this.width
        this.light = createLamp(0, 0, this.radius, COLORS.LAVA)
        this.animation = this.animations.BOILING
    }

    onScreen () {
        const { x, y, width, height, radius } = this
        const {
            camera,
            props: { viewport: { resolutionX, resolutionY } }
        } = this.game

        const r = radius
        const cx = x + width / 2
        const cy = y + height / 2

        return (
            cx + r > -camera.x &&
            cy + r > -camera.y &&
            cx - r < -camera.x + resolutionX &&
            cy - r < -camera.y + resolutionY
        )
    }

    draw () {
        if (this.onScreen()) {
            const { ctx, camera, props: { assets } } = this.game
            const { animation, animFrame } = this

            for (let x = 0; x < this.width / animation.width; x++) {
                ctx.drawImage(assets[this.asset],
                    animation.strip.x + animFrame * animation.width, animation.strip.y,
                    animation.width, animation.height,
                    this.x + camera.x + x * this.animation.width, this.y + camera.y,
                    animation.width, animation.height
                )
            }
        }
    }

    update () {
        if (this.onScreen()) {
            // this.canShoot && this.shoot()
            this.animate()
        }
    }

    // shoot () {
    //     const { world } = this.game

    //     world.addObject({
    //         type: ENTITIES_TYPE.LAVA_STONE,
    //         visible: true,
    //         direction: randomChoice([
    //             DIRECTIONS.LEFT,
    //             DIRECTIONS.RIGHT
    //         ]),
    //         force: {
    //             x: 0,
    //             y: -randomInt(4, 6)
    //         },
    //         x: this.x + randomInt(1, 8) * 16,
    //         y: this.y - 16
    //     }, LAYERS.OBJECTS)

    //     this.shootTimeout = setTimeout(() => {
    //         this.canShoot = true
    //     }, this.shootDelay)
    //     this.canShoot = false
    // }
}
