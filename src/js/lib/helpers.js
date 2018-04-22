import './illuminated'

const { Lamp, Vec2, RectangleObject } = window.illuminated

export function requireAll (requireContext) {
    return requireContext.keys().map(requireContext)
}

export function calculateViewportSize (width, height) {
    const pixelScale = height / 160
    const x = Math.round(width / pixelScale)
    const y = Math.round(height / pixelScale)

    return {
        width: Math.round(width / x) * x,
        height: Math.round(height / y) * y,
        resolutionX: x,
        resolutionY: y,
        scale: Math.round(width / x)
    }
}

export function brighten (hex, percent) {
    const a = Math.round(255 * percent / 100)
    const r = normalize(a + parseInt(hex.substr(1, 2), 16), 0, 256)
    const g = normalize(a + parseInt(hex.substr(3, 2), 16), 0, 256)
    const b = normalize(a + parseInt(hex.substr(5, 2), 16), 0, 256)
    return `#${(0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1)}`
}

export function darken (hex, percent) {
    return this.brighten(hex, -percent)
}

export function rgbToHex (r, g, b) {
    return ((r < 16) || (g < 8) || b).toString(16)
}

export function overlap (a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export function normalize (n, min, max) {
    while (n < min) {
        n += (max - min)
    }
    while (n >= max) {
        n -= (max - min)
    }
    return n
}

export function random (min, max) {
    return (min + (Math.random() * (max - min)))
}

export function randomInt (min, max) {
    return Math.round(random(min, max))
}

export function randomChoice (choices) {
    return choices[randomInt(0, choices.length - 1)]
}

export function outline (color, {x, y, width, height}) {
    return (ctx) => {
        ctx.save()
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y)
        ctx.lineTo(x + width, y + height)
        ctx.lineTo(x, y + height)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.restore()
    }
}

/**
 * illuminated.js
 */
export function createRectangleObject (x, y, width, height) {
    return new RectangleObject({
        topleft: new Vec2(x, y),
        bottomright: new Vec2(x + width, y + height)
    })
}

export function createLamp (x, y, distance, color) {
    return new Lamp({
        color,
        distance,
        samples: 1,
        radius: 8,
        position: new Vec2(x, y)
    })
}
