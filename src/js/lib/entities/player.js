import Character from '../models/character'
// import { playerJump, playerGet } from '../../actions/sounds'
import { DIRECTIONS, INPUTS, TIMEOUTS } from '../../lib/constants'
import { ENTITIES_FAMILY, ENTITIES_TYPE } from '../../lib/entities'

export default class Player extends Character {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.RIGHT
        this.lives = 3
        this.maxLives = 3
        this.energy = 100
        this.maxEnergy = 100
        this.maxSpeed = 2
        this.acceleration = 0.2
        this.inDark = 0
        this.items = [null, null]
        this.mapPieces = []
        this.bounds = {
            x: 10,
            y: 8,
            width: this.width - 20,
            height: this.height - 8
        }
        this.animations = {
            LEFT: {x: 704, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
            RIGHT: {x: 0, y: 16, w: 32, h: 48, frames: 8, fps: 15, loop: true},
            JUMP_LEFT: {x: 512, y: 16, w: 32, h: 48, frames: 4, fps: 24, loop: false},
            JUMP_RIGHT: {x: 256, y: 16, w: 32, h: 48, frames: 4, fps: 24, loop: false},
            STAND_LEFT: {x: 480, y: 16, w: 32, h: 48, frames: 1, fps: 1, loop: false},
            STAND_RIGHT: {x: 448, y: 16, w: 32, h: 48, frames: 1, fps: 1, loop: false},
            FALL_LEFT: {x: 672, y: 16, w: 32, h: 48, frames: 1, fps: 1, loop: false},
            FALL_RIGHT: {x: 416, y: 16, w: 32, h: 48, frames: 1, fps: 1, loop: false},
            DEAD: {x: 0, y: 144, w: 32, h: 48, frames: 7, fps: 24, loop: false},
            DEAD_LEFT: {x: 480, y: 144, w: 32, h: 48, frames: 1, fps: 0, loop: false},
            DEAD_RIGHT: {x: 448, y: 144, w: 32, h: 48, frames: 1, fps: 0, loop: false}
        }
        this.animation = this.animations.STAND_RIGHT
    }

    draw () {
        const { ctx } = this._scene
        ctx.save()
        if (!this.canHurt() && this.canMove()) {
            ctx.globalAlpha = 0.2
        }
        super.draw()
        ctx.restore()
    }

    update () {
        const { input, world } = this._scene

        if (this.canMove()) {
            if (input[INPUTS.INPUT_LEFT]) {
                if (this.direction === DIRECTIONS.RIGHT) {
                    this.addDust(DIRECTIONS.LEFT)
                }
                this.force.x -= this.acceleration
                this.direction = DIRECTIONS.LEFT
            }
            else if (input[INPUTS.INPUT_RIGHT]) {
                if (this.direction === DIRECTIONS.LEFT) {
                    this.addDust(DIRECTIONS.RIGHT)
                }
                this.force.x += this.acceleration
                this.direction = DIRECTIONS.RIGHT
            }
            if (input[INPUTS.INPUT_UP] && this.canJump()) {
                // todo: better sound dispatching
                // this.playSound(playerJump)
                this.force.y = -6
            }
            if (input[INPUTS.INPUT_ACTION]) {
                this.getItem(null)
            }
            if (input[INPUTS.INPUT_MAP] && this.mapPieces.length) {
                this.showMap()
            }
            if (input[INPUTS.INPUT_RESTORE]) {
                this.restore()
            }
        }
        // slow down
        if (!input[INPUTS.INPUT_LEFT] && !input[INPUTS.INPUT_RIGHT] && this.force.x !== 0) {
            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? -this.acceleration
                : this.acceleration
            if (this.direction === DIRECTIONS.LEFT && this.force.x > 0 ||
                this.direction === DIRECTIONS.RIGHT && this.force.x < 0) {
                this.force.x = 0
            }
        }
        this.force.y += this.force.y > 0
            ? world.gravity * 1.5
            : world.gravity / 2

        this.move()

        if (this.onFloor) {
            if (this.fall) {
                this.addDust(DIRECTIONS.LEFT)
                this.addDust(DIRECTIONS.RIGHT)
            }
            this.fall = false
            this.jump = false
        }
        else if (this.force.y > 0 && this.jump) {
            this.jump = false
            this.fall = true
        }
        else if (this.force.y < 0) {
            this.jump = true
            this.fall = false
        }

        if (this.energy > this.maxEnergy && this.energy > 0) this.energy -= 1

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
        else if (this.jump) {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.JUMP_RIGHT
                : this.animations.JUMP_LEFT
            )
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
        this.maxEnergy <= 0
            ? this.maxEnergy = 0
            : this.force.y -= 3
        this._scene.startTimeout(TIMEOUTS.PLAYER_HURT)
    }

    canMove () {
        return this.maxEnergy > 0
    }

    canJump () {
        return this.onFloor && !this.jump
    }

    canHurt () {
        return !this._scene.checkTimeout(TIMEOUTS.PLAYER_HURT)
    }

    canTake () {
        return !this._scene.checkTimeout(TIMEOUTS.PLAYER_TAKE)
    }

    canUse (itemId) {
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return this.canTake() && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    useItem (itemId) {
        const item = this.items.find((item) => item && item.properties.id === itemId)
        if (item) {
            [this.items[0], this.items[1]] = this.items.indexOf(item) === 0
                ? [this.items[1], null]
                : [this.items[0], null]
            this._scene.startTimeout(TIMEOUTS.PLAYER_TAKE)
            return item
        }
    }

    getItem (item) {
        if (this.canTake()) {
            if (this.items[1]) {
                this.items[1].placeAt(this.x + 16, this.y)
            }
            [this.items[0], this.items[1]] = [item, this.items[0]]

            if (item) {
                item.visible = false
                // this.playSound(playerGet)
            }
            this._scene.startTimeout(TIMEOUTS.PLAYER_TAKE)
        }
    }

    showMap () {
        this._scene.startTimeout(TIMEOUTS.PLAYER_MAP)
    }

    collectMapPiece (piece) {
        this.mapPieces.push(piece.animation)
        this.showMap()
    }

    lifeLoss () {
        if (!this._scene.checkTimeout(TIMEOUTS.PLAYER_RESPAWN)) {
            this.lives -= 1
            this.force = { x: 0, y: 0 }
            // this.lives === 0 ? gameOver() :
            this.restore()
        }
    }

    restore () {
        const { overlay, loadGame } = this._scene
        this._scene.startTimeout(TIMEOUTS.PLAYER_RESPAWN, () => {
            overlay.fadeIn()
            loadGame()
        })
    }
}
