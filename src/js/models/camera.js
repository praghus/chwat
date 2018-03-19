export default class Camera {
    constructor (scene) {
        this._scene = scene
        this.x = 0
        this.y = 0
        this.underground = false
        this.rector = 2
        this.a = 1
        this.shake = this.shake.bind(this)
    }

    setFollow (follow) {
        this.follow = follow
        this.center()
    }

    update () {
        const { world, viewport } = this._scene
        const { resolutionX, resolutionY } = viewport
        const { spriteSize, surface } = world

        if ((this.follow.x + (this.follow.width / 2)) + this.x > resolutionX / 2) {
            this.x -= this.follow.force.x > 0 ? this.follow.force.x : 0.5
        }
        if ((this.follow.x + (this.follow.width / 2)) + this.x < resolutionX / 2) {
            this.x -= this.follow.force.x < 0 ? this.follow.force.x : -0.5
        }
        if (this.x - resolutionX < -world.width * spriteSize) {
            this.x = (-world.width * spriteSize) + resolutionX
        }

        this.y = -((this.follow.y + this.follow.height) - (resolutionY / 2))
        if (this.y - resolutionY < -world.height * spriteSize) {
            this.y = (-world.height * spriteSize) + resolutionY
        }
        // above the surface
        if (Math.round((this.follow.y + (this.follow.height / 2)) / spriteSize) < surface) {
            this.underground = false
            if (this.y - resolutionY < -surface * spriteSize) {
                this.y = (-surface * spriteSize) + resolutionY
            }
        }
        // under the surface
        else {
            this.underground = true
            if ((this.y) > -surface * spriteSize) {
                this.y = (-surface * spriteSize)
            }
        }
        // shake
        if (this.rector !== 2) {
            if (this.a === 1) this.y += this.rector
            else if (this.a === 2) this.x += this.rector
            else if (this.a === 3) this.y -= this.rector
            else this.x -= this.rector
            this.a = this.a < 4 ? this.a + 1 : 1
        }

        if (this.x > 0) this.x = 0
        if (this.y > 0) this.y = 0
    }

    center () {
        const { viewport } = this._scene
        if (viewport && this.follow) {
            const {resolutionX, resolutionY} = viewport
            this.x = -((this.follow.x + (this.follow.width / 2)) - (resolutionX / 2))
            this.y = -((this.follow.y + this.follow.height) - (resolutionY / 2))
        }
    }

    moveTo ({x, y}) {
        const { viewport } = this._scene
        if (viewport) {
            const {resolutionX, resolutionY} = viewport
            this.x = -(x - (resolutionX / 2))
            this.y = -(y - (resolutionY / 2))
        }
    }

    shake () {
        if (this.rector < 0) {
            this.rector = 2
            return
        }
        this.rector -= 0.2
        setTimeout(this.shake, 50)
    }
}
