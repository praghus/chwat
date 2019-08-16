import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
import {
    COLORS,
    DIRECTIONS,
    ENTITIES_TYPE,
    INPUTS,
    SCENES
} from '../../lib/constants'

export default class Player extends GameEntity {
    constructor (obj, game) {
        super(obj, game)
        this.direction = DIRECTIONS.RIGHT
        this.solid = true
        this.lives = 3
        this.maxLives = 3
        this.energy = 100
        this.maxEnergy = 100
        this.maxSpeed = 2
        this.acceleration = 0.2
        this.inDark = 0
        this.items = [null, null]
        this.mapPieces = []
        this.initialPosition = { x: obj.x, y: obj.y }
        this.light = createLamp(0, 0, 96, COLORS.TRANS_WHITE)
        this.setBoundingBox(10, 10, this.width - 20, this.height - 10)
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

    collide (element, response) {
        super.collide(element, response)
        if (this.action) {
            switch (element.type) {
            case ENTITIES_TYPE.SWITCH:
            case ENTITIES_TYPE.TRIGGER:
                element.interact()
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
        if (this.canHurt() && element.damage > 0) {
            this.energy -= element.damage
            if (this.energy <= 0 && !this.game.checkTimeout('player_respawn')) {
                if (this.lives > 0) {
                    this.lives -= 1
                    this.visible = false
                    this.force = { x: 0, y: 0 }
                    this.game.overlay.fadeOut()
                    this.game.startTimeout('player_respawn', 2000, () => {
                        this.energy = this.maxEnergy
                        this.restore()
                    })
                }
                else {
                    this.game.props.setScene(SCENES.INTRO)
                }
            }
            this.force.y = -2
            this.game.startTimeout('player_hurt', 3000)
        }
    }

    update () {
        this.input()

        const { sprite } = this
        if (this.jump) {
            if (this.force.y <= 0) {
                sprite.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.JUMP_RIGHT
                    : this.animations.JUMP_LEFT)
            }
            else {
                sprite.animate(this.direction === DIRECTIONS.RIGHT
                    ? this.animations.FALL_RIGHT
                    : this.animations.FALL_LEFT)
                this.falling = true
            }
        }
        else if (this.force.x !== 0) {
            sprite.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.WALK_RIGHT
                : this.animations.WALK_LEFT)
        }
        else {
            sprite.animate(this.direction === DIRECTIONS.RIGHT
                ? this.animations.STAND_RIGHT
                : this.animations.STAND_LEFT)
        }
        // add dust when fell
        if (this.falling && !this.jump && this.onFloor) {
            this.addDust(DIRECTIONS.LEFT)
            this.addDust(DIRECTIONS.RIGHT)
            this.falling = false
        }
        this.move()
    }

    input () {
        const {
            camera,
            scene: { gravity },
            props: { input, viewport }
        } = this.game

        if (this.action) {
            this.moveItems()
            this.actionPerformed()
        }

        if (this.onFloor) {
            this.jump = false
            // this.force.y = 0
        }

        this.force.y += this.force.y > 0
            ? gravity
            : gravity / 2

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
                this.force.y = -6
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
            if (Math.abs(this.force.x > 0)) this.force.x -= this.acceleration
            if (Math.abs(this.force.x < 0)) this.force.x += this.acceleration
            if (Math.abs(this.force.x) < this.acceleration) this.force.x = 0
        }
    }

    moveItems (item) {
        if (this.canTake()) {
            if (this.items[1]) {
                this.items[1].placeAt(
                    this.x + 8,
                    this.y + 8
                )
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
        return this.energy > 0
    }

    canJump () {
        return this.onFloor && !this.jump
    }

    canHurt () {
        return this.canMove() && !this.game.checkTimeout('player_hurt')
    }

    canDoSomething () {
        return !this.game.checkTimeout('player_action')
    }

    canTake () {
        return !this.game.checkTimeout('player_take')
    }

    actionPerformed () {
        this.action = false
        this.game.startTimeout('player_take', 500)
    }

    canUse (itemId) {
        if (!!this.game.debug) return true
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return this.canTake() && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    showMap () {
        this.game.startTimeout('player_map', 2000)
    }

    restore () {
        const { camera, overlay } = this.game
        const { x, y } = this.initialPosition
        overlay.fadeIn()
        this.game.stopTimeout('player_hurt')
        this.x = x
        this.y = y
        this.visible = true
        camera.center()
    }
}
