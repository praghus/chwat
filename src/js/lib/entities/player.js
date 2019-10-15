import { GameEntity, EndLayer, GameOverLayer } from '../models'
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
    constructor (obj, sprite) {
        super(obj, sprite)
        this.direction = DIRECTIONS.LEFT
        this.attached = true
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

        this.paused = false
        this.debug = false

        this.inDark = false
        this.items = [null, null]
        this.mapPieces = []
        this.addLightSource(90, COLORS.TRANS_WHITE)
        this.setBoundingBox(10, 10, this.width - 20, this.height - 10)
    }

    draw (ctx, scene) {
        ctx.save()
        if (!this.canHurt() && this.canMove()) {
            ctx.globalAlpha = 0.2
        }
        super.draw(ctx, scene)
        ctx.restore()
    }

    collide (element, scene) {
        const debug = scene.getProperty('debug')
        const overlay = scene.getLayer(LAYERS.OVERLAY)

        if (this.action) {
            switch (element.type) {
            case ENTITIES_TYPE.SWITCH:
            case ENTITIES_TYPE.TRIGGER:
                element.interact(scene)
                break
            case ENTITIES_TYPE.ITEM:
                if (element.visible) {
                    this.moveItems(element, scene)
                    this.actionPerformed(scene)
                }
                break
            case ENTITIES_TYPE.MAP_PIECE:
                this.mapPieces.push(element.gid)
                this.showMap()
                element.kill()
                this.actionPerformed(scene)
                if (this.mapPieces.length === 6) {
                    this.addItem(ITEMS_TYPE.MAP, this.x + 16, this.y + 16)
                }
                break
            }
        }
        if (this.canHurt() && element.damage > 0 && !debug) {
            this.energy -= element.damage
            if (this.energy <= 0 && !this.checkTimeout('player_respawn')) {
                if (this.lives > 1) {
                    this.lives -= 1
                    this.visible = false
                    this.force = { x: 0, y: 0 }
                    overlay.fadeOut()
                    this.startTimeout('player_respawn', 2000, () => {
                        this.energy = this.maxEnergy
                        this.restore(scene)
                    })
                }
                else {
                    overlay.fadeOut()
                    this.visible = false
                    this.startTimeout('game_over', 2000, () => this.killed(scene))
                    this.startTimeout('restart', 10000, () => scene.properties.setScene(SCENES.INTRO))
                }
            }
            this.force.y = -2
            this.startTimeout('player_hurt', 3000)
        }
    }

    update (scene, input) {
        super.update(scene)
        this.onInput(scene, input)
        this.debug = scene.getProperty('debug')

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

    onInput (scene, input) {
        this.input = input
        const { properties: { sfx } } = scene
        const gravity = scene.getProperty('gravity')

        if (this.action) {
            this.moveItems(null, scene)
            this.actionPerformed(scene)
        }
        if (!this.onGround) {
            this.force.y += this.force.y > 0 ? gravity : gravity / 2
        }
        else if (Math.abs(this.force.y) <= 0.2) {
            this.force.y = 0
        }
        if (this.canMove()) {
            if (input.keyPressed[INPUTS.INPUT_LEFT]) {
                if (this.direction === DIRECTIONS.RIGHT && this.onGround) this.addDust(DIRECTIONS.LEFT)
                this.force.x = approach(this.force.x, -this.mSpeed, this.aSpeed)
                this.direction = DIRECTIONS.LEFT
                this.cameraFollow(scene)
            }
            else if (input.keyPressed[INPUTS.INPUT_RIGHT]) {
                if (this.direction === DIRECTIONS.LEFT && this.onGround) this.addDust(DIRECTIONS.RIGHT)
                this.force.x = approach(this.force.x, this.mSpeed, this.aSpeed)
                this.direction = DIRECTIONS.RIGHT
                this.cameraFollow(scene)
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
    }

    cameraFollow (scene) {
        const { camera, resolutionX, resolutionY } = scene
        this.direction === DIRECTIONS.LEFT
            ? camera.setMiddlePoint(resolutionX - resolutionX / 3, resolutionY / 2)
            : camera.setMiddlePoint(resolutionX / 3, resolutionY / 2)
    }

    moveItems (item, scene) {
        if (this.canTake()) {
            if (this.items[1]) {
                this.items[1].placeAt(
                    this.x + 6,
                    this.y + 8
                )
            }
            [this.items[0], this.items[1]] = [item, this.items[0]]
            if (item) {
                item.visible = false
                scene.properties.sfx(SOUNDS.PLAYER_GET)
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
        return this.canMove() && !this.checkTimeout('player_hurt')
    }

    canTake () {
        return !this.checkTimeout('player_take')
    }

    actionPerformed (scene) {
        this.action = false
        this.startTimeout('player_take', 500)
    }

    canUse (itemId) {
        if (this.debug) return true
        const haveItem = this.items.find((item) => item && item.properties.id === itemId)
        return this.canTake() && (itemId === ENTITIES_TYPE.PLAYER || haveItem)
    }

    showMap () {
        this.paused = true
        this.startTimeout('player_map', 1500, () => {
            this.paused = false
        })
    }

    killed (scene) {
        if (!this.gameOver) {
            this.gameOver = true
            scene.createCustomLayer(GameOverLayer, 1000)
        }
    }

    gameCompleted (scene) {
        if (!this.gameFinished) {
            this.gameFinished = true
            scene.createCustomLayer(EndLayer, 1000)
        }
    }

    restore (scene) {
        const { x, y } = this.initialPos
        this.x = x
        this.y = y
        this.visible = true
        this.inDark = false
        this.stopTimeout('player_hurt')
        scene.getLayer(LAYERS.OVERLAY).fadeIn()
        scene.showLayer(LAYERS.FOREGROUND2)
        scene.camera.center()
    }
}
