import { GameEntity } from '../models'

export default class Character extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.visible = true
        this.y -= obj.height
    }

    update () {
        if (this.activated) {
            this.kill()
        }
    }
}
