import ActiveElement from '../models/active-element'
// @todo: make common class for map gid objects
export default class Grass extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.y -= this.height
    }
}
