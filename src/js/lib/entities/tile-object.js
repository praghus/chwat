import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
import { COLORS, ENTITIES_TYPE } from '../../lib/constants'

export default class TileObject extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.solid = true
        this.visible = true
        this.y -= obj.height
        this.shadowCaster = this.type === ENTITIES_TYPE.BOX
        if (this.type === ENTITIES_TYPE.BONUS) {
            this.light = createLamp(0, 0, 32, COLORS.BONUS)
        }
    }
    collide (element, response) {
        const overlap = response.overlapV
        if (element.type === ENTITIES_TYPE.PLAYER) {
            switch (this.type) {
            case ENTITIES_TYPE.BOX:
                if (overlap.y !== 0) {
                    element.force.y = 0
                    element.y -= overlap.y
                    element.onFloor = true
                    element.jump = false
                }
                else if (overlap.x !== 0) {
                    // element.force.x -= overlap.x / 2
                    this.x += overlap.x
                    // this.force.x += overlap.x
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

    update () {
        if (this.onScreen()) {
            const { scene: { gravity } } = this.game

            if (this.type === ENTITIES_TYPE.BONUS) {
                this.force = { x: 0, y: 0 }
            }
            else {
                this.force.y += this.force.y > 0
                    ? gravity
                    : gravity / 2
            }

            this.move()
            this.force.x = 0
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.force.y = 1
        this.onFloor = false
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPosition
        this.placeAt(x, y - this.height)
    }
}
