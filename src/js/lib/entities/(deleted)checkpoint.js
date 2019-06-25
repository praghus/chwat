import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class Checkpoint extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
        this.visible = false
    }

    collide (element) {
        const { saveGame, lastCheckpointId } = this.game
        if (element.type === ENTITIES_TYPE.PLAYER && this.id !== lastCheckpointId) {
            saveGame(this.id)
        }
    }
}
