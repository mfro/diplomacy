export class Region {
    readonly attached = new Set<Region>();
    readonly adjacent = new Set<Region>();

    constructor(
        readonly id: string,
        readonly name: string,
        readonly type: UnitType,
    ) { }

    get allAdjacent() {
        let list = [...this.adjacent];
        for (let node of this.attached) {
            list.push(...node.adjacent);
        }
        for (let node of list.slice()) {
            list.push(...node.attached);
        }
        return list;
    }

    get isShore() {
        return this.type == UnitType.Land && this.allAdjacent.find(a => a.type == UnitType.Water);
    }

    static areSame(lhs: Region, rhs: Region) {
        return lhs == rhs || lhs.attached.has(rhs);
    }

    static areEqual(lhs: Region, rhs: Region) {
        return lhs == rhs;
    }
}

export enum UnitType {
    Land,
    Water,
}

export class Unit {
    constructor(
        readonly region: Region,
        readonly type: UnitType,
        readonly team: string,
    ) { }
}

export class GameMap {
    constructor(
        readonly regions: Region[],
    ) { }
}

export class GameState {
    readonly units = new Set<Unit>();

    constructor(
        readonly map: GameMap,
        readonly teams: string[],
    ) { }

    move(unit: Unit, target: Region) {
        this.units.delete(unit);
        this.units.add(new Unit(target, unit.type, unit.team));
    }
}
