import Character from '../models/character'
import {
    DIRECTIONS,
    ENTITIES_FAMILY,
    ENTITIES_TYPE,
    INPUTS,
    TIMEOUTS
} from '../../lib/constants'

export default class Player extends Character {
    constructor (obj, game) {
        super(obj, game)
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
        this.setBoundingBox(10, 8, this.width - 20, this.height - 8)
    }

    draw () {
        const { ctx } = this.game
        ctx.save()
        if (!this.canHurt() && this.canMove()) {
            ctx.globalAlpha = 0.2
        }
        super.draw()
        ctx.restore()
    }

    collide (element) {
        if (this.action) {
            switch (element.type) {
            case ENTITIES_TYPE.SWITCH:
            case ENTITIES_TYPE.TRIGGER:
                element.interact()
                this.actionPerformed()
                break
            case ENTITIES_TYPE.ITEM:
                if (element.visible) {
                    this.moveItems(element)
                    this.actionPerformed()
                }
                break
            case ENTITIES_TYPE.MAP_PIECE:
                this.mapPieces.push(element.gid)
                this.showMap()
                element.kill()
                this.actionPerformed()
                break
            }
        }
        if (this.canHurt() && element.damage > 0 && (
            element.family === ENTITIES_FAMILY.ENEMIES ||
            element.family === ENTITIES_FAMILY.TRAPS
        )) {
            // this.hit(element.damage)
            this.force.y = -2
            this.game.startTimeout(TIMEOUTS.PLAYER_HURT)
        }
    }

    update () {
        if (this.action) {
            this.moveItems()
            this.actionPerformed()
        }

        this.input()
        this.move()

        if (this.jump) {
            if (this.force.y <= 0) {
                this.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.JUMP_RIGHT
                    : this.animations.JUMP_LEFT)
            }
            else {
                this.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.FALL_RIGHT
                    : this.animations.FALL_LEFT)
                if (this.onFloor) {
                    this.addDust(DIRECTIONS.LEFT)
                    this.addDust(DIRECTIONS.RIGHT)
                    this.animFrame = 0
                    this.jump = false
                }
            }
        }
        else if (this.force.x !== 0) {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.WALK_RIGHT
                : this.animations.WALK_LEFT)
        }
        else {
            this.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.STAND_RIGHT
                : this.animations.STAND_LEFT)
        }
    }

    input () {
        const {
            camera,
            props: { input, viewport },
            world: { gravity }
        } = this.game

        if (this.canMove()) {
            if (input.keyPressed[INPUTS.INPUT_LEFT]) {
                if (this.direction === DIRECTIONS.RIGHT) {
                    this.addDust(DIRECTIONS.LEFT)
                    camera.setMiddlePoint(
                        viewport.resolutionX - viewport.resolutionX / 3,
                        viewport.resolutionY / 2
                    )
                }
                this.force.x -= this.acceleration
                this.direction = DIRECTIONS.LEFT
            }
            else if (input.keyPressed[INPUTS.INPUT_RIGHT]) {
                if (this.direction === DIRECTIONS.LEFT) {
                    this.addDust(DIRECTIONS.RIGHT)
                    camera.setMiddlePoint(
                        viewport.resolutionX / 3,
                        viewport.resolutionY / 2
                    )
                }
                this.force.x += this.acceleration
                this.direction = DIRECTIONS.RIGHT
            }
            if (input.keyPressed[INPUTS.INPUT_ACTION]) {
                this.action = true
            }
            if (input.keyPressed[INPUTS.INPUT_UP] && this.canJump()) {
                this.jump = true
                this.game.startTimeout(TIMEOUTS.PLAYER_JUMP, () => {
                    this.force.y = -6
                })
            }
            if (input.keyPressed[INPUTS.INPUT_MAP]) {
                this.showMap()
            }
        }
        // slow down
        if (
            !input.keyPressed[INPUTS.INPUT_LEFT] &&
            !input.keyPressed[INPUTS.INPUT_RIGHT] &&
            this.force.x !== 0
        ) {
            this.force.x += this.direction === DIRECTIONS.RIGHT
                ? -this.acceleration
                : this.acceleration
            if (
                this.direction === DIRECTIONS.LEFT && this.force.x > 0 ||
                this.direction === DIRECTIONS.RIGHT && this.force.x < 0
            ) {
                this.force.x = 0
            }
        }
        // gravity
        this.force.y += this.force.y > 0
            ? gravity * 1.5
            : gravity / 2
    }

    moveItems (item) {
        if (this.canTake()) {
            if (this.items[1]) {
                this.items[1].placeAt(this.x + 16, this.y)
            }
            [this.items[0], this.items[1]] = [item, this.items[0]]
            if (item) item.visible = false
        }
    }

    useItem (itemId) {
        const item = this.items.find((item) => item && item.properties.id === itemId)
        if (item) {
            [this.items[0], this.items[1]] = this.items.indexOf(item) === 0
                ? [this.items[1], null]
                : [this.items[0], null]
            this.actionPerformed()
            return item
        }
    }

    canMove () {
        return this.maxEnergy > 0
    }

    canJump () {
        return this.onFloor && !this.jump
    }

    canHurt () {
        return !this.game.checkTimeout(TIMEOUTS.PLAYER_HURT)
    }

    canDoSomething () {
        return !this.game.checkTimeout(TIMEOUTS.PLAYER_ACTION)
    }

    canTake () {
        return !this.game.checkTimeout(TIMEOUTS.PLAYER_TAKE)
    }

    actionPerformed () {
        this.action = false
        this.game.startTimeout(TIMEOUTS.PLAYER_TAKE)
    }

    canUse (itemId) {
        if (!!this.game.debug) return true
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return this.canTake() && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    showMap () {
        this.game.startTimeout(TIMEOUTS.PLAYER_MAP)
    }

    lifeLoss () {
        if (!this.game.checkTimeout(TIMEOUTS.PLAYER_RESPAWN)) {
            this.lives -= 1
            this.force = { x: 0, y: 0 }
            // this.lives === 0 ? gameOver() :
            // this.restore()
        }
    }
}
