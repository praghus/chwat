import {
    Bat, Blob, Catapult, Checkpoint, Coin, Crusher, DarkMask, Dust, Item, JumpThrough, Lava,
    LavaStone, Paddle, Particle, Player, Rock, Slope, SpiderTrap, Spikes, Torch, Trigger, Water
} from '../models/entities'

export const NON_COLLIDE_INDEX = 32 * 8

export const COLORS = {
    PLAYER_LIGHT: 'rgba(255,255,255,0.1)'
}

export const FONTS = {
    FONT_SMALL: { name: 'font_small', size: 5},
    FONT_NORMAL: { name: 'font_normal', size: 8},
    FONT_BIG: { name: 'font_big', size: 16}
}

export const LIGHTS = {
    PLAYER_LIGHT: 'player_light'
}

export const LAYERS = {
    MAIN: 'ground',
    BACKGROUND: 'background',
    FOREGROUND1: 'foreground1',
    FOREGROUND2: 'foreground2',
    DARKS: 'darks',
    OBJECTS: 'objects'
}

export const DIRECTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
}

export const INPUTS = {
    INPUT_UP: 'up',
    INPUT_RIGHT: 'right',
    INPUT_DOWN: 'down',
    INPUT_LEFT: 'left',
    INPUT_ACTION: 'fire'
}

export const INPUT_KEYS = {
    [INPUTS.INPUT_UP]: ['KeyW', 'ArrowUp'],
    [INPUTS.INPUT_RIGHT]: ['KeyD', 'ArrowRight'],
    [INPUTS.INPUT_DOWN]: ['KeyS', 'ArrowDown'],
    [INPUTS.INPUT_LEFT]: ['KeyA', 'ArrowLeft'],
    [INPUTS.INPUT_ACTION]: ['Space']
}

export const ENTITIES_TYPE = {
    BAT: 'bat',
    BLOB: 'blob',
    CATAPULT: 'catapult',
    CHECKPOINT: 'checkpoint',
    COIN: 'coin',
    CRUSHER: 'crusher',
    DARK_MASK: 'dark_mask',
    DUST: 'dust',
    ITEM: 'item',
    JUMP_THROUGH: 'jump_through',
    LAVA: 'lava',
    LAVA_STONE: 'lava_stone',
    PADDLE: 'paddle',
    PARTICLE: 'particle',
    PLAYER: 'player',
    ROCK: 'rock',
    SLOPE_LEFT: 'slope_left',
    SLOPE_RIGHT: 'slope_right',
    SPIDER_TRAP: 'spider_trap',
    SPIKES: 'spikes',
    TORCH_BIG: 'torch_big',
    TORCH_SMALL: 'torch_small',
    TRIGGER: 'trigger',
    WATER: 'water'
}

export const ENTITIES_FAMILY = {
    BULLETS: 'bullets',
    ENEMIES: 'enemies',
    ITEMS: 'items',
    MODIFIERS: 'modifiers',
    PARTICLES: 'particles',
    TRAPS: 'traps'
}

export const ASSETS = {
    BAT: 'bat',
    BLOB: 'blob',
    BUBBLE: 'sbubble',
    CATAPULT: 'catapult',
    COIN: 'coin',
    CRUSHER: 'crusher',
    DUST: 'dust',
    FAR_FOREST: 'bg3',
    FOREST: 'bg4',
    FRAMES: 'frames',
    HEART: 'heart',
    ITEMS: 'items',
    MOUNTAINS: 'bg2',
    PADDLE: 'paddle',
    PLAYER: 'player',
    ROCK: 'rock',
    SPIDER_TRAP: 'spider_trap',
    TORCH: 'torches',
    TILES: 'tiles',
    WATER: 'water'
}

export const ENTITIES = [
    { type: ENTITIES_TYPE.BAT, family: ENTITIES_FAMILY.ENEMIES, model: Bat, asset: ASSETS.BAT },
    { type: ENTITIES_TYPE.BLOB, family: ENTITIES_FAMILY.ENEMIES, model: Blob, asset: ASSETS.BLOB },
    { type: ENTITIES_TYPE.CATAPULT, family: ENTITIES_FAMILY.MODIFIERS, model: Catapult, asset: ASSETS.CATAPULT },
    { type: ENTITIES_TYPE.CHECKPOINT, family: ENTITIES_FAMILY.MODIFIERS, model: Checkpoint },
    { type: ENTITIES_TYPE.COIN, family: ENTITIES_FAMILY.ITEMS, model: Coin, asset: ASSETS.COIN },
    { type: ENTITIES_TYPE.CRUSHER, family: ENTITIES_FAMILY.TRAPS, model: Crusher, asset: ASSETS.CRUSHER },
    { type: ENTITIES_TYPE.DARK_MASK, family: ENTITIES_FAMILY.MODIFIERS, model: DarkMask },
    { type: ENTITIES_TYPE.DUST, family: ENTITIES_FAMILY.PARTICLES, model: Dust, asset: ASSETS.DUST },
    { type: ENTITIES_TYPE.ITEM, family: ENTITIES_FAMILY.ITEMS, model: Item, asset: ASSETS.ITEMS },
    { type: ENTITIES_TYPE.JUMP_THROUGH, family: ENTITIES_FAMILY.MODIFIERS, model: JumpThrough },
    { type: ENTITIES_TYPE.LAVA, family: ENTITIES_FAMILY.TRAPS, model: Lava },
    { type: ENTITIES_TYPE.LAVA_STONE, family: ENTITIES_FAMILY.TRAPS, model: LavaStone },
    { type: ENTITIES_TYPE.PADDLE, family: ENTITIES_FAMILY.MODIFIERS, model: Paddle, asset: ASSETS.PADDLE },
    { type: ENTITIES_TYPE.PARTICLE, family: ENTITIES_FAMILY.PARTICLES, model: Particle },
    { type: ENTITIES_TYPE.PLAYER, model: Player, asset: ASSETS.PLAYER},
    { type: ENTITIES_TYPE.ROCK, family: ENTITIES_FAMILY.TRAPS, model: Rock, asset: ASSETS.ROCK},
    { type: ENTITIES_TYPE.SPIDER_TRAP, family: ENTITIES_FAMILY.TRAPS, model: SpiderTrap, asset: ASSETS.SPIDER_TRAP },
    { type: ENTITIES_TYPE.SPIKES, family: ENTITIES_FAMILY.TRAPS, model: Spikes },
    { type: ENTITIES_TYPE.SLOPE_LEFT, family: ENTITIES_FAMILY.MODIFIERS, model: Slope },
    { type: ENTITIES_TYPE.SLOPE_RIGHT, family: ENTITIES_FAMILY.MODIFIERS, model: Slope },
    { type: ENTITIES_TYPE.TORCH_BIG, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TORCH_SMALL, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TRIGGER, family: ENTITIES_FAMILY.MODIFIERS, model: Trigger },
    { type: ENTITIES_TYPE.WATER, family: ENTITIES_FAMILY.TRAPS, model: Water, asset: ASSETS.WATER }
]

export function getEntityByType (entityType) {
    return ENTITIES.filter(({type}) => entityType === type)[0] || null
}

export function getKeyPressed (key) {
    return Object.keys(INPUT_KEYS).find((input) => INPUT_KEYS[input].indexOf(key) !== -1)
}
