import SAT from 'sat'
import { overlap, normalize } from '../lib/helpers'
import { canJumpThrough, DIRECTIONS, ENTITIES_TYPE, FONTS } from '../lib/constants'

export default class Entity {
    constructor (obj, game) {
        this._game = game
        this.id = obj.id
        this.x = obj.x
        this.y = obj.y
        this.name = obj.name
        this.asset = obj.asset || null
        this.color = obj.color
        this.width = obj.width
        this.height = obj.height
        this.family = obj.family || null
        this.type = obj.type
        this.properties = obj.properties
        this.direction = obj.direction || DIRECTIONS.LEFT
        this.force = { x: 0, y: 0 }
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
        this.hideMessage = this.hideMessage.bind(this)
    }

    onScreen () {
        const { world, camera, viewport } = this._game
        const { resolutionX, resolutionY } = viewport
        const { spriteSize } = world

        return this.x + this.width + spriteSize > -camera.x &&
                this.x - spriteSize < -camera.x + resolutionX &&
                this.y - spriteSize < -camera.y + resolutionY &&
                this.y + this.height + spriteSize > -camera.y
    }

    animate (animation) {
        const entity = this

        animation = animation || entity.animation
        entity.animFrame = entity.animFrame || 0
        entity.animCount = entity.animCount || 0

        if (entity.animation !== animation) {
            entity.animation = animation
            entity.animFrame = 0
            entity.animCount = 0
        }
        else if (++(entity.animCount) === Math.round(60 / animation.fps)) {
            if (entity.animFrame <= entity.animation.frames && animation.loop) {
                entity.animFrame = normalize(entity.animFrame + 1, 0, entity.animation.frames)
            }
            else if (entity.animFrame < entity.animation.frames - 1 && !animation.loop) {
                entity.animFrame += 1
            }
            entity.animCount = 0
        }
    }

    draw (ctx) {
        const { camera, assets, renderer } = this._game

        if (this.visible && this.onScreen()) {
            const asset = assets[this.asset]
            const sprite = asset || assets['no_image']

            if (this.shadowCaster && renderer.dynamicLights) {
                renderer.addLightmaskElement(
                    this.x + camera.x, this.y + camera.y,
                    this.width, this.height
                )
            }
            if (this.animation) {
                ctx.drawImage(sprite,
                    this.animation.x + this.animFrame * this.animation.w, this.animation.y,
                    this.animation.w, this.animation.h,
                    this.x + camera.x, this.y + camera.y,
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
        if (this.message) {
            const { text, x, y } = this.message
            renderer.fontPrint(text,
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
        return this.bounds || {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
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
        if (!this.dead && overlap(this, obj) && (this.onScreen() || this.activated)) {
            // poligon collision checking
            if (SAT.testPolygonPolygon(this.getVectorMask(), obj.getVectorMask())) {
                this.collide(obj)
                obj.collide(this)
            }
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
        const { world } = this._game
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
