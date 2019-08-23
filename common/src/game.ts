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
        return this.type == UnitType.Land
            && [...this.adjacent].find(a => a.type == UnitType.Water) != null;
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


interface OrderBase<T extends string> {
    readonly type: T,
    readonly unit: Unit,
}

export class HoldOrder implements OrderBase<'hold'> {
    readonly type = 'hold';
    constructor(
        readonly unit: Unit,
    ) { }

    toString() {
        return `${this.unit.team} ${this.unit.region.name} hold`;
    }
}

export class MoveOrder implements OrderBase<'move'> {
    readonly type = 'move';
    constructor(
        readonly unit: Unit,
        readonly target: Region,
        readonly requireConvoy: boolean,
    ) { }

    toString() {
        let text = `${this.unit.team} ${this.unit.region.name} -> ${this.target.name}`;
        if (this.requireConvoy) text += ` via convoy`;
        return text;
    }
}

export class SupportOrder implements OrderBase<'support'> {
    readonly type = 'support';
    constructor(
        readonly unit: Unit,
        readonly target: Region,
        readonly attack?: Region,
    ) { }

    toString() {
        let text = `${this.unit.team} ${this.unit.region.name} support ${this.target.name}`;
        if (this.attack) text += ` -> ${this.attack.name}`;
        else text += ` to hold`;
        return text;
    }
}

export class ConvoyOrder implements OrderBase<'convoy'> {
    readonly type = 'convoy';
    constructor(
        readonly unit: Unit,
        readonly start: Region,
        readonly end: Region,
    ) { }

    toString() {
        return `${this.unit.team} ${this.unit.region.name} convoy ${this.start.name} to ${this.end.name}`;
    }
}

export type AnyOrder = HoldOrder | MoveOrder | SupportOrder | ConvoyOrder;
