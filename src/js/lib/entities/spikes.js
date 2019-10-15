import { GameEntity } from '../models'
import { randomInt } from '../utils/helpers'
import { LAYERS, ENTITIES_TYPE } from '../constants'

export default class Spikes extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.damage = 1000
    }

    update (scene) {
        if (scene.onScreen(this)) {
            this.startTimeout(`spikes-${this.id}-shine`, 1000, () => {
                scene.addObject({
                    type: ENTITIES_TYPE.SPARKLE,
                    x: this.x + 8 * randomInt(0, this.width / 8),
                    y: this.y,
                    width: 8,
                    height: 8
                }, LAYERS.OBJECTS)
            })
        }
    }
}
