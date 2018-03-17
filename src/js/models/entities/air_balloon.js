import Entity from '../entity'
import { ASSETS, ENTITIES_TYPE } from '../../lib/constants'

export default class AirBalloon extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.positions = {
            CASTLE: { x: 5056, y: 90, player: { x: 5152, y: 48}},
            ISLE: { x: 128, y: 720, player: { x: 230, y: 720}}
        }
        this.position = this.positions.CASTLE
        this.solid = true
    }
    draw (ctx) {
        if (this.visible) {
            const {assets, camera} = this._game
            ctx.drawImage(
                assets[ASSETS.BALLOON],
                Math.floor(this.x + camera.x) - 72,
                Math.floor(this.y + camera.y) - 256
            )
        }
    }

    collide (element) {
        if (this.activated && element.type === ENTITIES_TYPE.PLAYER) {
            const { camera, player, renderer } = this._game
            this.position = this.position === this.positions.CASTLE
                ? this.positions.ISLE
                : this.positions.CASTLE

            this.x = this.position.x
            this.y = this.position.y
            player.x = this.position.player.x
            player.y = this.position.player.y
            renderer.blackOverlay = 1
            camera.center()
        }
    }

    update () {
        if (this.activated && this.y < 90) {
            this.y += 1
        }
    }
}
