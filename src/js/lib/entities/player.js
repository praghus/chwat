import { GameEntity, EndLayer, GameOverLayer } from '../models'
import { createLightSource } from 'tiled-platformer-lib'
import { approach } from '../../lib/utils/helpers'
import {
    COLORS,
    DIRECTIONS,
    ENTITIES_TYPE,
    INPUTS,
    ITEMS_TYPE,
    LAYERS,
    SCENES,
    SOUNDS
} from '../../lib/constants'

export default class Player extends GameEntity {
    constructor (obj, scene) {
        super(obj, scene)
        this.direction = DIRECTIONS.LEFT
        this.gameFinished = false
        this.gameOver = false
        this.solid = true
        this.input = null
        this.lives = 3
        this.energy = 100
        this.maxEnergy = 100

        this.aSpeed = 0.2 // acceleration speed
        this.dSpeed = 0.3 // deceleration speed
        this.mSpeed = 2 // maximum speed

        this.inDark = false
        this.items = [null, null]
        this.mapPieces = []
        this.light = createLightSource(0, 0, 96, COLORS.TRANS_WHITE)
        this.setBoundingBox(10, 10, this.width - 20, this.height - 10)

        /*
        states:
        - idle
        - walk left
        - walk right
        - jump
        - fall
        - landed
        - pick upo
        - use
        */

        // this.states = null
        // this.currentState = null
    }

    draw (ctx) {
        ctx.save()
        if (!this.canHurt() && this.canMove()) {
            ctx.globalAlpha = 0.2
        }
        super.draw(ctx)
        ctx.restore()
    }

    onScreen () {
        return true
    }

    collide (element) {
        const debug = this.scene.getProperty('debug')
        const overlay = this.scene.getLayer(LAYERS.OVERLAY)

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
                if (this.mapPieces.length === 6) {
                    this.addItem(ITEMS_TYPE.MAP, this.x + 16, this.y + 16)
                }
                break
            }
        }
        if (this.canHurt() && element.damage > 0 && !debug) {
            this.energy -= element.damage
            if (this.energy <= 0 && !this.scene.checkTimeout('player_respawn')) {
                if (this.lives > 1) {
                    this.lives -= 1
                    this.visible = false
                    this.force = { x: 0, y: 0 }
                    overlay.fadeOut()
                    this.scene.startTimeout('player_respawn', 2000, () => {
                        this.energy = this.maxEnergy
                        this.restore()
                    })
                }
                else {
                    overlay.fadeOut()
                    this.visible = false
                    this.scene.startTimeout('game_over', 2000, () => this.killed())
                    this.scene.startTimeout('restart', 10000, () => this.scene.setScene(SCENES.INTRO))
                }
            }
            this.force.y = -2
            this.scene.startTimeout('player_hurt', 3000)
        }
    }

    update () {
        this.input && this.getInput()
        this.move()

        const facingRight = this.direction === DIRECTIONS.RIGHT
        const {
            JUMP_RIGHT, JUMP_LEFT, FALL_RIGHT, FALL_LEFT,
            WALK_RIGHT, WALK_LEFT, STAND_RIGHT, STAND_LEFT
        } = this.animations

        let sprite

        if (this.jump) {
            this.force.y <= 0
                ? sprite = facingRight ? JUMP_RIGHT : JUMP_LEFT
                : sprite = facingRight ? FALL_RIGHT : FALL_LEFT
        }
        else if (Math.abs(this.force.x) > 0) {
            sprite = facingRight ? WALK_RIGHT : WALK_LEFT
        }
        else {
            sprite = facingRight ? STAND_RIGHT : STAND_LEFT
        }
        this.sprite.animate(sprite)
    }

    onInput (input) {
        this.input = input
    }

    getInput () {
        const { input } = this
        const { sfx } = this.scene

        if (this.action) {
            this.moveItems()
            this.actionPerformed()
        }

        if (this.canMove()) {
            if (input.keyPressed[INPUTS.INPUT_LEFT]) {
                if (this.direction === DIRECTIONS.RIGHT) {
                    this.addDust(DIRECTIONS.LEFT)
                }
                this.force.x = approach(this.force.x, -this.mSpeed, this.aSpeed)
                this.direction = DIRECTIONS.LEFT
                this.cameraFollow()
            }
            else if (input.keyPressed[INPUTS.INPUT_RIGHT]) {
                if (this.direction === DIRECTIONS.LEFT) {
                    this.addDust(DIRECTIONS.RIGHT)
                }
                this.force.x = approach(this.force.x, this.mSpeed, this.aSpeed)
                this.direction = DIRECTIONS.RIGHT
                this.cameraFollow()
            }
            else {
                this.force.x = approach(this.force.x, 0, this.dSpeed)
            }
            if (
                input.keyPressed[INPUTS.INPUT_ACTION] ||
                input.keyPressed[INPUTS.INPUT_DOWN]
            ) {
                this.action = true
            }
            if (input.keyPressed[INPUTS.INPUT_UP] && this.canJump()) {
                this.jump = true
                this.force.y = -5.8
                sfx(SOUNDS.PLAYER_JUMP)
            }
            else if (this.jump && this.onGround) {
                this.jump = false
                this.addDust(DIRECTIONS.LEFT)
                this.addDust(DIRECTIONS.RIGHT)
            }
            if (input.keyPressed[INPUTS.INPUT_MAP]) {
                this.showMap()
            }
        }
        this.force.y += this.force.y > 0
            ? this.scene.gravity
            : this.scene.gravity / 2
    }

    cameraFollow () {
        const { camera, resolutionX, resolutionY } = this.scene
        this.direction === DIRECTIONS.LEFT
            ? camera.setMiddlePoint(resolutionX - resolutionX / 3, resolutionY / 2)
            : camera.setMiddlePoint(resolutionX / 3, resolutionY / 2)
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
            if (item) {
                item.visible = false
                this.scene.sfx(SOUNDS.PLAYER_GET)
            }
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
        return this.onGround && !this.jump
    }

    canHurt () {
        return this.canMove() && !this.scene.checkTimeout('player_hurt')
    }

    canDoSomething () {
        return !this.scene.checkTimeout('player_action')
    }

    canTake () {
        return !this.scene.checkTimeout('player_take')
    }

    actionPerformed () {
        this.action = false
        this.scene.startTimeout('player_take', 500)
    }

    canUse (itemId) {
        if (!!this.scene.getProperty('debug')) return true
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return this.canTake() && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    showMap () {
        this.scene.setProperty('pause', true)
        this.scene.startTimeout('player_map', 1500, () => this.scene.setProperty('pause', false))
    }

    killed () {
        if (!this.gameOver) {
            this.gameOver = true
            this.scene.createCustomLayer(GameOverLayer, 1000)
        }
    }

    gameCompleted () {
        if (!this.gameFinished) {
            this.gameFinished = true
            this.scene.createCustomLayer(EndLayer, 1000)
        }
    }

    restore () {
        const { camera } = this.scene
        const { x, y } = this.initialPos
        this.scene.getLayer(LAYERS.OVERLAY).fadeIn()
        this.scene.stopTimeout('player_hurt')
        this.scene.showLayer(LAYERS.FOREGROUND2)
        this.x = x
        this.y = y
        this.visible = true
        this.inDark = false
        camera.center()
    }
}
