import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
import { COLORS } from '../../lib/constants'

export default class Lava extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
        this.radius = this.width
        this.light = createLamp(0, 0, this.radius, COLORS.LAVA)
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

    update () {
        if (this.onScreen()) {
            // this.canShoot && this.shoot()
            // this.sprite.animate(this.animations)
        }
    }

    // shoot () {
    //     const { scene } = this.game

    //     scene.addObject({
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
