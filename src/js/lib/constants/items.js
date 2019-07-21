import { ENTITIES_TYPE } from './entities'

const type = ENTITIES_TYPE.ITEM

export const ITEMS_TYPE = {
    CHOPPER: 'chopper',
    CRANK: 'crank',
    FLAG: 'flag',
    HANDLE: 'handle',
    HAY: 'hay',
    SHEEP: 'sheep'
}

export const ITEMS = {
    [ITEMS_TYPE.CHOPPER]: { gid: 1148, type, name: 'Chopper', properties: { id: ITEMS_TYPE.CHOPPER } },
    [ITEMS_TYPE.CRANK]: { gid: 1146, type, name: 'Crank', properties: { id: ITEMS_TYPE.CRANK } },
    [ITEMS_TYPE.FLAG]: { gid: 1307, type, name: 'Handle', properties: { id: ITEMS_TYPE.FLAG } },
    [ITEMS_TYPE.HANDLE]: { gid: 1143, type, name: 'Handle', properties: { id: ITEMS_TYPE.HANDLE } },
    [ITEMS_TYPE.HAY]: { gid: 1157, type, name: 'Hay', properties: { id: ITEMS_TYPE.HAY } },
    [ITEMS_TYPE.SHEEP]: { gid: 1150, type, name: 'Sheep', properties: { id: ITEMS_TYPE.SHEEP } }
}
