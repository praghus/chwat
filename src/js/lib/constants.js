export const NON_COLLIDE_INDEX = 256
export const SPECIAL_TILES_INDEX = 1024
export const JUMP_THROUGH_TILES = [210, 211, 212, 213, 214, 243, 836, 868, 1088, 1089]

export const MINI_TILES = {
    '230': {offsetX: 8, offsetY: 8, width: 8, height: 8},
    '233': {offsetX: 0, offsetY: 8, width: 8, height: 8},
    '234': {offsetX: 8, offsetY: 8, width: 8, height: 8},
    '235': {offsetX: 0, offsetY: 8, width: 8, height: 8}
}

export const SCENES = {
    INTRO: 'INTRO',
    GAME: 'GAME'
}

export const FONTS = {
    FONT_SMALL: { name: 'font_small', size: 5},
    FONT_NORMAL: { name: 'font_normal', size: 8},
    FONT_BIG: { name: 'font_big', size: 16}
}

export const COLORS = {
    BLUE_SKY: '#7CF',
    BLACK: '#000',
    DARK_GREY: '#222',
    DARK_RED: '#D00',
    GREEN: '#0F0',
    PURPLE: '#F0F',
    LIGHT_RED: '#F00',
    PLAYER_LIGHT: 'rgba(255,255,255,0.1)'
}

export const LIGHTS = {
    PLAYER_LIGHT: 'player_light'
}

export const LAYERS = {
    MAIN: 'ground',
    BACKGROUND1: 'background1',
    BACKGROUND2: 'background2',
    FOREGROUND1: 'foreground1',
    FOREGROUND2: 'foreground2',
    OBJECTS: 'objects'
}

export const DIRECTIONS = {
    UP: 'up',
    RIGHT: 'right',
    DOWN: 'down',
    LEFT: 'left'
}

export const INPUTS = {
    INPUT_UP: 'up',
    INPUT_RIGHT: 'right',
    INPUT_DOWN: 'down',
    INPUT_LEFT: 'left',
    INPUT_ACTION: 'action',
    INPUT_MAP: 'map',
    INPUT_DEBUG: 'debug',
    INPUT_RESTORE: 'restore'
}

export const INPUT_KEYS = {
    [INPUTS.INPUT_UP]: ['KeyW', 'ArrowUp'],
    [INPUTS.INPUT_RIGHT]: ['KeyD', 'ArrowRight'],
    [INPUTS.INPUT_DOWN]: ['KeyS', 'ArrowDown'],
    [INPUTS.INPUT_LEFT]: ['KeyA', 'ArrowLeft'],
    [INPUTS.INPUT_ACTION]: ['Space'],
    [INPUTS.INPUT_MAP]: ['KeyM'],
    [INPUTS.INPUT_DEBUG]: ['KeyI'],
    [INPUTS.INPUT_RESTORE]: ['KeyL']
}

export const TIMEOUTS = {
    'MESSAGE': { name: 'message', duration: 3000 },
    'HINT': { name: 'hint', duration: 2000 },
    'PLAYER_HURT': { name: 'player_hurt', duration: 3000 },
    'PLAYER_MAP': { name: 'player_map', duration: 2000 },
    'PLAYER_RESPAWN': { name: 'player_respawn', duration: 1000 },
    'PLAYER_TAKE': { name: 'player_take', duration: 500 }
}

export const ASSETS = {
    BALLOON: 'air_balloon',
    BAT: 'bat',
    BUTTONS: 'buttons',
    COOK: 'cook',
    SLIME: 'slime',
    BUBBLE: 'sbubble',
    BRIDGE: 'bridge',
    CATAPULT: 'catapult',
    MAP_PIECE: 'map_piece',
    CRUSHER: 'crusher',
    DUST: 'dust',
    DRAGON: 'dragon',
    ENERGY: 'energy',
    FAR_FOREST: 'bg3',
    FLAG: 'flag',
    FOG: 'bg5',
    FOREST: 'bg4',
    FRAMES: 'frames',
    GRASS: 'grass',
    HEAD: 'head',
    HEARTS: 'hearts',
    ITEMS: 'items',
    LAVA: 'lava',
    LIGHTING: 'lighting',
    LOGO: 'chwat',
    MOUNTAINS: 'bg2',
    PADDLE: 'paddle',
    PLAYER: 'player',
    ROCK: 'rock',
    SKY: 'bg6',
    SPIDER_TRAP: 'spider_trap',
    SWITCH: 'switch',
    TORCH: 'torches',
    TILES: 'tiles',
    WATER: 'water',
    WITCH: 'witch'
}
