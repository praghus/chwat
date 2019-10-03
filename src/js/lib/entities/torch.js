import { GameEntity } from '../models'
import { COLORS } from '../constants'
import { createLightSource } from 'tiled-platformer-lib'

export default class Torch extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.radius = 64
        this.y -= this.height
        this.light = createLightSource(0, 0, 32, COLORS.TORCH)
    }
}
