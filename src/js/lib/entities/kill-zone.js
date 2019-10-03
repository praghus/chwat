import { GameEntity } from '../models'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class KillZone extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 1000
    }

    collide (element) {
        // restore the initial position of the item when it falls into the water
        if (element.type === ENTITIES_TYPE.ITEM) {
            element.restore()
        }
    }
}
