import { testPolygonPolygon, Box, Polygon, Vector, Response } from 'sat'
import { getPerformance, isValidArray, normalize } from '../utils/helpers'

export default class Tile {
    constructor (id, asset, tileset) {
        // this.game = game
        this.id = id
        this.animFrame = 0
        this.asset = asset
        this.tileset = tileset
        this.width = tileset.tilewidth
        this.height = tileset.tileheight
        this.properties = this.getTileProperties()
        this.type = this.properties && this.properties.type || null
        this.animation = this.properties && this.properties.animation
        this.collisionLayer = this.createCollisionLayer()
        this.terrain = this.getTerrain()
        this.frameStart = getPerformance()
        this.then = getPerformance()
    }

    collide (polygon) {
        if (isValidArray(this.collisionLayer)) {
            const response = new Response()
            const hasCollision = this.collisionLayer.some((shape) =>
                testPolygonPolygon(shape, polygon, response)
            )
            return hasCollision && response
        }
    }

    createCollisionLayer () {
        const { objects } = this.properties
        const collisionLayer = []
        objects && objects.map(({shape, x, y, width, height, points}) => {
            switch (shape) {
            case 'polygon':
                collisionLayer.push(
                    new Polygon(new Vector(0, 0), points.map((v) => new Vector(x + v[0], y + v[1])))
                )
                break
            case 'ellipse':
            case 'rectangle':
                collisionLayer.push(
                    new Box(new Vector(x, y), width, height).toPolygon()
                )
                break
            }
        }) || collisionLayer.push(new Box(new Vector(0, 0), this.width, this.height).toPolygon())
        return isValidArray(collisionLayer) && collisionLayer || null
    }

    getTerrain () {
        const { terrain } = this.properties
        return terrain && terrain.split(',').map((id) => id ? parseInt(id) : null)
    }

    getTileProperties () {
        const { id, tileset: { firstgid, tiles } } = this
        return isValidArray(tiles) && tiles.filter((tile) => tile.id === id - firstgid)[0] || {}
    }

    getSprite () {
        const { tileset: { firstgid } } = this
        if (this.animation && this.animation.frames) {
            this.frameStart = getPerformance()
            const duration = this.animation.frames[this.animFrame].duration
            if (this.frameStart - this.then > duration) {
                if (this.animFrame <= this.animation.frames.length) {
                    this.animFrame = normalize(this.animFrame + 1, 0, this.animation.frames.length)
                }
                this.then = getPerformance()
            }
            return this.animation.frames[this.animFrame].tileid + firstgid
        }
        else return this.id
    }

    draw (ctx, x, y, options = {}) {
        const {
            asset,
            tileset: {
                columns,
                firstgid,
                tilewidth,
                tileheight
            }
        } = this
        const scale = options.scale || 1
        const debug = !!options.debug
        const sprite = this.getSprite()

        ctx.drawImage(
            asset,
            ((sprite - firstgid) % columns) * tilewidth,
            (Math.ceil(((sprite - firstgid) + 1) / columns) - 1) * tileheight,
            tilewidth, tileheight,
            x, y,
            tilewidth * scale, tileheight * scale
        )

        isValidArray(this.collisionLayer) && debug && this.collisionLayer.map(
            (object) => {
                const [ posX, posY ] = [object.pos.x + x, object.pos.y + y]
                ctx.save()
                ctx.lineWidth = 0.1
                ctx.strokeStyle = isValidArray(this.properties.objects) ? '#f0f' : '#ff0'
                if (object instanceof Polygon) {
                    ctx.beginPath()
                    ctx.moveTo(object.points[0].x + posX, object.points[0].y + posY)
                    object.points.map((v) => ctx.lineTo(posX + v.x, posY + v.y))
                    ctx.lineTo(object.points[0].x + posX, object.points[0].y + posY)
                    ctx.stroke()
                }
                else if (object instanceof Box) {
                    ctx.beginPath()
                    ctx.moveTo(posX, posY)
                    ctx.lineTo(posX + object.w, posY)
                    ctx.lineTo(posX + object.w, posY + object.h)
                    ctx.lineTo(posX, posY + object.h)
                    ctx.lineTo(posX, posY)
                    ctx.stroke()
                }
                ctx.restore()
            }
        )
    }
}
