import { GameEntity } from '../models'
import { Vector, pointInPolygon } from 'sat'
import { ENTITIES_TYPE } from '../../lib/constants'

export default class DarkMask extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.visible = false
    }

    overlapTest (obj) {
        if (this.onScreen() && obj.type === ENTITIES_TYPE.PLAYER) {
            const point = new Vector(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2
            )
            if (pointInPolygon(point, this.getTranslatedBounds())) {
                this.scene.player.inDark = true
            }
        }
    }
}
