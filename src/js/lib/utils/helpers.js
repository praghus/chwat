import moment from 'moment'
import { ENTITIES, INPUT_KEYS } from '../constants'

export const noop = () => {}
export const isValidArray = (arr) => arr && arr.length
export const getPerformance = () => typeof performance !== 'undefined' && performance.now()
export const requireAll = (requireContext) => requireContext.keys().map(requireContext)
export const getFilename = (path) => path.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.')

export function calculateViewportSize (width, height) {
    const pixelScale = height / 128
    const x = Math.round(width / pixelScale)
    const y = Math.round(height / pixelScale)

    return {
        width: Math.round(width / x) * x,
        height: Math.round(height / y) * y,
        scale: Math.round(width / x),
        resolutionX: x,
        resolutionY: y
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
    return ENTITIES.filter(({type}) => entityType === type)[0] || null
}

export function getKeyPressed (key) {
    return Object.keys(INPUT_KEYS).find((input) => INPUT_KEYS[input].indexOf(key) !== -1)
}

export function getProperties (data) {
    if (data && data.length) {
        const properties = {}
        data.map(({name, value}) => {
            properties[name] = value
        })
        return properties
    }
}

export function getElementProperties (element) {
    const { force, properties } = element
    const filteredElement = { force, properties }
    Object.getOwnPropertyNames(element).filter((prop) =>
        typeof element[prop] !== 'object' &&
        typeof element[prop] !== 'function' &&
        prop !== 'properties'
    ).map((prop) => {
        filteredElement[prop] = element[prop]
    })
    return filteredElement
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