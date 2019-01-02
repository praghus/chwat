import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/entities'

export default class MapPiece extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
        this.y -= this.height
        this.types = {
            piece1: [0, 0],
            piece2: [16, 0],
            piece3: [32, 0],
            piece4: [0, 16],
            piece5: [16, 16],
            piece6: [32, 16]
        }
        const [x, y] = this.types[this.properties.id]
        this.animation = {x, y, w: 16, h: 16}
    }

    collide (element) {
        const { player } = this._scene
        if (element.type === ENTITIES_TYPE.PLAYER) {
            this.dead = true
            player.collectMapPiece(this)
        }
    }

    update () {
        const { gravity } = this._scene.world
        if (this.onScreen()) {
            this.force.y += gravity
            this.move()
        }
    }
}
