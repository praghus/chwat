import { GameEntity } from '../models'
import { ASSETS, ENTITIES_TYPE, DIRECTIONS } from '../../lib/constants'

export default class Balloon extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.positions = {
            CASTLE: { x: 5056, y: 90, player: { x: 5152, y: 48 } },
            ISLE: { x: 128, y: 720, player: { x: 230, y: 720 } }
        }
        this.position = this.positions.CASTLE
        this.solid = true
    }

    draw () {
        if (this.visible && this.onScreen()) {
            const { ctx, camera, props: { assets } } = this.game
            ctx.drawImage(
                assets[ASSETS.BALLOON],
                Math.floor(this.x + camera.x) - 72,
                Math.floor(this.y + camera.y) - 256
            )
        }
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            const { camera, player, overlay } = this.game
            this.position = this.position === this.positions.CASTLE
                ? this.positions.ISLE
                : this.positions.CASTLE

            this.x = this.position.x
            this.y = this.position.y
            player.x = this.position.player.x
            player.y = this.position.player.y
            player.initialPosition = this.position.player

            player.direction = DIRECTIONS.RIGHT
            overlay.fadeIn()
            camera.center()
        }
    }

    update () {
        if (this.activated && this.y < 90) {
            this.y += 1
        }
    }
}
