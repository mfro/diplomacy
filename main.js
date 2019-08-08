'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs-extra'));
var zlib = _interopDefault(require('zlib'));
var request = _interopDefault(require('request-promise-native'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Region {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.attached = new Set();
        this.adjacent = new Set();
    }
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
    static areSame(lhs, rhs) {
        return lhs == rhs || lhs.attached.has(rhs);
    }
    static areEqual(lhs, rhs) {
        return lhs == rhs;
    }
}
var UnitType;
(function (UnitType) {
    UnitType[UnitType["Land"] = 0] = "Land";
    UnitType[UnitType["Water"] = 1] = "Water";
})(UnitType || (UnitType = {}));
class Unit {
    constructor(region, type, team) {
        this.region = region;
        this.type = type;
        this.team = team;
    }
}
class GameMap {
    constructor(regions) {
        this.regions = regions;
    }
}
class GameState {
    constructor(map, teams) {
        this.map = map;
        this.teams = teams;
        this.units = new Set();
    }
    move(unit, target) {
        this.units.delete(unit);
        this.units.add(new Unit(target, unit.type, unit.team));
    }
}
//# sourceMappingURL=game.js.map

const LAND = UnitType.Land;
const WATER = UnitType.Water;
function n(id, name, type) {
    return new Region(id, name, type);
}
// austria
let BOH = n('BOH', 'Bohemia', LAND);
let BUD = n('BUD', 'Budapest', LAND);
let GAL = n('GAL', 'Galicia', LAND);
let TRI = n('TRI', 'Trieste', LAND);
let TYR = n('TYR', 'Tyrolia', LAND);
let VIE = n('VIE', 'Vienna', LAND);
// england
let CLY = n('CLY', 'Clyde', LAND);
let EDI = n('EDI', 'Edinburgh', LAND);
let LVP = n('LVP', 'Liverpool', LAND);
let LON = n('LON', 'London', LAND);
let WAL = n('WAL', 'Wales', LAND);
let YOR = n('YOR', 'Yorkshire', LAND);
// france
let BRE = n('BRE', 'Brest', LAND);
let BUR = n('BUR', 'Burgundy', LAND);
let GAS = n('GAS', 'Gascony', LAND);
let MAR = n('MAR', 'Marseilles', LAND);
let PAR = n('PAR', 'Paris', LAND);
let PIC = n('PIC', 'Picardy', LAND);
// germany
let BER = n('BER', 'Berlin', LAND);
let KIE = n('KIE', 'Kiel', LAND);
let MUN = n('MUN', 'Munich', LAND);
let PRU = n('PRU', 'Prussia', LAND);
let RUH = n('RUH', 'Ruhr', LAND);
let SIL = n('SIL', 'Silesia', LAND);
// italy
let APU = n('APU', 'Apulia', LAND);
let NAP = n('NAP', 'Naples', LAND);
let PIE = n('PIE', 'Piedmont', LAND);
let ROM = n('ROM', 'Rome', LAND);
let TUS = n('TUS', 'Tuscany', LAND);
let VEN = n('VEN', 'Venice', LAND);
// russia
let FIN = n('FIN', 'Finland', LAND);
let LVN = n('LVN', 'Livonia', LAND);
let MOS = n('MOS', 'Moscow', LAND);
let SEV = n('SEV', 'Sevastopol', LAND);
let STP = n('STP', 'St. Petersburg', LAND);
let UKR = n('UKR', 'Ukraine', LAND);
let WAR = n('WAR', 'Warsaw', LAND);
// turkey
let ANK = n('ANK', 'Ankara', LAND);
let ARM = n('ARM', 'Armenia', LAND);
let CON = n('CON', 'Constantinople', LAND);
let SMY = n('SMY', 'Smyrna', LAND);
let SYR = n('SYR', 'Syria', LAND);
// neutral
let ALB = n('ALB', 'Albania', LAND);
let BEL = n('BEL', 'Belgium', LAND);
let BUL = n('BUL', 'Bulgaria', LAND);
let DEN = n('DEN', 'Denmark', LAND);
let GRE = n('GRE', 'Greece', LAND);
let HOL = n('HOL', 'Holland', LAND);
let NWY = n('NWY', 'Norway', LAND);
let NAF = n('NAF', 'North Africa', LAND);
let POR = n('POR', 'Portugal', LAND);
let RUM = n('RUM', 'Rumania', LAND);
let SER = n('SER', 'Serbia', LAND);
let SPA = n('SPA', 'Spain', LAND);
let SWE = n('SWE', 'Sweden', LAND);
let TUN = n('TUN', 'Tunis', LAND);
// water
let ADR = n('ADR', 'Adriatic Sea', WATER);
let AEG = n('AEG', 'Aegean Sea', WATER);
let BAL = n('BAL', 'Baltic Sea', WATER);
let BAR = n('BAR', 'Barents Sea', WATER);
let BLA = n('BLA', 'Black Sea', WATER);
let EAS = n('EAS', 'Eastern Mediterranean', WATER);
let ENG = n('ENG', 'English Channel', WATER);
let BOT = n('BOT', 'Gulf of Bothnia', WATER);
let GOL = n('GOL', 'Gulf of Lyon', WATER);
let HEL = n('HEL', 'Helgoland Bight', WATER);
let ION = n('ION', 'Ionian Sea', WATER);
let IRI = n('IRI', 'Irish Sea', WATER);
let MID = n('MID', 'Mid-Atlantic Ocean', WATER);
let NAT = n('NAT', 'North Atlantic Ocean', WATER);
let NTH = n('NTH', 'North Sea', WATER);
let NRG = n('NRG', 'Norwegian Sea', WATER);
let SKA = n('SKA', 'Skagerrack', WATER);
let TYN = n('TYN', 'Tyrrhenian Sea', WATER);
let WES = n('WES', 'Western Mediterranean', WATER);
let STP_NORTH = n('STP', 'St. Petersburg (North Coast)', LAND);
let STP_SOUTH = n('STP', 'St. Petersburg (South Coast)', LAND);
let SPA_NORTH = n('SPA', 'Spain (North Coast)', LAND);
let SPA_SOUTH = n('SPA', 'Spain (South Coast)', LAND);
let BUL_NORTH = n('BUL', 'Bulgaria (East Coast)', LAND);
let BUL_SOUTH = n('BUL', 'Bulgaria (South Coast)', LAND);
function border(node, adjacent) {
    for (let other of adjacent)
        node.adjacent.add(other);
}
function attach(node, attached) {
    let all = [node, ...attached];
    for (let region of all) {
        for (let other of all) {
            if (other == region)
                continue;
            region.attached.add(other);
        }
    }
}
border(STP_NORTH, [BAR, NWY]);
attach(STP, [STP_SOUTH, STP_NORTH]);
border(STP_SOUTH, [BOT, LVN, FIN]);
border(BUL_NORTH, [BLA, CON, RUM]);
attach(BUL, [BUL_SOUTH, BUL_NORTH]);
border(BUL_SOUTH, [AEG, GRE, CON]);
border(SPA_NORTH, [MID, POR, GAS]);
attach(SPA, [SPA_SOUTH, SPA_NORTH]);
border(SPA_SOUTH, [GOL, WES, MID, POR, MAR]);
border(NAT, [NRG, CLY, LVP, IRI, MID]);
border(NRG, [BAR, NWY, NTH, EDI, CLY, NAT]);
border(CLY, [NRG, EDI, LVP, NAT]);
border(LVP, [CLY, EDI, YOR, WAL, IRI, NAT]);
border(IRI, [NAT, LVP, WAL, ENG, MID]);
border(MID, [NAT, IRI, ENG, BRE, GAS, POR, WES, NAF, SPA_NORTH, SPA_SOUTH]);
border(BAR, [NRG, NWY, STP_NORTH]);
border(NWY, [NRG, BAR, STP, FIN, SWE, SKA, NTH, STP_NORTH]);
border(NTH, [NRG, NWY, SKA, DEN, HEL, HOL, BEL, ENG, LON, YOR, EDI]);
border(EDI, [NRG, NTH, YOR, LVP, CLY]);
border(YOR, [EDI, NTH, LON, WAL, LVP]);
border(WAL, [LVP, YOR, LON, ENG, IRI]);
border(ENG, [IRI, WAL, LON, NTH, BEL, PIC, BRE, MID]);
border(BRE, [ENG, PIC, PAR, GAS, MID]);
border(GAS, [BRE, PAR, BUR, MAR, SPA, MID]);
border(SPA, [GAS, MAR, POR]);
border(POR, [MID, SPA, SPA_NORTH, SPA_SOUTH]);
border(WES, [GOL, TYN, TUN, NAF, MID, SPA_SOUTH]);
border(NAF, [MID, WES, TUN]);
border(STP, [NWY, MOS, LVN, FIN]);
border(SWE, [NWY, FIN, BOT, BAL, DEN, SKA]);
border(FIN, [NWY, STP, BOT, SWE, STP_SOUTH]);
border(SKA, [NWY, SWE, DEN, NTH]);
border(DEN, [SKA, SWE, BAL, KIE, HEL, NTH]);
border(HEL, [NTH, DEN, KIE, HOL]);
border(HOL, [NTH, HEL, KIE, RUH, BEL]);
border(BEL, [ENG, NTH, HOL, RUH, BUR, PIC]);
border(LON, [YOR, NTH, ENG, WAL]);
border(PIC, [ENG, BEL, BUR, PAR, BRE]);
border(PAR, [PIC, BUR, GAS, BRE]);
border(GAS, [BRE, PAR, BUR, MAR, SPA, MID, SPA_NORTH]);
border(BUR, [PAR, PIC, BEL, RUH, MUN, MAR, GAS]);
border(MAR, [GAS, BUR, PIE, GOL, SPA, SPA_SOUTH]);
border(GOL, [MAR, PIE, TUS, TYN, WES, SPA_SOUTH]);
border(TYN, [TUS, ROM, NAP, ION, TUN, WES, GOL]);
border(TUN, [WES, TYN, ION, NAF]);
border(MOS, [STP, SEV, UKR, WAR, LVN]);
border(LVN, [BOT, STP, MOS, WAR, PRU, BAL, STP_SOUTH]);
border(BOT, [SWE, FIN, LVN, BAL, STP_SOUTH]);
border(BAL, [DEN, SWE, BOT, LVN, PRU, BER, KIE]);
border(KIE, [HEL, DEN, BAL, BER, MUN, RUH, HOL]);
border(RUH, [BEL, HOL, KIE, MUN, BUR]);
border(PIE, [TYR, VEN, TUS, GOL, MAR]);
border(TUS, [PIE, VEN, ROM, TYN, GOL]);
border(ROM, [TUS, VEN, APU, NAP, TYN]);
border(NAP, [ROM, APU, ION, TYN]);
border(ION, [TYN, NAP, APU, ADR, ALB, GRE, AEG, EAS, TUN]);
border(SEV, [UKR, MOS, ARM, BLA, RUM]);
border(UKR, [MOS, SEV, RUM, GAL, WAR]);
border(WAR, [PRU, LVN, MOS, UKR, GAL, SIL]);
border(PRU, [BAL, LVN, WAR, SIL, BER]);
border(BER, [BAL, PRU, SIL, MUN, KIE]);
border(MUN, [RUH, KIE, BER, SIL, BOH, TYR, BUR]);
border(TYR, [MUN, BOH, VIE, TRI, VEN, PIE]);
border(VEN, [TYR, TRI, ADR, APU, ROM, TUS, PIE]);
border(APU, [VEN, ADR, ION, NAP, ROM]);
border(ADR, [VEN, TRI, ALB, ION, APU]);
border(ALB, [TRI, SER, GRE, ION, ADR]);
border(GRE, [ALB, SER, BUL, AEG, ION, BUL_SOUTH]);
border(AEG, [GRE, CON, SMY, EAS, ION, BUL_SOUTH]);
border(EAS, [AEG, SMY, SYR, ION]);
border(ARM, [SEV, SYR, SMY, ANK, BLA]);
border(BLA, [RUM, SEV, ARM, ANK, CON, BUL_NORTH]);
border(RUM, [BUD, GAL, UKR, SEV, BLA, BUL, SER, BUL_NORTH]);
border(GAL, [BOH, SIL, WAR, UKR, RUM, BUD, VIE]);
border(SIL, [BER, PRU, WAR, GAL, BOH, MUN]);
border(BOH, [MUN, SIL, GAL, VIE, TYR]);
border(VIE, [BOH, GAL, BUD, TRI, TYR]);
border(TRI, [TYR, VIE, BUD, SER, ALB, ADR, VEN]);
border(SER, [BUD, RUM, BUL, GRE, ALB, TRI]);
border(BUL, [RUM, CON, GRE, SER]);
border(CON, [BUL, BLA, ANK, SMY, AEG, BUL_SOUTH, BUL_NORTH]);
border(SMY, [CON, ANK, ARM, SYR, EAS, AEG]);
border(SYR, [SMY, ARM, EAS]);
border(BUD, [VIE, GAL, RUM, SER, TRI]);
border(ANK, [BLA, ARM, SMY, CON]);
const europe = new GameMap([BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH]);
const REGIONS = { BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH };
//# sourceMappingURL=data.js.map

function error(msg) {
    debugger;
    return new Error(msg);
}
function* matches(regex, target) {
    let copy = new RegExp(regex, 'g');
    let match;
    while (match = copy.exec(target))
        yield match;
}
//# sourceMappingURL=util.js.map

class HoldOrder {
    constructor(unit) {
        this.unit = unit;
        this.type = 'hold';
    }
    toString() {
        return `${this.unit.team} ${this.unit.region.name} hold`;
    }
}
class MoveOrder {
    constructor(unit, target, requireConvoy) {
        this.unit = unit;
        this.target = target;
        this.requireConvoy = requireConvoy;
        this.type = 'move';
    }
    toString() {
        let text = `${this.unit.team} ${this.unit.region.name} move -> ${this.target.name}`;
        if (this.requireConvoy)
            text += ` via convoy`;
        return text;
    }
}
class SupportOrder {
    constructor(unit, target, attack) {
        this.unit = unit;
        this.target = target;
        this.attack = attack;
        this.type = 'support';
    }
    toString() {
        let text = `${this.unit.team} ${this.unit.region.name} support ${this.target.name}`;
        if (this.attack)
            text += ` -> ${this.attack.name}`;
        else
            text += ` to hold`;
        return text;
    }
}
class ConvoyOrder {
    constructor(unit, start, end) {
        this.unit = unit;
        this.start = start;
        this.end = end;
        this.type = 'convoy';
    }
    toString() {
        return `${this.unit.team} ${this.unit.region.name} convoy ${this.start.name} to ${this.end.name}`;
    }
}
function resolve(orders) {
    function canMove(unit, dst) {
        if (unit.type == UnitType.Water) {
            if (!unit.region.adjacent.has(dst))
                return false;
            if (dst.type != UnitType.Water && !dst.isShore)
                return false;
            if (dst.type == UnitType.Land && unit.region.type == UnitType.Land) {
                let shore = [...unit.region.adjacent].find(a => a.type == UnitType.Water && dst.adjacent.has(a));
                if (shore == null)
                    return false;
            }
        }
        else {
            if (!unit.region.allAdjacent.includes(dst))
                return false;
            if (dst.type != UnitType.Land)
                return false;
        }
        return true;
    }
    function canReach(unit, dst) {
        if (canMove(unit, dst))
            return true;
        let shore = [...dst.attached].find(a => unit.region.adjacent.has(a));
        return shore != null;
    }
    function isValid(order) {
        if (order.type == 'move') {
            if (Region.areSame(order.unit.region, order.target))
                return false;
            if (order.unit.type == UnitType.Water && !canMove(order.unit, order.target))
                return false;
        }
        return true;
    }
    function findRoutes(order, skip) {
        let convoys = orders.filter(o => o.type == 'convoy'
            && o.unit.region != skip
            && Region.areSame(o.start, order.unit.region)
            && resolve(o));
        let used = convoys.map(() => false);
        let node = order.unit;
        let path = [];
        let paths = [];
        function search() {
            if (canMove(node, order.target) || path.length > 0 && canReach(node, order.target)) {
                paths.push(path.slice());
            }
            for (let next = 0; next < convoys.length; ++next) {
                if (used[next] || !node.region.allAdjacent.includes(convoys[next].unit.region))
                    continue;
                let previous = node;
                used[next] = true;
                path.push(convoys[next]);
                node = convoys[next].unit;
                search();
                node = previous;
                path.pop();
                used[next] = false;
            }
        }
        search();
        if (paths.length == 0)
            return null;
        if (order.requireConvoy && paths.filter(a => a.length > 0).length == 0)
            return null;
        return { convoys, paths };
    }
    function findHoldSupport(order) {
        if (order.type == 'move')
            return [];
        return orders.filter(o => o.type == 'support'
            && Region.areEqual(o.target, order.unit.region)
            && resolve(o));
    }
    function findMoveSupport(order) {
        return orders.filter(o => o.type == 'support'
            && Region.areEqual(o.target, order.unit.region)
            && resolve(o));
    }
    for (let i = 0; i < orders.length; ++i) {
        if (isValid(orders[i]))
            continue;
        let dump = orders[i];
        orders.splice(i, 1, new HoldOrder(dump.unit));
    }
    let passed = new Set();
    let checked = new Set();
    let reasons = new Map();
    let stack = [];
    function fail(order, reason) {
        stack.pop();
        reasons.set(order, reason);
        return false;
    }
    function pass(order) {
        stack.pop();
        passed.add(order);
        return true;
    }
    function resolve(order) {
        if (stack[0] == order && stack.every(o => o.type == 'move') && stack.length > 2) {
            return true;
        }
        else if (stack.includes(order)) {
            throw error('recursive resolve');
        }
        if (checked.has(order))
            return passed.has(order);
        checked.add(order);
        if (stack.includes(order))
            throw error(`recursive resolve`);
        stack.push(order);
        if (order.type == 'hold') {
            return pass(order);
        }
        if (order.type == 'move') {
            let current = orders.find(o => Region.areSame(o.unit.region, order.target));
            let best = [];
            let strength = 0;
            let bestDislodge = [];
            let dislodgeStrength = 0;
            let forceResolved = null;
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.target))
                    continue;
                let routes = findRoutes(attack);
                if (routes == null)
                    continue;
                let support = findMoveSupport(attack);
                if (current && current.type == 'move' && Region.areSame(current.target, attack.unit.region)) {
                    //  prevent dislodged unit from bouncing with other units entering dislodger's region
                    let enemies = support.filter(o => o.unit.team != current.unit.team);
                    let currentRoutes = findRoutes(current);
                    if (currentRoutes != null && currentRoutes.paths.length == 1 && routes.paths.length == 1) {
                        let currentAttack = findMoveSupport(current).filter(o => o.unit.team != attack.unit.team);
                        if (currentAttack.length > enemies.length)
                            continue;
                    }
                    else {
                        forceResolved = attack;
                    }
                }
                if (support.length > strength) {
                    best = [attack];
                    strength = support.length;
                }
                else if (support.length == strength) {
                    best.push(attack);
                }
                if (current && attack.unit.team != current.unit.team) {
                    let enemies = support.filter(o => o.unit.team != current.unit.team);
                    if (enemies.length > dislodgeStrength) {
                        bestDislodge = [attack];
                        dislodgeStrength = enemies.length;
                    }
                    else if (enemies.length == dislodgeStrength) {
                        bestDislodge.push(attack);
                    }
                }
            }
            if (!best.includes(order))
                return fail(order, `Overpowered by ${best.join(', ')} with strength ${strength} vs ${findMoveSupport(order).length} `);
            if (best.length != 1)
                return fail(order, `Standoff with ${best.join(', ')} with strength ${strength} `);
            if (current && best[0] != forceResolved) {
                if (current.type == 'move' && Region.areSame(current.target, best[0].unit.region)) {
                    if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                        return fail(order, `Avoiding self-dislodgement`);
                    let currentAttack = findMoveSupport(current).filter(o => o.unit.team != best[0].unit.team);
                    if (currentAttack.length == dislodgeStrength)
                        return fail(order, `Balanced faceoff ${currentAttack.join(', ')} vs ${findMoveSupport(order).filter(o => o.unit.team != current.unit.team).join(', ')}`);
                    if (currentAttack.length > dislodgeStrength)
                        throw error('Failed to filter out dislodged attack');
                }
                else if (current.type != 'move' || !resolve(current)) {
                    if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                        return fail(order, `Avoiding self-dislodgement`);
                    let holdSupport = findHoldSupport(current);
                    if (holdSupport.length >= dislodgeStrength)
                        return fail(order, `Held with ${holdSupport.join(', ')} vs ${findMoveSupport(order).filter(o => o.unit.team != current.unit.team).join(', ')}`);
                }
            }
            return pass(order);
        }
        if (order.type == 'convoy') {
            if (order.unit.region.type != UnitType.Water)
                return fail(order, 'Only water units can convoy');
            let target = orders.find(o => o.type == 'move'
                && o.unit.type == UnitType.Land
                && Region.areSame(o.unit.region, order.start)
                && Region.areSame(o.target, order.end));
            if (target == null)
                return fail(order, 'No matching target');
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (resolve(attack))
                    return fail(order, `Dislodged by ${attack} `);
            }
            return pass(order);
        }
        if (order.type == 'support') {
            let supportee = orders.find(o => Region.areSame(o.unit.region, order.target));
            if (supportee == null)
                return fail(order, 'No matching target');
            if (order.attack) {
                if (supportee.type != 'move')
                    return fail(order, `Support attacked ${order.attack.name} target was ${supportee}`);
                if (!canReach(order.unit, order.attack))
                    return fail(order, `Support attacked ${order.attack.name} but could not reach`);
                if (!Region.areEqual(supportee.target, order.attack))
                    return fail(order, `Support attacked ${order.attack.name} but target attacked ${supportee.target}`);
            }
            else {
                if (supportee.type == 'move')
                    return fail(order, `Support held but target was ${supportee}`);
                if (!canReach(order.unit, order.target))
                    return fail(order, `Support held ${order.target.name} but could not reach`);
            }
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (order.unit.team == attack.unit.team)
                    continue;
                if (supportee.type == 'move') {
                    if (Region.areSame(supportee.target, attack.unit.region)) {
                        // if it is from the target region of the supported attack,
                        // it can only cut support by dislodging
                        if (resolve(attack))
                            return fail(order, `Dislodged by ${attack}`);
                    }
                    else {
                        // if it is convoyed by the target region of the supported attack,
                        // it can only cut support if it has an alternate path
                        let routes = findRoutes(attack, supportee.target);
                        if (routes != null)
                            return fail(order, `Disrupted by ${attack}`);
                    }
                }
                else {
                    let routes = findRoutes(attack);
                    if (routes != null)
                        return fail(order, `Disrupted by ${attack}`);
                }
            }
            return pass(order);
        }
        throw error(`Invalid order`);
    }
    let evicted = [];
    let resolved = [];
    for (let order of orders) {
        if (order.type == 'move' && resolve(order)) {
            resolved.push(order);
        }
        else {
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (resolve(attack))
                    evicted.push(order.unit);
            }
        }
    }
    return { resolved, evicted, reasons };
}
//# sourceMappingURL=rules.js.map

const session_key = `343evhj23vv05beiiv8dldlno4`;
function playdiplomacy(path) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `https://www.playdiplomacy.com${path}`;
        try {
            let response = yield request(url, {
                headers: { 'cookie': `PHPSESSID=${session_key}` },
                resolveWithFullResponse: true,
                followRedirect: false,
            });
            if (response.statusCode != 200)
                throw error('invalid status code');
            return response.body;
        }
        catch (e) {
            debugger;
            throw e;
        }
    });
}
function game_history(query) {
    return __awaiter(this, void 0, void 0, function* () {
        let cache = `cache/${query}`;
        let data;
        try {
            data = fs.readFileSync(cache, 'utf8');
        }
        catch (e) {
            data = yield playdiplomacy(`/game_history.php?${query}`);
            yield fs.writeFile(cache, data, 'utf8');
        }
        return data;
    });
}
function get_history(id, phase, date) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = `game_id=${id}&phase=${phase}&gdate=${date}`;
        let data = yield game_history(query);
        let found = false;
        let inputs = {};
        for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
            let team = match[1];
            let list = [];
            for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
                list.push(part[1]);
            }
            if (list.length == 0)
                continue;
            found = true;
            inputs[team] = list;
        }
        if (found)
            return inputs;
        return undefined;
    });
}
function get_game(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let turns = [];
        let history = yield game_history(`game_id=${id}`);
        for (let content of history.split('</br></br>')) {
            let date = turns.length;
            let turn = { orders: {} };
            let found = false;
            for (let match of matches(/<b><a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)'>[^<]+<\/a><\/b>&nbsp;&nbsp;/, content)) {
                if (id != parseInt(match[1]))
                    throw error(`Failed to parse game history: ${id}`);
                if (date != parseInt(match[3]))
                    throw error(`Failed to parse game history: ${id}`);
                let phase = match[2];
                let inputs = yield get_history(id, phase, date);
                if (inputs == null && phase != 'O')
                    continue;
                found = true;
                switch (phase) {
                    case 'O':
                        turn.orders = inputs || {};
                        break;
                    case 'R':
                        turn.retreats = inputs;
                        break;
                    case 'B':
                        turn.builds = inputs;
                        break;
                }
            }
            if (!found)
                continue;
            turns.push(turn);
        }
        return turns;
    });
}
function get_page(page) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `/games.php?subpage=all_finished&variant-0=1&map_variant-0=1&current_page=${page}`;
        let data = yield playdiplomacy(url);
        let ids = new Set();
        for (let match of matches(/<a href="game_play_details\.php\?game_id=(\d+)/, data)) {
            let gameId = parseInt(match[1]);
            ids.add(gameId);
        }
        return [...ids];
    });
}
function read_game(raw) {
    let data = zlib.gunzipSync(raw);
    let game = JSON.parse(data.toString('utf8'));
    for (let turn of game) {
        if (turn.builds && Object.keys(turn.builds).length == 0) {
            delete turn.builds;
        }
        if (turn.retreats && Object.keys(turn.retreats).length == 0) {
            delete turn.retreats;
        }
        if (Object.keys(turn.orders).length == 0) {
            // sometimes games have an empty last turn with no orders
            if (turn.builds || turn.retreats
                || game.indexOf(turn) + 1 != game.length)
                throw error(`missing orders: ${game.indexOf(turn)}`);
            game.pop();
            break;
        }
    }
    return game;
}
function write_game(turns) {
    let data = Buffer.from(JSON.stringify(turns), 'utf8');
    return zlib.gzipSync(data);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        fs.mkdirpSync('data');
        fs.mkdirpSync('cache');
        let errors = 0;
        let oldKnown;
        let newKnown = { newest: 0, count: 0 };
        try {
            oldKnown = fs.readJSONSync('data/known.json');
            console.log(`known: ${oldKnown.newest} +${oldKnown.count}`);
        }
        catch (e) {
            oldKnown = null;
        }
        let skip = 0;
        for (let i = 1; i <= 1000 && errors < 10; ++i) {
            if (skip >= 15) {
                skip -= 15;
                continue;
            }
            console.log(`fetching page ${i}`);
            let ids = yield get_page(i);
            for (let id of ids) {
                if (newKnown.newest == 0)
                    newKnown.newest = id;
                if (oldKnown && id == oldKnown.newest) {
                    skip = oldKnown.count;
                    newKnown.count += oldKnown.count;
                    oldKnown = null;
                }
                if (skip >= 1) {
                    skip -= 1;
                    console.log(`skipping game ${id}`);
                    continue;
                }
                console.log(`fetching game ${id}`);
                try {
                    let outputFile = `data/${id}`;
                    if (!fs.pathExistsSync(outputFile)) {
                        let game = yield get_game(id);
                        let data = write_game(game);
                        let parsed = read_game(data);
                        if (JSON.stringify(parsed) != JSON.stringify(game))
                            throw error('game encoding failed');
                        fs.writeFileSync(outputFile, data);
                    }
                    if (errors == 0) {
                        ++newKnown.count;
                    }
                }
                catch (e) {
                    ++errors;
                    fs.appendFileSync('errors.txt', `${id} ${e}`, 'utf8');
                    console.error(id, e);
                }
            }
            if (oldKnown == null) {
                fs.writeJSONSync('data/known.json', newKnown);
                console.log(`known: ${newKnown.newest} +${newKnown.count}`);
            }
        }
    });
}
function check() {
    return __awaiter(this, void 0, void 0, function* () {
        fs.mkdirpSync('data');
        fs.mkdirpSync('cache');
        let count = 0;
        let allIds = fs.readdirSync('data');
        for (let id of allIds) {
            if (id == 'known.json')
                continue;
            let game = read_game(fs.readFileSync(`data/${id}`));
            let turns = 0;
            let history = yield game_history(`game_id=${id}`);
            for (let content of history.split('</br></br>')) {
                let found = false;
                for (let _ of matches(/<b><a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)'>[^<]+<\/a><\/b>&nbsp;&nbsp;/, content)) {
                    found = true;
                    break;
                }
                if (!found)
                    continue;
                ++turns;
            }
            if (turns != game.length) {
                game = yield get_game(parseInt(id));
                if (turns != game.length) {
                    throw error(`Mismatch: ${id} ${turns} ${game.length}`);
                }
            }
            let builds = 0;
            let retreats = 0;
            for (let i = 0; i < game.length; ++i) {
                if (game[i].builds)
                    builds++;
                if (game[i].retreats)
                    retreats++;
            }
            if (builds == 0 && retreats == 0) {
                game = yield get_game(parseInt(id));
                console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns} *`);
            }
            else {
                console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns}`);
            }
            let data = write_game(game);
            fs.writeFileSync(`data/${id}`, data);
        }
    });
}
function parse_orders(game, inputs) {
    let isNew = game.units.size == 0;
    let fleets = new Set([REGIONS.LON, REGIONS.EDI, REGIONS.BRE, REGIONS.NAP, REGIONS.KIE, REGIONS.TRI, REGIONS.ANK, REGIONS.SEV, REGIONS.STP_SOUTH]);
    let orders = [];
    let resolved = [];
    for (let team in inputs) {
        for (let raw of inputs[team]) {
            let match = /(.*?)(HOLD|MOVE|SUPPORT|CONVOY)(.*)->(.*)/.exec(raw);
            if (match == null)
                throw error(`failed to match order: ${raw}`);
            let regionName = match[1].trim();
            let op = match[2];
            let args = match[3].trim();
            let result = match[4].trim();
            if (result == 'Invalid order or syntax error')
                continue;
            let region = game.map.regions.find(r => r.name == regionName);
            if (region == null)
                throw error(`failed to find region for order: ${raw} `);
            let unit = [...game.units].find(u => u.region == region && u.team == team);
            if (unit == null) {
                if (isNew)
                    game.units.add(unit = new Unit(region, fleets.has(region) ? UnitType.Water : UnitType.Land, team));
                else
                    throw error(`Unit does not exist: ${team} ${region.name} `);
            }
            let order;
            if (op == 'HOLD' || result == 'Illegal order replaced with Hold order') {
                order = new HoldOrder(unit);
            }
            else if (op == 'MOVE') {
                let moveArgs = args.split('VIA');
                let rawTarget = moveArgs[0].trim();
                let target = europe.regions.find(r => r.name == rawTarget);
                if (target == null)
                    throw error(`failed to find target region for move order: ${args} `);
                order = new MoveOrder(unit, target, moveArgs.length > 1);
                if (result == 'resolved') {
                    resolved.push(order);
                }
            }
            else if (op == 'SUPPORT') {
                let [rawSrc, rawDst] = args.split(' to '); // 'X to hold' or 'X to Y'
                let src = europe.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find target region for support order: ${rawSrc} `);
                if (rawDst == 'hold')
                    order = new SupportOrder(unit, src);
                else {
                    let dst = europe.regions.find(r => r.name == rawDst);
                    if (dst == null)
                        throw error(`failed to find attack region for support order: ${rawDst} `);
                    order = new SupportOrder(unit, src, dst);
                }
            }
            else if (op == 'CONVOY') {
                let [rawSrc, rawDst] = args.split(' to '); // 'X to Y'
                let src = europe.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find start region for convoy order: ${rawSrc} `);
                let dst = europe.regions.find(r => r.name == rawDst);
                if (dst == null)
                    throw error(`failed to find end region for convoy order: ${rawDst} `);
                order = new ConvoyOrder(unit, src, dst);
            }
            else {
                throw error(`invalid order: ${op}`);
            }
            orders.push(order);
        }
    }
    return { orders, resolved };
}
function parse_retreats(evicted, inputs) {
    let retreats = [];
    for (let team in inputs) {
        for (let raw of inputs[team]) {
            let match = /((.*)RETREAT(.*)|(.*)DESTROY)\s+->(.*)/.exec(raw);
            if (match == null)
                throw error(`failed to match retreat: ${raw} `);
            let result = match[5].trim();
            if (match[2]) {
                let rawSrc = match[2].trim();
                let rawDst = match[3].trim();
                let src = europe.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find region for retreat: ${raw}`);
                let dst = europe.regions.find(r => r.name == rawDst);
                if (dst == null)
                    throw error(`failed to find region for retreat: ${raw}`);
                let unit = evicted.find(u => u.region == src && u.team == team);
                if (unit == null)
                    throw error(`failed to find unit for retreat: ${raw} ${team}`);
                retreats.push({ unit, target: dst, resolved: result == 'resolved' });
            }
            else {
                let rawRegion = match[4].trim();
                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null)
                    throw error(`failed to find region for retreat: ${raw}`);
                let unit = [...evicted].find(u => u.region == region && u.team == team);
                if (unit == null)
                    throw error(`failed to find unit for retreat: ${raw} ${team}`);
                retreats.push({ unit, target: null, resolved: result == 'resolved' });
            }
        }
    }
    return retreats;
}
function parse_builds(game, inputs) {
    let builds = [];
    for (let team in inputs) {
        for (let raw of inputs[team]) {
            let match = /(BUILD\s+(fleet|army)\s+(.*)|(.*)DESTROY)\s+->(.*)/.exec(raw);
            if (match == null)
                throw error(`failed to match build: ${raw}`);
            let result = match[5].trim();
            if (match[2]) {
                let type = match[2].trim();
                let rawRegion = match[3].trim();
                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null)
                    throw error(`failed to find region for build: ${raw}`);
                let unit = new Unit(region, type == 'fleet' ? UnitType.Water : UnitType.Land, team);
                builds.push({ unit, resolved: result == 'resolved' });
            }
            else {
                let rawRegion = match[4].trim();
                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null)
                    throw error(`failed to find region for build: ${raw}`);
                let unit = [...game.units].find(u => u.region == region && u.team == team);
                if (unit == null) {
                    if (result != 'resolved')
                        continue;
                    else
                        throw error(`failed to find unit for build: ${raw} ${team}`);
                }
                builds.push({ unit, resolved: result == 'resolved' });
            }
        }
    }
    return builds;
}
//# sourceMappingURL=scrape.js.map

const ignored_games = new Set([159594, 158093, 151387, 147485, 152046, 151325, 153104, 153152, 153323, 153349, 154242, 154944, 155422, 155463]);
const teams = new Set(['ENGLAND', 'FRANCE', 'GERMANY', 'ITALY', 'AUSTRIA', 'RUSSIA', 'TURKEY']);
const totals = { checked: 0, skipped_via: 0, skipped_team: 0 };
function run_game(id, turns) {
    let game = new GameState(europe, []);
    for (let i = 0; i < turns.length; ++i) {
        console.debug(`processing ${i % 2 ? 'fall' : 'spring'} ${1901 + Math.floor(i / 2)}`);
        let remote = parse_orders(game, turns[i].orders);
        let orders = remote.orders.slice();
        if (orders.find(o => o.type == 'move' && o.requireConvoy)) {
            ++totals.skipped_via;
            console.log(`skipping ${id} - found VIA CONVOY (${totals.skipped_via} total)`);
            return;
        }
        let x = [...game.units].find(u => !teams.has(u.team));
        if (x) {
            console.log(`skipping ${id} - found team ${x.team} (${totals.skipped_team} total)`);
            ++totals.skipped_team;
            return;
        }
        for (let unit of game.units) {
            let order = orders.find(o => o.unit == unit);
            if (order)
                continue;
            orders.push(new HoldOrder(unit));
        }
        let local = resolve(orders);
        for (let move of local.resolved) {
            if (!game.units.has(move.unit))
                debugger;
            game.units.delete(move.unit);
            game.units.add(new Unit(move.target, move.unit.type, move.unit.team));
        }
        for (let order of orders) {
            if (order.type == 'move') {
                if (local.resolved.includes(order) != remote.resolved.includes(order)) {
                    for (let pair of local.reasons) {
                        console.log(`${pair[0]}: ${pair[1]}`);
                    }
                    console.log(order);
                    debugger;
                    resolve(orders);
                    throw error(`Mismatch in game ${id}`);
                }
            }
        }
        // if (local.evicted.length == 0 != !turns[i].retreats) {
        //     throw error(`Mismatch in game ${id}`);
        // }
        if (local.evicted.length) {
            let evicted = new Set(local.evicted);
            let retreats = parse_retreats(local.evicted, turns[i].retreats);
            for (let retreat of retreats) {
                if (retreat.resolved) {
                    if (retreat.target)
                        game.move(retreat.unit, retreat.target);
                    else
                        game.units.delete(retreat.unit);
                    evicted.delete(retreat.unit);
                }
            }
            for (let unit of evicted) {
                game.units.delete(unit);
            }
        }
        if (i % 2 == 1) {
            let builds = parse_builds(game, turns[i].builds);
            for (let build of builds) {
                if (build.resolved) {
                    if (game.units.has(build.unit))
                        game.units.delete(build.unit);
                    else
                        game.units.add(build.unit);
                }
            }
        }
        for (let region of game.map.regions) {
            let units = [...game.units].filter(u => u.region == region);
            if (units.length > 1)
                throw error(`Mismatch in game ${id}`);
        }
    }
    ++totals.checked;
}
function run$1() {
    return __awaiter(this, void 0, void 0, function* () {
        fs.mkdirpSync('data');
        fs.mkdirpSync('cache');
        // let game = scrape.read_game(fs.readFileSync(`data/155270`));
        // run_game(155270, game);
        let allIds = fs.readdirSync('data');
        for (let id of allIds) {
            if (id == 'known.json')
                continue;
            if (ignored_games.has(parseInt(id)))
                continue;
            console.log(`processing game ${id}`);
            let game = read_game(fs.readFileSync(`data/${id}`));
            run_game(parseInt(id), game);
        }
        console.log(totals);
    });
}
let x = global;
if (x.devtoolsFormatters == null)
    x.devtoolsFormatters = [];
x.devtoolsFormatters.push({
    header(obj, config) {
        if (obj instanceof MoveOrder || obj instanceof HoldOrder || obj instanceof SupportOrder || obj instanceof ConvoyOrder) {
            return ["span", {}, obj.toString()];
        }
        if (obj instanceof Unit) {
            return ["span", {}, `${obj.team} ${obj.type == UnitType.Water ? 'fleet' : 'army'} in ${obj.region.name}`];
        }
        return null;
    },
    hasBody(obj, config) {
        return false;
        // return obj instanceof OrderBase;
    },
    body(obj, config) {
        // let children = [];
        // for (let key in obj) {
        // }
        // return [
        //     'ol',
        //     {},
        // ]
    }
});
let op = process.argv[2];
if (op == 'scrape')
    run();
else if (op == 'check')
    check();
else if (op == 'run')
    run$1();
else {
    console.log('unknown or missing command');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2dhbWUudHMiLCJzcmMvZGF0YS50cyIsInNyYy91dGlsLnRzIiwic3JjL3J1bGVzLnRzIiwic3JjL3NjcmFwZS50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZWdpb24ge1xuICAgIHJlYWRvbmx5IGF0dGFjaGVkID0gbmV3IFNldDxSZWdpb24+KCk7XG4gICAgcmVhZG9ubHkgYWRqYWNlbnQgPSBuZXcgU2V0PFJlZ2lvbj4oKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHR5cGU6IFVuaXRUeXBlLFxuICAgICkgeyB9XG5cbiAgICBnZXQgYWxsQWRqYWNlbnQoKSB7XG4gICAgICAgIGxldCBsaXN0ID0gWy4uLnRoaXMuYWRqYWNlbnRdO1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICAgIGxpc3QucHVzaCguLi5ub2RlLmFkamFjZW50KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBub2RlIG9mIGxpc3Quc2xpY2UoKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKC4uLm5vZGUuYXR0YWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIGdldCBpc1Nob3JlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdGhpcy5hbGxBZGphY2VudC5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXJlU2FtZShsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHMgfHwgbGhzLmF0dGFjaGVkLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhcmVFcXVhbChsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHM7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBVbml0VHlwZSB7XG4gICAgTGFuZCxcbiAgICBXYXRlcixcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSByZWdpb246IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogVW5pdFR5cGUsXG4gICAgICAgIHJlYWRvbmx5IHRlYW06IHN0cmluZyxcbiAgICApIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZU1hcCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHJlZ2lvbnM6IFJlZ2lvbltdLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU3RhdGUge1xuICAgIHJlYWRvbmx5IHVuaXRzID0gbmV3IFNldDxVbml0PigpO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IG1hcDogR2FtZU1hcCxcbiAgICAgICAgcmVhZG9ubHkgdGVhbXM6IHN0cmluZ1tdLFxuICAgICkgeyB9XG5cbiAgICBtb3ZlKHVuaXQ6IFVuaXQsIHRhcmdldDogUmVnaW9uKSB7XG4gICAgICAgIHRoaXMudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICB0aGlzLnVuaXRzLmFkZChuZXcgVW5pdCh0YXJnZXQsIHVuaXQudHlwZSwgdW5pdC50ZWFtKSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVnaW9uLCBHYW1lTWFwLCBVbml0VHlwZSB9IGZyb20gJy4vZ2FtZSc7XG5cbmNvbnN0IExBTkQgPSBVbml0VHlwZS5MYW5kO1xuY29uc3QgV0FURVIgPSBVbml0VHlwZS5XYXRlcjtcblxuZnVuY3Rpb24gbihpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGU6IFVuaXRUeXBlKTogUmVnaW9uIHtcbiAgICByZXR1cm4gbmV3IFJlZ2lvbihpZCwgbmFtZSwgdHlwZSk7XG59XG5cbi8vIGF1c3RyaWFcbmxldCBCT0ggPSBuKCdCT0gnLCAnQm9oZW1pYScsIExBTkQpO1xubGV0IEJVRCA9IG4oJ0JVRCcsICdCdWRhcGVzdCcsIExBTkQpO1xubGV0IEdBTCA9IG4oJ0dBTCcsICdHYWxpY2lhJywgTEFORCk7XG5sZXQgVFJJID0gbignVFJJJywgJ1RyaWVzdGUnLCBMQU5EKTtcbmxldCBUWVIgPSBuKCdUWVInLCAnVHlyb2xpYScsIExBTkQpO1xubGV0IFZJRSA9IG4oJ1ZJRScsICdWaWVubmEnLCBMQU5EKTtcblxuLy8gZW5nbGFuZFxubGV0IENMWSA9IG4oJ0NMWScsICdDbHlkZScsIExBTkQpO1xubGV0IEVESSA9IG4oJ0VESScsICdFZGluYnVyZ2gnLCBMQU5EKTtcbmxldCBMVlAgPSBuKCdMVlAnLCAnTGl2ZXJwb29sJywgTEFORCk7XG5sZXQgTE9OID0gbignTE9OJywgJ0xvbmRvbicsIExBTkQpO1xubGV0IFdBTCA9IG4oJ1dBTCcsICdXYWxlcycsIExBTkQpO1xubGV0IFlPUiA9IG4oJ1lPUicsICdZb3Jrc2hpcmUnLCBMQU5EKTtcblxuLy8gZnJhbmNlXG5sZXQgQlJFID0gbignQlJFJywgJ0JyZXN0JywgTEFORCk7XG5sZXQgQlVSID0gbignQlVSJywgJ0J1cmd1bmR5JywgTEFORCk7XG5sZXQgR0FTID0gbignR0FTJywgJ0dhc2NvbnknLCBMQU5EKTtcbmxldCBNQVIgPSBuKCdNQVInLCAnTWFyc2VpbGxlcycsIExBTkQpO1xubGV0IFBBUiA9IG4oJ1BBUicsICdQYXJpcycsIExBTkQpO1xubGV0IFBJQyA9IG4oJ1BJQycsICdQaWNhcmR5JywgTEFORCk7XG5cbi8vIGdlcm1hbnlcbmxldCBCRVIgPSBuKCdCRVInLCAnQmVybGluJywgTEFORCk7XG5sZXQgS0lFID0gbignS0lFJywgJ0tpZWwnLCBMQU5EKTtcbmxldCBNVU4gPSBuKCdNVU4nLCAnTXVuaWNoJywgTEFORCk7XG5sZXQgUFJVID0gbignUFJVJywgJ1BydXNzaWEnLCBMQU5EKTtcbmxldCBSVUggPSBuKCdSVUgnLCAnUnVocicsIExBTkQpO1xubGV0IFNJTCA9IG4oJ1NJTCcsICdTaWxlc2lhJywgTEFORCk7XG5cbi8vIGl0YWx5XG5sZXQgQVBVID0gbignQVBVJywgJ0FwdWxpYScsIExBTkQpO1xubGV0IE5BUCA9IG4oJ05BUCcsICdOYXBsZXMnLCBMQU5EKTtcbmxldCBQSUUgPSBuKCdQSUUnLCAnUGllZG1vbnQnLCBMQU5EKTtcbmxldCBST00gPSBuKCdST00nLCAnUm9tZScsIExBTkQpO1xubGV0IFRVUyA9IG4oJ1RVUycsICdUdXNjYW55JywgTEFORCk7XG5sZXQgVkVOID0gbignVkVOJywgJ1ZlbmljZScsIExBTkQpO1xuXG4vLyBydXNzaWFcbmxldCBGSU4gPSBuKCdGSU4nLCAnRmlubGFuZCcsIExBTkQpO1xubGV0IExWTiA9IG4oJ0xWTicsICdMaXZvbmlhJywgTEFORCk7XG5sZXQgTU9TID0gbignTU9TJywgJ01vc2NvdycsIExBTkQpO1xubGV0IFNFViA9IG4oJ1NFVicsICdTZXZhc3RvcG9sJywgTEFORCk7XG5sZXQgU1RQID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnJywgTEFORCk7XG5sZXQgVUtSID0gbignVUtSJywgJ1VrcmFpbmUnLCBMQU5EKTtcbmxldCBXQVIgPSBuKCdXQVInLCAnV2Fyc2F3JywgTEFORCk7XG5cbi8vIHR1cmtleVxubGV0IEFOSyA9IG4oJ0FOSycsICdBbmthcmEnLCBMQU5EKTtcbmxldCBBUk0gPSBuKCdBUk0nLCAnQXJtZW5pYScsIExBTkQpO1xubGV0IENPTiA9IG4oJ0NPTicsICdDb25zdGFudGlub3BsZScsIExBTkQpO1xubGV0IFNNWSA9IG4oJ1NNWScsICdTbXlybmEnLCBMQU5EKTtcbmxldCBTWVIgPSBuKCdTWVInLCAnU3lyaWEnLCBMQU5EKTtcblxuLy8gbmV1dHJhbFxubGV0IEFMQiA9IG4oJ0FMQicsICdBbGJhbmlhJywgTEFORCk7XG5sZXQgQkVMID0gbignQkVMJywgJ0JlbGdpdW0nLCBMQU5EKTtcbmxldCBCVUwgPSBuKCdCVUwnLCAnQnVsZ2FyaWEnLCBMQU5EKTtcbmxldCBERU4gPSBuKCdERU4nLCAnRGVubWFyaycsIExBTkQpO1xubGV0IEdSRSA9IG4oJ0dSRScsICdHcmVlY2UnLCBMQU5EKTtcbmxldCBIT0wgPSBuKCdIT0wnLCAnSG9sbGFuZCcsIExBTkQpO1xubGV0IE5XWSA9IG4oJ05XWScsICdOb3J3YXknLCBMQU5EKTtcbmxldCBOQUYgPSBuKCdOQUYnLCAnTm9ydGggQWZyaWNhJywgTEFORCk7XG5sZXQgUE9SID0gbignUE9SJywgJ1BvcnR1Z2FsJywgTEFORCk7XG5sZXQgUlVNID0gbignUlVNJywgJ1J1bWFuaWEnLCBMQU5EKTtcbmxldCBTRVIgPSBuKCdTRVInLCAnU2VyYmlhJywgTEFORCk7XG5sZXQgU1BBID0gbignU1BBJywgJ1NwYWluJywgTEFORCk7XG5sZXQgU1dFID0gbignU1dFJywgJ1N3ZWRlbicsIExBTkQpO1xubGV0IFRVTiA9IG4oJ1RVTicsICdUdW5pcycsIExBTkQpO1xuXG4vLyB3YXRlclxubGV0IEFEUiA9IG4oJ0FEUicsICdBZHJpYXRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQUVHID0gbignQUVHJywgJ0FlZ2VhbiBTZWEnLCBXQVRFUik7XG5sZXQgQkFMID0gbignQkFMJywgJ0JhbHRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQkFSID0gbignQkFSJywgJ0JhcmVudHMgU2VhJywgV0FURVIpO1xubGV0IEJMQSA9IG4oJ0JMQScsICdCbGFjayBTZWEnLCBXQVRFUik7XG5sZXQgRUFTID0gbignRUFTJywgJ0Vhc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcbmxldCBFTkcgPSBuKCdFTkcnLCAnRW5nbGlzaCBDaGFubmVsJywgV0FURVIpO1xubGV0IEJPVCA9IG4oJ0JPVCcsICdHdWxmIG9mIEJvdGhuaWEnLCBXQVRFUik7XG5sZXQgR09MID0gbignR09MJywgJ0d1bGYgb2YgTHlvbicsIFdBVEVSKTtcbmxldCBIRUwgPSBuKCdIRUwnLCAnSGVsZ29sYW5kIEJpZ2h0JywgV0FURVIpO1xubGV0IElPTiA9IG4oJ0lPTicsICdJb25pYW4gU2VhJywgV0FURVIpO1xubGV0IElSSSA9IG4oJ0lSSScsICdJcmlzaCBTZWEnLCBXQVRFUik7XG5sZXQgTUlEID0gbignTUlEJywgJ01pZC1BdGxhbnRpYyBPY2VhbicsIFdBVEVSKTtcbmxldCBOQVQgPSBuKCdOQVQnLCAnTm9ydGggQXRsYW50aWMgT2NlYW4nLCBXQVRFUik7XG5sZXQgTlRIID0gbignTlRIJywgJ05vcnRoIFNlYScsIFdBVEVSKTtcbmxldCBOUkcgPSBuKCdOUkcnLCAnTm9yd2VnaWFuIFNlYScsIFdBVEVSKTtcbmxldCBTS0EgPSBuKCdTS0EnLCAnU2thZ2VycmFjaycsIFdBVEVSKTtcbmxldCBUWU4gPSBuKCdUWU4nLCAnVHlycmhlbmlhbiBTZWEnLCBXQVRFUik7XG5sZXQgV0VTID0gbignV0VTJywgJ1dlc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcblxubGV0IFNUUF9OT1JUSCA9IG4oJ1NUUCcsICdTdC4gUGV0ZXJzYnVyZyAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1RQX1NPVVRIID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IFNQQV9OT1JUSCA9IG4oJ1NQQScsICdTcGFpbiAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1BBX1NPVVRIID0gbignU1BBJywgJ1NwYWluIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IEJVTF9OT1JUSCA9IG4oJ0JVTCcsICdCdWxnYXJpYSAoRWFzdCBDb2FzdCknLCBMQU5EKTtcbmxldCBCVUxfU09VVEggPSBuKCdCVUwnLCAnQnVsZ2FyaWEgKFNvdXRoIENvYXN0KScsIExBTkQpO1xuXG5mdW5jdGlvbiBib3JkZXIobm9kZTogUmVnaW9uLCBhZGphY2VudDogUmVnaW9uW10pIHtcbiAgICBmb3IgKGxldCBvdGhlciBvZiBhZGphY2VudClcbiAgICAgICAgbm9kZS5hZGphY2VudC5hZGQob3RoZXIpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2gobm9kZTogUmVnaW9uLCBhdHRhY2hlZDogUmVnaW9uW10pIHtcbiAgICBsZXQgYWxsID0gW25vZGUsIC4uLmF0dGFjaGVkXTtcbiAgICBmb3IgKGxldCByZWdpb24gb2YgYWxsKSB7XG4gICAgICAgIGZvciAobGV0IG90aGVyIG9mIGFsbCkge1xuICAgICAgICAgICAgaWYgKG90aGVyID09IHJlZ2lvbikgY29udGludWU7XG4gICAgICAgICAgICByZWdpb24uYXR0YWNoZWQuYWRkKG90aGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYm9yZGVyKFNUUF9OT1JUSCwgW0JBUiwgTldZXSk7XG5hdHRhY2goU1RQLCBbU1RQX1NPVVRILCBTVFBfTk9SVEhdKTtcbmJvcmRlcihTVFBfU09VVEgsIFtCT1QsIExWTiwgRklOXSk7XG5cbmJvcmRlcihCVUxfTk9SVEgsIFtCTEEsIENPTiwgUlVNXSk7XG5hdHRhY2goQlVMLCBbQlVMX1NPVVRILCBCVUxfTk9SVEhdKTtcbmJvcmRlcihCVUxfU09VVEgsIFtBRUcsIEdSRSwgQ09OXSk7XG5cbmJvcmRlcihTUEFfTk9SVEgsIFtNSUQsIFBPUiwgR0FTXSk7XG5hdHRhY2goU1BBLCBbU1BBX1NPVVRILCBTUEFfTk9SVEhdKTtcbmJvcmRlcihTUEFfU09VVEgsIFtHT0wsIFdFUywgTUlELCBQT1IsIE1BUl0pO1xuXG5ib3JkZXIoTkFULCBbTlJHLCBDTFksIExWUCwgSVJJLCBNSURdKTtcbmJvcmRlcihOUkcsIFtCQVIsIE5XWSwgTlRILCBFREksIENMWSwgTkFUXSk7XG5ib3JkZXIoQ0xZLCBbTlJHLCBFREksIExWUCwgTkFUXSk7XG5ib3JkZXIoTFZQLCBbQ0xZLCBFREksIFlPUiwgV0FMLCBJUkksIE5BVF0pO1xuYm9yZGVyKElSSSwgW05BVCwgTFZQLCBXQUwsIEVORywgTUlEXSk7XG5ib3JkZXIoTUlELCBbTkFULCBJUkksIEVORywgQlJFLCBHQVMsIFBPUiwgV0VTLCBOQUYsIFNQQV9OT1JUSCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoQkFSLCBbTlJHLCBOV1ksIFNUUF9OT1JUSF0pO1xuYm9yZGVyKE5XWSwgW05SRywgQkFSLCBTVFAsIEZJTiwgU1dFLCBTS0EsIE5USCwgU1RQX05PUlRIXSk7XG5ib3JkZXIoTlRILCBbTlJHLCBOV1ksIFNLQSwgREVOLCBIRUwsIEhPTCwgQkVMLCBFTkcsIExPTiwgWU9SLCBFREldKTtcbmJvcmRlcihFREksIFtOUkcsIE5USCwgWU9SLCBMVlAsIENMWV0pO1xuYm9yZGVyKFlPUiwgW0VESSwgTlRILCBMT04sIFdBTCwgTFZQXSk7XG5ib3JkZXIoV0FMLCBbTFZQLCBZT1IsIExPTiwgRU5HLCBJUkldKTtcbmJvcmRlcihFTkcsIFtJUkksIFdBTCwgTE9OLCBOVEgsIEJFTCwgUElDLCBCUkUsIE1JRF0pO1xuYm9yZGVyKEJSRSwgW0VORywgUElDLCBQQVIsIEdBUywgTUlEXSk7XG5ib3JkZXIoR0FTLCBbQlJFLCBQQVIsIEJVUiwgTUFSLCBTUEEsIE1JRF0pO1xuYm9yZGVyKFNQQSwgW0dBUywgTUFSLCBQT1JdKTtcbmJvcmRlcihQT1IsIFtNSUQsIFNQQSwgU1BBX05PUlRILCBTUEFfU09VVEhdKTtcbmJvcmRlcihXRVMsIFtHT0wsIFRZTiwgVFVOLCBOQUYsIE1JRCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoTkFGLCBbTUlELCBXRVMsIFRVTl0pO1xuYm9yZGVyKFNUUCwgW05XWSwgTU9TLCBMVk4sIEZJTl0pO1xuYm9yZGVyKFNXRSwgW05XWSwgRklOLCBCT1QsIEJBTCwgREVOLCBTS0FdKTtcbmJvcmRlcihGSU4sIFtOV1ksIFNUUCwgQk9ULCBTV0UsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKFNLQSwgW05XWSwgU1dFLCBERU4sIE5USF0pO1xuYm9yZGVyKERFTiwgW1NLQSwgU1dFLCBCQUwsIEtJRSwgSEVMLCBOVEhdKTtcbmJvcmRlcihIRUwsIFtOVEgsIERFTiwgS0lFLCBIT0xdKTtcbmJvcmRlcihIT0wsIFtOVEgsIEhFTCwgS0lFLCBSVUgsIEJFTF0pO1xuYm9yZGVyKEJFTCwgW0VORywgTlRILCBIT0wsIFJVSCwgQlVSLCBQSUNdKTtcbmJvcmRlcihMT04sIFtZT1IsIE5USCwgRU5HLCBXQUxdKTtcbmJvcmRlcihQSUMsIFtFTkcsIEJFTCwgQlVSLCBQQVIsIEJSRV0pO1xuYm9yZGVyKFBBUiwgW1BJQywgQlVSLCBHQVMsIEJSRV0pO1xuYm9yZGVyKEdBUywgW0JSRSwgUEFSLCBCVVIsIE1BUiwgU1BBLCBNSUQsIFNQQV9OT1JUSF0pO1xuYm9yZGVyKEJVUiwgW1BBUiwgUElDLCBCRUwsIFJVSCwgTVVOLCBNQVIsIEdBU10pO1xuYm9yZGVyKE1BUiwgW0dBUywgQlVSLCBQSUUsIEdPTCwgU1BBLCBTUEFfU09VVEhdKTtcbmJvcmRlcihHT0wsIFtNQVIsIFBJRSwgVFVTLCBUWU4sIFdFUywgU1BBX1NPVVRIXSk7XG5ib3JkZXIoVFlOLCBbVFVTLCBST00sIE5BUCwgSU9OLCBUVU4sIFdFUywgR09MXSk7XG5ib3JkZXIoVFVOLCBbV0VTLCBUWU4sIElPTiwgTkFGXSk7XG5ib3JkZXIoTU9TLCBbU1RQLCBTRVYsIFVLUiwgV0FSLCBMVk5dKTtcbmJvcmRlcihMVk4sIFtCT1QsIFNUUCwgTU9TLCBXQVIsIFBSVSwgQkFMLCBTVFBfU09VVEhdKTtcbmJvcmRlcihCT1QsIFtTV0UsIEZJTiwgTFZOLCBCQUwsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKEJBTCwgW0RFTiwgU1dFLCBCT1QsIExWTiwgUFJVLCBCRVIsIEtJRV0pO1xuYm9yZGVyKEtJRSwgW0hFTCwgREVOLCBCQUwsIEJFUiwgTVVOLCBSVUgsIEhPTF0pO1xuYm9yZGVyKFJVSCwgW0JFTCwgSE9MLCBLSUUsIE1VTiwgQlVSXSk7XG5ib3JkZXIoUElFLCBbVFlSLCBWRU4sIFRVUywgR09MLCBNQVJdKTtcbmJvcmRlcihUVVMsIFtQSUUsIFZFTiwgUk9NLCBUWU4sIEdPTF0pO1xuYm9yZGVyKFJPTSwgW1RVUywgVkVOLCBBUFUsIE5BUCwgVFlOXSk7XG5ib3JkZXIoTkFQLCBbUk9NLCBBUFUsIElPTiwgVFlOXSk7XG5ib3JkZXIoSU9OLCBbVFlOLCBOQVAsIEFQVSwgQURSLCBBTEIsIEdSRSwgQUVHLCBFQVMsIFRVTl0pO1xuYm9yZGVyKFNFViwgW1VLUiwgTU9TLCBBUk0sIEJMQSwgUlVNXSk7XG5ib3JkZXIoVUtSLCBbTU9TLCBTRVYsIFJVTSwgR0FMLCBXQVJdKTtcbmJvcmRlcihXQVIsIFtQUlUsIExWTiwgTU9TLCBVS1IsIEdBTCwgU0lMXSk7XG5ib3JkZXIoUFJVLCBbQkFMLCBMVk4sIFdBUiwgU0lMLCBCRVJdKTtcbmJvcmRlcihCRVIsIFtCQUwsIFBSVSwgU0lMLCBNVU4sIEtJRV0pO1xuYm9yZGVyKE1VTiwgW1JVSCwgS0lFLCBCRVIsIFNJTCwgQk9ILCBUWVIsIEJVUl0pO1xuYm9yZGVyKFRZUiwgW01VTiwgQk9ILCBWSUUsIFRSSSwgVkVOLCBQSUVdKTtcbmJvcmRlcihWRU4sIFtUWVIsIFRSSSwgQURSLCBBUFUsIFJPTSwgVFVTLCBQSUVdKTtcbmJvcmRlcihBUFUsIFtWRU4sIEFEUiwgSU9OLCBOQVAsIFJPTV0pO1xuYm9yZGVyKEFEUiwgW1ZFTiwgVFJJLCBBTEIsIElPTiwgQVBVXSk7XG5ib3JkZXIoQUxCLCBbVFJJLCBTRVIsIEdSRSwgSU9OLCBBRFJdKTtcbmJvcmRlcihHUkUsIFtBTEIsIFNFUiwgQlVMLCBBRUcsIElPTiwgQlVMX1NPVVRIXSk7XG5ib3JkZXIoQUVHLCBbR1JFLCBDT04sIFNNWSwgRUFTLCBJT04sIEJVTF9TT1VUSF0pO1xuYm9yZGVyKEVBUywgW0FFRywgU01ZLCBTWVIsIElPTl0pO1xuYm9yZGVyKEFSTSwgW1NFViwgU1lSLCBTTVksIEFOSywgQkxBXSk7XG5ib3JkZXIoQkxBLCBbUlVNLCBTRVYsIEFSTSwgQU5LLCBDT04sIEJVTF9OT1JUSF0pO1xuYm9yZGVyKFJVTSwgW0JVRCwgR0FMLCBVS1IsIFNFViwgQkxBLCBCVUwsIFNFUiwgQlVMX05PUlRIXSk7XG5ib3JkZXIoR0FMLCBbQk9ILCBTSUwsIFdBUiwgVUtSLCBSVU0sIEJVRCwgVklFXSk7XG5ib3JkZXIoU0lMLCBbQkVSLCBQUlUsIFdBUiwgR0FMLCBCT0gsIE1VTl0pO1xuYm9yZGVyKEJPSCwgW01VTiwgU0lMLCBHQUwsIFZJRSwgVFlSXSk7XG5ib3JkZXIoVklFLCBbQk9ILCBHQUwsIEJVRCwgVFJJLCBUWVJdKTtcbmJvcmRlcihUUkksIFtUWVIsIFZJRSwgQlVELCBTRVIsIEFMQiwgQURSLCBWRU5dKTtcbmJvcmRlcihTRVIsIFtCVUQsIFJVTSwgQlVMLCBHUkUsIEFMQiwgVFJJXSk7XG5ib3JkZXIoQlVMLCBbUlVNLCBDT04sIEdSRSwgU0VSXSk7XG5ib3JkZXIoQ09OLCBbQlVMLCBCTEEsIEFOSywgU01ZLCBBRUcsIEJVTF9TT1VUSCwgQlVMX05PUlRIXSk7XG5ib3JkZXIoU01ZLCBbQ09OLCBBTkssIEFSTSwgU1lSLCBFQVMsIEFFR10pO1xuYm9yZGVyKFNZUiwgW1NNWSwgQVJNLCBFQVNdKTtcbmJvcmRlcihCVUQsIFtWSUUsIEdBTCwgUlVNLCBTRVIsIFRSSV0pO1xuYm9yZGVyKEFOSywgW0JMQSwgQVJNLCBTTVksIENPTl0pO1xuXG5leHBvcnQgY29uc3QgZXVyb3BlID0gbmV3IEdhbWVNYXAoW0JPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEhdKTtcblxuZXhwb3J0IGNvbnN0IFJFR0lPTlMgPSB7IEJPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEggfTtcbiIsImV4cG9ydCBmdW5jdGlvbiBlcnJvcihtc2c6IHN0cmluZykge1xuICAgIGRlYnVnZ2VyO1xuICAgIHJldHVybiBuZXcgRXJyb3IobXNnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBtYXRjaGVzKHJlZ2V4OiBSZWdFeHAsIHRhcmdldDogc3RyaW5nKSB7XG4gICAgbGV0IGNvcHkgPSBuZXcgUmVnRXhwKHJlZ2V4LCAnZycpO1xuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAobWF0Y2ggPSBjb3B5LmV4ZWModGFyZ2V0KSlcbiAgICAgICAgeWllbGQgbWF0Y2g7XG59XG4iLCJpbXBvcnQgeyBVbml0LCBSZWdpb24sIFVuaXRUeXBlIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBPcmRlckJhc2U8VCBleHRlbmRzIHN0cmluZz4ge1xuICAgIHJlYWRvbmx5IHR5cGU6IFQsXG4gICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbn1cblxuZXhwb3J0IGNsYXNzIEhvbGRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnaG9sZCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ2hvbGQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gaG9sZGA7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW92ZU9yZGVyIGltcGxlbWVudHMgT3JkZXJCYXNlPCdtb3ZlJz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnbW92ZSc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgICAgIHJlYWRvbmx5IHRhcmdldDogUmVnaW9uLFxuICAgICAgICByZWFkb25seSByZXF1aXJlQ29udm95OiBib29sZWFuLFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IHRleHQgPSBgJHt0aGlzLnVuaXQudGVhbX0gJHt0aGlzLnVuaXQucmVnaW9uLm5hbWV9IG1vdmUgLT4gJHt0aGlzLnRhcmdldC5uYW1lfWA7XG4gICAgICAgIGlmICh0aGlzLnJlcXVpcmVDb252b3kpIHRleHQgKz0gYCB2aWEgY29udm95YDtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3VwcG9ydE9yZGVyIGltcGxlbWVudHMgT3JkZXJCYXNlPCdzdXBwb3J0Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnc3VwcG9ydCc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgICAgIHJlYWRvbmx5IHRhcmdldDogUmVnaW9uLFxuICAgICAgICByZWFkb25seSBhdHRhY2s/OiBSZWdpb24sXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgdGV4dCA9IGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gc3VwcG9ydCAke3RoaXMudGFyZ2V0Lm5hbWV9YDtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNrKSB0ZXh0ICs9IGAgLT4gJHt0aGlzLmF0dGFjay5uYW1lfWA7XG4gICAgICAgIGVsc2UgdGV4dCArPSBgIHRvIGhvbGRgO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb252b3lPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnY29udm95Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnY29udm95JztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgc3RhcnQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgZW5kOiBSZWdpb24sXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy51bml0LnRlYW19ICR7dGhpcy51bml0LnJlZ2lvbi5uYW1lfSBjb252b3kgJHt0aGlzLnN0YXJ0Lm5hbWV9IHRvICR7dGhpcy5lbmQubmFtZX1gO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgQW55T3JkZXIgPSBIb2xkT3JkZXIgfCBNb3ZlT3JkZXIgfCBTdXBwb3J0T3JkZXIgfCBDb252b3lPcmRlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUob3JkZXJzOiBBbnlPcmRlcltdKSB7XG4gICAgZnVuY3Rpb24gY2FuTW92ZSh1bml0OiBVbml0LCBkc3Q6IFJlZ2lvbikge1xuICAgICAgICBpZiAodW5pdC50eXBlID09IFVuaXRUeXBlLldhdGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFkamFjZW50Lmhhcyhkc3QpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkc3QudHlwZSAhPSBVbml0VHlwZS5XYXRlciAmJiAhZHN0LmlzU2hvcmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdW5pdC5yZWdpb24udHlwZSA9PSBVbml0VHlwZS5MYW5kKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNob3JlID0gWy4uLnVuaXQucmVnaW9uLmFkamFjZW50XS5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyICYmIGRzdC5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICAgICAgICAgIGlmIChzaG9yZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGRzdCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlICE9IFVuaXRUeXBlLkxhbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuUmVhY2godW5pdDogVW5pdCwgZHN0OiBSZWdpb24pIHtcbiAgICAgICAgaWYgKGNhbk1vdmUodW5pdCwgZHN0KSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGxldCBzaG9yZSA9IFsuLi5kc3QuYXR0YWNoZWRdLmZpbmQoYSA9PiB1bml0LnJlZ2lvbi5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICByZXR1cm4gc2hvcmUgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkKG9yZGVyOiBBbnlPcmRlcikge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScpIHtcbiAgICAgICAgICAgIGlmIChSZWdpb24uYXJlU2FtZShvcmRlci51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChvcmRlci51bml0LnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIgJiYgIWNhbk1vdmUob3JkZXIudW5pdCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUm91dGVzKG9yZGVyOiBNb3ZlT3JkZXIsIHNraXA/OiBSZWdpb24pIHtcbiAgICAgICAgbGV0IGNvbnZveXMgPSBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdjb252b3knXG4gICAgICAgICAgICAmJiBvLnVuaXQucmVnaW9uICE9IHNraXBcbiAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8uc3RhcnQsIG9yZGVyLnVuaXQucmVnaW9uKVxuICAgICAgICAgICAgJiYgcmVzb2x2ZShvKSkgYXMgQ29udm95T3JkZXJbXTtcblxuICAgICAgICBsZXQgdXNlZCA9IGNvbnZveXMubWFwKCgpID0+IGZhbHNlKTtcbiAgICAgICAgbGV0IG5vZGUgPSBvcmRlci51bml0O1xuXG4gICAgICAgIGxldCBwYXRoOiBDb252b3lPcmRlcltdID0gW107XG4gICAgICAgIGxldCBwYXRoczogQ29udm95T3JkZXJbXVtdID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoKCkge1xuICAgICAgICAgICAgaWYgKGNhbk1vdmUobm9kZSwgb3JkZXIudGFyZ2V0KSB8fCBwYXRoLmxlbmd0aCA+IDAgJiYgY2FuUmVhY2gobm9kZSwgb3JkZXIudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2gocGF0aC5zbGljZSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgbmV4dCA9IDA7IG5leHQgPCBjb252b3lzLmxlbmd0aDsgKytuZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZWRbbmV4dF0gfHwgIW5vZGUucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGNvbnZveXNbbmV4dF0udW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGxldCBwcmV2aW91cyA9IG5vZGU7XG4gICAgICAgICAgICAgICAgdXNlZFtuZXh0XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKGNvbnZveXNbbmV4dF0pO1xuICAgICAgICAgICAgICAgIG5vZGUgPSBjb252b3lzW25leHRdLnVuaXQ7XG5cbiAgICAgICAgICAgICAgICBzZWFyY2goKTtcblxuICAgICAgICAgICAgICAgIG5vZGUgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICBwYXRoLnBvcCgpO1xuICAgICAgICAgICAgICAgIHVzZWRbbmV4dF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlYXJjaCgpO1xuXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChvcmRlci5yZXF1aXJlQ29udm95ICYmIHBhdGhzLmZpbHRlcihhID0+IGEubGVuZ3RoID4gMCkubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4geyBjb252b3lzLCBwYXRocyB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRIb2xkU3VwcG9ydChvcmRlcjogQW55T3JkZXIpIHtcbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuXG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRNb3ZlU3VwcG9ydChvcmRlcjogTW92ZU9yZGVyKSB7XG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpc1ZhbGlkKG9yZGVyc1tpXSkpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBsZXQgZHVtcCA9IG9yZGVyc1tpXTtcbiAgICAgICAgb3JkZXJzLnNwbGljZShpLCAxLCBuZXcgSG9sZE9yZGVyKGR1bXAudW5pdCkpO1xuICAgIH1cblxuICAgIGxldCBwYXNzZWQgPSBuZXcgU2V0PEFueU9yZGVyPigpO1xuICAgIGxldCBjaGVja2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcbiAgICBsZXQgcmVhc29ucyA9IG5ldyBNYXA8QW55T3JkZXIsIHN0cmluZz4oKTtcblxuICAgIGxldCBzdGFjazogQW55T3JkZXJbXSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmFpbChvcmRlcjogQW55T3JkZXIsIHJlYXNvbjogc3RyaW5nKTogZmFsc2Uge1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgcmVhc29ucy5zZXQob3JkZXIsIHJlYXNvbik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXNzKG9yZGVyOiBBbnlPcmRlcik6IHRydWUge1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgcGFzc2VkLmFkZChvcmRlcik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmUob3JkZXI6IEFueU9yZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChzdGFja1swXSA9PSBvcmRlciAmJiBzdGFjay5ldmVyeShvID0+IG8udHlwZSA9PSAnbW92ZScpICYmIHN0YWNrLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ3JlY3Vyc2l2ZSByZXNvbHZlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hlY2tlZC5oYXMob3JkZXIpKVxuICAgICAgICAgICAgcmV0dXJuIHBhc3NlZC5oYXMob3JkZXIpO1xuICAgICAgICBjaGVja2VkLmFkZChvcmRlcik7XG5cbiAgICAgICAgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSlcbiAgICAgICAgICAgIHRocm93IGVycm9yKGByZWN1cnNpdmUgcmVzb2x2ZWApO1xuXG4gICAgICAgIHN0YWNrLnB1c2gob3JkZXIpO1xuXG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdob2xkJykge1xuICAgICAgICAgICAgcmV0dXJuIHBhc3Mob3JkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IG9yZGVycy5maW5kKG8gPT4gUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSk7XG5cbiAgICAgICAgICAgIGxldCBiZXN0OiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgbGV0IGJlc3REaXNsb2RnZTogTW92ZU9yZGVyW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBkaXNsb2RnZVN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgbGV0IGZvcmNlUmVzb2x2ZWQ6IE1vdmVPcmRlciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2spO1xuICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgc3VwcG9ydCA9IGZpbmRNb3ZlU3VwcG9ydChhdHRhY2spO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgcHJldmVudCBkaXNsb2RnZWQgdW5pdCBmcm9tIGJvdW5jaW5nIHdpdGggb3RoZXIgdW5pdHMgZW50ZXJpbmcgZGlzbG9kZ2VyJ3MgcmVnaW9uXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmVtaWVzID0gc3VwcG9ydC5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJvdXRlcyA9IGZpbmRSb3V0ZXMoY3VycmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3V0ZXMgIT0gbnVsbCAmJiBjdXJyZW50Um91dGVzLnBhdGhzLmxlbmd0aCA9PSAxICYmIHJvdXRlcy5wYXRocy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRBdHRhY2sgPSBmaW5kTW92ZVN1cHBvcnQoY3VycmVudCkuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gYXR0YWNrLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBlbmVtaWVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmVzb2x2ZWQgPSBhdHRhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydC5sZW5ndGggPiBzdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0ID0gW2F0dGFja107XG4gICAgICAgICAgICAgICAgICAgIHN0cmVuZ3RoID0gc3VwcG9ydC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0Lmxlbmd0aCA9PSBzdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0LnB1c2goYXR0YWNrKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBhdHRhY2sudW5pdC50ZWFtICE9IGN1cnJlbnQudW5pdC50ZWFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmVtaWVzID0gc3VwcG9ydC5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllcy5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0RGlzbG9kZ2UgPSBbYXR0YWNrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2xvZGdlU3RyZW5ndGggPSBlbmVtaWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbmVtaWVzLmxlbmd0aCA9PSBkaXNsb2RnZVN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0RGlzbG9kZ2UucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJlc3QuaW5jbHVkZXMob3JkZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgT3ZlcnBvd2VyZWQgYnkgJHtiZXN0LmpvaW4oJywgJyl9IHdpdGggc3RyZW5ndGggJHtzdHJlbmd0aH0gdnMgJHtmaW5kTW92ZVN1cHBvcnQob3JkZXIpLmxlbmd0aH0gYCk7XG5cbiAgICAgICAgICAgIGlmIChiZXN0Lmxlbmd0aCAhPSAxKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3RhbmRvZmYgd2l0aCAke2Jlc3Quam9pbignLCAnKX0gd2l0aCBzdHJlbmd0aCAke3N0cmVuZ3RofSBgKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgYmVzdFswXSAhPSBmb3JjZVJlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQudHlwZSA9PSAnbW92ZScgJiYgUmVnaW9uLmFyZVNhbWUoY3VycmVudC50YXJnZXQsIGJlc3RbMF0udW5pdC5yZWdpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiZXN0RGlzbG9kZ2UubGVuZ3RoICE9IDEgfHwgYmVzdFswXSAhPSBiZXN0RGlzbG9kZ2VbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYEF2b2lkaW5nIHNlbGYtZGlzbG9kZ2VtZW50YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRBdHRhY2sgPSBmaW5kTW92ZVN1cHBvcnQoY3VycmVudCkuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gYmVzdFswXS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgQmFsYW5jZWQgZmFjZW9mZiAke2N1cnJlbnRBdHRhY2suam9pbignLCAnKX0gdnMgJHtmaW5kTW92ZVN1cHBvcnQob3JkZXIpLmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSkuam9pbignLCAnKX1gKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ0ZhaWxlZCB0byBmaWx0ZXIgb3V0IGRpc2xvZGdlZCBhdHRhY2snKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnQudHlwZSAhPSAnbW92ZScgfHwgIXJlc29sdmUoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJlc3REaXNsb2RnZS5sZW5ndGggIT0gMSB8fCBiZXN0WzBdICE9IGJlc3REaXNsb2RnZVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgQXZvaWRpbmcgc2VsZi1kaXNsb2RnZW1lbnRgKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgaG9sZFN1cHBvcnQgPSBmaW5kSG9sZFN1cHBvcnQoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob2xkU3VwcG9ydC5sZW5ndGggPj0gZGlzbG9kZ2VTdHJlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgSGVsZCB3aXRoICR7aG9sZFN1cHBvcnQuam9pbignLCAnKX0gdnMgJHtmaW5kTW92ZVN1cHBvcnQob3JkZXIpLmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSkuam9pbignLCAnKX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdjb252b3knKSB7XG4gICAgICAgICAgICBpZiAob3JkZXIudW5pdC5yZWdpb24udHlwZSAhPSBVbml0VHlwZS5XYXRlcilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgJ09ubHkgd2F0ZXIgdW5pdHMgY2FuIGNvbnZveScpO1xuXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gb3JkZXJzLmZpbmQobyA9PiBvLnR5cGUgPT0gJ21vdmUnXG4gICAgICAgICAgICAgICAgJiYgby51bml0LnR5cGUgPT0gVW5pdFR5cGUuTGFuZFxuICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udW5pdC5yZWdpb24sIG9yZGVyLnN0YXJ0KVxuICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udGFyZ2V0LCBvcmRlci5lbmQpKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgJ05vIG1hdGNoaW5nIHRhcmdldCcpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlKGF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzbG9kZ2VkIGJ5ICR7YXR0YWNrfSBgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhc3Mob3JkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ3N1cHBvcnQnKSB7XG4gICAgICAgICAgICBsZXQgc3VwcG9ydGVlID0gb3JkZXJzLmZpbmQobyA9PiBSZWdpb24uYXJlU2FtZShvLnVuaXQucmVnaW9uLCBvcmRlci50YXJnZXQpKTtcbiAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgJ05vIG1hdGNoaW5nIHRhcmdldCcpO1xuXG4gICAgICAgICAgICBpZiAob3JkZXIuYXR0YWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZS50eXBlICE9ICdtb3ZlJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdXBwb3J0IGF0dGFja2VkICR7b3JkZXIuYXR0YWNrLm5hbWV9IHRhcmdldCB3YXMgJHtzdXBwb3J0ZWV9YCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZWFjaChvcmRlci51bml0LCBvcmRlci5hdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYFN1cHBvcnQgYXR0YWNrZWQgJHtvcmRlci5hdHRhY2submFtZX0gYnV0IGNvdWxkIG5vdCByZWFjaGApO1xuICAgICAgICAgICAgICAgIGlmICghUmVnaW9uLmFyZUVxdWFsKHN1cHBvcnRlZS50YXJnZXQsIG9yZGVyLmF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3VwcG9ydCBhdHRhY2tlZCAke29yZGVyLmF0dGFjay5uYW1lfSBidXQgdGFyZ2V0IGF0dGFja2VkICR7c3VwcG9ydGVlLnRhcmdldH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZS50eXBlID09ICdtb3ZlJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdXBwb3J0IGhlbGQgYnV0IHRhcmdldCB3YXMgJHtzdXBwb3J0ZWV9YCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZWFjaChvcmRlci51bml0LCBvcmRlci50YXJnZXQpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYFN1cHBvcnQgaGVsZCAke29yZGVyLnRhcmdldC5uYW1lfSBidXQgY291bGQgbm90IHJlYWNoYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrLnR5cGUgIT0gJ21vdmUnIHx8ICFSZWdpb24uYXJlU2FtZShhdHRhY2sudGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyLnVuaXQudGVhbSA9PSBhdHRhY2sudW5pdC50ZWFtKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUudHlwZSA9PSAnbW92ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFJlZ2lvbi5hcmVTYW1lKHN1cHBvcnRlZS50YXJnZXQsIGF0dGFjay51bml0LnJlZ2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGlzIGZyb20gdGhlIHRhcmdldCByZWdpb24gb2YgdGhlIHN1cHBvcnRlZCBhdHRhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBjYW4gb25seSBjdXQgc3VwcG9ydCBieSBkaXNsb2RnaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzbG9kZ2VkIGJ5ICR7YXR0YWNrfWApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgaXMgY29udm95ZWQgYnkgdGhlIHRhcmdldCByZWdpb24gb2YgdGhlIHN1cHBvcnRlZCBhdHRhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBjYW4gb25seSBjdXQgc3VwcG9ydCBpZiBpdCBoYXMgYW4gYWx0ZXJuYXRlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBmaW5kUm91dGVzKGF0dGFjaywgc3VwcG9ydGVlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVzICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNydXB0ZWQgYnkgJHthdHRhY2t9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2spO1xuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVzICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYERpc3J1cHRlZCBieSAke2F0dGFja31gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycm9yKGBJbnZhbGlkIG9yZGVyYCk7XG4gICAgfVxuXG4gICAgbGV0IGV2aWN0ZWQ6IFVuaXRbXSA9IFtdO1xuICAgIGxldCByZXNvbHZlZDogTW92ZU9yZGVyW10gPSBbXTtcblxuICAgIGZvciAobGV0IG9yZGVyIG9mIG9yZGVycykge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScgJiYgcmVzb2x2ZShvcmRlcikpIHtcbiAgICAgICAgICAgIHJlc29sdmVkLnB1c2gob3JkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICBldmljdGVkLnB1c2gob3JkZXIudW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyByZXNvbHZlZCwgZXZpY3RlZCwgcmVhc29ucyB9O1xufVxuIiwiaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJztcbmltcG9ydCB7IGVycm9yLCBtYXRjaGVzIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IEdhbWVTdGF0ZSwgVW5pdCwgVW5pdFR5cGUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgUkVHSU9OUywgZXVyb3BlIH0gZnJvbSAnLi9kYXRhJztcbmltcG9ydCB7IEhvbGRPcmRlciwgTW92ZU9yZGVyLCBTdXBwb3J0T3JkZXIsIENvbnZveU9yZGVyIH0gZnJvbSAnLi9ydWxlcyc7XG5cbmV4cG9ydCB0eXBlIElucHV0cyA9IHsgW3RlYW06IHN0cmluZ106IHN0cmluZ1tdIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHVybiB7XG4gICAgb3JkZXJzOiBJbnB1dHMsXG4gICAgcmV0cmVhdHM/OiBJbnB1dHMsXG4gICAgYnVpbGRzPzogSW5wdXRzLFxufVxuXG5jb25zdCBzZXNzaW9uX2tleSA9IGAzNDNldmhqMjN2djA1YmVpaXY4ZGxkbG5vNGA7XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXlkaXBsb21hY3kocGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5wbGF5ZGlwbG9tYWN5LmNvbSR7cGF0aH1gO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QodXJsLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdjb29raWUnOiBgUEhQU0VTU0lEPSR7c2Vzc2lvbl9rZXl9YCB9LFxuICAgICAgICAgICAgcmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG4gICAgICAgICAgICBmb2xsb3dSZWRpcmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9IDIwMCkgdGhyb3cgZXJyb3IoJ2ludmFsaWQgc3RhdHVzIGNvZGUnKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdhbWVfaGlzdG9yeShxdWVyeTogc3RyaW5nKSB7XG4gICAgbGV0IGNhY2hlID0gYGNhY2hlLyR7cXVlcnl9YDtcblxuICAgIGxldCBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGUsICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeShgL2dhbWVfaGlzdG9yeS5waHA/JHtxdWVyeX1gKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGNhY2hlLCBkYXRhLCAndXRmOCcpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRfaGlzdG9yeShpZDogbnVtYmVyLCBwaGFzZTogc3RyaW5nLCBkYXRlOiBudW1iZXIpIHtcbiAgICBsZXQgcXVlcnkgPSBgZ2FtZV9pZD0ke2lkfSZwaGFzZT0ke3BoYXNlfSZnZGF0ZT0ke2RhdGV9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IGdhbWVfaGlzdG9yeShxdWVyeSk7XG5cbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICBsZXQgaW5wdXRzOiBJbnB1dHMgPSB7fTtcblxuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPihcXHcrKTxcXC9iPjx1bD4oLio/KTxcXC91bD4vLCBkYXRhKSkge1xuICAgICAgICBsZXQgdGVhbSA9IG1hdGNoWzFdO1xuICAgICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHBhcnQgb2YgbWF0Y2hlcygvPGxpPiguKj8pPFxcL2xpPi8sIG1hdGNoWzJdKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKHBhcnRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKSBjb250aW51ZTtcblxuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1t0ZWFtXSA9IGxpc3Q7XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKVxuICAgICAgICByZXR1cm4gaW5wdXRzO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldF9nYW1lKGlkOiBudW1iZXIpIHtcbiAgICBsZXQgdHVybnMgPSBbXTtcbiAgICBsZXQgaGlzdG9yeSA9IGF3YWl0IGdhbWVfaGlzdG9yeShgZ2FtZV9pZD0ke2lkfWApO1xuXG4gICAgZm9yIChsZXQgY29udGVudCBvZiBoaXN0b3J5LnNwbGl0KCc8L2JyPjwvYnI+JykpIHtcbiAgICAgICAgbGV0IGRhdGUgPSB0dXJucy5sZW5ndGg7XG4gICAgICAgIGxldCB0dXJuOiBUdXJuID0geyBvcmRlcnM6IHt9IH07XG5cbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPjxhIGhyZWY9J2dhbWVfaGlzdG9yeVxcLnBocFxcP2dhbWVfaWQ9KFxcZCspJnBoYXNlPShcXHcpJmdkYXRlPShcXGQrKSc+W148XSs8XFwvYT48XFwvYj4mbmJzcDsmbmJzcDsvLCBjb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKGlkICE9IHBhcnNlSW50KG1hdGNoWzFdKSkgdGhyb3cgZXJyb3IoYEZhaWxlZCB0byBwYXJzZSBnYW1lIGhpc3Rvcnk6ICR7aWR9YCk7XG4gICAgICAgICAgICBpZiAoZGF0ZSAhPSBwYXJzZUludChtYXRjaFszXSkpIHRocm93IGVycm9yKGBGYWlsZWQgdG8gcGFyc2UgZ2FtZSBoaXN0b3J5OiAke2lkfWApO1xuXG4gICAgICAgICAgICBsZXQgcGhhc2UgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgIGxldCBpbnB1dHMgPSBhd2FpdCBnZXRfaGlzdG9yeShpZCwgcGhhc2UsIGRhdGUpO1xuICAgICAgICAgICAgaWYgKGlucHV0cyA9PSBudWxsICYmIHBoYXNlICE9ICdPJykgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdPJzogdHVybi5vcmRlcnMgPSBpbnB1dHMgfHwge307IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1InOiB0dXJuLnJldHJlYXRzID0gaW5wdXRzOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdCJzogdHVybi5idWlsZHMgPSBpbnB1dHM7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFmb3VuZCkgY29udGludWU7XG5cbiAgICAgICAgdHVybnMucHVzaCh0dXJuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHVybnM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRfcGFnZShwYWdlOiBudW1iZXIpIHtcbiAgICBsZXQgdXJsID0gYC9nYW1lcy5waHA/c3VicGFnZT1hbGxfZmluaXNoZWQmdmFyaWFudC0wPTEmbWFwX3ZhcmlhbnQtMD0xJmN1cnJlbnRfcGFnZT0ke3BhZ2V9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IHBsYXlkaXBsb21hY3kodXJsKTtcblxuICAgIGxldCBpZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGxldCBtYXRjaCBvZiBtYXRjaGVzKC88YSBocmVmPVwiZ2FtZV9wbGF5X2RldGFpbHNcXC5waHBcXD9nYW1lX2lkPShcXGQrKS8sIGRhdGEpKSB7XG4gICAgICAgIGxldCBnYW1lSWQgPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgIGlkcy5hZGQoZ2FtZUlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gWy4uLmlkc107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkX2dhbWUocmF3OiBCdWZmZXIpIHtcbiAgICBsZXQgZGF0YSA9IHpsaWIuZ3VuemlwU3luYyhyYXcpO1xuICAgIGxldCBnYW1lID0gSlNPTi5wYXJzZShkYXRhLnRvU3RyaW5nKCd1dGY4JykpIGFzIFR1cm5bXTtcblxuICAgIGZvciAobGV0IHR1cm4gb2YgZ2FtZSkge1xuICAgICAgICBpZiAodHVybi5idWlsZHMgJiYgT2JqZWN0LmtleXModHVybi5idWlsZHMpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBkZWxldGUgdHVybi5idWlsZHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR1cm4ucmV0cmVhdHMgJiYgT2JqZWN0LmtleXModHVybi5yZXRyZWF0cykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0dXJuLnJldHJlYXRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh0dXJuLm9yZGVycykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIC8vIHNvbWV0aW1lcyBnYW1lcyBoYXZlIGFuIGVtcHR5IGxhc3QgdHVybiB3aXRoIG5vIG9yZGVyc1xuICAgICAgICAgICAgaWYgKHR1cm4uYnVpbGRzIHx8IHR1cm4ucmV0cmVhdHNcbiAgICAgICAgICAgICAgICB8fCBnYW1lLmluZGV4T2YodHVybikgKyAxICE9IGdhbWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yKGBtaXNzaW5nIG9yZGVyczogJHtnYW1lLmluZGV4T2YodHVybil9YCk7XG4gICAgICAgICAgICBnYW1lLnBvcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2FtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlX2dhbWUodHVybnM6IFR1cm5bXSkge1xuICAgIGxldCBkYXRhID0gQnVmZmVyLmZyb20oSlNPTi5zdHJpbmdpZnkodHVybnMpLCAndXRmOCcpO1xuICAgIHJldHVybiB6bGliLmd6aXBTeW5jKGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgIGZzLm1rZGlycFN5bmMoJ2RhdGEnKTtcbiAgICBmcy5ta2RpcnBTeW5jKCdjYWNoZScpO1xuXG4gICAgbGV0IGVycm9ycyA9IDA7XG4gICAgbGV0IG9sZEtub3duO1xuICAgIGxldCBuZXdLbm93biA9IHsgbmV3ZXN0OiAwLCBjb3VudDogMCB9O1xuICAgIHRyeSB7XG4gICAgICAgIG9sZEtub3duID0gZnMucmVhZEpTT05TeW5jKCdkYXRhL2tub3duLmpzb24nKSBhcyB0eXBlb2YgbmV3S25vd247XG4gICAgICAgIGNvbnNvbGUubG9nKGBrbm93bjogJHtvbGRLbm93bi5uZXdlc3R9ICske29sZEtub3duLmNvdW50fWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgb2xkS25vd24gPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBza2lwID0gMFxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDEwMDAgJiYgZXJyb3JzIDwgMTA7ICsraSkge1xuICAgICAgICBpZiAoc2tpcCA+PSAxNSkge1xuICAgICAgICAgICAgc2tpcCAtPSAxNTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYGZldGNoaW5nIHBhZ2UgJHtpfWApXG4gICAgICAgIGxldCBpZHMgPSBhd2FpdCBnZXRfcGFnZShpKTtcblxuICAgICAgICBmb3IgKGxldCBpZCBvZiBpZHMpIHtcbiAgICAgICAgICAgIGlmIChuZXdLbm93bi5uZXdlc3QgPT0gMClcbiAgICAgICAgICAgICAgICBuZXdLbm93bi5uZXdlc3QgPSBpZDtcblxuICAgICAgICAgICAgaWYgKG9sZEtub3duICYmIGlkID09IG9sZEtub3duLm5ld2VzdCkge1xuICAgICAgICAgICAgICAgIHNraXAgPSBvbGRLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICBuZXdLbm93bi5jb3VudCArPSBvbGRLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICBvbGRLbm93biA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChza2lwID49IDEpIHtcbiAgICAgICAgICAgICAgICBza2lwIC09IDE7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHNraXBwaW5nIGdhbWUgJHtpZH1gKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZmV0Y2hpbmcgZ2FtZSAke2lkfWApXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBvdXRwdXRGaWxlID0gYGRhdGEvJHtpZH1gO1xuICAgICAgICAgICAgICAgIGlmICghZnMucGF0aEV4aXN0c1N5bmMob3V0cHV0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWUgPSBhd2FpdCBnZXRfZ2FtZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gd3JpdGVfZ2FtZShnYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnNlZCA9IHJlYWRfZ2FtZShkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkocGFyc2VkKSAhPSBKU09OLnN0cmluZ2lmeShnYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yKCdnYW1lIGVuY29kaW5nIGZhaWxlZCcpXG5cbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRGaWxlLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKytuZXdLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgKytlcnJvcnM7XG4gICAgICAgICAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoJ2Vycm9ycy50eHQnLCBgJHtpZH0gJHtlfWAsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpZCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2xkS25vd24gPT0gbnVsbCkge1xuICAgICAgICAgICAgZnMud3JpdGVKU09OU3luYygnZGF0YS9rbm93bi5qc29uJywgbmV3S25vd24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGtub3duOiAke25ld0tub3duLm5ld2VzdH0gKyR7bmV3S25vd24uY291bnR9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICBmcy5ta2RpcnBTeW5jKCdkYXRhJyk7XG4gICAgZnMubWtkaXJwU3luYygnY2FjaGUnKTtcblxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IGFsbElkcyA9IGZzLnJlYWRkaXJTeW5jKCdkYXRhJyk7XG5cbiAgICBmb3IgKGxldCBpZCBvZiBhbGxJZHMpIHtcbiAgICAgICAgaWYgKGlkID09ICdrbm93bi5qc29uJykgY29udGludWU7XG5cbiAgICAgICAgbGV0IGdhbWUgPSByZWFkX2dhbWUoZnMucmVhZEZpbGVTeW5jKGBkYXRhLyR7aWR9YCkpO1xuXG4gICAgICAgIGxldCB0dXJucyA9IDA7XG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgZ2FtZV9oaXN0b3J5KGBnYW1lX2lkPSR7aWR9YCk7XG5cbiAgICAgICAgZm9yIChsZXQgY29udGVudCBvZiBoaXN0b3J5LnNwbGl0KCc8L2JyPjwvYnI+JykpIHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgXyBvZiBtYXRjaGVzKC88Yj48YSBocmVmPSdnYW1lX2hpc3RvcnlcXC5waHBcXD9nYW1lX2lkPShcXGQrKSZwaGFzZT0oXFx3KSZnZGF0ZT0oXFxkKyknPltePF0rPFxcL2E+PFxcL2I+Jm5ic3A7Jm5ic3A7LywgY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZm91bmQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgKyt0dXJucztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0dXJucyAhPSBnYW1lLmxlbmd0aCkge1xuICAgICAgICAgICAgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKHBhcnNlSW50KGlkKSk7XG4gICAgICAgICAgICBpZiAodHVybnMgIT0gZ2FtZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgTWlzbWF0Y2g6ICR7aWR9ICR7dHVybnN9ICR7Z2FtZS5sZW5ndGh9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnVpbGRzID0gMDtcbiAgICAgICAgbGV0IHJldHJlYXRzID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnYW1lLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoZ2FtZVtpXS5idWlsZHMpIGJ1aWxkcysrO1xuICAgICAgICAgICAgaWYgKGdhbWVbaV0ucmV0cmVhdHMpIHJldHJlYXRzKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnVpbGRzID09IDAgJiYgcmV0cmVhdHMgPT0gMCkge1xuICAgICAgICAgICAgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKHBhcnNlSW50KGlkKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsoKytjb3VudCkudG9TdHJpbmcoKS5wYWRTdGFydChhbGxJZHMubGVuZ3RoLnRvU3RyaW5nKCkubGVuZ3RoKX0gLyAke2FsbElkcy5sZW5ndGh9ICR7aWR9ICR7dHVybnN9ICpgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeygrK2NvdW50KS50b1N0cmluZygpLnBhZFN0YXJ0KGFsbElkcy5sZW5ndGgudG9TdHJpbmcoKS5sZW5ndGgpfSAvICR7YWxsSWRzLmxlbmd0aH0gJHtpZH0gJHt0dXJuc31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRhID0gd3JpdGVfZ2FtZShnYW1lKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgZGF0YS8ke2lkfWAsIGRhdGEpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlX29yZGVycyhnYW1lOiBHYW1lU3RhdGUsIGlucHV0czogSW5wdXRzKSB7XG4gICAgbGV0IGlzTmV3ID0gZ2FtZS51bml0cy5zaXplID09IDA7XG4gICAgbGV0IGZsZWV0cyA9IG5ldyBTZXQoW1JFR0lPTlMuTE9OLCBSRUdJT05TLkVESSwgUkVHSU9OUy5CUkUsIFJFR0lPTlMuTkFQLCBSRUdJT05TLktJRSwgUkVHSU9OUy5UUkksIFJFR0lPTlMuQU5LLCBSRUdJT05TLlNFViwgUkVHSU9OUy5TVFBfU09VVEhdKTtcblxuICAgIGxldCBvcmRlcnMgPSBbXTtcbiAgICBsZXQgcmVzb2x2ZWQgPSBbXTtcblxuICAgIGZvciAobGV0IHRlYW0gaW4gaW5wdXRzKSB7XG4gICAgICAgIGZvciAobGV0IHJhdyBvZiBpbnB1dHNbdGVhbV0pIHtcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IC8oLio/KShIT0xEfE1PVkV8U1VQUE9SVHxDT05WT1kpKC4qKS0+KC4qKS8uZXhlYyhyYXcpO1xuICAgICAgICAgICAgaWYgKG1hdGNoID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gbWF0Y2ggb3JkZXI6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICBsZXQgcmVnaW9uTmFtZSA9IG1hdGNoWzFdLnRyaW0oKTtcbiAgICAgICAgICAgIGxldCBvcCA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgbGV0IGFyZ3MgPSBtYXRjaFszXS50cmltKCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gbWF0Y2hbNF0udHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09ICdJbnZhbGlkIG9yZGVyIG9yIHN5bnRheCBlcnJvcicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGxldCByZWdpb24gPSBnYW1lLm1hcC5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmVnaW9uTmFtZSk7XG4gICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIG9yZGVyOiAke3Jhd30gYCk7XG5cbiAgICAgICAgICAgIGxldCB1bml0ID0gWy4uLmdhbWUudW5pdHNdLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24gJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgaWYgKHVuaXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChpc05ldykgZ2FtZS51bml0cy5hZGQodW5pdCA9IG5ldyBVbml0KHJlZ2lvbiwgZmxlZXRzLmhhcyhyZWdpb24pID8gVW5pdFR5cGUuV2F0ZXIgOiBVbml0VHlwZS5MYW5kLCB0ZWFtKSk7XG4gICAgICAgICAgICAgICAgZWxzZSB0aHJvdyBlcnJvcihgVW5pdCBkb2VzIG5vdCBleGlzdDogJHt0ZWFtfSAke3JlZ2lvbi5uYW1lfSBgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG9yZGVyO1xuXG4gICAgICAgICAgICBpZiAob3AgPT0gJ0hPTEQnIHx8IHJlc3VsdCA9PSAnSWxsZWdhbCBvcmRlciByZXBsYWNlZCB3aXRoIEhvbGQgb3JkZXInKSB7XG4gICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgSG9sZE9yZGVyKHVuaXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcCA9PSAnTU9WRScpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW92ZUFyZ3MgPSBhcmdzLnNwbGl0KCdWSUEnKTtcblxuICAgICAgICAgICAgICAgIGxldCByYXdUYXJnZXQgPSBtb3ZlQXJnc1swXS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB0YXJnZXQgcmVnaW9uIGZvciBtb3ZlIG9yZGVyOiAke2FyZ3N9IGApO1xuXG4gICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgTW92ZU9yZGVyKHVuaXQsIHRhcmdldCwgbW92ZUFyZ3MubGVuZ3RoID4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSAncmVzb2x2ZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkLnB1c2gob3JkZXIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcCA9PSAnU1VQUE9SVCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgW3Jhd1NyYywgcmF3RHN0XSA9IGFyZ3Muc3BsaXQoJyB0byAnKTsgLy8gJ1ggdG8gaG9sZCcgb3IgJ1ggdG8gWSdcblxuICAgICAgICAgICAgICAgIGxldCBzcmMgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1NyYyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYyA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgdGFyZ2V0IHJlZ2lvbiBmb3Igc3VwcG9ydCBvcmRlcjogJHtyYXdTcmN9IGApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJhd0RzdCA9PSAnaG9sZCcpXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IFN1cHBvcnRPcmRlcih1bml0LCBzcmMpO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZHN0ID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdEc3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCBhdHRhY2sgcmVnaW9uIGZvciBzdXBwb3J0IG9yZGVyOiAke3Jhd0RzdH0gYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgU3VwcG9ydE9yZGVyKHVuaXQsIHNyYywgZHN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdDT05WT1knKSB7XG4gICAgICAgICAgICAgICAgbGV0IFtyYXdTcmMsIHJhd0RzdF0gPSBhcmdzLnNwbGl0KCcgdG8gJyk7IC8vICdYIHRvIFknXG5cbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdTcmMpO1xuICAgICAgICAgICAgICAgIGlmIChzcmMgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHN0YXJ0IHJlZ2lvbiBmb3IgY29udm95IG9yZGVyOiAke3Jhd1NyY30gYCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZHN0ID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdEc3QpO1xuICAgICAgICAgICAgICAgIGlmIChkc3QgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIGVuZCByZWdpb24gZm9yIGNvbnZveSBvcmRlcjogJHtyYXdEc3R9IGApO1xuXG4gICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgQ29udm95T3JkZXIodW5pdCwgc3JjLCBkc3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgaW52YWxpZCBvcmRlcjogJHtvcH1gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcmRlcnMucHVzaChvcmRlcik7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IG9yZGVycywgcmVzb2x2ZWQgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlX3JldHJlYXRzKGV2aWN0ZWQ6IFVuaXRbXSwgaW5wdXRzOiBJbnB1dHMpIHtcbiAgICBsZXQgcmV0cmVhdHMgPSBbXTtcblxuICAgIGZvciAobGV0IHRlYW0gaW4gaW5wdXRzKSB7XG4gICAgICAgIGZvciAobGV0IHJhdyBvZiBpbnB1dHNbdGVhbV0pIHtcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IC8oKC4qKVJFVFJFQVQoLiopfCguKilERVNUUk9ZKVxccystPiguKikvLmV4ZWMocmF3KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIG1hdGNoIHJldHJlYXQ6ICR7cmF3fSBgKTtcblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG1hdGNoWzVdLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICAgICAgICAgIGxldCByYXdTcmMgPSBtYXRjaFsyXS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHJhd0RzdCA9IG1hdGNoWzNdLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGxldCBzcmMgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1NyYyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYyA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciByZXRyZWF0OiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCBkc3QgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd0RzdCk7XG4gICAgICAgICAgICAgICAgaWYgKGRzdCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciByZXRyZWF0OiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gZXZpY3RlZC5maW5kKHUgPT4gdS5yZWdpb24gPT0gc3JjICYmIHUudGVhbSA9PSB0ZWFtKTtcbiAgICAgICAgICAgICAgICBpZiAodW5pdCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgdW5pdCBmb3IgcmV0cmVhdDogJHtyYXd9ICR7dGVhbX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHJlYXRzLnB1c2goeyB1bml0LCB0YXJnZXQ6IGRzdCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmF3UmVnaW9uID0gbWF0Y2hbNF0udHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlZ2lvbiA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3UmVnaW9uKTtcbiAgICAgICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIHJldHJlYXQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBbLi4uZXZpY3RlZF0uZmluZCh1ID0+IHUucmVnaW9uID09IHJlZ2lvbiAmJiB1LnRlYW0gPT0gdGVhbSk7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXQgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHVuaXQgZm9yIHJldHJlYXQ6ICR7cmF3fSAke3RlYW19YCk7XG5cbiAgICAgICAgICAgICAgICByZXRyZWF0cy5wdXNoKHsgdW5pdCwgdGFyZ2V0OiBudWxsLCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0cmVhdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZV9idWlsZHMoZ2FtZTogR2FtZVN0YXRlLCBpbnB1dHM6IElucHV0cykge1xuICAgIGxldCBidWlsZHMgPSBbXTtcblxuICAgIGZvciAobGV0IHRlYW0gaW4gaW5wdXRzKSB7XG4gICAgICAgIGZvciAobGV0IHJhdyBvZiBpbnB1dHNbdGVhbV0pIHtcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IC8oQlVJTERcXHMrKGZsZWV0fGFybXkpXFxzKyguKil8KC4qKURFU1RST1kpXFxzKy0+KC4qKS8uZXhlYyhyYXcpO1xuICAgICAgICAgICAgaWYgKG1hdGNoID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gbWF0Y2ggYnVpbGQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gbWF0Y2hbNV0udHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IG1hdGNoWzJdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBsZXQgcmF3UmVnaW9uID0gbWF0Y2hbM10udHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlZ2lvbiA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3UmVnaW9uKTtcbiAgICAgICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIGJ1aWxkOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gbmV3IFVuaXQocmVnaW9uLCB0eXBlID09ICdmbGVldCcgPyBVbml0VHlwZS5XYXRlciA6IFVuaXRUeXBlLkxhbmQsIHRlYW0pO1xuXG4gICAgICAgICAgICAgICAgYnVpbGRzLnB1c2goeyB1bml0LCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByYXdSZWdpb24gPSBtYXRjaFs0XS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVnaW9uID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdSZWdpb24pO1xuICAgICAgICAgICAgICAgIGlmIChyZWdpb24gPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3IgYnVpbGQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBbLi4uZ2FtZS51bml0c10uZmluZCh1ID0+IHUucmVnaW9uID09IHJlZ2lvbiAmJiB1LnRlYW0gPT0gdGVhbSk7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9ICdyZXNvbHZlZCcpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB1bml0IGZvciBidWlsZDogJHtyYXd9ICR7dGVhbX1gKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBidWlsZHMucHVzaCh7IHVuaXQsIHJlc29sdmVkOiByZXN1bHQgPT0gJ3Jlc29sdmVkJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWlsZHM7XG59XG4iLCJpbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlLW5hdGl2ZSc7XG5cbmltcG9ydCB7IGV1cm9wZSwgUkVHSU9OUyB9IGZyb20gJy4vZGF0YSc7XG5pbXBvcnQgeyBVbml0LCBSZWdpb24sIEdhbWVTdGF0ZSwgVW5pdFR5cGUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgQW55T3JkZXIsIE1vdmVPcmRlciwgSG9sZE9yZGVyLCBTdXBwb3J0T3JkZXIsIENvbnZveU9yZGVyLCByZXNvbHZlIH0gZnJvbSAnLi9ydWxlcyc7XG5pbXBvcnQgKiBhcyBzY3JhcGUgZnJvbSAnLi9zY3JhcGUnO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tICcuL3V0aWwnO1xuXG5mdW5jdGlvbiogbWF0Y2hlcyhyZWdleDogUmVnRXhwLCB0YXJnZXQ6IHN0cmluZykge1xuICAgIGxldCBjb3B5ID0gbmV3IFJlZ0V4cChyZWdleCwgJ2cnKTtcbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKG1hdGNoID0gY29weS5leGVjKHRhcmdldCkpXG4gICAgICAgIHlpZWxkIG1hdGNoO1xufVxuXG5jb25zdCBpZ25vcmVkX2dhbWVzID0gbmV3IFNldChbMTU5NTk0LCAxNTgwOTMsIDE1MTM4NywgMTQ3NDg1LCAxNTIwNDYsIDE1MTMyNSwgMTUzMTA0LCAxNTMxNTIsIDE1MzMyMywgMTUzMzQ5LCAxNTQyNDIsIDE1NDk0NCwgMTU1NDIyLCAxNTU0NjNdKTtcbmNvbnN0IHRlYW1zID0gbmV3IFNldChbJ0VOR0xBTkQnLCAnRlJBTkNFJywgJ0dFUk1BTlknLCAnSVRBTFknLCAnQVVTVFJJQScsICdSVVNTSUEnLCAnVFVSS0VZJ10pO1xuXG5jb25zdCB0b3RhbHMgPSB7IGNoZWNrZWQ6IDAsIHNraXBwZWRfdmlhOiAwLCBza2lwcGVkX3RlYW06IDAgfTtcblxuZnVuY3Rpb24gcnVuX2dhbWUoaWQ6IG51bWJlciwgdHVybnM6IHNjcmFwZS5UdXJuW10pIHtcbiAgICBsZXQgZ2FtZSA9IG5ldyBHYW1lU3RhdGUoZXVyb3BlLCBbXSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHR1cm5zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHByb2Nlc3NpbmcgJHtpICUgMiA/ICdmYWxsJyA6ICdzcHJpbmcnfSAkezE5MDEgKyBNYXRoLmZsb29yKGkgLyAyKX1gKTtcblxuICAgICAgICBsZXQgcmVtb3RlID0gc2NyYXBlLnBhcnNlX29yZGVycyhnYW1lLCB0dXJuc1tpXS5vcmRlcnMpO1xuICAgICAgICBsZXQgb3JkZXJzID0gcmVtb3RlLm9yZGVycy5zbGljZSgpO1xuXG4gICAgICAgIGlmIChvcmRlcnMuZmluZChvID0+IG8udHlwZSA9PSAnbW92ZScgJiYgby5yZXF1aXJlQ29udm95KSkge1xuICAgICAgICAgICAgKyt0b3RhbHMuc2tpcHBlZF92aWE7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgc2tpcHBpbmcgJHtpZH0gLSBmb3VuZCBWSUEgQ09OVk9ZICgke3RvdGFscy5za2lwcGVkX3ZpYX0gdG90YWwpYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgeCA9IFsuLi5nYW1lLnVuaXRzXS5maW5kKHUgPT4gIXRlYW1zLmhhcyh1LnRlYW0pKTtcbiAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBza2lwcGluZyAke2lkfSAtIGZvdW5kIHRlYW0gJHt4LnRlYW19ICgke3RvdGFscy5za2lwcGVkX3RlYW19IHRvdGFsKWApO1xuICAgICAgICAgICAgKyt0b3RhbHMuc2tpcHBlZF90ZWFtO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgdW5pdCBvZiBnYW1lLnVuaXRzKSB7XG4gICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnMuZmluZChvID0+IG8udW5pdCA9PSB1bml0KTtcbiAgICAgICAgICAgIGlmIChvcmRlcikgY29udGludWU7XG4gICAgICAgICAgICBvcmRlcnMucHVzaChuZXcgSG9sZE9yZGVyKHVuaXQpKVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGxvY2FsID0gcmVzb2x2ZShvcmRlcnMpO1xuXG4gICAgICAgIGZvciAobGV0IG1vdmUgb2YgbG9jYWwucmVzb2x2ZWQpIHtcbiAgICAgICAgICAgIGlmICghZ2FtZS51bml0cy5oYXMobW92ZS51bml0KSkgZGVidWdnZXI7XG4gICAgICAgICAgICBnYW1lLnVuaXRzLmRlbGV0ZShtb3ZlLnVuaXQpO1xuICAgICAgICAgICAgZ2FtZS51bml0cy5hZGQobmV3IFVuaXQobW92ZS50YXJnZXQsIG1vdmUudW5pdC50eXBlLCBtb3ZlLnVuaXQudGVhbSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgb3JkZXIgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScpIHtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwucmVzb2x2ZWQuaW5jbHVkZXMob3JkZXIpICE9IHJlbW90ZS5yZXNvbHZlZC5pbmNsdWRlcyhvcmRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFpciBvZiBsb2NhbC5yZWFzb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtwYWlyWzBdfTogJHtwYWlyWzFdfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9yZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoYE1pc21hdGNoIGluIGdhbWUgJHtpZH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAobG9jYWwuZXZpY3RlZC5sZW5ndGggPT0gMCAhPSAhdHVybnNbaV0ucmV0cmVhdHMpIHtcbiAgICAgICAgLy8gICAgIHRocm93IGVycm9yKGBNaXNtYXRjaCBpbiBnYW1lICR7aWR9YCk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAobG9jYWwuZXZpY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBldmljdGVkID0gbmV3IFNldChsb2NhbC5ldmljdGVkKTtcbiAgICAgICAgICAgIGxldCByZXRyZWF0cyA9IHNjcmFwZS5wYXJzZV9yZXRyZWF0cyhsb2NhbC5ldmljdGVkLCB0dXJuc1tpXS5yZXRyZWF0cyEpO1xuICAgICAgICAgICAgZm9yIChsZXQgcmV0cmVhdCBvZiByZXRyZWF0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXRyZWF0LnJlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXRyZWF0LnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUubW92ZShyZXRyZWF0LnVuaXQsIHJldHJlYXQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS51bml0cy5kZWxldGUocmV0cmVhdC51bml0KTtcbiAgICAgICAgICAgICAgICAgICAgZXZpY3RlZC5kZWxldGUocmV0cmVhdC51bml0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCB1bml0IG9mIGV2aWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBnYW1lLnVuaXRzLmRlbGV0ZSh1bml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpICUgMiA9PSAxKSB7XG4gICAgICAgICAgICBsZXQgYnVpbGRzID0gc2NyYXBlLnBhcnNlX2J1aWxkcyhnYW1lLCB0dXJuc1tpXS5idWlsZHMhKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgYnVpbGQgb2YgYnVpbGRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJ1aWxkLnJlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnYW1lLnVuaXRzLmhhcyhidWlsZC51bml0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKGJ1aWxkLnVuaXQpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnVuaXRzLmFkZChidWlsZC51bml0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByZWdpb24gb2YgZ2FtZS5tYXAucmVnaW9ucykge1xuICAgICAgICAgICAgbGV0IHVuaXRzID0gWy4uLmdhbWUudW5pdHNdLmZpbHRlcih1ID0+IHUucmVnaW9uID09IHJlZ2lvbik7XG4gICAgICAgICAgICBpZiAodW5pdHMubGVuZ3RoID4gMSkgdGhyb3cgZXJyb3IoYE1pc21hdGNoIGluIGdhbWUgJHtpZH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICsrdG90YWxzLmNoZWNrZWQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICBmcy5ta2RpcnBTeW5jKCdkYXRhJyk7XG4gICAgZnMubWtkaXJwU3luYygnY2FjaGUnKTtcblxuICAgIC8vIGxldCBnYW1lID0gc2NyYXBlLnJlYWRfZ2FtZShmcy5yZWFkRmlsZVN5bmMoYGRhdGEvMTU1MjcwYCkpO1xuICAgIC8vIHJ1bl9nYW1lKDE1NTI3MCwgZ2FtZSk7XG5cbiAgICBsZXQgYWxsSWRzID0gZnMucmVhZGRpclN5bmMoJ2RhdGEnKTtcblxuICAgIGZvciAobGV0IGlkIG9mIGFsbElkcykge1xuICAgICAgICBpZiAoaWQgPT0gJ2tub3duLmpzb24nKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlnbm9yZWRfZ2FtZXMuaGFzKHBhcnNlSW50KGlkKSkpIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGBwcm9jZXNzaW5nIGdhbWUgJHtpZH1gKTtcblxuICAgICAgICBsZXQgZ2FtZSA9IHNjcmFwZS5yZWFkX2dhbWUoZnMucmVhZEZpbGVTeW5jKGBkYXRhLyR7aWR9YCkpO1xuICAgICAgICBydW5fZ2FtZShwYXJzZUludChpZCksIGdhbWUpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKHRvdGFscyk7XG59XG5cbmxldCB4ID0gZ2xvYmFsO1xuXG5pZiAoeC5kZXZ0b29sc0Zvcm1hdHRlcnMgPT0gbnVsbCkgeC5kZXZ0b29sc0Zvcm1hdHRlcnMgPSBbXTtcbnguZGV2dG9vbHNGb3JtYXR0ZXJzLnB1c2goe1xuICAgIGhlYWRlcihvYmosIGNvbmZpZykge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTW92ZU9yZGVyIHx8IG9iaiBpbnN0YW5jZW9mIEhvbGRPcmRlciB8fCBvYmogaW5zdGFuY2VvZiBTdXBwb3J0T3JkZXIgfHwgb2JqIGluc3RhbmNlb2YgQ29udm95T3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBvYmoudG9TdHJpbmcoKV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgVW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai50ZWFtfSAke29iai50eXBlID09IFVuaXRUeXBlLldhdGVyID8gJ2ZsZWV0JyA6ICdhcm15J30gaW4gJHtvYmoucmVnaW9uLm5hbWV9YF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGhhc0JvZHkob2JqLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyByZXR1cm4gb2JqIGluc3RhbmNlb2YgT3JkZXJCYXNlO1xuICAgIH0sXG4gICAgYm9keShvYmosIGNvbmZpZykge1xuICAgICAgICAvLyBsZXQgY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgLy8gZm9yIChsZXQga2V5IGluIG9iaikge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gcmV0dXJuIFtcbiAgICAgICAgLy8gICAgICdvbCcsXG4gICAgICAgIC8vICAgICB7fSxcbiAgICAgICAgLy8gXVxuICAgIH1cbn0pO1xuXG5sZXQgb3AgPSBwcm9jZXNzLmFyZ3ZbMl07XG5cbmlmIChvcCA9PSAnc2NyYXBlJylcbiAgICBzY3JhcGUucnVuKCk7XG5lbHNlIGlmIChvcCA9PSAnY2hlY2snKVxuICAgIHNjcmFwZS5jaGVjaygpO1xuZWxzZSBpZiAob3AgPT0gJ3J1bicpXG4gICAgcnVuKCk7XG5lbHNlIHtcbiAgICBjb25zb2xlLmxvZygndW5rbm93biBvciBtaXNzaW5nIGNvbW1hbmQnKVxufVxuIl0sIm5hbWVzIjpbInNjcmFwZS5wYXJzZV9vcmRlcnMiLCJzY3JhcGUucGFyc2VfcmV0cmVhdHMiLCJzY3JhcGUucGFyc2VfYnVpbGRzIiwicnVuIiwic2NyYXBlLnJlYWRfZ2FtZSIsInNjcmFwZS5ydW4iLCJzY3JhcGUuY2hlY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQWEsTUFBTTtJQUlmLFlBQ2EsRUFBVSxFQUNWLElBQVksRUFDWixJQUFjO1FBRmQsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixTQUFJLEdBQUosSUFBSSxDQUFVO1FBTmxCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzdCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0tBTWpDO0lBRUwsSUFB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QUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUd0QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7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LFNBQVM7WUFDOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUI7S0FDSjtDQUNKO0FBRUQsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbkMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRTdDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0IsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzdELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbEMsQUFBTyxNQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUU3ZCxBQUFPLE1BQU0sT0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxF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
