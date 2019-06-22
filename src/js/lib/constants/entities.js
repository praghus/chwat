import { ANIMATIONS } from '../animations'
import { ASSETS } from './assets'
import {
    Balloon, Bridge, Catapult, Checkpoint, Cook, Crusher, DarkMask,
    Dragon, Dust, Grass, Lava, LavaStone, Paddle,
    Particle, Player, Rock, Slime, SpiderTrap, Spikes, Switch,
    TileObject, Torch, Trigger, Water, Witch, WoodenBridge
} from '../entities'

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
    COOK: 'cook',
    SLIME: 'slime',
    BRIDGE: 'bridge',
    CATAPULT: 'catapult',
    CHECKPOINT: 'checkpoint',
    DRAGON: 'dragon',
    MAP_PIECE: 'map_piece',
    CRUSHER: 'crusher',
    DARK_MASK: 'dark_mask',
    DUST: 'dust',
    FLAG: 'flag',
    GRASS: 'grass',
    ITEM: 'item',
    JUMP_THROUGH: 'jump_through',
    LAVA: 'lava',
    LAVA_STONE: 'lava_stone',
    PADDLE: 'paddle',
    PARTICLE: 'particle',
    PLAYER: 'player',
    ROCK: 'rock',
    SPIDER_TRAP: 'spider_trap',
    SPIKES: 'spikes',
    SWITCH: 'switch',
    TORCH: 'torch',
    TRIGGER: 'trigger',
    WATER: 'water',
    WITCH: 'witch',
    WOODEN_BRIDGE: 'wooden_bridge'
}
/* eslint-disable max-len */
export const ENTITIES = [
    { type: ENTITIES_TYPE.PLAYER, model: Player, asset: ASSETS.PLAYER, animations: ANIMATIONS.PLAYER},
    { type: ENTITIES_TYPE.BALLOON, family: ENTITIES_FAMILY.MODIFIERS, model: Balloon, asset: ASSETS.BALLOON },
    { type: ENTITIES_TYPE.BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: Bridge, asset: ASSETS.BRIDGE },
    { type: ENTITIES_TYPE.CATAPULT, family: ENTITIES_FAMILY.MODIFIERS, model: Catapult, asset: ASSETS.CATAPULT, animations: ANIMATIONS.CATAPULT },
    { type: ENTITIES_TYPE.COOK, family: ENTITIES_FAMILY.MODIFIERS, model: Cook, asset: ASSETS.COOK },
    { type: ENTITIES_TYPE.CHECKPOINT, family: ENTITIES_FAMILY.MODIFIERS, model: Checkpoint },
    { type: ENTITIES_TYPE.MAP_PIECE, family: ENTITIES_FAMILY.ITEMS, model: TileObject},
    { type: ENTITIES_TYPE.CRUSHER, family: ENTITIES_FAMILY.TRAPS, model: Crusher, asset: ASSETS.CRUSHER },
    { type: ENTITIES_TYPE.DARK_MASK, family: ENTITIES_FAMILY.MODIFIERS, model: DarkMask },
    { type: ENTITIES_TYPE.DRAGON, family: ENTITIES_FAMILY.MODIFIERS, model: Dragon, asset: ASSETS.DRAGON },
    { type: ENTITIES_TYPE.DUST, family: ENTITIES_FAMILY.PARTICLES, model: Dust, asset: ASSETS.DUST, animations: ANIMATIONS.DUST },
    { type: ENTITIES_TYPE.FLAG, family: ENTITIES_FAMILY.MODIFIERS, model: TileObject },
    { type: ENTITIES_TYPE.GRASS, family: ENTITIES_FAMILY.MODIFIERS, model: Grass, asset: ASSETS.GRASS },
    { type: ENTITIES_TYPE.ITEM, family: ENTITIES_FAMILY.ITEMS, model: TileObject },
    { type: ENTITIES_TYPE.LAVA, family: ENTITIES_FAMILY.TRAPS, model: Lava, asset: ASSETS.LAVA },
    { type: ENTITIES_TYPE.LAVA_STONE, family: ENTITIES_FAMILY.TRAPS, model: LavaStone },
    { type: ENTITIES_TYPE.PADDLE, family: ENTITIES_FAMILY.MODIFIERS, model: Paddle, asset: ASSETS.PADDLE },
    { type: ENTITIES_TYPE.PARTICLE, family: ENTITIES_FAMILY.PARTICLES, model: Particle },
    { type: ENTITIES_TYPE.ROCK, family: ENTITIES_FAMILY.TRAPS, model: Rock, asset: ASSETS.ROCK},
    { type: ENTITIES_TYPE.SLIME, family: ENTITIES_FAMILY.ENEMIES, model: Slime, asset: ASSETS.SLIME, animations: ANIMATIONS.SLIME },
    { type: ENTITIES_TYPE.SPIDER_TRAP, family: ENTITIES_FAMILY.TRAPS, model: SpiderTrap, asset: ASSETS.SPIDER_TRAP },
    { type: ENTITIES_TYPE.SPIKES, family: ENTITIES_FAMILY.TRAPS, model: Spikes },
    { type: ENTITIES_TYPE.SWITCH, family: ENTITIES_FAMILY.MODIFIERS, model: Switch, asset: ASSETS.SWITCH, animations: ANIMATIONS.SWITCH },
    { type: ENTITIES_TYPE.TORCH, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TRIGGER, family: ENTITIES_FAMILY.MODIFIERS, model: Trigger },
    { type: ENTITIES_TYPE.WATER, family: ENTITIES_FAMILY.TRAPS, model: Water, asset: ASSETS.WATER, animations: ANIMATIONS.WATER },
    { type: ENTITIES_TYPE.WITCH, family: ENTITIES_FAMILY.MODIFIERS, model: Witch },
    { type: ENTITIES_TYPE.WOODEN_BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: WoodenBridge }
]
