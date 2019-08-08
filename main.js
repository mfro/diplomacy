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
}
class MoveOrder {
    constructor(unit, target, requireConvoy) {
        this.unit = unit;
        this.target = target;
        this.requireConvoy = requireConvoy;
        this.type = 'move';
    }
}
class SupportOrder {
    constructor(unit, target, attack) {
        this.unit = unit;
        this.target = target;
        this.attack = attack;
        this.type = 'support';
    }
}
class ConvoyOrder {
    constructor(unit, start, end) {
        this.unit = unit;
        this.start = start;
        this.end = end;
        this.type = 'convoy';
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
    let checked = new Set();
    let passed = new Set();
    let stack = [];
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
        try {
            stack.push(order);
            if (order.type == 'hold') {
                passed.add(order);
                return true;
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
                        if (currentRoutes != null && currentRoutes.convoys.length == 0 && routes.convoys.length == 0) {
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
                if (best.length != 1)
                    return false;
                if (best[0] != order)
                    return false;
                if (current && best[0] != forceResolved) {
                    if (current.type == 'move' && Region.areSame(current.target, best[0].unit.region)) {
                        if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                            return false;
                        let currentAttack = findMoveSupport(current).filter(o => o.unit.team != best[0].unit.team);
                        if (currentAttack.length == dislodgeStrength)
                            return false;
                        if (currentAttack.length > dislodgeStrength)
                            throw error('Failed to filter out dislodged attack');
                    }
                    else if (current.type != 'move' || !resolve(current)) {
                        if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                            return false;
                        if (findHoldSupport(current).length >= dislodgeStrength)
                            return false;
                    }
                }
                passed.add(order);
                return true;
            }
            if (order.type == 'convoy') {
                if (order.unit.region.type != UnitType.Water)
                    return false;
                let target = orders.find(o => o.type == 'move'
                    && Region.areSame(o.unit.region, order.start)
                    && Region.areSame(o.target, order.end));
                if (target == null)
                    return false;
                for (let attack of orders) {
                    if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                        continue;
                    if (resolve(attack))
                        return false;
                }
                passed.add(order);
                return true;
            }
            if (order.type == 'support') {
                let supportee = orders.find(o => Region.areSame(o.unit.region, order.target));
                if (supportee == null)
                    return false;
                if (order.attack) {
                    if (supportee.type != 'move'
                        || !canReach(order.unit, order.attack)
                        || !Region.areEqual(supportee.target, order.attack))
                        return false;
                }
                else {
                    if (supportee.type == 'move'
                        || !canReach(order.unit, order.target))
                        return false;
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
                            if (findMoveSupport(attack).length > findHoldSupport(order).length)
                                return false;
                        }
                        else {
                            // if it is convoyed by the target region of the supported attack,
                            // it can only cut support if it has an alternate path
                            let routes = findRoutes(attack, supportee.target);
                            if (routes != null)
                                return false;
                        }
                    }
                    else {
                        let routes = findRoutes(attack);
                        if (routes != null)
                            return false;
                    }
                }
                passed.add(order);
                return true;
            }
            throw error(`Invalid order`);
        }
        finally {
            stack.pop();
        }
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
    return { resolved, evicted };
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
            for (let match of matches(/<a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)/, content)) {
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
    return JSON.parse(data.toString('utf8'));
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
                for (let _ of matches(/<a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)/, content)) {
                    found = true;
                    break;
                }
                if (!found)
                    continue;
                ++turns;
            }
            if (turns != game.length || turns == 0)
                throw error(`Mismatch: ${id} ${turns} ${game.length}`);
            let builds = 0;
            let retreats = 0;
            for (let i = 0; i < game.length; ++i) {
                if (game[i].builds)
                    builds++;
                if (game[i].retreats)
                    retreats++;
            }
            if (builds == 0 || retreats == 0) {
                let game = yield get_game(parseInt(id));
                let data = write_game(game);
                fs.writeFileSync(`data/${id}`, data);
                console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns} *`);
            }
            else {
                console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns}`);
            }
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
            if (op == 'HOLD') {
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

function run_game(id, turns) {
    let game = new GameState(europe, []);
    for (let i = 0; i < turns.length; ++i) {
        console.debug(`processing ${i % 2 ? 'fall' : 'spring'} ${1901 + Math.floor(i / 2)}`);
        let remote = parse_orders(game, turns[i].orders);
        let orders = remote.orders.slice();
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
}
function run$1() {
    return __awaiter(this, void 0, void 0, function* () {
        fs.mkdirpSync('data');
        fs.mkdirpSync('cache');
        let allIds = fs.readdirSync('data');
        for (let id of allIds) {
            if (id == 'known.json')
                continue;
            console.log(`processing game ${id}`);
            let game = read_game(fs.readFileSync(`data/${id}`));
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
                        throw error(`missing orders: ${id} ${game.indexOf(turn)}`);
                    game.pop();
                    break;
                }
            }
            run_game(parseInt(id), game);
        }
    });
}
let x = global;
if (x.devtoolsFormatters == null)
    x.devtoolsFormatters = [];
x.devtoolsFormatters.push({
    header(obj, config) {
        if (obj instanceof MoveOrder) {
            let text = `${obj.unit.team} ${obj.unit.region.name} move -> ${obj.target.name}`;
            if (obj.requireConvoy)
                text += ` via convoy`;
            return ["span", {}, text];
        }
        if (obj instanceof HoldOrder) {
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} hold`];
        }
        if (obj instanceof SupportOrder) {
            if (obj.attack)
                return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} support ${obj.target.name} -> ${obj.attack.name}`];
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} support ${obj.target.name} hold`];
        }
        if (obj instanceof ConvoyOrder) {
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} convoy ${obj.start.name} -> ${obj.end.name}`];
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
//# sourceMappingURL=main.js.map
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2dhbWUudHMiLCJzcmMvZGF0YS50cyIsInNyYy91dGlsLnRzIiwic3JjL3J1bGVzLnRzIiwic3JjL3NjcmFwZS50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZWdpb24ge1xuICAgIHJlYWRvbmx5IGF0dGFjaGVkID0gbmV3IFNldDxSZWdpb24+KCk7XG4gICAgcmVhZG9ubHkgYWRqYWNlbnQgPSBuZXcgU2V0PFJlZ2lvbj4oKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHR5cGU6IFVuaXRUeXBlLFxuICAgICkgeyB9XG5cbiAgICBnZXQgYWxsQWRqYWNlbnQoKSB7XG4gICAgICAgIGxldCBsaXN0ID0gWy4uLnRoaXMuYWRqYWNlbnRdO1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICAgIGxpc3QucHVzaCguLi5ub2RlLmFkamFjZW50KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBub2RlIG9mIGxpc3Quc2xpY2UoKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKC4uLm5vZGUuYXR0YWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIGdldCBpc1Nob3JlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdGhpcy5hbGxBZGphY2VudC5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXJlU2FtZShsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHMgfHwgbGhzLmF0dGFjaGVkLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhcmVFcXVhbChsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHM7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBVbml0VHlwZSB7XG4gICAgTGFuZCxcbiAgICBXYXRlcixcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSByZWdpb246IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogVW5pdFR5cGUsXG4gICAgICAgIHJlYWRvbmx5IHRlYW06IHN0cmluZyxcbiAgICApIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZU1hcCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHJlZ2lvbnM6IFJlZ2lvbltdLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU3RhdGUge1xuICAgIHJlYWRvbmx5IHVuaXRzID0gbmV3IFNldDxVbml0PigpO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IG1hcDogR2FtZU1hcCxcbiAgICAgICAgcmVhZG9ubHkgdGVhbXM6IHN0cmluZ1tdLFxuICAgICkgeyB9XG5cbiAgICBtb3ZlKHVuaXQ6IFVuaXQsIHRhcmdldDogUmVnaW9uKSB7XG4gICAgICAgIHRoaXMudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICB0aGlzLnVuaXRzLmFkZChuZXcgVW5pdCh0YXJnZXQsIHVuaXQudHlwZSwgdW5pdC50ZWFtKSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVnaW9uLCBHYW1lTWFwLCBVbml0VHlwZSB9IGZyb20gJy4vZ2FtZSc7XG5cbmNvbnN0IExBTkQgPSBVbml0VHlwZS5MYW5kO1xuY29uc3QgV0FURVIgPSBVbml0VHlwZS5XYXRlcjtcblxuZnVuY3Rpb24gbihpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGU6IFVuaXRUeXBlKTogUmVnaW9uIHtcbiAgICByZXR1cm4gbmV3IFJlZ2lvbihpZCwgbmFtZSwgdHlwZSk7XG59XG5cbi8vIGF1c3RyaWFcbmxldCBCT0ggPSBuKCdCT0gnLCAnQm9oZW1pYScsIExBTkQpO1xubGV0IEJVRCA9IG4oJ0JVRCcsICdCdWRhcGVzdCcsIExBTkQpO1xubGV0IEdBTCA9IG4oJ0dBTCcsICdHYWxpY2lhJywgTEFORCk7XG5sZXQgVFJJID0gbignVFJJJywgJ1RyaWVzdGUnLCBMQU5EKTtcbmxldCBUWVIgPSBuKCdUWVInLCAnVHlyb2xpYScsIExBTkQpO1xubGV0IFZJRSA9IG4oJ1ZJRScsICdWaWVubmEnLCBMQU5EKTtcblxuLy8gZW5nbGFuZFxubGV0IENMWSA9IG4oJ0NMWScsICdDbHlkZScsIExBTkQpO1xubGV0IEVESSA9IG4oJ0VESScsICdFZGluYnVyZ2gnLCBMQU5EKTtcbmxldCBMVlAgPSBuKCdMVlAnLCAnTGl2ZXJwb29sJywgTEFORCk7XG5sZXQgTE9OID0gbignTE9OJywgJ0xvbmRvbicsIExBTkQpO1xubGV0IFdBTCA9IG4oJ1dBTCcsICdXYWxlcycsIExBTkQpO1xubGV0IFlPUiA9IG4oJ1lPUicsICdZb3Jrc2hpcmUnLCBMQU5EKTtcblxuLy8gZnJhbmNlXG5sZXQgQlJFID0gbignQlJFJywgJ0JyZXN0JywgTEFORCk7XG5sZXQgQlVSID0gbignQlVSJywgJ0J1cmd1bmR5JywgTEFORCk7XG5sZXQgR0FTID0gbignR0FTJywgJ0dhc2NvbnknLCBMQU5EKTtcbmxldCBNQVIgPSBuKCdNQVInLCAnTWFyc2VpbGxlcycsIExBTkQpO1xubGV0IFBBUiA9IG4oJ1BBUicsICdQYXJpcycsIExBTkQpO1xubGV0IFBJQyA9IG4oJ1BJQycsICdQaWNhcmR5JywgTEFORCk7XG5cbi8vIGdlcm1hbnlcbmxldCBCRVIgPSBuKCdCRVInLCAnQmVybGluJywgTEFORCk7XG5sZXQgS0lFID0gbignS0lFJywgJ0tpZWwnLCBMQU5EKTtcbmxldCBNVU4gPSBuKCdNVU4nLCAnTXVuaWNoJywgTEFORCk7XG5sZXQgUFJVID0gbignUFJVJywgJ1BydXNzaWEnLCBMQU5EKTtcbmxldCBSVUggPSBuKCdSVUgnLCAnUnVocicsIExBTkQpO1xubGV0IFNJTCA9IG4oJ1NJTCcsICdTaWxlc2lhJywgTEFORCk7XG5cbi8vIGl0YWx5XG5sZXQgQVBVID0gbignQVBVJywgJ0FwdWxpYScsIExBTkQpO1xubGV0IE5BUCA9IG4oJ05BUCcsICdOYXBsZXMnLCBMQU5EKTtcbmxldCBQSUUgPSBuKCdQSUUnLCAnUGllZG1vbnQnLCBMQU5EKTtcbmxldCBST00gPSBuKCdST00nLCAnUm9tZScsIExBTkQpO1xubGV0IFRVUyA9IG4oJ1RVUycsICdUdXNjYW55JywgTEFORCk7XG5sZXQgVkVOID0gbignVkVOJywgJ1ZlbmljZScsIExBTkQpO1xuXG4vLyBydXNzaWFcbmxldCBGSU4gPSBuKCdGSU4nLCAnRmlubGFuZCcsIExBTkQpO1xubGV0IExWTiA9IG4oJ0xWTicsICdMaXZvbmlhJywgTEFORCk7XG5sZXQgTU9TID0gbignTU9TJywgJ01vc2NvdycsIExBTkQpO1xubGV0IFNFViA9IG4oJ1NFVicsICdTZXZhc3RvcG9sJywgTEFORCk7XG5sZXQgU1RQID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnJywgTEFORCk7XG5sZXQgVUtSID0gbignVUtSJywgJ1VrcmFpbmUnLCBMQU5EKTtcbmxldCBXQVIgPSBuKCdXQVInLCAnV2Fyc2F3JywgTEFORCk7XG5cbi8vIHR1cmtleVxubGV0IEFOSyA9IG4oJ0FOSycsICdBbmthcmEnLCBMQU5EKTtcbmxldCBBUk0gPSBuKCdBUk0nLCAnQXJtZW5pYScsIExBTkQpO1xubGV0IENPTiA9IG4oJ0NPTicsICdDb25zdGFudGlub3BsZScsIExBTkQpO1xubGV0IFNNWSA9IG4oJ1NNWScsICdTbXlybmEnLCBMQU5EKTtcbmxldCBTWVIgPSBuKCdTWVInLCAnU3lyaWEnLCBMQU5EKTtcblxuLy8gbmV1dHJhbFxubGV0IEFMQiA9IG4oJ0FMQicsICdBbGJhbmlhJywgTEFORCk7XG5sZXQgQkVMID0gbignQkVMJywgJ0JlbGdpdW0nLCBMQU5EKTtcbmxldCBCVUwgPSBuKCdCVUwnLCAnQnVsZ2FyaWEnLCBMQU5EKTtcbmxldCBERU4gPSBuKCdERU4nLCAnRGVubWFyaycsIExBTkQpO1xubGV0IEdSRSA9IG4oJ0dSRScsICdHcmVlY2UnLCBMQU5EKTtcbmxldCBIT0wgPSBuKCdIT0wnLCAnSG9sbGFuZCcsIExBTkQpO1xubGV0IE5XWSA9IG4oJ05XWScsICdOb3J3YXknLCBMQU5EKTtcbmxldCBOQUYgPSBuKCdOQUYnLCAnTm9ydGggQWZyaWNhJywgTEFORCk7XG5sZXQgUE9SID0gbignUE9SJywgJ1BvcnR1Z2FsJywgTEFORCk7XG5sZXQgUlVNID0gbignUlVNJywgJ1J1bWFuaWEnLCBMQU5EKTtcbmxldCBTRVIgPSBuKCdTRVInLCAnU2VyYmlhJywgTEFORCk7XG5sZXQgU1BBID0gbignU1BBJywgJ1NwYWluJywgTEFORCk7XG5sZXQgU1dFID0gbignU1dFJywgJ1N3ZWRlbicsIExBTkQpO1xubGV0IFRVTiA9IG4oJ1RVTicsICdUdW5pcycsIExBTkQpO1xuXG4vLyB3YXRlclxubGV0IEFEUiA9IG4oJ0FEUicsICdBZHJpYXRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQUVHID0gbignQUVHJywgJ0FlZ2VhbiBTZWEnLCBXQVRFUik7XG5sZXQgQkFMID0gbignQkFMJywgJ0JhbHRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQkFSID0gbignQkFSJywgJ0JhcmVudHMgU2VhJywgV0FURVIpO1xubGV0IEJMQSA9IG4oJ0JMQScsICdCbGFjayBTZWEnLCBXQVRFUik7XG5sZXQgRUFTID0gbignRUFTJywgJ0Vhc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcbmxldCBFTkcgPSBuKCdFTkcnLCAnRW5nbGlzaCBDaGFubmVsJywgV0FURVIpO1xubGV0IEJPVCA9IG4oJ0JPVCcsICdHdWxmIG9mIEJvdGhuaWEnLCBXQVRFUik7XG5sZXQgR09MID0gbignR09MJywgJ0d1bGYgb2YgTHlvbicsIFdBVEVSKTtcbmxldCBIRUwgPSBuKCdIRUwnLCAnSGVsZ29sYW5kIEJpZ2h0JywgV0FURVIpO1xubGV0IElPTiA9IG4oJ0lPTicsICdJb25pYW4gU2VhJywgV0FURVIpO1xubGV0IElSSSA9IG4oJ0lSSScsICdJcmlzaCBTZWEnLCBXQVRFUik7XG5sZXQgTUlEID0gbignTUlEJywgJ01pZC1BdGxhbnRpYyBPY2VhbicsIFdBVEVSKTtcbmxldCBOQVQgPSBuKCdOQVQnLCAnTm9ydGggQXRsYW50aWMgT2NlYW4nLCBXQVRFUik7XG5sZXQgTlRIID0gbignTlRIJywgJ05vcnRoIFNlYScsIFdBVEVSKTtcbmxldCBOUkcgPSBuKCdOUkcnLCAnTm9yd2VnaWFuIFNlYScsIFdBVEVSKTtcbmxldCBTS0EgPSBuKCdTS0EnLCAnU2thZ2VycmFjaycsIFdBVEVSKTtcbmxldCBUWU4gPSBuKCdUWU4nLCAnVHlycmhlbmlhbiBTZWEnLCBXQVRFUik7XG5sZXQgV0VTID0gbignV0VTJywgJ1dlc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcblxubGV0IFNUUF9OT1JUSCA9IG4oJ1NUUCcsICdTdC4gUGV0ZXJzYnVyZyAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1RQX1NPVVRIID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IFNQQV9OT1JUSCA9IG4oJ1NQQScsICdTcGFpbiAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1BBX1NPVVRIID0gbignU1BBJywgJ1NwYWluIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IEJVTF9OT1JUSCA9IG4oJ0JVTCcsICdCdWxnYXJpYSAoRWFzdCBDb2FzdCknLCBMQU5EKTtcbmxldCBCVUxfU09VVEggPSBuKCdCVUwnLCAnQnVsZ2FyaWEgKFNvdXRoIENvYXN0KScsIExBTkQpO1xuXG5mdW5jdGlvbiBib3JkZXIobm9kZTogUmVnaW9uLCBhZGphY2VudDogUmVnaW9uW10pIHtcbiAgICBmb3IgKGxldCBvdGhlciBvZiBhZGphY2VudClcbiAgICAgICAgbm9kZS5hZGphY2VudC5hZGQob3RoZXIpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2gobm9kZTogUmVnaW9uLCBhdHRhY2hlZDogUmVnaW9uW10pIHtcbiAgICBsZXQgYWxsID0gW25vZGUsIC4uLmF0dGFjaGVkXTtcbiAgICBmb3IgKGxldCByZWdpb24gb2YgYWxsKSB7XG4gICAgICAgIGZvciAobGV0IG90aGVyIG9mIGFsbCkge1xuICAgICAgICAgICAgaWYgKG90aGVyID09IHJlZ2lvbikgY29udGludWU7XG4gICAgICAgICAgICByZWdpb24uYXR0YWNoZWQuYWRkKG90aGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYm9yZGVyKFNUUF9OT1JUSCwgW0JBUiwgTldZXSk7XG5hdHRhY2goU1RQLCBbU1RQX1NPVVRILCBTVFBfTk9SVEhdKTtcbmJvcmRlcihTVFBfU09VVEgsIFtCT1QsIExWTiwgRklOXSk7XG5cbmJvcmRlcihCVUxfTk9SVEgsIFtCTEEsIENPTiwgUlVNXSk7XG5hdHRhY2goQlVMLCBbQlVMX1NPVVRILCBCVUxfTk9SVEhdKTtcbmJvcmRlcihCVUxfU09VVEgsIFtBRUcsIEdSRSwgQ09OXSk7XG5cbmJvcmRlcihTUEFfTk9SVEgsIFtNSUQsIFBPUiwgR0FTXSk7XG5hdHRhY2goU1BBLCBbU1BBX1NPVVRILCBTUEFfTk9SVEhdKTtcbmJvcmRlcihTUEFfU09VVEgsIFtHT0wsIFdFUywgTUlELCBQT1IsIE1BUl0pO1xuXG5ib3JkZXIoTkFULCBbTlJHLCBDTFksIExWUCwgSVJJLCBNSURdKTtcbmJvcmRlcihOUkcsIFtCQVIsIE5XWSwgTlRILCBFREksIENMWSwgTkFUXSk7XG5ib3JkZXIoQ0xZLCBbTlJHLCBFREksIExWUCwgTkFUXSk7XG5ib3JkZXIoTFZQLCBbQ0xZLCBFREksIFlPUiwgV0FMLCBJUkksIE5BVF0pO1xuYm9yZGVyKElSSSwgW05BVCwgTFZQLCBXQUwsIEVORywgTUlEXSk7XG5ib3JkZXIoTUlELCBbTkFULCBJUkksIEVORywgQlJFLCBHQVMsIFBPUiwgV0VTLCBOQUYsIFNQQV9OT1JUSCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoQkFSLCBbTlJHLCBOV1ksIFNUUF9OT1JUSF0pO1xuYm9yZGVyKE5XWSwgW05SRywgQkFSLCBTVFAsIEZJTiwgU1dFLCBTS0EsIE5USCwgU1RQX05PUlRIXSk7XG5ib3JkZXIoTlRILCBbTlJHLCBOV1ksIFNLQSwgREVOLCBIRUwsIEhPTCwgQkVMLCBFTkcsIExPTiwgWU9SLCBFREldKTtcbmJvcmRlcihFREksIFtOUkcsIE5USCwgWU9SLCBMVlAsIENMWV0pO1xuYm9yZGVyKFlPUiwgW0VESSwgTlRILCBMT04sIFdBTCwgTFZQXSk7XG5ib3JkZXIoV0FMLCBbTFZQLCBZT1IsIExPTiwgRU5HLCBJUkldKTtcbmJvcmRlcihFTkcsIFtJUkksIFdBTCwgTE9OLCBOVEgsIEJFTCwgUElDLCBCUkUsIE1JRF0pO1xuYm9yZGVyKEJSRSwgW0VORywgUElDLCBQQVIsIEdBUywgTUlEXSk7XG5ib3JkZXIoR0FTLCBbQlJFLCBQQVIsIEJVUiwgTUFSLCBTUEEsIE1JRF0pO1xuYm9yZGVyKFNQQSwgW0dBUywgTUFSLCBQT1JdKTtcbmJvcmRlcihQT1IsIFtNSUQsIFNQQSwgU1BBX05PUlRILCBTUEFfU09VVEhdKTtcbmJvcmRlcihXRVMsIFtHT0wsIFRZTiwgVFVOLCBOQUYsIE1JRCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoTkFGLCBbTUlELCBXRVMsIFRVTl0pO1xuYm9yZGVyKFNUUCwgW05XWSwgTU9TLCBMVk4sIEZJTl0pO1xuYm9yZGVyKFNXRSwgW05XWSwgRklOLCBCT1QsIEJBTCwgREVOLCBTS0FdKTtcbmJvcmRlcihGSU4sIFtOV1ksIFNUUCwgQk9ULCBTV0UsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKFNLQSwgW05XWSwgU1dFLCBERU4sIE5USF0pO1xuYm9yZGVyKERFTiwgW1NLQSwgU1dFLCBCQUwsIEtJRSwgSEVMLCBOVEhdKTtcbmJvcmRlcihIRUwsIFtOVEgsIERFTiwgS0lFLCBIT0xdKTtcbmJvcmRlcihIT0wsIFtOVEgsIEhFTCwgS0lFLCBSVUgsIEJFTF0pO1xuYm9yZGVyKEJFTCwgW0VORywgTlRILCBIT0wsIFJVSCwgQlVSLCBQSUNdKTtcbmJvcmRlcihMT04sIFtZT1IsIE5USCwgRU5HLCBXQUxdKTtcbmJvcmRlcihQSUMsIFtFTkcsIEJFTCwgQlVSLCBQQVIsIEJSRV0pO1xuYm9yZGVyKFBBUiwgW1BJQywgQlVSLCBHQVMsIEJSRV0pO1xuYm9yZGVyKEdBUywgW0JSRSwgUEFSLCBCVVIsIE1BUiwgU1BBLCBNSUQsIFNQQV9OT1JUSF0pO1xuYm9yZGVyKEJVUiwgW1BBUiwgUElDLCBCRUwsIFJVSCwgTVVOLCBNQVIsIEdBU10pO1xuYm9yZGVyKE1BUiwgW0dBUywgQlVSLCBQSUUsIEdPTCwgU1BBLCBTUEFfU09VVEhdKTtcbmJvcmRlcihHT0wsIFtNQVIsIFBJRSwgVFVTLCBUWU4sIFdFUywgU1BBX1NPVVRIXSk7XG5ib3JkZXIoVFlOLCBbVFVTLCBST00sIE5BUCwgSU9OLCBUVU4sIFdFUywgR09MXSk7XG5ib3JkZXIoVFVOLCBbV0VTLCBUWU4sIElPTiwgTkFGXSk7XG5ib3JkZXIoTU9TLCBbU1RQLCBTRVYsIFVLUiwgV0FSLCBMVk5dKTtcbmJvcmRlcihMVk4sIFtCT1QsIFNUUCwgTU9TLCBXQVIsIFBSVSwgQkFMLCBTVFBfU09VVEhdKTtcbmJvcmRlcihCT1QsIFtTV0UsIEZJTiwgTFZOLCBCQUwsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKEJBTCwgW0RFTiwgU1dFLCBCT1QsIExWTiwgUFJVLCBCRVIsIEtJRV0pO1xuYm9yZGVyKEtJRSwgW0hFTCwgREVOLCBCQUwsIEJFUiwgTVVOLCBSVUgsIEhPTF0pO1xuYm9yZGVyKFJVSCwgW0JFTCwgSE9MLCBLSUUsIE1VTiwgQlVSXSk7XG5ib3JkZXIoUElFLCBbVFlSLCBWRU4sIFRVUywgR09MLCBNQVJdKTtcbmJvcmRlcihUVVMsIFtQSUUsIFZFTiwgUk9NLCBUWU4sIEdPTF0pO1xuYm9yZGVyKFJPTSwgW1RVUywgVkVOLCBBUFUsIE5BUCwgVFlOXSk7XG5ib3JkZXIoTkFQLCBbUk9NLCBBUFUsIElPTiwgVFlOXSk7XG5ib3JkZXIoSU9OLCBbVFlOLCBOQVAsIEFQVSwgQURSLCBBTEIsIEdSRSwgQUVHLCBFQVMsIFRVTl0pO1xuYm9yZGVyKFNFViwgW1VLUiwgTU9TLCBBUk0sIEJMQSwgUlVNXSk7XG5ib3JkZXIoVUtSLCBbTU9TLCBTRVYsIFJVTSwgR0FMLCBXQVJdKTtcbmJvcmRlcihXQVIsIFtQUlUsIExWTiwgTU9TLCBVS1IsIEdBTCwgU0lMXSk7XG5ib3JkZXIoUFJVLCBbQkFMLCBMVk4sIFdBUiwgU0lMLCBCRVJdKTtcbmJvcmRlcihCRVIsIFtCQUwsIFBSVSwgU0lMLCBNVU4sIEtJRV0pO1xuYm9yZGVyKE1VTiwgW1JVSCwgS0lFLCBCRVIsIFNJTCwgQk9ILCBUWVIsIEJVUl0pO1xuYm9yZGVyKFRZUiwgW01VTiwgQk9ILCBWSUUsIFRSSSwgVkVOLCBQSUVdKTtcbmJvcmRlcihWRU4sIFtUWVIsIFRSSSwgQURSLCBBUFUsIFJPTSwgVFVTLCBQSUVdKTtcbmJvcmRlcihBUFUsIFtWRU4sIEFEUiwgSU9OLCBOQVAsIFJPTV0pO1xuYm9yZGVyKEFEUiwgW1ZFTiwgVFJJLCBBTEIsIElPTiwgQVBVXSk7XG5ib3JkZXIoQUxCLCBbVFJJLCBTRVIsIEdSRSwgSU9OLCBBRFJdKTtcbmJvcmRlcihHUkUsIFtBTEIsIFNFUiwgQlVMLCBBRUcsIElPTiwgQlVMX1NPVVRIXSk7XG5ib3JkZXIoQUVHLCBbR1JFLCBDT04sIFNNWSwgRUFTLCBJT04sIEJVTF9TT1VUSF0pO1xuYm9yZGVyKEVBUywgW0FFRywgU01ZLCBTWVIsIElPTl0pO1xuYm9yZGVyKEFSTSwgW1NFViwgU1lSLCBTTVksIEFOSywgQkxBXSk7XG5ib3JkZXIoQkxBLCBbUlVNLCBTRVYsIEFSTSwgQU5LLCBDT04sIEJVTF9OT1JUSF0pO1xuYm9yZGVyKFJVTSwgW0JVRCwgR0FMLCBVS1IsIFNFViwgQkxBLCBCVUwsIFNFUiwgQlVMX05PUlRIXSk7XG5ib3JkZXIoR0FMLCBbQk9ILCBTSUwsIFdBUiwgVUtSLCBSVU0sIEJVRCwgVklFXSk7XG5ib3JkZXIoU0lMLCBbQkVSLCBQUlUsIFdBUiwgR0FMLCBCT0gsIE1VTl0pO1xuYm9yZGVyKEJPSCwgW01VTiwgU0lMLCBHQUwsIFZJRSwgVFlSXSk7XG5ib3JkZXIoVklFLCBbQk9ILCBHQUwsIEJVRCwgVFJJLCBUWVJdKTtcbmJvcmRlcihUUkksIFtUWVIsIFZJRSwgQlVELCBTRVIsIEFMQiwgQURSLCBWRU5dKTtcbmJvcmRlcihTRVIsIFtCVUQsIFJVTSwgQlVMLCBHUkUsIEFMQiwgVFJJXSk7XG5ib3JkZXIoQlVMLCBbUlVNLCBDT04sIEdSRSwgU0VSXSk7XG5ib3JkZXIoQ09OLCBbQlVMLCBCTEEsIEFOSywgU01ZLCBBRUcsIEJVTF9TT1VUSCwgQlVMX05PUlRIXSk7XG5ib3JkZXIoU01ZLCBbQ09OLCBBTkssIEFSTSwgU1lSLCBFQVMsIEFFR10pO1xuYm9yZGVyKFNZUiwgW1NNWSwgQVJNLCBFQVNdKTtcbmJvcmRlcihCVUQsIFtWSUUsIEdBTCwgUlVNLCBTRVIsIFRSSV0pO1xuYm9yZGVyKEFOSywgW0JMQSwgQVJNLCBTTVksIENPTl0pO1xuXG5leHBvcnQgY29uc3QgZXVyb3BlID0gbmV3IEdhbWVNYXAoW0JPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEhdKTtcblxuZXhwb3J0IGNvbnN0IFJFR0lPTlMgPSB7IEJPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEggfTtcbiIsImV4cG9ydCBmdW5jdGlvbiBlcnJvcihtc2c6IHN0cmluZykge1xuICAgIGRlYnVnZ2VyO1xuICAgIHJldHVybiBuZXcgRXJyb3IobXNnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBtYXRjaGVzKHJlZ2V4OiBSZWdFeHAsIHRhcmdldDogc3RyaW5nKSB7XG4gICAgbGV0IGNvcHkgPSBuZXcgUmVnRXhwKHJlZ2V4LCAnZycpO1xuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAobWF0Y2ggPSBjb3B5LmV4ZWModGFyZ2V0KSlcbiAgICAgICAgeWllbGQgbWF0Y2g7XG59XG4iLCJpbXBvcnQgeyBVbml0LCBSZWdpb24sIFVuaXRUeXBlIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBPcmRlckJhc2U8VCBleHRlbmRzIHN0cmluZz4ge1xuICAgIHJlYWRvbmx5IHR5cGU6IFQsXG4gICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbn1cblxuZXhwb3J0IGNsYXNzIEhvbGRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnaG9sZCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ2hvbGQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlT3JkZXIgaW1wbGVtZW50cyBPcmRlckJhc2U8J21vdmUnPiB7XG4gICAgcmVhZG9ubHkgdHlwZSA9ICdtb3ZlJztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgdGFyZ2V0OiBSZWdpb24sXG4gICAgICAgIHJlYWRvbmx5IHJlcXVpcmVDb252b3k6IGJvb2xlYW4sXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1cHBvcnRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnc3VwcG9ydCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ3N1cHBvcnQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICAgICByZWFkb25seSB0YXJnZXQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgYXR0YWNrPzogUmVnaW9uLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb252b3lPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnY29udm95Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnY29udm95JztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgc3RhcnQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgZW5kOiBSZWdpb24sXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IHR5cGUgQW55T3JkZXIgPSBIb2xkT3JkZXIgfCBNb3ZlT3JkZXIgfCBTdXBwb3J0T3JkZXIgfCBDb252b3lPcmRlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUob3JkZXJzOiBBbnlPcmRlcltdKSB7XG4gICAgZnVuY3Rpb24gY2FuTW92ZSh1bml0OiBVbml0LCBkc3Q6IFJlZ2lvbikge1xuICAgICAgICBpZiAodW5pdC50eXBlID09IFVuaXRUeXBlLldhdGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFkamFjZW50Lmhhcyhkc3QpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkc3QudHlwZSAhPSBVbml0VHlwZS5XYXRlciAmJiAhZHN0LmlzU2hvcmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdW5pdC5yZWdpb24udHlwZSA9PSBVbml0VHlwZS5MYW5kKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNob3JlID0gWy4uLnVuaXQucmVnaW9uLmFkamFjZW50XS5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyICYmIGRzdC5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICAgICAgICAgIGlmIChzaG9yZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGRzdCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlICE9IFVuaXRUeXBlLkxhbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuUmVhY2godW5pdDogVW5pdCwgZHN0OiBSZWdpb24pIHtcbiAgICAgICAgaWYgKGNhbk1vdmUodW5pdCwgZHN0KSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGxldCBzaG9yZSA9IFsuLi5kc3QuYXR0YWNoZWRdLmZpbmQoYSA9PiB1bml0LnJlZ2lvbi5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICByZXR1cm4gc2hvcmUgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkKG9yZGVyOiBBbnlPcmRlcikge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScpIHtcbiAgICAgICAgICAgIGlmIChSZWdpb24uYXJlU2FtZShvcmRlci51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChvcmRlci51bml0LnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIgJiYgIWNhbk1vdmUob3JkZXIudW5pdCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUm91dGVzKG9yZGVyOiBNb3ZlT3JkZXIsIHNraXA/OiBSZWdpb24pIHtcbiAgICAgICAgbGV0IGNvbnZveXMgPSBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdjb252b3knXG4gICAgICAgICAgICAmJiBvLnVuaXQucmVnaW9uICE9IHNraXBcbiAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8uc3RhcnQsIG9yZGVyLnVuaXQucmVnaW9uKVxuICAgICAgICAgICAgJiYgcmVzb2x2ZShvKSkgYXMgQ29udm95T3JkZXJbXTtcblxuICAgICAgICBsZXQgdXNlZCA9IGNvbnZveXMubWFwKCgpID0+IGZhbHNlKTtcbiAgICAgICAgbGV0IG5vZGUgPSBvcmRlci51bml0O1xuXG4gICAgICAgIGxldCBwYXRoOiBDb252b3lPcmRlcltdID0gW107XG4gICAgICAgIGxldCBwYXRoczogQ29udm95T3JkZXJbXVtdID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoKCkge1xuICAgICAgICAgICAgaWYgKGNhbk1vdmUobm9kZSwgb3JkZXIudGFyZ2V0KSB8fCBwYXRoLmxlbmd0aCA+IDAgJiYgY2FuUmVhY2gobm9kZSwgb3JkZXIudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2gocGF0aC5zbGljZSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgbmV4dCA9IDA7IG5leHQgPCBjb252b3lzLmxlbmd0aDsgKytuZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZWRbbmV4dF0gfHwgIW5vZGUucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGNvbnZveXNbbmV4dF0udW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGxldCBwcmV2aW91cyA9IG5vZGU7XG4gICAgICAgICAgICAgICAgdXNlZFtuZXh0XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKGNvbnZveXNbbmV4dF0pO1xuICAgICAgICAgICAgICAgIG5vZGUgPSBjb252b3lzW25leHRdLnVuaXQ7XG5cbiAgICAgICAgICAgICAgICBzZWFyY2goKTtcblxuICAgICAgICAgICAgICAgIG5vZGUgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICBwYXRoLnBvcCgpO1xuICAgICAgICAgICAgICAgIHVzZWRbbmV4dF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlYXJjaCgpO1xuXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChvcmRlci5yZXF1aXJlQ29udm95ICYmIHBhdGhzLmZpbHRlcihhID0+IGEubGVuZ3RoID4gMCkubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4geyBjb252b3lzLCBwYXRocyB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRIb2xkU3VwcG9ydChvcmRlcjogQW55T3JkZXIpIHtcbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuXG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRNb3ZlU3VwcG9ydChvcmRlcjogTW92ZU9yZGVyKSB7XG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpc1ZhbGlkKG9yZGVyc1tpXSkpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBsZXQgZHVtcCA9IG9yZGVyc1tpXTtcbiAgICAgICAgb3JkZXJzLnNwbGljZShpLCAxLCBuZXcgSG9sZE9yZGVyKGR1bXAudW5pdCkpO1xuICAgIH1cblxuICAgIGxldCBjaGVja2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcbiAgICBsZXQgcGFzc2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcblxuICAgIGxldCBzdGFjazogQW55T3JkZXJbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIHJlc29sdmUob3JkZXI6IEFueU9yZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChzdGFja1swXSA9PSBvcmRlciAmJiBzdGFjay5ldmVyeShvID0+IG8udHlwZSA9PSAnbW92ZScpICYmIHN0YWNrLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ3JlY3Vyc2l2ZSByZXNvbHZlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hlY2tlZC5oYXMob3JkZXIpKVxuICAgICAgICAgICAgcmV0dXJuIHBhc3NlZC5oYXMob3JkZXIpO1xuICAgICAgICBjaGVja2VkLmFkZChvcmRlcik7XG5cbiAgICAgICAgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSlcbiAgICAgICAgICAgIHRocm93IGVycm9yKGByZWN1cnNpdmUgcmVzb2x2ZWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGFjay5wdXNoKG9yZGVyKTtcblxuICAgICAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ2hvbGQnKSB7XG4gICAgICAgICAgICAgICAgcGFzc2VkLmFkZChvcmRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gb3JkZXJzLmZpbmQobyA9PiBSZWdpb24uYXJlU2FtZShvLnVuaXQucmVnaW9uLCBvcmRlci50YXJnZXQpKTtcblxuICAgICAgICAgICAgICAgIGxldCBiZXN0OiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgICAgICAgICBsZXQgYmVzdERpc2xvZGdlOiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBkaXNsb2RnZVN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgICAgIGxldCBmb3JjZVJlc29sdmVkOiBNb3ZlT3JkZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBmaW5kUm91dGVzKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdXBwb3J0ID0gZmluZE1vdmVTdXBwb3J0KGF0dGFjayk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHByZXZlbnQgZGlzbG9kZ2VkIHVuaXQgZnJvbSBib3VuY2luZyB3aXRoIG90aGVyIHVuaXRzIGVudGVyaW5nIGRpc2xvZGdlcidzIHJlZ2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVuZW1pZXMgPSBzdXBwb3J0LmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJvdXRlcyA9IGZpbmRSb3V0ZXMoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJvdXRlcyAhPSBudWxsICYmIGN1cnJlbnRSb3V0ZXMuY29udm95cy5sZW5ndGggPT0gMCAmJiByb3V0ZXMuY29udm95cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50QXR0YWNrID0gZmluZE1vdmVTdXBwb3J0KGN1cnJlbnQpLmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGF0dGFjay51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXR0YWNrLmxlbmd0aCA+IGVuZW1pZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZXNvbHZlZCA9IGF0dGFjaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0Lmxlbmd0aCA+IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0ID0gW2F0dGFja107XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlbmd0aCA9IHN1cHBvcnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQubGVuZ3RoID09IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0LnB1c2goYXR0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGF0dGFjay51bml0LnRlYW0gIT0gY3VycmVudC51bml0LnRlYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbmVtaWVzID0gc3VwcG9ydC5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZW1pZXMubGVuZ3RoID4gZGlzbG9kZ2VTdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZSA9IFthdHRhY2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2xvZGdlU3RyZW5ndGggPSBlbmVtaWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW5lbWllcy5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZS5wdXNoKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmVzdC5sZW5ndGggIT0gMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJlc3RbMF0gIT0gb3JkZXIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGJlc3RbMF0gIT0gZm9yY2VSZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYmVzdFswXS51bml0LnJlZ2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiZXN0RGlzbG9kZ2UubGVuZ3RoICE9IDEgfHwgYmVzdFswXSAhPSBiZXN0RGlzbG9kZ2VbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEF0dGFjayA9IGZpbmRNb3ZlU3VwcG9ydChjdXJyZW50KS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBiZXN0WzBdLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yKCdGYWlsZWQgdG8gZmlsdGVyIG91dCBkaXNsb2RnZWQgYXR0YWNrJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudC50eXBlICE9ICdtb3ZlJyB8fCAhcmVzb2x2ZShjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJlc3REaXNsb2RnZS5sZW5ndGggIT0gMSB8fCBiZXN0WzBdICE9IGJlc3REaXNsb2RnZVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kSG9sZFN1cHBvcnQoY3VycmVudCkubGVuZ3RoID49IGRpc2xvZGdlU3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFzc2VkLmFkZChvcmRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdjb252b3knKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyLnVuaXQucmVnaW9uLnR5cGUgIT0gVW5pdFR5cGUuV2F0ZXIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBvcmRlcnMuZmluZChvID0+IG8udHlwZSA9PSAnbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgJiYgUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udGFyZ2V0LCBvcmRlci5lbmQpKTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXNzZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ3N1cHBvcnQnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN1cHBvcnRlZSA9IG9yZGVycy5maW5kKG8gPT4gUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAob3JkZXIuYXR0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUudHlwZSAhPSAnbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICFjYW5SZWFjaChvcmRlci51bml0LCBvcmRlci5hdHRhY2spXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhUmVnaW9uLmFyZUVxdWFsKHN1cHBvcnRlZS50YXJnZXQsIG9yZGVyLmF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZS50eXBlID09ICdtb3ZlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIWNhblJlYWNoKG9yZGVyLnVuaXQsIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0YWNrLnR5cGUgIT0gJ21vdmUnIHx8ICFSZWdpb24uYXJlU2FtZShhdHRhY2sudGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3JkZXIudW5pdC50ZWFtID09IGF0dGFjay51bml0LnRlYW0pXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydGVlLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVnaW9uLmFyZVNhbWUoc3VwcG9ydGVlLnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGlzIGZyb20gdGhlIHRhcmdldCByZWdpb24gb2YgdGhlIHN1cHBvcnRlZCBhdHRhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIG9ubHkgY3V0IHN1cHBvcnQgYnkgZGlzbG9kZ2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kTW92ZVN1cHBvcnQoYXR0YWNrKS5sZW5ndGggPiBmaW5kSG9sZFN1cHBvcnQob3JkZXIpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBpcyBjb252b3llZCBieSB0aGUgdGFyZ2V0IHJlZ2lvbiBvZiB0aGUgc3VwcG9ydGVkIGF0dGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBjYW4gb25seSBjdXQgc3VwcG9ydCBpZiBpdCBoYXMgYW4gYWx0ZXJuYXRlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2ssIHN1cHBvcnRlZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IGZpbmRSb3V0ZXMoYXR0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXNzZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgZXJyb3IoYEludmFsaWQgb3JkZXJgKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGV2aWN0ZWQ6IFVuaXRbXSA9IFtdO1xuICAgIGxldCByZXNvbHZlZDogTW92ZU9yZGVyW10gPSBbXTtcblxuICAgIGZvciAobGV0IG9yZGVyIG9mIG9yZGVycykge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScgJiYgcmVzb2x2ZShvcmRlcikpIHtcbiAgICAgICAgICAgIHJlc29sdmVkLnB1c2gob3JkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICBldmljdGVkLnB1c2gob3JkZXIudW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyByZXNvbHZlZCwgZXZpY3RlZCB9O1xufVxuIiwiaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJztcbmltcG9ydCB7IGVycm9yLCBtYXRjaGVzIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IEdhbWVTdGF0ZSwgVW5pdCwgVW5pdFR5cGUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgUkVHSU9OUywgZXVyb3BlIH0gZnJvbSAnLi9kYXRhJztcbmltcG9ydCB7IEhvbGRPcmRlciwgTW92ZU9yZGVyLCBTdXBwb3J0T3JkZXIsIENvbnZveU9yZGVyIH0gZnJvbSAnLi9ydWxlcyc7XG5cbmV4cG9ydCB0eXBlIElucHV0cyA9IHsgW3RlYW06IHN0cmluZ106IHN0cmluZ1tdIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHVybiB7XG4gICAgb3JkZXJzOiBJbnB1dHMsXG4gICAgcmV0cmVhdHM/OiBJbnB1dHMsXG4gICAgYnVpbGRzPzogSW5wdXRzLFxufVxuXG5jb25zdCBzZXNzaW9uX2tleSA9IGAzNDNldmhqMjN2djA1YmVpaXY4ZGxkbG5vNGA7XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXlkaXBsb21hY3kocGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5wbGF5ZGlwbG9tYWN5LmNvbSR7cGF0aH1gO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QodXJsLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdjb29raWUnOiBgUEhQU0VTU0lEPSR7c2Vzc2lvbl9rZXl9YCB9LFxuICAgICAgICAgICAgcmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG4gICAgICAgICAgICBmb2xsb3dSZWRpcmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9IDIwMCkgdGhyb3cgZXJyb3IoJ2ludmFsaWQgc3RhdHVzIGNvZGUnKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdhbWVfaGlzdG9yeShxdWVyeTogc3RyaW5nKSB7XG4gICAgbGV0IGNhY2hlID0gYGNhY2hlLyR7cXVlcnl9YDtcblxuICAgIGxldCBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGUsICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeShgL2dhbWVfaGlzdG9yeS5waHA/JHtxdWVyeX1gKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGNhY2hlLCBkYXRhLCAndXRmOCcpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRfaGlzdG9yeShpZDogbnVtYmVyLCBwaGFzZTogc3RyaW5nLCBkYXRlOiBudW1iZXIpIHtcbiAgICBsZXQgcXVlcnkgPSBgZ2FtZV9pZD0ke2lkfSZwaGFzZT0ke3BoYXNlfSZnZGF0ZT0ke2RhdGV9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IGdhbWVfaGlzdG9yeShxdWVyeSk7XG5cbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICBsZXQgaW5wdXRzOiBJbnB1dHMgPSB7fTtcblxuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPihcXHcrKTxcXC9iPjx1bD4oLio/KTxcXC91bD4vLCBkYXRhKSkge1xuICAgICAgICBsZXQgdGVhbSA9IG1hdGNoWzFdO1xuICAgICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHBhcnQgb2YgbWF0Y2hlcygvPGxpPiguKj8pPFxcL2xpPi8sIG1hdGNoWzJdKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKHBhcnRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKSBjb250aW51ZTtcblxuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1t0ZWFtXSA9IGxpc3Q7XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKVxuICAgICAgICByZXR1cm4gaW5wdXRzO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldF9nYW1lKGlkOiBudW1iZXIpIHtcbiAgICBsZXQgdHVybnMgPSBbXTtcbiAgICBsZXQgaGlzdG9yeSA9IGF3YWl0IGdhbWVfaGlzdG9yeShgZ2FtZV9pZD0ke2lkfWApO1xuXG4gICAgZm9yIChsZXQgY29udGVudCBvZiBoaXN0b3J5LnNwbGl0KCc8L2JyPjwvYnI+JykpIHtcbiAgICAgICAgbGV0IGRhdGUgPSB0dXJucy5sZW5ndGg7XG4gICAgICAgIGxldCB0dXJuOiBUdXJuID0geyBvcmRlcnM6IHt9IH07XG5cbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxhIGhyZWY9J2dhbWVfaGlzdG9yeVxcLnBocFxcP2dhbWVfaWQ9KFxcZCspJnBoYXNlPShcXHcpJmdkYXRlPShcXGQrKS8sIGNvbnRlbnQpKSB7XG4gICAgICAgICAgICBpZiAoaWQgIT0gcGFyc2VJbnQobWF0Y2hbMV0pKSB0aHJvdyBlcnJvcihgRmFpbGVkIHRvIHBhcnNlIGdhbWUgaGlzdG9yeTogJHtpZH1gKTtcbiAgICAgICAgICAgIGlmIChkYXRlICE9IHBhcnNlSW50KG1hdGNoWzNdKSkgdGhyb3cgZXJyb3IoYEZhaWxlZCB0byBwYXJzZSBnYW1lIGhpc3Rvcnk6ICR7aWR9YCk7XG5cbiAgICAgICAgICAgIGxldCBwaGFzZSA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgbGV0IGlucHV0cyA9IGF3YWl0IGdldF9oaXN0b3J5KGlkLCBwaGFzZSwgZGF0ZSk7XG4gICAgICAgICAgICBpZiAoaW5wdXRzID09IG51bGwgJiYgcGhhc2UgIT0gJ08nKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ08nOiB0dXJuLm9yZGVycyA9IGlucHV0cyB8fCB7fTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnUic6IHR1cm4ucmV0cmVhdHMgPSBpbnB1dHM7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0InOiB0dXJuLmJ1aWxkcyA9IGlucHV0czsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSBjb250aW51ZTtcblxuICAgICAgICB0dXJucy5wdXNoKHR1cm4pO1xuICAgIH1cblxuICAgIHJldHVybiB0dXJucztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldF9wYWdlKHBhZ2U6IG51bWJlcikge1xuICAgIGxldCB1cmwgPSBgL2dhbWVzLnBocD9zdWJwYWdlPWFsbF9maW5pc2hlZCZ2YXJpYW50LTA9MSZtYXBfdmFyaWFudC0wPTEmY3VycmVudF9wYWdlPSR7cGFnZX1gO1xuICAgIGxldCBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeSh1cmwpO1xuXG4gICAgbGV0IGlkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxhIGhyZWY9XCJnYW1lX3BsYXlfZGV0YWlsc1xcLnBocFxcP2dhbWVfaWQ9KFxcZCspLywgZGF0YSkpIHtcbiAgICAgICAgbGV0IGdhbWVJZCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgaWRzLmFkZChnYW1lSWQpO1xuICAgIH1cblxuICAgIHJldHVybiBbLi4uaWRzXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRfZ2FtZShyYXc6IEJ1ZmZlcik6IFR1cm5bXSB7XG4gICAgbGV0IGRhdGEgPSB6bGliLmd1bnppcFN5bmMocmF3KTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhLnRvU3RyaW5nKCd1dGY4JykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVfZ2FtZSh0dXJuczogVHVybltdKSB7XG4gICAgbGV0IGRhdGEgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeSh0dXJucyksICd1dGY4Jyk7XG4gICAgcmV0dXJuIHpsaWIuZ3ppcFN5bmMoZGF0YSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gICAgZnMubWtkaXJwU3luYygnZGF0YScpO1xuICAgIGZzLm1rZGlycFN5bmMoJ2NhY2hlJyk7XG5cbiAgICBsZXQgZXJyb3JzID0gMDtcbiAgICBsZXQgb2xkS25vd247XG4gICAgbGV0IG5ld0tub3duID0geyBuZXdlc3Q6IDAsIGNvdW50OiAwIH07XG4gICAgdHJ5IHtcbiAgICAgICAgb2xkS25vd24gPSBmcy5yZWFkSlNPTlN5bmMoJ2RhdGEva25vd24uanNvbicpIGFzIHR5cGVvZiBuZXdLbm93bjtcbiAgICAgICAgY29uc29sZS5sb2coYGtub3duOiAke29sZEtub3duLm5ld2VzdH0gKyR7b2xkS25vd24uY291bnR9YCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBvbGRLbm93biA9IG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHNraXAgPSAwXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTAwMCAmJiBlcnJvcnMgPCAxMDsgKytpKSB7XG4gICAgICAgIGlmIChza2lwID49IDE1KSB7XG4gICAgICAgICAgICBza2lwIC09IDE1O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgZmV0Y2hpbmcgcGFnZSAke2l9YClcbiAgICAgICAgbGV0IGlkcyA9IGF3YWl0IGdldF9wYWdlKGkpO1xuXG4gICAgICAgIGZvciAobGV0IGlkIG9mIGlkcykge1xuICAgICAgICAgICAgaWYgKG5ld0tub3duLm5ld2VzdCA9PSAwKVxuICAgICAgICAgICAgICAgIG5ld0tub3duLm5ld2VzdCA9IGlkO1xuXG4gICAgICAgICAgICBpZiAob2xkS25vd24gJiYgaWQgPT0gb2xkS25vd24ubmV3ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2tpcCA9IG9sZEtub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIG5ld0tub3duLmNvdW50ICs9IG9sZEtub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIG9sZEtub3duID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNraXAgPj0gMSkge1xuICAgICAgICAgICAgICAgIHNraXAgLT0gMTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgc2tpcHBpbmcgZ2FtZSAke2lkfWApXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmZXRjaGluZyBnYW1lICR7aWR9YClcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IG91dHB1dEZpbGUgPSBgZGF0YS8ke2lkfWA7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5wYXRoRXhpc3RzU3luYyhvdXRwdXRGaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB3cml0ZV9nYW1lKGdhbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyc2VkID0gcmVhZF9nYW1lKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwYXJzZWQpICE9IEpTT04uc3RyaW5naWZ5KGdhbWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ2dhbWUgZW5jb2RpbmcgZmFpbGVkJylcblxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG91dHB1dEZpbGUsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChlcnJvcnMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICArK25ld0tub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICArK2Vycm9ycztcbiAgICAgICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYygnZXJyb3JzLnR4dCcsIGAke2lkfSAke2V9YCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGlkLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGRLbm93biA9PSBudWxsKSB7XG4gICAgICAgICAgICBmcy53cml0ZUpTT05TeW5jKCdkYXRhL2tub3duLmpzb24nLCBuZXdLbm93bik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhga25vd246ICR7bmV3S25vd24ubmV3ZXN0fSArJHtuZXdLbm93bi5jb3VudH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrKCkge1xuICAgIGZzLm1rZGlycFN5bmMoJ2RhdGEnKTtcbiAgICBmcy5ta2RpcnBTeW5jKCdjYWNoZScpO1xuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBsZXQgYWxsSWRzID0gZnMucmVhZGRpclN5bmMoJ2RhdGEnKTtcblxuICAgIGZvciAobGV0IGlkIG9mIGFsbElkcykge1xuICAgICAgICBpZiAoaWQgPT0gJ2tub3duLmpzb24nKSBjb250aW51ZTtcblxuICAgICAgICBsZXQgZ2FtZSA9IHJlYWRfZ2FtZShmcy5yZWFkRmlsZVN5bmMoYGRhdGEvJHtpZH1gKSk7XG5cbiAgICAgICAgbGV0IHR1cm5zID0gMDtcbiAgICAgICAgbGV0IGhpc3RvcnkgPSBhd2FpdCBnYW1lX2hpc3RvcnkoYGdhbWVfaWQ9JHtpZH1gKTtcblxuICAgICAgICBmb3IgKGxldCBjb250ZW50IG9mIGhpc3Rvcnkuc3BsaXQoJzwvYnI+PC9icj4nKSkge1xuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBfIG9mIG1hdGNoZXMoLzxhIGhyZWY9J2dhbWVfaGlzdG9yeVxcLnBocFxcP2dhbWVfaWQ9KFxcZCspJnBoYXNlPShcXHcpJmdkYXRlPShcXGQrKS8sIGNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSBjb250aW51ZTtcbiAgICAgICAgICAgICsrdHVybnM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHVybnMgIT0gZ2FtZS5sZW5ndGggfHwgdHVybnMgPT0gMClcbiAgICAgICAgICAgIHRocm93IGVycm9yKGBNaXNtYXRjaDogJHtpZH0gJHt0dXJuc30gJHtnYW1lLmxlbmd0aH1gKTtcblxuICAgICAgICBsZXQgYnVpbGRzID0gMDtcbiAgICAgICAgbGV0IHJldHJlYXRzID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnYW1lLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoZ2FtZVtpXS5idWlsZHMpIGJ1aWxkcysrO1xuICAgICAgICAgICAgaWYgKGdhbWVbaV0ucmV0cmVhdHMpIHJldHJlYXRzKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnVpbGRzID09IDAgfHwgcmV0cmVhdHMgPT0gMCkge1xuICAgICAgICAgICAgbGV0IGdhbWUgPSBhd2FpdCBnZXRfZ2FtZShwYXJzZUludChpZCkpO1xuICAgICAgICAgICAgbGV0IGRhdGEgPSB3cml0ZV9nYW1lKGdhbWUpO1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgZGF0YS8ke2lkfWAsIGRhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7KCsrY291bnQpLnRvU3RyaW5nKCkucGFkU3RhcnQoYWxsSWRzLmxlbmd0aC50b1N0cmluZygpLmxlbmd0aCl9IC8gJHthbGxJZHMubGVuZ3RofSAke2lkfSAke3R1cm5zfSAqYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsoKytjb3VudCkudG9TdHJpbmcoKS5wYWRTdGFydChhbGxJZHMubGVuZ3RoLnRvU3RyaW5nKCkubGVuZ3RoKX0gLyAke2FsbElkcy5sZW5ndGh9ICR7aWR9ICR7dHVybnN9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZV9vcmRlcnMoZ2FtZTogR2FtZVN0YXRlLCBpbnB1dHM6IElucHV0cykge1xuICAgIGxldCBpc05ldyA9IGdhbWUudW5pdHMuc2l6ZSA9PSAwO1xuICAgIGxldCBmbGVldHMgPSBuZXcgU2V0KFtSRUdJT05TLkxPTiwgUkVHSU9OUy5FREksIFJFR0lPTlMuQlJFLCBSRUdJT05TLk5BUCwgUkVHSU9OUy5LSUUsIFJFR0lPTlMuVFJJLCBSRUdJT05TLkFOSywgUkVHSU9OUy5TRVYsIFJFR0lPTlMuU1RQX1NPVVRIXSk7XG5cbiAgICBsZXQgb3JkZXJzID0gW107XG4gICAgbGV0IHJlc29sdmVkID0gW107XG5cbiAgICBmb3IgKGxldCB0ZWFtIGluIGlucHV0cykge1xuICAgICAgICBmb3IgKGxldCByYXcgb2YgaW5wdXRzW3RlYW1dKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSAvKC4qPykoSE9MRHxNT1ZFfFNVUFBPUlR8Q09OVk9ZKSguKiktPiguKikvLmV4ZWMocmF3KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIG1hdGNoIG9yZGVyOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgbGV0IHJlZ2lvbk5hbWUgPSBtYXRjaFsxXS50cmltKCk7XG4gICAgICAgICAgICBsZXQgb3AgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgIGxldCBhcmdzID0gbWF0Y2hbM10udHJpbSgpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG1hdGNoWzRdLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSAnSW52YWxpZCBvcmRlciBvciBzeW50YXggZXJyb3InKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBsZXQgcmVnaW9uID0gZ2FtZS5tYXAucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJlZ2lvbk5hbWUpO1xuICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciBvcmRlcjogJHtyYXd9IGApO1xuXG4gICAgICAgICAgICBsZXQgdW5pdCA9IFsuLi5nYW1lLnVuaXRzXS5maW5kKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uICYmIHUudGVhbSA9PSB0ZWFtKTtcbiAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOZXcpIGdhbWUudW5pdHMuYWRkKHVuaXQgPSBuZXcgVW5pdChyZWdpb24sIGZsZWV0cy5oYXMocmVnaW9uKSA/IFVuaXRUeXBlLldhdGVyIDogVW5pdFR5cGUuTGFuZCwgdGVhbSkpO1xuICAgICAgICAgICAgICAgIGVsc2UgdGhyb3cgZXJyb3IoYFVuaXQgZG9lcyBub3QgZXhpc3Q6ICR7dGVhbX0gJHtyZWdpb24ubmFtZX0gYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBvcmRlcjtcblxuICAgICAgICAgICAgaWYgKG9wID09ICdIT0xEJykge1xuICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IEhvbGRPcmRlcih1bml0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3AgPT0gJ01PVkUnKSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vdmVBcmdzID0gYXJncy5zcGxpdCgnVklBJyk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmF3VGFyZ2V0ID0gbW92ZUFyZ3NbMF0udHJpbSgpO1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1RhcmdldCk7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgdGFyZ2V0IHJlZ2lvbiBmb3IgbW92ZSBvcmRlcjogJHthcmdzfSBgKTtcblxuICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IE1vdmVPcmRlcih1bml0LCB0YXJnZXQsIG1vdmVBcmdzLmxlbmd0aCA+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT0gJ3Jlc29sdmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZC5wdXNoKG9yZGVyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3AgPT0gJ1NVUFBPUlQnKSB7XG4gICAgICAgICAgICAgICAgbGV0IFtyYXdTcmMsIHJhd0RzdF0gPSBhcmdzLnNwbGl0KCcgdG8gJyk7IC8vICdYIHRvIGhvbGQnIG9yICdYIHRvIFknXG5cbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdTcmMpO1xuICAgICAgICAgICAgICAgIGlmIChzcmMgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHRhcmdldCByZWdpb24gZm9yIHN1cHBvcnQgb3JkZXI6ICR7cmF3U3JjfSBgKTtcblxuICAgICAgICAgICAgICAgIGlmIChyYXdEc3QgPT0gJ2hvbGQnKVxuICAgICAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBTdXBwb3J0T3JkZXIodW5pdCwgc3JjKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRzdCA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3RHN0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRzdCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgYXR0YWNrIHJlZ2lvbiBmb3Igc3VwcG9ydCBvcmRlcjogJHtyYXdEc3R9IGApO1xuXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IFN1cHBvcnRPcmRlcih1bml0LCBzcmMsIGRzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcCA9PSAnQ09OVk9ZJykge1xuICAgICAgICAgICAgICAgIGxldCBbcmF3U3JjLCByYXdEc3RdID0gYXJncy5zcGxpdCgnIHRvICcpOyAvLyAnWCB0byBZJ1xuXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3U3JjKTtcbiAgICAgICAgICAgICAgICBpZiAoc3JjID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCBzdGFydCByZWdpb24gZm9yIGNvbnZveSBvcmRlcjogJHtyYXdTcmN9IGApO1xuXG4gICAgICAgICAgICAgICAgbGV0IGRzdCA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3RHN0KTtcbiAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCBlbmQgcmVnaW9uIGZvciBjb252b3kgb3JkZXI6ICR7cmF3RHN0fSBgKTtcblxuICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IENvbnZveU9yZGVyKHVuaXQsIHNyYywgZHN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoYGludmFsaWQgb3JkZXI6ICR7b3B9YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3JkZXJzLnB1c2gob3JkZXIpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBvcmRlcnMsIHJlc29sdmVkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZV9yZXRyZWF0cyhldmljdGVkOiBVbml0W10sIGlucHV0czogSW5wdXRzKSB7XG4gICAgbGV0IHJldHJlYXRzID0gW107XG5cbiAgICBmb3IgKGxldCB0ZWFtIGluIGlucHV0cykge1xuICAgICAgICBmb3IgKGxldCByYXcgb2YgaW5wdXRzW3RlYW1dKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSAvKCguKilSRVRSRUFUKC4qKXwoLiopREVTVFJPWSlcXHMrLT4oLiopLy5leGVjKHJhdyk7XG4gICAgICAgICAgICBpZiAobWF0Y2ggPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBtYXRjaCByZXRyZWF0OiAke3Jhd30gYCk7XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBtYXRjaFs1XS50cmltKCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmF3U3JjID0gbWF0Y2hbMl0udHJpbSgpO1xuICAgICAgICAgICAgICAgIGxldCByYXdEc3QgPSBtYXRjaFszXS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdTcmMpO1xuICAgICAgICAgICAgICAgIGlmIChzcmMgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3IgcmV0cmVhdDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZHN0ID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdEc3QpO1xuICAgICAgICAgICAgICAgIGlmIChkc3QgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3IgcmV0cmVhdDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdW5pdCA9IGV2aWN0ZWQuZmluZCh1ID0+IHUucmVnaW9uID09IHNyYyAmJiB1LnRlYW0gPT0gdGVhbSk7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXQgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHVuaXQgZm9yIHJldHJlYXQ6ICR7cmF3fSAke3RlYW19YCk7XG5cbiAgICAgICAgICAgICAgICByZXRyZWF0cy5wdXNoKHsgdW5pdCwgdGFyZ2V0OiBkc3QsIHJlc29sdmVkOiByZXN1bHQgPT0gJ3Jlc29sdmVkJyB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJhd1JlZ2lvbiA9IG1hdGNoWzRdLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGxldCByZWdpb24gPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1JlZ2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciByZXRyZWF0OiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gWy4uLmV2aWN0ZWRdLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24gJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB1bml0IGZvciByZXRyZWF0OiAke3Jhd30gJHt0ZWFtfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0cmVhdHMucHVzaCh7IHVuaXQsIHRhcmdldDogbnVsbCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHJlYXRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VfYnVpbGRzKGdhbWU6IEdhbWVTdGF0ZSwgaW5wdXRzOiBJbnB1dHMpIHtcbiAgICBsZXQgYnVpbGRzID0gW107XG5cbiAgICBmb3IgKGxldCB0ZWFtIGluIGlucHV0cykge1xuICAgICAgICBmb3IgKGxldCByYXcgb2YgaW5wdXRzW3RlYW1dKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSAvKEJVSUxEXFxzKyhmbGVldHxhcm15KVxccysoLiopfCguKilERVNUUk9ZKVxccystPiguKikvLmV4ZWMocmF3KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIG1hdGNoIGJ1aWxkOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG1hdGNoWzVdLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBtYXRjaFsyXS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHJhd1JlZ2lvbiA9IG1hdGNoWzNdLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGxldCByZWdpb24gPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1JlZ2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciBidWlsZDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdW5pdCA9IG5ldyBVbml0KHJlZ2lvbiwgdHlwZSA9PSAnZmxlZXQnID8gVW5pdFR5cGUuV2F0ZXIgOiBVbml0VHlwZS5MYW5kLCB0ZWFtKTtcblxuICAgICAgICAgICAgICAgIGJ1aWxkcy5wdXNoKHsgdW5pdCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgcmF3UmVnaW9uID0gbWF0Y2hbNF0udHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlZ2lvbiA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3UmVnaW9uKTtcbiAgICAgICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIGJ1aWxkOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gWy4uLmdhbWUudW5pdHNdLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24gJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSAncmVzb2x2ZWQnKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgdW5pdCBmb3IgYnVpbGQ6ICR7cmF3fSAke3RlYW19YCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnVpbGRzLnB1c2goeyB1bml0LCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbGRzO1xufVxuIiwiaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ3JlcXVlc3QtcHJvbWlzZS1uYXRpdmUnO1xuXG5pbXBvcnQgeyBldXJvcGUsIFJFR0lPTlMgfSBmcm9tICcuL2RhdGEnO1xuaW1wb3J0IHsgVW5pdCwgUmVnaW9uLCBHYW1lU3RhdGUsIFVuaXRUeXBlIH0gZnJvbSAnLi9nYW1lJztcbmltcG9ydCB7IEFueU9yZGVyLCBNb3ZlT3JkZXIsIEhvbGRPcmRlciwgU3VwcG9ydE9yZGVyLCBDb252b3lPcmRlciwgcmVzb2x2ZSB9IGZyb20gJy4vcnVsZXMnO1xuaW1wb3J0ICogYXMgc2NyYXBlIGZyb20gJy4vc2NyYXBlJztcbmltcG9ydCB7IGVycm9yIH0gZnJvbSAnLi91dGlsJztcblxuZnVuY3Rpb24qIG1hdGNoZXMocmVnZXg6IFJlZ0V4cCwgdGFyZ2V0OiBzdHJpbmcpIHtcbiAgICBsZXQgY29weSA9IG5ldyBSZWdFeHAocmVnZXgsICdnJyk7XG4gICAgbGV0IG1hdGNoO1xuICAgIHdoaWxlIChtYXRjaCA9IGNvcHkuZXhlYyh0YXJnZXQpKVxuICAgICAgICB5aWVsZCBtYXRjaDtcbn1cblxuY29uc3QgaWdub3JlZF9nYW1lcyA9IG5ldyBTZXQoWzE1OTU5NCwgMTU4MDkzXSk7XG5cbmZ1bmN0aW9uIHJ1bl9nYW1lKGlkOiBudW1iZXIsIHR1cm5zOiBzY3JhcGUuVHVybltdKSB7XG4gICAgbGV0IGdhbWUgPSBuZXcgR2FtZVN0YXRlKGV1cm9wZSwgW10pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0dXJucy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKGBwcm9jZXNzaW5nICR7aSAlIDIgPyAnZmFsbCcgOiAnc3ByaW5nJ30gJHsxOTAxICsgTWF0aC5mbG9vcihpIC8gMil9YCk7XG5cbiAgICAgICAgbGV0IHJlbW90ZSA9IHNjcmFwZS5wYXJzZV9vcmRlcnMoZ2FtZSwgdHVybnNbaV0ub3JkZXJzKTtcbiAgICAgICAgbGV0IG9yZGVycyA9IHJlbW90ZS5vcmRlcnMuc2xpY2UoKTtcblxuICAgICAgICBmb3IgKGxldCB1bml0IG9mIGdhbWUudW5pdHMpIHtcbiAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVycy5maW5kKG8gPT4gby51bml0ID09IHVuaXQpO1xuICAgICAgICAgICAgaWYgKG9yZGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIG9yZGVycy5wdXNoKG5ldyBIb2xkT3JkZXIodW5pdCkpXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbG9jYWwgPSByZXNvbHZlKG9yZGVycyk7XG5cbiAgICAgICAgZm9yIChsZXQgbW92ZSBvZiBsb2NhbC5yZXNvbHZlZCkge1xuICAgICAgICAgICAgaWYgKCFnYW1lLnVuaXRzLmhhcyhtb3ZlLnVuaXQpKSBkZWJ1Z2dlcjtcbiAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKG1vdmUudW5pdCk7XG4gICAgICAgICAgICBnYW1lLnVuaXRzLmFkZChuZXcgVW5pdChtb3ZlLnRhcmdldCwgbW92ZS51bml0LnR5cGUsIG1vdmUudW5pdC50ZWFtKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBvcmRlciBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC5yZXNvbHZlZC5pbmNsdWRlcyhvcmRlcikgIT0gcmVtb3RlLnJlc29sdmVkLmluY2x1ZGVzKG9yZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvcmRlcnMpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgTWlzbWF0Y2ggaW4gZ2FtZSAke2lkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChsb2NhbC5ldmljdGVkLmxlbmd0aCA9PSAwICE9ICF0dXJuc1tpXS5yZXRyZWF0cykge1xuICAgICAgICAvLyAgICAgdGhyb3cgZXJyb3IoYE1pc21hdGNoIGluIGdhbWUgJHtpZH1gKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChsb2NhbC5ldmljdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGV2aWN0ZWQgPSBuZXcgU2V0KGxvY2FsLmV2aWN0ZWQpO1xuICAgICAgICAgICAgbGV0IHJldHJlYXRzID0gc2NyYXBlLnBhcnNlX3JldHJlYXRzKGxvY2FsLmV2aWN0ZWQsIHR1cm5zW2ldLnJldHJlYXRzISk7XG4gICAgICAgICAgICBmb3IgKGxldCByZXRyZWF0IG9mIHJldHJlYXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJlYXQucmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJlYXQudGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5tb3ZlKHJldHJlYXQudW5pdCwgcmV0cmVhdC50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnVuaXRzLmRlbGV0ZShyZXRyZWF0LnVuaXQpO1xuICAgICAgICAgICAgICAgICAgICBldmljdGVkLmRlbGV0ZShyZXRyZWF0LnVuaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHVuaXQgb2YgZXZpY3RlZCkge1xuICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGkgJSAyID09IDEpIHtcbiAgICAgICAgICAgIGxldCBidWlsZHMgPSBzY3JhcGUucGFyc2VfYnVpbGRzKGdhbWUsIHR1cm5zW2ldLmJ1aWxkcyEpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBidWlsZCBvZiBidWlsZHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnVpbGQucmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWUudW5pdHMuaGFzKGJ1aWxkLnVuaXQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS51bml0cy5kZWxldGUoYnVpbGQudW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuYWRkKGJ1aWxkLnVuaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IHJlZ2lvbiBvZiBnYW1lLm1hcC5yZWdpb25zKSB7XG4gICAgICAgICAgICBsZXQgdW5pdHMgPSBbLi4uZ2FtZS51bml0c10uZmlsdGVyKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uKTtcbiAgICAgICAgICAgIGlmICh1bml0cy5sZW5ndGggPiAxKSB0aHJvdyBlcnJvcihgTWlzbWF0Y2ggaW4gZ2FtZSAke2lkfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gICAgZnMubWtkaXJwU3luYygnZGF0YScpO1xuICAgIGZzLm1rZGlycFN5bmMoJ2NhY2hlJyk7XG5cbiAgICBsZXQgYWxsSWRzID0gZnMucmVhZGRpclN5bmMoJ2RhdGEnKTtcblxuICAgIGZvciAobGV0IGlkIG9mIGFsbElkcykge1xuICAgICAgICBpZiAoaWQgPT0gJ2tub3duLmpzb24nKSBjb250aW51ZTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgcHJvY2Vzc2luZyBnYW1lICR7aWR9YCk7XG5cbiAgICAgICAgbGV0IGdhbWUgPSBzY3JhcGUucmVhZF9nYW1lKGZzLnJlYWRGaWxlU3luYyhgZGF0YS8ke2lkfWApKTtcbiAgICAgICAgZm9yIChsZXQgdHVybiBvZiBnYW1lKSB7XG4gICAgICAgICAgICBpZiAodHVybi5idWlsZHMgJiYgT2JqZWN0LmtleXModHVybi5idWlsZHMpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHR1cm4uYnVpbGRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR1cm4ucmV0cmVhdHMgJiYgT2JqZWN0LmtleXModHVybi5yZXRyZWF0cykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdHVybi5yZXRyZWF0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0dXJuLm9yZGVycykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBzb21ldGltZXMgZ2FtZXMgaGF2ZSBhbiBlbXB0eSBsYXN0IHR1cm4gd2l0aCBubyBvcmRlcnNcbiAgICAgICAgICAgICAgICBpZiAodHVybi5idWlsZHMgfHwgdHVybi5yZXRyZWF0c1xuICAgICAgICAgICAgICAgICAgICB8fCBnYW1lLmluZGV4T2YodHVybikgKyAxICE9IGdhbWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgbWlzc2luZyBvcmRlcnM6ICR7aWR9ICR7Z2FtZS5pbmRleE9mKHR1cm4pfWApO1xuICAgICAgICAgICAgICAgIGdhbWUucG9wKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBydW5fZ2FtZShwYXJzZUludChpZCksIGdhbWUpO1xuICAgIH1cbn1cblxubGV0IHggPSBnbG9iYWw7XG5cbmlmICh4LmRldnRvb2xzRm9ybWF0dGVycyA9PSBudWxsKSB4LmRldnRvb2xzRm9ybWF0dGVycyA9IFtdO1xueC5kZXZ0b29sc0Zvcm1hdHRlcnMucHVzaCh7XG4gICAgaGVhZGVyKG9iaiwgY29uZmlnKSB7XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNb3ZlT3JkZXIpIHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gYCR7b2JqLnVuaXQudGVhbX0gJHtvYmoudW5pdC5yZWdpb24ubmFtZX0gbW92ZSAtPiAke29iai50YXJnZXQubmFtZX1gO1xuICAgICAgICAgICAgaWYgKG9iai5yZXF1aXJlQ29udm95KSB0ZXh0ICs9IGAgdmlhIGNvbnZveWA7XG4gICAgICAgICAgICByZXR1cm4gW1wic3BhblwiLCB7fSwgdGV4dF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgSG9sZE9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gW1wic3BhblwiLCB7fSwgYCR7b2JqLnVuaXQudGVhbX0gJHtvYmoudW5pdC5yZWdpb24ubmFtZX0gaG9sZGBdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFN1cHBvcnRPcmRlcikge1xuICAgICAgICAgICAgaWYgKG9iai5hdHRhY2spXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai51bml0LnRlYW19ICR7b2JqLnVuaXQucmVnaW9uLm5hbWV9IHN1cHBvcnQgJHtvYmoudGFyZ2V0Lm5hbWV9IC0+ICR7b2JqLmF0dGFjay5uYW1lfWBdO1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai51bml0LnRlYW19ICR7b2JqLnVuaXQucmVnaW9uLm5hbWV9IHN1cHBvcnQgJHtvYmoudGFyZ2V0Lm5hbWV9IGhvbGRgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBDb252b3lPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai51bml0LnRlYW19ICR7b2JqLnVuaXQucmVnaW9uLm5hbWV9IGNvbnZveSAke29iai5zdGFydC5uYW1lfSAtPiAke29iai5lbmQubmFtZX1gXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBVbml0KSB7XG4gICAgICAgICAgICByZXR1cm4gW1wic3BhblwiLCB7fSwgYCR7b2JqLnRlYW19ICR7b2JqLnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIgPyAnZmxlZXQnIDogJ2FybXknfSBpbiAke29iai5yZWdpb24ubmFtZX1gXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgaGFzQm9keShvYmosIGNvbmZpZykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIHJldHVybiBvYmogaW5zdGFuY2VvZiBPcmRlckJhc2U7XG4gICAgfSxcbiAgICBib2R5KG9iaiwgY29uZmlnKSB7XG4gICAgICAgIC8vIGxldCBjaGlsZHJlbiA9IFtdO1xuICAgICAgICAvLyBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICAvLyByZXR1cm4gW1xuICAgICAgICAvLyAgICAgJ29sJyxcbiAgICAgICAgLy8gICAgIHt9LFxuICAgICAgICAvLyBdXG4gICAgfVxufSk7XG5cbmxldCBvcCA9IHByb2Nlc3MuYXJndlsyXTtcblxuaWYgKG9wID09ICdzY3JhcGUnKVxuICAgIHNjcmFwZS5ydW4oKTtcbmVsc2UgaWYgKG9wID09ICdjaGVjaycpXG4gICAgc2NyYXBlLmNoZWNrKCk7XG5lbHNlIGlmIChvcCA9PSAncnVuJylcbiAgICBydW4oKTtcbmVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCd1bmtub3duIG9yIG1pc3NpbmcgY29tbWFuZCcpXG59XG4iXSwibmFtZXMiOlsic2NyYXBlLnBhcnNlX29yZGVycyIsInNjcmFwZS5wYXJzZV9yZXRyZWF0cyIsInNjcmFwZS5wYXJzZV9idWlsZHMiLCJydW4iLCJzY3JhcGUucmVhZF9nYW1lIiwic2NyYXBlLnJ1biIsInNjcmFwZS5jaGVjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFBYSxNQUFNO0lBSWYsWUFDYSxFQUFVLEVBQ1YsSUFBWSxFQUNaLElBQWM7UUFGZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVU7UUFObEIsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDN0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7S0FNakM7SUFFTCxJQUFJLFdBQVc7UUFDWCxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0Y7SUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUNuQyxPQUFPLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDOUM7SUFFRCxPQUFPLFFBQVEsQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUNwQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUM7S0FDckI7Q0FDSjtBQUVELEFBQUEsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2hCLHVDQUFJLENBQUE7SUFDSix5Q0FBSyxDQUFBO0NBQ1IsRUFIVyxRQUFRLEtBQVIsUUFBUSxRQUduQjtBQUVELE1BQWEsSUFBSTtJQUNiLFlBQ2EsTUFBYyxFQUNkLElBQWMsRUFDZCxJQUFZO1FBRlosV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLFNBQUksR0FBSixJQUFJLENBQVU7UUFDZCxTQUFJLEdBQUosSUFBSSxDQUFRO0tBQ3BCO0NBQ1I7QUFFRCxNQUFhLE9BQU87SUFDaEIsWUFDYSxPQUFpQjtRQUFqQixZQUFPLEdBQVAsT0FBTyxDQUFVO0tBQ3pCO0NBQ1I7QUFFRCxNQUFhLFNBQVM7SUFHbEIsWUFDYSxHQUFZLEVBQ1osS0FBZTtRQURmLFFBQUcsR0FBSCxHQUFHLENBQVM7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUFVO1FBSm5CLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBUSxDQUFDO0tBSzVCO0lBRUwsSUFBSSxDQUFDLElBQVUsRUFBRSxNQUFjO1FBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzFEO0NBQ0o7OztBQy9ERCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzNCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7QUFFN0IsU0FBUyxDQUFDLENBQUMsRUFBVSxFQUFFLElBQVksRUFBRSxJQUFjO0lBQy9DLE9BQU8sSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNyQzs7QUFHRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUks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LENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUVuQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUVsQyxBQUFPLE1BQU0sTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTdkLEFBQU8sTUFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVB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
