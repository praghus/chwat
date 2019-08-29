import { GameEntity } from '../models'

export default class Camera extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = false
    }

    update () {
        const { follow } = this.game.camera
        const followMidX = follow.x + follow.width / 2
        const followMidY = follow.y + follow.height / 2
        if (
            followMidX > this.x &&
            followMidX < this.x + this.width &&
            followMidY > this.y &&
            followMidY < this.y + this.height
        ) {
            this.game.setCameraViewport(this)
        }
    }
}
