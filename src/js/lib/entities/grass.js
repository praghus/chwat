import { GameEntity } from '../models'
// @todo: make common class for map gid objects
export default class Grass extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
        this.y -= this.height
    }
}
