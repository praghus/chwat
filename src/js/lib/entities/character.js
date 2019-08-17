import { GameEntity } from '../models'

export default class Character extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
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
