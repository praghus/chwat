import { GameEntity } from '../models'
import { createLamp } from 'tiled-platformer-lib'
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
    constructor (obj, game) {
        super(obj, game)
        this.direction = DIRECTIONS.LEFT
        this.solid = true
        this.lives = 3
        this.energy = 100
        this.maxEnergy = 100
        this.maxSpeed = 2
        this.acceleration = 0.25
        this.inDark = 0
        this.items = [null, null]
        this.mapPieces = []
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
                if (this.mapPieces.length === 6) {
                    this.addItem(ITEMS_TYPE.MAP, this.x + 16, this.y + 16)
                }
                break
            }
        }
        if (this.canHurt() && element.damage > 0 && !this.game.debug) {
            this.energy -= element.damage
            if (this.energy <= 0 && !this.game.checkTimeout('player_respawn')) {
                if (this.lives > 1) {
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
                    this.game.overlay.fadeOut()
                    this.visible = false
                    this.game.startTimeout('game_over', 2000, this.game.over)
                    this.game.startTimeout('restart', 10000, () => {
                        this.game.props.setScene(SCENES.INTRO)
                    })
                }
            }
            this.force.y = -2
            this.game.startTimeout('player_hurt', 3000)
        }
    }

    update () {
        const { sprite } = this
        this.input()
        this.move()

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
            if (this.onFloor) {
                this.jump = false
            }
        }
        else if (Math.abs(this.force.x) > this.acceleration) {
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
    }

    input () {
        const {
            scene: { gravity },
            props: { input, playSound }
        } = this.game

        if (this.action) {
            this.moveItems()
            this.actionPerformed()
        }

        this.force.y += this.force.y > 0
            ? gravity
            : gravity / 2

        if (this.canMove()) {
            if (input.keyPressed[INPUTS.INPUT_LEFT]) {
                if (this.direction === DIRECTIONS.RIGHT) {
                    this.addDust(DIRECTIONS.LEFT)
                }
                this.force.x -= this.acceleration
                this.direction = DIRECTIONS.LEFT
                this.cameraFollow()
            }
            else if (input.keyPressed[INPUTS.INPUT_RIGHT]) {
                if (this.direction === DIRECTIONS.LEFT) {
                    this.addDust(DIRECTIONS.RIGHT)
                }
                this.force.x += this.acceleration
                this.direction = DIRECTIONS.RIGHT
                this.cameraFollow()
            }
            if (
                input.keyPressed[INPUTS.INPUT_ACTION] ||
                input.keyPressed[INPUTS.INPUT_DOWN]
            ) {
                this.action = true
            }
            if (input.keyPressed[INPUTS.INPUT_UP] && this.canJump()) {
                this.jump = true
                this.force.y = -5.6
                playSound(SOUNDS.PLAYER_JUMP)
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

    cameraFollow () {
        const {
            camera,
            props: { viewport }
        } = this.game

        if (this.direction === DIRECTIONS.LEFT) {
            camera.setMiddlePoint(
                viewport.resolutionX - viewport.resolutionX / 3,
                viewport.resolutionY / 2
            )
        }
        else {
            camera.setMiddlePoint(
                viewport.resolutionX / 3,
                viewport.resolutionY / 2
            )
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
            if (item) {
                item.visible = false
                this.game.props.playSound(SOUNDS.PLAYER_GET)
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
        this.game.pause()
        this.game.startTimeout('player_map', 1500, () => {
            this.game.pause(false)
        })
    }

    restore () {
        const { camera, scene, overlay } = this.game
        const { x, y } = this.initialPosition
        overlay.fadeIn()
        this.game.stopTimeout('player_hurt')
        this.x = x
        this.y = y
        this.visible = true
        this.inDark = 0
        scene.showLayer(LAYERS.FOREGROUND2)
        camera.center()
    }
}
