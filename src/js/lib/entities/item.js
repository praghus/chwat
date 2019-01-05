import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../../lib/entities'
import { INPUTS } from '../../lib/constants'

export default class Item extends ActiveElement {
    constructor (obj, scene) {
        super(obj, scene)
        this.width = 16
        this.height = 16
        this.solid = true
        this.y -= this.height
        this.initialPosition = {
            x: this.x,
            y: this.y
        }
        this.types = {
            axe: {name: 'Axe', sprite: [64, 0]},
            ball: {name: 'Crystal ballBall', sprite: [64, 32]},
            chopper: {name: 'Chopper', sprite: [112, 32]},
            coconuts: {name: '', sprite: [80, 48]},
            coin: {name: 'Coin', sprite: [0, 48]},
            crank: {name: 'Crank', sprite: [80, 32]},
            crowbar: {name: 'Crowbar', sprite: [32, 0]},
            flag: {name: 'Flag', sprite: [48, 16]},
            flour: {name: 'Flour', sprite: [48, 48]},
            glove: {name: 'Glove', sprite: [64, 48]},
            hammer: {name: 'Hammer', sprite: [16, 48]},
            handle: {name: 'Handle', sprite: [144, 0]},
            hay: {name: 'Hay', sprite: [96, 48]},
            heavy_key: {name: 'Heavy key', sprite: [128, 16]},
            key: {name: 'Key', sprite: [16, 16]},
            knocker: {name: 'Knocker', sprite: [32, 16]},
            line: {name: 'Line', sprite: [80, 0]},
            medicine: {name: 'Medicine', sprite: [128, 0]},
            nails: {name: 'Nails', sprite: [96, 32]},
            oiler: {name: 'Oiler', sprite: [96, 16]},
            pipe: {name: 'Pipe', sprite: [112, 16]},
            plank: {name: 'Plank', sprite: [48, 32]},
            saw: {name: 'Saw', sprite: [96, 0]},
            scissors: {name: 'Scissors', sprite: [128, 32]},
            scythe: {name: 'Scythe', sprite: [16, 32]},
            sheep: {name: 'Sheep', sprite: [144, 32]},
            spade: {name: 'Spade', sprite: [48, 0]},
            stick: {name: 'Stick', sprite: [0, 16]},
            stone: {name: 'Stone', sprite: [80, 16]},
            sulfur: {name: 'Sulfur', sprite: [0, 32]},
            tar: {name: 'Tar', sprite: [144, 16]},
            tnt: {name: 'Dynamite', sprite: [16, 0]},
            tools: {name: 'Tools', sprite: [32, 48]},
            weight: {name: 'Weight', sprite: [112, 0]},
            undefined: {name: 'undefined', sprite: [0, 0]}
        }
        if (this.types[this.properties.id]) {
            const { name, sprite } = this.types[this.properties.id]
            const [x, y] = sprite
            this.name = name
            this.animation = {x, y, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
        else {
            this.animation = {x: 0, y: 0, w: 16, h: 16, frames: 1, fps: 0, loop: false}
        }
    }

    // draw () {
    //     const { assets, ctx, camera, world } = this._scene
    //     if (this.onScreen() && this.visible) {
    //         if (this.gid) {
    //             const {columns, name, firstgid} = world.getAssetForTile(this.gid)
    //             ctx.drawImage(assets[name],
    //                 ((this.gid - firstgid) % columns) * world.spriteSize,
    //                 (Math.ceil(((this.gid - firstgid) + 1) / columns) - 1) * world.spriteSize,
    //                 world.spriteSize, world.spriteSize,
    //                 Math.floor(this.x + camera.x), Math.floor(this.y + camera.y),
    //                 world.spriteSize, world.spriteSize)
    //         }
    //         else {
    //             ctx.drawImage(assets.items, 0, 0, 16, 16, this.x + camera.x, this.y + camera.y, 16, 16)
    //         }
    //     }
    // }

    collide (element) {
        const { input, player } = this._scene
        if (input[INPUTS.INPUT_ACTION] && element.type === ENTITIES_TYPE.PLAYER && this.visible) {
            player.getItem(this)
        }
    }

    update () {
        const { gravity } = this._scene.world
        if (this.onScreen()) {
            if (this.onFloor) this.force.y *= -0.5
            this.force.y += gravity
            this.move()
        }
    }

    placeAt (x, y) {
        this.x = x
        this.y = y
        this.visible = true
    }

    restore () {
        const { x, y } = this.initialPosition
        this.placeAt(x, y)
    }
}
