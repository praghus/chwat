import { GameEntity } from '../models'
import { randomInt } from '../utils/helpers'
import { LAYERS, ENTITIES_TYPE } from '../constants'

export default class Spikes extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.damage = 1000
    }

    update () {
        if (this.onScreen()) {
            this.scene.startTimeout(`spikes-${this.id}-shine`, 2000, () => {
                this.scene.addObject({
                    type: ENTITIES_TYPE.SPARKLE,
                    x: this.x + 8 * randomInt(0, this.width / 8),
                    y: this.y
                }, LAYERS.OBJECTS)
            })
        }
    }
}
