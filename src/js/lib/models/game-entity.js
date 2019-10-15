import { Light } from 'lucendi'
import { Entity } from 'tiled-platformer-lib'
import {
    DIRECTIONS,
    ENTITIES_TYPE,
    LAYERS
} from '../constants'
import {
    getItemById,
    isValidArray,
    lightMaskDisc,
    lightMaskRect,
    noop,
    randomInt
} from '../utils/helpers'

export default class GameEntity extends Entity {
    constructor (obj, sprite) {
        super(obj, sprite)
        this.visible = true
        this.timeoutsPool = {}
        this.emmiter = []
        this.hideHint = () => {
            this.hint = null
        }
        this.hideMessage = () => {
            this.message = null
        }
    }

    update (scene) {
        isValidArray(this.emmiter) && this.emmiter.map(
            ({ obj, layerId, index }, i) => {
                scene.addObject(obj, layerId, index)
                this.emmiter.splice(i, 1)
            }
        )
        super.update(scene)
    }

    draw (ctx, scene) {
        if (scene.onScreen(this)) {
            super.draw(ctx, scene)
            const overlay = scene.getLayer(LAYERS.OVERLAY)
            this.hint && overlay.addHint(this)
            this.message && overlay.addMessage(this)
            scene.getProperty('debug') && overlay.displayDebug(scene, this)(ctx)
        }
    }

    showHint (items) {
        if (!this.checkTimeout('hint')) {
            this.hint = items
            this.startTimeout('hint', 1000, this.hideHint)
        }
    }

    showMessage (message) {
        if (!this.checkTimeout('message')) {
            this.message = message
            this.startTimeout('message', 2000, this.hideMessage)
        }
    }

    changeHint (items) {
        this.stopTimeout('hint')
        this.showHint(items)
    }

    changeMessage (message) {
        this.stopTimeout('message')
        this.showMessage(message)
    }

    emit (obj, layerId, index) {
        this.emmiter.push({ obj, layerId, index })
    }

    addItem (id, x, y) {
        const item = getItemById(id)
        if (item) {
            this.emit({ x, y, ...item }, LAYERS.OBJECTS, 0)
        }
    }

    addLightSource (distance, color, radius = 8) {
        this.light = new Light({ color, distance, radius, id: this.type })
    }

    getLight (scene) {
        if (!this.light) return
        this.light.move(
            this.x + (this.width / 2) + scene.camera.x,
            this.y + (this.height / 2) + scene.camera.y
        )
        return this.light
    }

    getLightMask (scene) {
        const x = Math.round(this.x + scene.camera.x)
        const y = Math.round(this.y + scene.camera.y)
        const { pos, points } = this.getTranslatedBounds(x, y)
        return this.shape === 'ellipse'
            ? lightMaskDisc(x, y, this.width / 2)
            : lightMaskRect(pos.x, pos.y, points)
    }

    addDust (direction) {
        this.emit({
            type: ENTITIES_TYPE.DUST,
            visible: true,
            dead: false,
            width: 16,
            height: 16,
            x: direction === DIRECTIONS.RIGHT
                ? this.x - 4
                : this.x + this.width - 8,
            y: this.y + this.height - 16,
            direction
        }, LAYERS.OBJECTS)
    }

    emitParticles (particle, x, y, count = 10, radius = 8) {
        for (let i = 0; i < count; i++) {
            const props = {
                x: x - (radius / 2) + randomInt(0, radius),
                y: y - (radius / 2) + randomInt(0, radius),
                force: particle.forceVector(),
                ...particle
            }
            this.emit({
                type: ENTITIES_TYPE.PARTICLE,
                life: randomInt(60, 120),
                dead: false,
                ...props
            }, LAYERS.OBJECTS)
        }
    }

    bounce () {
        this.direction = this.direction === DIRECTIONS.RIGHT
            ? DIRECTIONS.LEFT
            : DIRECTIONS.RIGHT
        this.force.x *= -1
    }

    restore () {
        this.dead = false
        this.animFrame = 0
    }

    checkTimeout (name) {
        return this.timeoutsPool[name] || null
    }

    startTimeout (name, duration, callback = noop) {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name)
                callback()
            }, duration)
        }
    }

    stopTimeout (name) {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name])
            this.timeoutsPool[name] = null
        }
    }
}
