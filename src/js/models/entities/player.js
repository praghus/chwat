import Entity from '../entity'
import { playerJump, playerGet } from '../../actions/sounds'
import { ASSETS, DIRECTIONS, ENTITIES_FAMILY, ENTITIES_TYPE, INPUTS } from '../../lib/constants'

export default class Player extends Entity {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.RIGHT
        this.inDark = 0
        this.lives = 3
        this.energy = 100
        this.maxEnergy = 100
        this.maxSpeed = 2
        this.speed = 0.2
        this.solid = true
        this.hintTimeout = null
        this.hurtTimeout = null
        this.itemTimeout = null
        this.items = [null, null]
        this.hint = null
        this.respawnTimeout = null
        this.bounds = {
            x: 10,
            y: 8,
            width: this.width - 20,
            height: this.height - 8
        }
        this.lastPosition = {
            x: this.x,
            y: this.y
        }
        this.animations = {
            LEFT: {x: 704, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
            RIGHT: {x: 0, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
            JUMP_LEFT: {x: 512, y: 16, w: 32, h: 48, frames: 4, fps: 15, loop: false},
            JUMP_RIGHT: {x: 256, y: 16, w: 32, h: 48, frames: 4, fps: 15, loop: false},
            STAND_LEFT: {x: 480, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
            STAND_RIGHT: {x: 448, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
            FALL_LEFT: {x: 672, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
            FALL_RIGHT: {x: 416, y: 16, w: 32, h: 48, frames: 1, fps: 15, loop: false},
            DEAD: {x: 0, y: 144, w: 32, h: 48, frames: 7, fps: 24, loop: false},
            DEAD_LEFT: {x: 480, y: 144, w: 32, h: 48, frames: 1, fps: 0, loop: false},
            DEAD_RIGHT: {x: 448, y: 144, w: 32, h: 48, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.STAND_RIGHT
        this.hideHint = this.hideHint.bind(this)
    }

    draw (ctx) {
        ctx.save()
        if (!this.canHurt() && this.canMove()) {
            ctx.globalAlpha = 0.2
        }
        super.draw(ctx)
        ctx.restore()

        if (this.hint) {
            const { assets, camera } = this._scene
            const { animation, animFrame } = this.hint
            ctx.drawImage(
                assets[ASSETS.BUBBLE],
                Math.floor(this.x + camera.x + this.width / 2), Math.floor(this.y + camera.y) - 24
            )
            ctx.drawImage(
                assets[ASSETS.ITEMS],
                animation.x + animFrame * animation.w, animation.y,
                animation.w, animation.h,
                8 + Math.floor(this.x + camera.x + this.width / 2), Math.floor(this.y + camera.y) - 22,
                animation.w, animation.h
            )
        }
    }

    update (dt) {
        const { input, world } = this._scene

        if (this.canMove()) {
            if (input[INPUTS.INPUT_LEFT]) {
                this.force.x -= this.speed
                if (this.direction === DIRECTIONS.RIGHT) this.addDust(DIRECTIONS.LEFT)
                this.direction = DIRECTIONS.LEFT
            }
            if (input[INPUTS.INPUT_RIGHT]) {
                this.force.x += this.speed
                if (this.direction === DIRECTIONS.LEFT) this.addDust(DIRECTIONS.RIGHT)
                this.direction = DIRECTIONS.RIGHT
            }
            if (input[INPUTS.INPUT_UP] && this.canJump()) {
                this.doJump = true
                // todo: better sound dispatching
                this.playSound(playerJump)
            }
            if (input[INPUTS.INPUT_ACTION]) {
                this.getItem(null)
            }
        }
        // slow down
        if (!input[INPUTS.INPUT_LEFT] && !input[INPUTS.INPUT_RIGHT] && this.force.x !== 0) {
            this.force.x += this.direction === DIRECTIONS.RIGHT ? -this.speed : this.speed
            if (this.direction === DIRECTIONS.LEFT && this.force.x > 0 ||
                this.direction === DIRECTIONS.RIGHT && this.force.x < 0) {
                this.force.x = 0
            }
        }

        this.force.y += this.force.y > 0
            ? world.gravity * 1.5
            : world.gravity

        this.move()

        if (this.energy > this.maxEnergy && this.energy > 0) this.energy -= 1

        if (this.onFloor) {
            if (this.fall) {
                this.addDust(DIRECTIONS.LEFT)
                this.addDust(DIRECTIONS.RIGHT)
            }
            this.fall = false
            this.jump = false
        }
        if (this.maxEnergy <= 0) {
            if (this.onFloor) {
                this.animate(this.animations.DEAD)
            }
            else {
                this.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.DEAD_RIGHT
                    : this.animations.DEAD_LEFT
                )
            }
            this.lifeLoss()
        }
        else if (this.doJump || this.jump) {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.JUMP_RIGHT
                : this.animations.JUMP_LEFT
            )
            if (this.animFrame === 0 && this.force.x !== 0) {
                this.animFrame = 2
            }
            if (this.animFrame === 2) {
                if (!this.jump) {
                    if (this.force.x !== 0) {
                        this.addDust(this.direction)
                    }
                    this.force.y = -8.3
                    this.jump = true
                    this.doJump = false
                }
            }
            if (this.force.y > 0) {
                this.jump = false
                this.fall = true
                this.doJump = false
            }
        }
        else if (this.fall) {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.FALL_RIGHT
                : this.animations.FALL_LEFT)
        }
        else if (this.force.x !== 0) {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.RIGHT
                : this.animations.LEFT)
        }
        else {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.STAND_RIGHT
                : this.animations.STAND_LEFT)
        }
    }

    collide (element) {
        if (this.canHurt() && element.damage > 0 && (
            element.family === ENTITIES_FAMILY.ENEMIES ||
            element.family === ENTITIES_FAMILY.TRAPS
        )) {
            this.hit(element.damage)
        }
    }

    hit (s) {
        this.maxEnergy -= s
        if (this.maxEnergy <= 0) {
            this.maxEnergy = 0
        }
        else {
            this.force.y -= 3
        }
        this.hurtTimeout = setTimeout(() => {
            this.hurtTimeout = null
        }, 3000)
    }

    // todo: move to parent
    addDust (direction) {
        if (!this.onFloor) return
        const { elements } = this._scene
        elements.add({
            type: ENTITIES_TYPE.DUST,
            x: direction === DIRECTIONS.RIGHT
                ? this.x - 4
                : this.x + 22,
            y: this.y + 32,
            direction
        })
    }

    canMove () {
        return this.maxEnergy > 0
    }

    canJump () {
        return this.onFloor && !this.doJump && !this.jump
    }

    canHurt () {
        return !this.hurtTimeout
    }

    canTake () {
        return !this.itemTimeout
    }

    canUse (itemId) {
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return !this.itemTimeout && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    useItem (itemId) {
        const item = this.items.find((item) => item && item.properties.id === itemId)
        if (item) {
            [this.items[0], this.items[1]] = this.items.indexOf(item) === 0
                ? [this.items[1], null]
                : [this.items[0], null]
            this.setItemTimeout()
            return item
        }
    }

    getItem (item) {
        if (this.canTake()) {
            const { elements } = this._scene
            if (this.items[1]) {
                elements.add(Object.assign(this.items[1], {
                    dead: false,
                    x: this.x + 16,
                    y: this.y
                }))
            }
            [this.items[0], this.items[1]] = [item, this.items[0]]
            this.playSound(playerGet)
            this.setItemTimeout()
            if (item) item.kill()
        }
    }

    setItemTimeout () {
        this.itemTimeout = setTimeout(() => {
            this.itemTimeout = null
        }, 500)
    }

    showHint (item) {
        if (!this.hintTimeout && !this.itemTimeout) {
            this.hint = item
            this.hintTimeout = setTimeout(this.hideHint, 2000)
        }
    }

    hideHint () {
        this.hint = null
        this.hintTimeout = null
    }

    checkpoint () {
        this.lastPosition = {
            x: this.x,
            y: this.y
        }
    }

    lifeLoss () {
        if (!this.respawnTimeout) {
            this.lives -= 1
            this.force = { x: 0, y: 0 }
            // if (this.lives === 0) {
            //     // game over
            // }
            // else {
            this.restoreCheckpoint()
            // }
        }
    }

    restoreCheckpoint () {
        if (!this.respawnTimeout) {
            const { camera } = this._scene
            const { x, y } = this.lastPosition
            this.respawnTimeout = setTimeout(() => {
                this.x = x
                this.y = y
                this.inDark = 0
                this.energy = 100
                this.maxEnergy = 100
                this.hurtTimeout = null
                this.respawnTimeout = null
                this._scene.blackOverlay = 1
                camera.center()
            }, 1000)
        }
    }
}