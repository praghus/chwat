import Entity from '../entity'
import { ENTITIES_TYPE } from '../../lib/entities'

export default class Checkpoint extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
    }

    collide (element) {
        const { saveGame, lastCheckpointId } = this._scene
        if (element.type === ENTITIES_TYPE.PLAYER && this.id !== lastCheckpointId) {
            saveGame(this.id)
        }
    }
}
