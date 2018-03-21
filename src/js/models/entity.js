import SAT from 'sat'
import { outline, overlap, normalize } from '../lib/helpers'
import { canJumpThrough, FONTS } from '../lib/constants'

export default class Entity {
    constructor (obj, scene) {
        this._scene = scene
        this.force = { x: 0, y: 0 }
        this.bounds = null
        this.speed = 0
        this.maxSpeed = 1
        this.activated = false
        this.dead = false
        this.jump = false
        this.fall = false
        this.onFloor = false
        this.solid = false
        this.shadowCaster = false
        this.visible = true
        this.animation = null
        this.animFrame = 0
        this.animCount = 0
        this.message = null
        this.messageTimeout = null
        this.messageDuration = 2000
        this.vectorMask = null
        this.playSound = scene.playSound
        // map all object properties
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
        this.hideMessage = this.hideMessage.bind(this)
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

    draw (ctx) {
        const {
            addLightmaskElement,
            assets,
            camera,
            debug,
            dynamicLights,
            fontPrint
        } = this._scene

        if (this.visible && this.onScreen()) {
            const asset = assets[this.asset]
            const sprite = asset || assets['no_image']

            if (this.shadowCaster && dynamicLights) {
                addLightmaskElement(
                    this.x + camera.x, this.y + camera.y,
                    this.width, this.height
                )
            }
            if (this.animation) {
                ctx.drawImage(sprite,
                    this.animation.x + this.animFrame * this.animation.w, this.animation.y,
                    this.animation.w, this.animation.h,
                    Math.floor(this.x + camera.x), Math.floor(this.y + camera.y),
                    this.animation.w, this.animation.h
                )
            }
            else {
                ctx.drawImage(sprite,
                    0, 0, asset ? this.width : 16, asset ? this.height : 16,
                    Math.floor(this.x + camera.x), Math.floor(this.y + camera.y),
                    this.width, this.height
                )
            }
        }
        // debug
        // -------------------------------------------
        if (debug) {
            if (this.vectorMask) {ctx.save()
                ctx.strokeStyle = '#ff0'
                ctx.beginPath()
                ctx.moveTo(this.x + camera.x, this.y + camera.y)
                this.vectorMask.map(({x, y}) => ctx.lineTo(
                    this.x + x + camera.x,
                    this.y + y + camera.y
                ))
                ctx.lineTo(
                    this.vectorMask[0].x + this.x + camera.x,
                    this.vectorMask[0].y + this.y + camera.y)
                ctx.stroke()
                ctx.restore()
            }
            else {
                outline(ctx, this.visible ? '#0f0' : '#f0f', {
                    x: this.x + camera.x,
                    y: this.y + camera.y,
                    width: this.width,
                    height: this.height
                })

                if (this.bounds) {
                    outline(ctx, '#f00', {
                        x: this.x + camera.x + this.bounds.x,
                        y: this.y + camera.y + this.bounds.y,
                        width: this.bounds.width,
                        height: this.bounds.height
                    })
                }
            }
            if (this.visible) {
                fontPrint(`${this.name || this.type}\nx:${Math.floor(this.x)}\ny:${Math.floor(this.y)}`,
                    Math.floor(this.x + camera.x),
                    Math.floor(this.y + camera.y),
                    FONTS.FONT_SMALL
                )
            }
        }

        if (this.message) {
            const { text, x, y } = this.message
            fontPrint(text,
                Math.floor(x + camera.x),
                Math.floor(y + camera.y),
                FONTS.FONT_SMALL
            )
        }
    }

    update () {
        // update
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

    getVectorMask () {
        const { x, y, width, height } = this.getBounds()
        const vectorMask = this.vectorMask || [
            new SAT.Vector(x, y),
            new SAT.Vector(x + width, y),
            new SAT.Vector(x + width, y + height),
            new SAT.Vector(x, y + height)
        ]
        return new SAT.Polygon(new SAT.Vector(this.x, this.y), vectorMask)
    }

    overlapTest (obj) {
        if (!this.dead && (this.onScreen() || this.activated) &&
            overlap(this.getBoundingRect(), obj.getBoundingRect()) &&
            SAT.testPolygonPolygon(this.getVectorMask(), obj.getVectorMask())
        ) {
            this.collide(obj)
            obj.collide(this)
        }
    }

    collide (element) {
        // console.log("Object "+element.type+" collide with "+this.type);
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

        const nearMatrix = []

        for (let y = PY; y <= PH; y++) {
            for (let x = PX; x <= PW; x++) {
                const data = world.tileData(x, y)
                if (data.solid) nearMatrix.push(data)
            }
        }

        nearMatrix.forEach((tile) => {
            const jumpThrough = canJumpThrough(tile.type)
            if (!jumpThrough && overlap(nextX, tile)) {
                if (this.force.x < 0) {
                    this.force.x = tile.x + tile.width - offsetX
                }
                else if (this.force.x > 0) {
                    this.force.x = tile.x - offsetX - boundsWidth
                }
            }
            if (overlap(nextY, tile)) {
                if (this.force.y < 0 && !jumpThrough) {
                    this.force.y = tile.y + tile.height - offsetY
                }
                else if (
                    (this.force.y > 0 && !jumpThrough) ||
                    (jumpThrough && this.y + this.height <= tile.y)
                ) {
                    this.force.y = tile.y - offsetY - boundsHeight
                }
            }
        })

        this.x += this.force.x
        this.y += this.force.y

        this.onCeiling = this.expectedY < this.y
        this.onFloor = this.expectedY > this.y
        this.onLeftEdge = !world.isSolid(PX, PH)
        this.onRightEdge = !world.isSolid(PW, PH)

        if (this.onFloor) {
            this.force.y *= -0.4
        }
    }

    showMessage (text, x = this.x, y = this.y) {
        if (!this.messageTimeout) {
            this.message = { text, x, y }
            this.messageTimeout = setTimeout(this.hideMessage, this.messageDuration)
        }
    }

    hideMessage () {
        if (this.messageTimeout) {
            this.message = null
            this.messageTimeout = null
        }
    }
}
