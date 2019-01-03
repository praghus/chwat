import { ASSETS } from './constants'

import Balloon from './entities/balloon'
import Bat from './entities/bat'
import Bridge from './entities/bridge'
import Catapult from './entities/catapult'
import Checkpoint from './entities/checkpoint'
import Cook from './entities/cook'
import Crusher from './entities/crusher'
import DarkMask from './entities/dark-mask'
import Dragon from './entities/dragon'
import Dust from './entities/dust'
import Flag from './entities/flag'
import Grass from './entities/grass'
import Item from './entities/item'
import Lava from './entities/lava'
import LavaStone from './entities/lava-stone'
import MapPiece from './entities/map-piece'
import Paddle from './entities/paddle'
import Particle from './entities/particle'
import Player from './entities/player'
import Rock from './entities/rock'
import Slime from './entities/slime'
import Slope from './entities/slope'
import SpiderTrap from './entities/spider-trap'
import Spikes from './entities/spikes'
import Switch from './entities/switch'
import Torch from './entities/torch'
import Trigger from './entities/trigger'
import Water from './entities/water'
import Witch from './entities/witch'
import WoodenBridge from './entities/wooden-bridge'

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
    SLOPE: 'slope',
    SPIDER_TRAP: 'spider_trap',
    SPIKES: 'spikes',
    SWITCH: 'switch',
    TORCH: 'torch',
    TRIGGER: 'trigger',
    WATER: 'water',
    WITCH: 'witch',
    WOODEN_BRIDGE: 'wooden_bridge'
}
export const ENTITIES = [
    { type: ENTITIES_TYPE.PLAYER, model: Player, asset: ASSETS.PLAYER},
    { type: ENTITIES_TYPE.BALLOON, family: ENTITIES_FAMILY.MODIFIERS, model: Balloon, asset: ASSETS.BALLOON },
    { type: ENTITIES_TYPE.BAT, family: ENTITIES_FAMILY.ENEMIES, model: Bat, asset: ASSETS.BAT },
    { type: ENTITIES_TYPE.BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: Bridge, asset: ASSETS.BRIDGE },
    { type: ENTITIES_TYPE.CATAPULT, family: ENTITIES_FAMILY.MODIFIERS, model: Catapult, asset: ASSETS.CATAPULT },
    { type: ENTITIES_TYPE.COOK, family: ENTITIES_FAMILY.MODIFIERS, model: Cook, asset: ASSETS.COOK },
    { type: ENTITIES_TYPE.CHECKPOINT, family: ENTITIES_FAMILY.MODIFIERS, model: Checkpoint },
    { type: ENTITIES_TYPE.MAP_PIECE, family: ENTITIES_FAMILY.ITEMS, model: MapPiece, asset: ASSETS.MAP_PIECE},
    { type: ENTITIES_TYPE.CRUSHER, family: ENTITIES_FAMILY.TRAPS, model: Crusher, asset: ASSETS.CRUSHER },
    { type: ENTITIES_TYPE.DARK_MASK, family: ENTITIES_FAMILY.MODIFIERS, model: DarkMask },
    { type: ENTITIES_TYPE.DRAGON, family: ENTITIES_FAMILY.MODIFIERS, model: Dragon, asset: ASSETS.DRAGON },
    { type: ENTITIES_TYPE.DUST, family: ENTITIES_FAMILY.PARTICLES, model: Dust, asset: ASSETS.DUST },
    { type: ENTITIES_TYPE.FLAG, family: ENTITIES_FAMILY.MODIFIERS, model: Flag, asset: ASSETS.FLAG },
    { type: ENTITIES_TYPE.GRASS, family: ENTITIES_FAMILY.MODIFIERS, model: Grass, asset: ASSETS.GRASS },
    { type: ENTITIES_TYPE.ITEM, family: ENTITIES_FAMILY.ITEMS, model: Item, asset: ASSETS.ITEMS },
    { type: ENTITIES_TYPE.LAVA, family: ENTITIES_FAMILY.TRAPS, model: Lava, asset: ASSETS.LAVA },
    { type: ENTITIES_TYPE.LAVA_STONE, family: ENTITIES_FAMILY.TRAPS, model: LavaStone },
    { type: ENTITIES_TYPE.PADDLE, family: ENTITIES_FAMILY.MODIFIERS, model: Paddle, asset: ASSETS.PADDLE },
    { type: ENTITIES_TYPE.PARTICLE, family: ENTITIES_FAMILY.PARTICLES, model: Particle },
    { type: ENTITIES_TYPE.ROCK, family: ENTITIES_FAMILY.TRAPS, model: Rock, asset: ASSETS.ROCK},
    { type: ENTITIES_TYPE.SLIME, family: ENTITIES_FAMILY.ENEMIES, model: Slime, asset: ASSETS.SLIME },
    { type: ENTITIES_TYPE.SPIDER_TRAP, family: ENTITIES_FAMILY.TRAPS, model: SpiderTrap, asset: ASSETS.SPIDER_TRAP },
    { type: ENTITIES_TYPE.SPIKES, family: ENTITIES_FAMILY.TRAPS, model: Spikes },
    { type: ENTITIES_TYPE.SLOPE, family: ENTITIES_FAMILY.MODIFIERS, model: Slope },
    { type: ENTITIES_TYPE.SWITCH, family: ENTITIES_FAMILY.MODIFIERS, model: Switch, asset: ASSETS.SWITCH },
    { type: ENTITIES_TYPE.TORCH, family: ENTITIES_FAMILY.MODIFIERS, model: Torch, asset: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TRIGGER, family: ENTITIES_FAMILY.MODIFIERS, model: Trigger },
    { type: ENTITIES_TYPE.WATER, family: ENTITIES_FAMILY.TRAPS, model: Water, asset: ASSETS.WATER },
    { type: ENTITIES_TYPE.WITCH, family: ENTITIES_FAMILY.MODIFIERS, model: Witch },
    { type: ENTITIES_TYPE.WOODEN_BRIDGE, family: ENTITIES_FAMILY.MODIFIERS, model: WoodenBridge }
]
