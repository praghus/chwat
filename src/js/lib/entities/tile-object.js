import { GameEntity } from '../models'
import { COLORS, ENTITIES_TYPE } from '../../lib/constants'

export default class TileObject extends GameEntity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.solid = true
        this.visible = true
        this.y -= obj.height
        this.shadowCaster = this.type === ENTITIES_TYPE.BOX
        if (this.type === ENTITIES_TYPE.BONUS) {
            this.addLightSource(32, COLORS.BONUS)
        }
    }

    collide (element, scene, response) {
        const overlap = response.overlapV
        const { map: { tilewidth, tileheight } } = scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            switch (this.type) {
            case ENTITIES_TYPE.BOX:
                if (overlap.y !== 0) {
                    element.force.y = 0
                    element.y -= overlap.y
                    element.onGround = true
                    element.jump = false
                }
                else if (overlap.x !== 0) {
                    if (!scene.isSolidArea(
                        Math.floor((this.x + overlap.x) / tilewidth),
                        Math.floor(this.y / tileheight),
                        this.collisionLayers
                    )) {
                        this.x += overlap.x
                        this.onGround = false
                    }
                }

                break
            case ENTITIES_TYPE.BONUS:
                element.energy = element.maxEnergy
                element.lives += 1
                this.kill()
                break
            }
        }
    }

    update (scene) {
        if (scene.onScreen(this)) {
            super.update(scene)
            const gravity = scene.getProperty('gravity')
            if (this.type !== ENTITIES_TYPE.BONUS && !this.onGround) {
                this.force.y += this.force.y > 0
                    ? gravity
                    : gravity / 2
            }
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.force.y = 1
        this.onGround = false
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPos
        this.placeAt(x, y - this.height)
    }
}
