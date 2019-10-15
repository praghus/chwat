import { Layer } from 'tiled-platformer-lib'
import { DarkMask, LineOfSight } from 'lucendi'
import { lightMaskRect } from '../../utils/helpers'
import { LAYERS } from '../../constants'

export default class LightLayer extends Layer {
    constructor (scene) {
        super(scene)
        this.id = LAYERS.LIGHTMASK
    }

    draw (ctx, scene) {
        if (scene.getProperty('inDark')) {
            const { resolutionX, resolutionY } = scene
            const boundaries = []
            const lights = []

            scene.forEachVisibleObject(LAYERS.LIGHTS, (obj) => {
                obj.light && lights.push(obj.getLight(scene))
            })
            scene.forEachVisibleObject(LAYERS.OBJECTS, (obj) => {
                obj.light && lights.push(obj.getLight(scene))
                obj.shadowCaster && boundaries.push(obj.getLightMask(scene))
            })
            scene.forEachVisibleTile(LAYERS.MAIN, (tile, x, y) => {
                if (tile && tile.isSolid() && !tile.isOneWay()) {
                    tile.collisionMask.map(({ points }) => boundaries.push(lightMaskRect(x, y, points)))
                }
            })
            ctx.globalCompositeOperation = 'lighter'
            for (const light of lights) {
                const l = new LineOfSight(light, boundaries)
                l.buffer(resolutionX, resolutionY)
                l.render(ctx)
            }
            ctx.globalCompositeOperation = 'source-over'
            const d = new DarkMask(lights)
            d.buffer(resolutionX, resolutionY)
            d.render(ctx)
        }
    }
}
