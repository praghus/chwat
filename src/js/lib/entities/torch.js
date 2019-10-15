import { GameEntity } from '../models'
import { COLORS } from '../constants'

export default class Torch extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.radius = 64
        this.y -= this.height
        this.addLightSource(32, COLORS.TORCH)
    }
}
