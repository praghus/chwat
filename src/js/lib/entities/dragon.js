import { GameEntity } from '../models'

export default class Dragon extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = true
        this.y -= obj.height
        this.setBoundingBox(60, 108, this.width - 158, this.height - 140)
    }

    update () {
        if (this.onScreen()) {
            if (this.activated) {
                if (this.y > -128) {
                    this.y -= 1
                    this.x -= 1
                }
                else this.kill()
            }
        }
    }
}
