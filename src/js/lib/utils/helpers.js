import moment from 'moment'
import { ENTITIES, INPUT_KEYS, ITEMS } from '../constants'

export const isProduction = process.env.NODE_ENV === 'production'
export const noop = () => {}
export const isValidArray = (arr) => arr && arr.length
export const getPerformance = () => typeof performance !== 'undefined' && performance.now()
export const requireAll = (requireContext) => requireContext.keys().map(requireContext)
export const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.')

export function calculateViewportSize (width, height) {
    const pixelScale = Math.round(height / 124)

    return {
        width,
        height,
        resolutionX: Math.round(width / pixelScale),
        resolutionY: Math.round(height / pixelScale),
        scale: pixelScale
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

export function isMobileDevice () {
    return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1)
};

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

export function getEntityByType (entityType) {
    return ENTITIES.filter(({ type }) => entityType === type)[0] || null
}

export function getItemById (id) {
    return Object.keys(ITEMS).indexOf(id) !== -1 && ITEMS[id]
}

export function getKeyPressed (key) {
    return Object.keys(INPUT_KEYS).find((input) => INPUT_KEYS[input].indexOf(key) !== -1)
}

export function getProperties (obj, property) {
    return obj.properties && obj.properties[property]
}

export function countTime (timer) {
    const ms = moment().diff(moment(timer))
    const d = moment.duration(ms)
    return d.asHours() >= 1
        ? Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss')
        : moment.utc(ms).format('mm:ss')
}

export function between (value, a, b) {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return value >= min && value <= max
}

