import { DIRECTIONS, TIMEOUTS } from '../lib/constants'
import { noop, overlap, normalize } from '../lib/helpers'

export default class Entity {
    constructor (obj, scene) {
        this._scene = scene
        this.force = { x: 0, y: 0 }
        this.bounds = null
        this.acceleration = 0
        this.maxSpeed = 1
        this.awake = false
        this.activated = false
        this.dead = false
        this.jump = false
        this.fall = false
        this.onFloor = false
        this.solid = false
        this.visible = true
        this.animation = null
        this.animFrame = 0
        this.animCount = 0
        this.range = 0
        this.message = null
        this.timeoutsPool = {}
        this.vectorMask = null
        this.playSound = scene.playSound
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
        this.lastPosition = {
            x: this.x,
            y: this.y
        }
        this.checkTimeout = this.checkTimeout.bind(this)
        this.startTimeout = this.startTimeout.bind(this)
        this.stopTimeout = this.stopTimeout.bind(this)
        this.hideMessage = () => {
            this.message = null
        }
    }

    onScreen () {
        const { world, camera, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        const { x, y, width, height } = this
        const { spriteSize } = world

        return (
            x + width + spriteSize > -camera.x &&
            y + height + spriteSize > -camera.y &&
            x - spriteSize < -camera.x + resolutionX &&
            y - spriteSize < -camera.y + resolutionY
        )
    }

    animate (animation = this.animation) {
        this.animFrame = this.animFrame || 0
        this.animCount = this.animCount || 0

        if (this.animation !== animation) {
            this.animation = animation
            this.animFrame = 0
            this.animCount = 0
        }
        else if (++(this.animCount) === Math.round(60 / animation.fps)) {
            if (this.animFrame <= this.animation.frames && animation.loop) {
                this.animFrame = normalize(this.animFrame + 1, 0, this.animation.frames)
            }
            else if (this.animFrame < this.animation.frames - 1 && !animation.loop) {
                this.animFrame += 1
            }
            this.animCount = 0
        }
    }

    draw () {
        const { ctx, addLightmaskElement, assets, camera, debug, dynamicLights, overlays } = this._scene
        if (this.onScreen()) {
            const { animation, animFrame, width, height, visible } = this
            const [ posX, posY ] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            ]
            if (visible) {
                const asset = assets[this.asset]
                const sprite = asset || assets['no_image']

                if (dynamicLights && this.lightmask) {
                    addLightmaskElement(this.lightmask, {x: posX, y: posY, width, height})
                }
                if (animation) {
                    ctx.drawImage(sprite,
                        animation.x + animFrame * animation.w, animation.y,
                        animation.w, animation.h,
                        posX, posY,
                        animation.w, animation.h
                    )
                }
                else {
                    ctx.drawImage(sprite,
                        0, 0,
                        asset ? width : 16,
                        asset ? height : 16,
                        posX, posY,
                        width, height
                    )
                }
            }
            debug && overlays.displayDebug(this)
        }
        if (this.message) {
            const { text, x, y } = this.message
            overlays.displayText(text,
                Math.floor(x + camera.x),
                Math.floor(y + camera.y)
            )
        }
    }

    getBounds () {
        const { width, height } = this
        return this.bounds || {x: 0, y: 0, width, height}
    }

    getBoundingRect () {
        const {x, y, width, height} = this.getBounds()
        return {
            x: this.x + x,
            y: this.y + y,
            width, height
        }
    }

    overlapTest (obj) {
        if (!this.dead && (this.onScreen() || this.activated || this.awake) &&
            overlap(this.getBoundingRect(), obj.getBoundingRect())
        ) {
            this.collide && this.collide(obj)
            obj.collide && obj.collide(this)
        }
    }

    hit (damage) {
        if (!this.dead) {
            this.force.x += -(this.force.x * 4)
            this.force.y = -2
            this.energy -= damage
            if (this.energy <= 0) {
                this.kill()
            }
        }
    }

    kill () {
        this.dead = true
    }

    bounce () {
        if (this.force.x !== 0) {
            this.force.x *= -1.5
            this.direction = this.direction === DIRECTIONS.RIGHT
                ? DIRECTIONS.LEFT
                : DIRECTIONS.RIGHT
        }
    }

    move () {
        const { world } = this._scene
        const { spriteSize } = world

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y

        const {
            x: boundsX,
            y: boundsY,
            width: boundsWidth,
            height: boundsHeight
        } = this.getBounds()

        const boundsSize = { width: boundsWidth, height: boundsHeight }

        const offsetX = this.x + boundsX
        const offsetY = this.y + boundsY

        const nextX = { x: offsetX + this.force.x, y: offsetY, ...boundsSize }
        const nextY = { x: offsetX, y: offsetY + this.force.y, ...boundsSize }

        const PX = Math.floor(this.expectedX / spriteSize)
        const PY = Math.floor(this.expectedY / spriteSize)
        const PW = Math.floor((this.expectedX + this.width) / spriteSize)
        const PH = Math.floor((this.expectedY + this.height) / spriteSize)

        for (let y = PY; y <= PH; y++) {
            for (let x = PX; x <= PW; x++) {
                const tile = world.tileData(x, y)
                if (tile.solid) {
                    if (!tile.jumpThrough && overlap(nextX, tile)) {
                        if (this.force.x < 0) {
                            this.force.x = tile.x + tile.width - offsetX
                        }
                        else if (this.force.x > 0) {
                            this.force.x = tile.x - offsetX - boundsWidth
                        }
                    }
                    if (overlap(nextY, tile)) {
                        if (this.force.y < 0 && !tile.jumpThrough) {
                            this.force.y = tile.y + tile.height - offsetY
                        }
                        else if (
                            (this.force.y > 0 && !tile.jumpThrough) || (
                                tile.jumpThrough && this.y + this.height <= tile.y
                            )
                        ) {
                            this.force.y = tile.y - offsetY - boundsHeight
                        }
                    }
                }
            }
        }

        this.x += this.force.x
        this.y += this.force.y

        this.onCeiling = this.expectedY < this.y
        this.onFloor = this.expectedY > this.y
        this.onLeftEdge = !world.isSolid(PX, PH)
        this.onRightEdge = !world.isSolid(PW, PH)
    }

    checkTimeout ({name}) {
        return this.timeoutsPool[name] || null
    }

    startTimeout ({name, duration}, callback = noop) {
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

    showMessage (text, x = this.x, y = this.y) {
        if (!this.checkTimeout(TIMEOUTS.MESSAGE)) {
            this.message = { text, x, y }
            this.startTimeout(TIMEOUTS.MESSAGE, this.hideMessage)
        }
    }

    checkpoint () {
        this.lastPosition = {
            x: this.x,
            y: this.y
        }
    }

    restore () {
        this.dead = false
        this.activated = false
        this.dead = false
        this.animFrame = 0
        this.animCount = 0
    }
}
