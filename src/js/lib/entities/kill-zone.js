import { GameEntity } from '../models'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class KillZone extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.damage = 1000
    }

    collide (element, scene) {
        // restore the initial position of the item when it falls into the water
        if (element.type === ENTITIES_TYPE.ITEM) {
            element.restore(scene)
        }
    }
}
