import { GameEntity } from '../models'
import { COLORS } from '../constants'
import { createLamp } from 'tiled-platformer-lib'

export default class Torch extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.radius = 64
        this.y -= this.height
        this.light = createLamp(0, 0, 32, COLORS.TORCH)
    }
}
