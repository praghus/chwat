import Character from '../models/character'
import { ENTITIES_TYPE } from '../../lib/entities'

export default class Witch extends Character {
    constructor (obj, scene) {
        super(obj, scene)
        this.solid = false
        this.visible = false
        this.haveInitialElement = obj.haveInitialElement || false
        this.activators = []
    }

    collide (element) {
        if (!this.dead && !this.activated) {
            if (element.type === ENTITIES_TYPE.ITEM) {
                const { id } = element.properties

                if (id === 'ball' && element.onFloor) {
                    this.haveInitialElement = true
                    element.kill()
                    this.changeMessage('My crystal ball.\nThank You!', this.x, this.y)
                }

                if (this.haveInitialElement && ['coconuts', 'hay', 'sulfur'].indexOf(id) !== -1) {
                    this.activators.push(element)
                }

                if (!this.activated && this.activators.length === 3) {
                    this.activated = true
                }
            }
            else if (element.type === ENTITIES_TYPE.PLAYER) {
                const hint = this.haveInitialElement
                    ? 'Bring me some sulfur,\ndry hay and coconuts'
                    : 'I will help you, but first\nbring me my crystal ball'
                this.showMessage(hint, this.x, this.y)
            }
        }
    }

    update () {
        if (this.activated) {
            const { elements, overlay } = this._scene
            this.activators.map((item) => item.kill())
            const sheep = elements.getByProperties('id', 'sheep')
            sheep.x = this.x + 16
            sheep.y = this.y - 16
            overlay.fadeIn()
            this.dead = true
        }
        else {
            this.activators = []
        }
    }
}
