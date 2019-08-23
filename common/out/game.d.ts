export declare class Region {
    readonly id: string;
    readonly name: string;
    readonly type: UnitType;
    readonly attached: Set<Region>;
    readonly adjacent: Set<Region>;
    constructor(id: string, name: string, type: UnitType);
    readonly allAdjacent: Region[];
    readonly isShore: boolean;
    static areSame(lhs: Region, rhs: Region): boolean;
    static areEqual(lhs: Region, rhs: Region): boolean;
}
export declare enum UnitType {
    Land = 0,
    Water = 1
}
export declare class Unit {
    readonly region: Region;
    readonly type: UnitType;
    readonly team: string;
    constructor(region: Region, type: UnitType, team: string);
}
export declare class GameMap {
    readonly regions: Region[];
    constructor(regions: Region[]);
}
export declare class GameState {
    readonly map: GameMap;
    readonly teams: string[];
    readonly units: Set<Unit>;
    constructor(map: GameMap, teams: string[]);
    move(unit: Unit, target: Region): void;
}
interface OrderBase<T extends string> {
    readonly type: T;
    readonly unit: Unit;
}
export declare class HoldOrder implements OrderBase<'hold'> {
    readonly unit: Unit;
    readonly type = "hold";
    constructor(unit: Unit);
    toString(): string;
}
export declare class MoveOrder implements OrderBase<'move'> {
    readonly unit: Unit;
    readonly target: Region;
    readonly requireConvoy: boolean;
    readonly type = "move";
    constructor(unit: Unit, target: Region, requireConvoy: boolean);
    toString(): string;
}
export declare class SupportOrder implements OrderBase<'support'> {
    readonly unit: Unit;
    readonly target: Region;
    readonly attack?: Region | undefined;
    readonly type = "support";
    constructor(unit: Unit, target: Region, attack?: Region | undefined);
    toString(): string;
}
export declare class ConvoyOrder implements OrderBase<'convoy'> {
    readonly unit: Unit;
    readonly start: Region;
    readonly end: Region;
    readonly type = "convoy";
    constructor(unit: Unit, start: Region, end: Region);
    toString(): string;
}
export declare type AnyOrder = HoldOrder | MoveOrder | SupportOrder | ConvoyOrder;
export {};
