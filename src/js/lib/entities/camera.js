import { GameEntity } from '../models'

export default class Camera extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = false
    }

    update (scene) {
        const { follow } = scene.camera
        const followMidX = follow.x + follow.width / 2
        const followMidY = follow.y + follow.height / 2
        if (
            scene.getProperty('currentCameraId') !== this.id &&
            followMidX > this.x &&
            followMidX < this.x + this.width &&
            followMidY > this.y &&
            followMidY < this.y + this.height
        ) {
            scene.camera.setBounds(this.x, this.y, this.width, this.height)
            scene.setProperty('currentCameraId', this.id)
        }
    }
}
