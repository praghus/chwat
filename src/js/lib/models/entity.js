import { Box, Vector } from 'sat'
import { TILE_TYPE } from '../constants'
import { getPerformance, isValidArray, overlap, normalize } from '../utils/helpers'

export default class Entity {
    constructor (obj, game) {
        this.game = game
        this.bounds = null
        this.speed = 0
        this.maxSpeed = 1
        this.activated = false
        this.dead = false
        this.onFloor = false
        this.solid = false
        this.vectorMask = null
        this.animation = null
        this.animFrame = 0
        this.force = {
            x: 0,
            y: 0
        }
        Object.keys(obj).map((prop) => {
            this[prop] = obj[prop]
        })
        this.frameStart = getPerformance()
        this.then = getPerformance()

        this.setBoundingBox(0, 0, this.width, this.height)
    }

    setBoundingBox (x, y, w, h) {
        this.bounds = new Box(new Vector(x, y), w, h)
    }

    getBoundingRect () {
        const {pos: {x, y}, w: width, h: height} = this.bounds
        return {
            x: this.x + x,
            y: this.y + y,
            width,
            height
        }
    }

    onScreen () {
        const {
            camera,
            world: { spriteSize },
            props: {
                viewport: { resolutionX, resolutionY }
            }
        } = this.game
        const { x, y, width, height } = this
        return (
            x + width + spriteSize > -camera.x &&
            y + height + spriteSize > -camera.y &&
            x - spriteSize < -camera.x + resolutionX &&
            y - spriteSize < -camera.y + resolutionY
        )
    }

    animate (animation = this.animation) {
        this.animFrame = this.animFrame || 0

        this.frameStart = getPerformance()

        if (this.animation !== animation) {
            this.animation = animation
            this.animFrame = 0
        }

        const duration = animation.strip
            ? animation.strip.duration
            : isValidArray(animation.frames) && animation.frames[this.animFrame][2]

        const framesCount = animation.strip
            ? animation.strip.frames
            : isValidArray(animation.frames) && animation.frames.length

        if (this.frameStart - this.then > duration) {
            if (this.animFrame <= framesCount && animation.loop) {
                this.animFrame = normalize(this.animFrame + 1, 0, framesCount)
            }
            else if (this.animFrame < framesCount - 1 && !animation.loop) {
                this.animFrame += 1
            }
            this.then = getPerformance()
        }
    }

    draw () {
        const { ctx, camera, world, props: { assets } } = this.game
        if (this.onScreen()) {
            const {
                animation,
                animFrame,
                gid,
                width,
                height,
                visible
            } = this
            const sprite = assets[this.asset]
            const [ posX, posY ] = [
                Math.floor(this.x + camera.x),
                Math.floor(this.y + camera.y)
            ]
            if (visible) {
                if (animation) {
                    const { frames, strip } = animation
                    const x = strip
                        ? strip.x + animFrame * animation.width
                        : isValidArray(frames) && frames[animFrame][0]
                    const y = strip
                        ? strip.y
                        : isValidArray(frames) && frames[animFrame][1]
                    animation && ctx.drawImage(sprite,
                        x, y,
                        animation.width, animation.height,
                        posX, posY,
                        animation.width, animation.height
                    )
                }
                else if (gid) {
                    const tile = world.createTile(gid)
                    tile.draw(ctx, posX, posY)
                }
                else {
                    ctx.drawImage(sprite, 0, 0, width, height, posX, posY, width, height)
                }
            }
        }
    }

    overlapTest (obj) {
        if (!this.dead && (this.onScreen() || this.activated) &&
            overlap(this.getBoundingRect(), obj.getBoundingRect())
        ) {
            this.collide && this.collide(obj)
            obj.collide && obj.collide(this)
        }
    }

    move () {
        const { world } = this.game
        const { spriteSize } = world

        if (this.force.x > this.maxSpeed) this.force.x = this.maxSpeed
        if (this.force.x < -this.maxSpeed) this.force.x = -this.maxSpeed
        if (this.force.y > spriteSize / 2) this.force.y = spriteSize / 2
        // if (this.force.y < -spriteSize) this.force.y = -spriteSize
        if (this.x + this.force.x < 0) this.force.x = 0
        if (this.y + this.force.y < 0) this.force.y = 0

        this.expectedX = this.x + this.force.x
        this.expectedY = this.y + this.force.y
        this.onCeiling = false
        this.onFloor = false

        const { pos: { x: boundsX, y: boundsY }, w, h } = this.bounds
        const PX = Math.floor((this.expectedX + boundsX) / spriteSize)
        const PY = Math.floor((this.expectedY + boundsY) / spriteSize)
        const PW = Math.floor((this.expectedX + boundsX + w) / spriteSize)
        const PH = Math.floor((this.expectedY + boundsY + h) / spriteSize)

        for (let y = PY; y <= PH; y++) {
            for (let x = PX; x <= PW; x++) {
                world.getTilledCollisionLayers().map((layer) => {
                    const t = layer.data[x][y]

                    if (world.isSolidTile(t)) {
                        const td = world.tiles[t]
                        const isOneWay = td.type === TILE_TYPE.ONE_WAY
                        // const diff = Math.round(this.y + boundsY + h - (y * td.height))
                        const ccY = td.collide({w, h,
                            x: this.x + boundsX - (x * td.width),
                            y: this.expectedY + boundsY - (y * td.height)
                        })
                        const ccX = td.collide({w, h,
                            x: this.expectedX + boundsX - (x * td.width),
                            y: this.y + boundsY - (y * td.height)
                        })

                        if (ccX) {
                            const ovy = parseFloat(ccX.overlapV.y.toFixed(2))
                            if (Math.abs(ovy) && !(isOneWay && this.force.y < 0)) {
                                this.force.y += ovy
                            }
                            else if (this.force.x !== 0 && !isOneWay) {
                                this.force.x += parseFloat(ccX.overlapV.x.toFixed(2))
                            }
                        }
                        if (ccY && this.force.y !== 0 && !(isOneWay && this.force.y < 0)) {
                            const ovy1 = parseFloat(ccY.overlapV.y.toFixed(2))
                            this.force.y += ovy1
                        }
                    }
                })
            }
        }
        this.onFloor = this.y + this.force.y < this.expectedY
        this.onLeftEdge = !world.isSolidArea(PX, PH)
        this.onRightEdge = !world.isSolidArea(PW, PH)

        this.x = Math.round(this.x + this.force.x)
        this.y = Math.round(this.y + this.force.y)

        if (this.onFloor) {
            this.force.y = 0
            this.jump = false
        }
    }

    kill () {
        this.dead = true
    }

    restore () {
        this.activated = false
        this.dead = false
        this.animFrame = 0
    }
}
