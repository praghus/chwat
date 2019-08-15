import { GameEntity } from '../models'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class MapPiece extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.width = 16
        this.height = 16
    }

    collide (element) {
        const { player } = this.game
        if (element.type === ENTITIES_TYPE.PLAYER) {
            this.kill()
            player.collectMapPiece(this)
        }
    }

    update () {
        if (this.onScreen()) {
            const { gravity } = this.game.scene
            if (this.onFloor) this.force.y *= -0.5
            this.force.y += gravity
            this.move()
        }
    }
}
