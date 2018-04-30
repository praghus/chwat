import { ASSETS } from './constants'
import {
    Balloon, Bat, Bridge, Catapult, Checkpoint, Crusher, DarkMask, Dust, Item,
    JumpThrough, Lava, LavaStone, MapPiece, Paddle, Particle, Player, Rock, Slime,
    Slope, SpiderTrap, Spikes, Switch, Torch, Trigger, Water, WoodenBridge
} from '../models/entities'

export const ENTITIES_FAMILY = {
    BULLETS: 'bullets',
    ENEMIES: 'enemies',
    ITEMS: 'items',
    MODIFIERS: 'modifiers',
    PARTICLES: 'particles',
    TRAPS: 'traps'
}

export const ENTITIES_TYPE = {
    BALLOON: 'balloon',
    BAT: 'bat',
    SLIME: 'slime',
    BRIDGE: 'bridge',
    CATAPULT: 'catapult',
    CHECKPOINT: 'checkpoint',
    MAP_PIECE: 'map_piece',
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
    SWITCH: 'switch',
    TORCH_BIG: 'torch_big',
    TORCH_SMALL: 'torch_small',
    TRIGGER: 'trigger',
    WATER: 'water',
    WOODEN_BRIDGE: 'wooden_bridge'
}

export const ENTITIES = [
    { type: ENTITIES_TYPE.PLAYER, model: Player, asset: ASSETS.PLAYER},
    { type: ENTITIES_TYPE.BALLOON, family: ENTITIES_FAMILY.MODIFIERS, model: Balloon, asset: ASSETS.BALLOON },
    { type: ENTITIES_TYPE.BAT, family: ENTITIES_FAMILY.ENEMIES, model: Bat, asset: ASSETS.BAT },
    { type: ENTITIES_TYPE.BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: Bridge, asset: ASSETS.BRIDGE },
    { type: ENTITIES_TYPE.CATAPULT, family: ENTITIES_FAMILY.MODIFIERS, model: Catapult, asset: ASSETS.CATAPULT },
    { type: ENTITIES_TYPE.CHECKPOINT, family: ENTITIES_FAMILY.MODIFIERS, model: Checkpoint },
    { type: ENTITIES_TYPE.MAP_PIECE, family: ENTITIES_FAMILY.ITEMS, model: MapPiece, asset: ASSETS.MAP_PIECE},
    { type: ENTITIES_TYPE.CRUSHER, family: ENTITIES_FAMILY.TRAPS, model: Crusher, asset: ASSETS.CRUSHER },
    { type: ENTITIES_TYPE.DARK_MASK, family: ENTITIES_FAMILY.MODIFIERS, model: DarkMask },
    { type: ENTITIES_TYPE.DUST, family: ENTITIES_FAMILY.PARTICLES, model: Dust, asset: ASSETS.DUST },
    { type: ENTITIES_TYPE.ITEM, family: ENTITIES_FAMILY.ITEMS, model: Item, asset: ASSETS.ITEMS },
    { type: ENTITIES_TYPE.JUMP_THROUGH, family: ENTITIES_FAMILY.MODIFIERS, model: JumpThrough },
    { type: ENTITIES_TYPE.LAVA, family: ENTITIES_FAMILY.TRAPS, model: Lava, asset: ASSETS.LAVA },
    { type: ENTITIES_TYPE.LAVA_STONE, family: ENTITIES_FAMILY.TRAPS, model: LavaStone },
    { type: ENTITIES_TYPE.PADDLE, family: ENTITIES_FAMILY.MODIFIERS, model: Paddle, asset: ASSETS.PADDLE },
    { type: ENTITIES_TYPE.PARTICLE, family: ENTITIES_FAMILY.PARTICLES, model: Particle },
    { type: ENTITIES_TYPE.ROCK, family: ENTITIES_FAMILY.TRAPS, model: Rock, asset: ASSETS.ROCK},
    { type: ENTITIES_TYPE.SLIME, family: ENTITIES_FAMILY.ENEMIES, model: Slime, asset: ASSETS.SLIME },
    { type: ENTITIES_TYPE.SPIDER_TRAP, family: ENTITIES_FAMILY.TRAPS, model: SpiderTrap, asset: ASSETS.SPIDER_TRAP },
    { type: ENTITIES_TYPE.SPIKES, family: ENTITIES_FAMILY.TRAPS, model: Spikes },
    { type: ENTITIES_TYPE.SLOPE_LEFT, family: ENTITIES_FAMILY.MODIFIERS, model: Slope },
    { type: ENTITIES_TYPE.SLOPE_RIGHT, family: ENTITIES_FAMILY.MODIFIERS, model: Slope },
    { type: ENTITIES_TYPE.SWITCH, family: ENTITIES_FAMILY.MODIFIERS, model: Switch, asset: ASSETS.SWITCH },
    { type: ENTITIES_TYPE.TORCH_BIG, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TORCH_SMALL, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TRIGGER, family: ENTITIES_FAMILY.MODIFIERS, model: Trigger },
    { type: ENTITIES_TYPE.WATER, family: ENTITIES_FAMILY.TRAPS, model: Water, asset: ASSETS.WATER },
    { type: ENTITIES_TYPE.WOODEN_BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: WoodenBridge }
]
