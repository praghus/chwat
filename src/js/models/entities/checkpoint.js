import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Checkpoint extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
    }

    collide (element) {
        const { player } = this._game
        if (element.type === ENTITIES_TYPE.PLAYER) {
            player.checkpoint()
        }
    }

}
