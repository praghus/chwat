import * as ANIMATIONS from '../animations'
import { ASSETS } from './assets'
import { LAYERS } from './config'
import {
    Balloon, Bridge, Camera, Catapult, Character, DarkMask, Dragon, Dust,
    Grass, KillZone, Paddle, Particle, Player, Rock, Ship, Slime, SpiderTrap,
    Spikes, Sparkle, Switch, TileObject, Torch, Trigger, Water, Collector
} from '../entities'

export const ENTITIES_TYPE = {
    BALLOON: 'balloon',
    BONUS: 'bonus',
    BOX: 'box',
    CAMERA: 'camera',
    CHARACTER: 'character',
    COLLECTOR: 'collector',
    SLIME: 'slime',
    BRIDGE: 'bridge',
    CATAPULT: 'catapult',
    CHECKPOINT: 'checkpoint',
    DRAGON: 'dragon',
    MAP_PIECE: 'map_piece',
    DARK_MASK: 'dark_mask',
    DUST: 'dust',
    FLAG: 'flag',
    GRASS: 'grass',
    ITEM: 'item',
    KILL_ZONE: 'kill_zone',
    PADDLE: 'paddle',
    PARTICLE: 'particle',
    PLAYER: 'player',
    ROCK: 'rock',
    SHIP: 'ship',
    SPARKLE: 'sparkle',
    SPIDER_TRAP: 'spider_trap',
    SPIKES: 'spikes',
    SWITCH: 'switch',
    TORCH: 'torch',
    TRIGGER: 'trigger',
    WATER: 'water'
}

const collisionLayers = [LAYERS.MAIN]

/* eslint-disable max-len */
export const ENTITIES = [
    { type: ENTITIES_TYPE.BALLOON, model: Balloon, aid: ASSETS.BALLOON },
    { type: ENTITIES_TYPE.BONUS, model: TileObject, collisionLayers },
    { type: ENTITIES_TYPE.BOX, model: TileObject, collisionLayers },
    { type: ENTITIES_TYPE.BRIDGE, model: Bridge, aid: ASSETS.BRIDGE, animations: ANIMATIONS.BRIDGE, collisionLayers },
    { type: ENTITIES_TYPE.CAMERA, model: Camera },
    { type: ENTITIES_TYPE.CATAPULT, model: Catapult, aid: ASSETS.CATAPULT, animations: ANIMATIONS.CATAPULT, collisionLayers },
    { type: ENTITIES_TYPE.COLLECTOR, model: Collector, collisionLayers },
    { type: ENTITIES_TYPE.CHARACTER, model: Character, collisionLayers },
    { type: ENTITIES_TYPE.DARK_MASK, model: DarkMask },
    { type: ENTITIES_TYPE.DRAGON, model: Dragon },
    { type: ENTITIES_TYPE.DUST, model: Dust, aid: ASSETS.DUST, animations: ANIMATIONS.DUST, collisionLayers },
    { type: ENTITIES_TYPE.FLAG, model: TileObject, collisionLayers },
    { type: ENTITIES_TYPE.GRASS, model: Grass, aid: ASSETS.GRASS },
    { type: ENTITIES_TYPE.ITEM, model: TileObject, collisionLayers },
    { type: ENTITIES_TYPE.KILL_ZONE, model: KillZone, collisionLayers },
    { type: ENTITIES_TYPE.MAP_PIECE, model: TileObject, collisionLayers },
    { type: ENTITIES_TYPE.PADDLE, model: Paddle, aid: ASSETS.PADDLE },
    { type: ENTITIES_TYPE.PARTICLE, model: Particle, collisionLayers },
    { type: ENTITIES_TYPE.PLAYER, model: Player, aid: ASSETS.PLAYER, animations: ANIMATIONS.PLAYER, collisionLayers },
    { type: ENTITIES_TYPE.ROCK, model: Rock, aid: ASSETS.ROCK, collisionLayers },
    { type: ENTITIES_TYPE.SHIP, model: Ship },
    { type: ENTITIES_TYPE.SLIME, model: Slime, aid: ASSETS.SLIME, animations: ANIMATIONS.SLIME, collisionLayers },
    { type: ENTITIES_TYPE.SPIDER_TRAP, model: SpiderTrap, aid: ASSETS.SPIDER_TRAP, animations: ANIMATIONS.SPIDER_TRAP, collisionLayers },
    { type: ENTITIES_TYPE.SPARKLE, model: Sparkle, aid: ASSETS.SHINE, animations: ANIMATIONS.SPARKLE },
    { type: ENTITIES_TYPE.SPIKES, model: Spikes },
    { type: ENTITIES_TYPE.SWITCH, model: Switch, aid: ASSETS.SWITCH, animations: ANIMATIONS.SWITCH },
    { type: ENTITIES_TYPE.TORCH, model: Torch, aid: ASSETS.TORCH },
    { type: ENTITIES_TYPE.TRIGGER, model: Trigger },
    { type: ENTITIES_TYPE.WATER, model: Water, aid: ASSETS.WATER, animations: ANIMATIONS.WATER, collisionLayers }
]
