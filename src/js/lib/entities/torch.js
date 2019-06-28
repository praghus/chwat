import ActiveElement from '../models/active-element'
import { COLORS } from '../constants'
import { createLamp } from 'tiled-platformer-lib'

export default class Torch extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.y -= this.height
        this.radius = 64
        this.light = createLamp(0, 0, this.radius, COLORS.TORCH)
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
}
