import { GameEntity } from '../models'

export default class Dragon extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
        this.y -= obj.height
        this.setBoundingBox(60, 108, this.width - 158, this.height - 140)
    }

    update (scene) {
        if (scene.onScreen(this)) {
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
