import { GameEntity } from '../models'

export default class Ship extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
        this.visible = false
        this.activated = false
        this.y -= obj.height
    }
}
