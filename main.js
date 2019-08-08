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
        return null;
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
                if (inputs == null)
                    continue;
                found = true;
                switch (phase) {
                    case 'O':
                        turn.orders = inputs;
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
            console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns}`);
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
        debugger;
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
        if (local.evicted.length == 0 != !turns[i].retreats) {
            throw error(`Mismatch in game ${id}`);
        }
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
            let game = read_game(fs.readFileSync(`data/${id}`));
            for (let turn of game) {
                if (turn.builds && Object.keys(turn.builds)) {
                    delete turn.builds;
                }
                if (turn.retreats && Object.keys(turn.retreats)) {
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
            console.log(`processed game ${id}`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2dhbWUudHMiLCJzcmMvZGF0YS50cyIsInNyYy91dGlsLnRzIiwic3JjL3J1bGVzLnRzIiwic3JjL3NjcmFwZS50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZWdpb24ge1xuICAgIHJlYWRvbmx5IGF0dGFjaGVkID0gbmV3IFNldDxSZWdpb24+KCk7XG4gICAgcmVhZG9ubHkgYWRqYWNlbnQgPSBuZXcgU2V0PFJlZ2lvbj4oKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHR5cGU6IFVuaXRUeXBlLFxuICAgICkgeyB9XG5cbiAgICBnZXQgYWxsQWRqYWNlbnQoKSB7XG4gICAgICAgIGxldCBsaXN0ID0gWy4uLnRoaXMuYWRqYWNlbnRdO1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICAgIGxpc3QucHVzaCguLi5ub2RlLmFkamFjZW50KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBub2RlIG9mIGxpc3Quc2xpY2UoKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKC4uLm5vZGUuYXR0YWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIGdldCBpc1Nob3JlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdGhpcy5hbGxBZGphY2VudC5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXJlU2FtZShsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHMgfHwgbGhzLmF0dGFjaGVkLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhcmVFcXVhbChsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHM7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBVbml0VHlwZSB7XG4gICAgTGFuZCxcbiAgICBXYXRlcixcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSByZWdpb246IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogVW5pdFR5cGUsXG4gICAgICAgIHJlYWRvbmx5IHRlYW06IHN0cmluZyxcbiAgICApIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZU1hcCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHJlZ2lvbnM6IFJlZ2lvbltdLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU3RhdGUge1xuICAgIHJlYWRvbmx5IHVuaXRzID0gbmV3IFNldDxVbml0PigpO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IG1hcDogR2FtZU1hcCxcbiAgICAgICAgcmVhZG9ubHkgdGVhbXM6IHN0cmluZ1tdLFxuICAgICkgeyB9XG5cbiAgICBtb3ZlKHVuaXQ6IFVuaXQsIHRhcmdldDogUmVnaW9uKSB7XG4gICAgICAgIHRoaXMudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICB0aGlzLnVuaXRzLmFkZChuZXcgVW5pdCh0YXJnZXQsIHVuaXQudHlwZSwgdW5pdC50ZWFtKSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVnaW9uLCBHYW1lTWFwLCBVbml0VHlwZSB9IGZyb20gJy4vZ2FtZSc7XG5cbmNvbnN0IExBTkQgPSBVbml0VHlwZS5MYW5kO1xuY29uc3QgV0FURVIgPSBVbml0VHlwZS5XYXRlcjtcblxuZnVuY3Rpb24gbihpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGU6IFVuaXRUeXBlKTogUmVnaW9uIHtcbiAgICByZXR1cm4gbmV3IFJlZ2lvbihpZCwgbmFtZSwgdHlwZSk7XG59XG5cbi8vIGF1c3RyaWFcbmxldCBCT0ggPSBuKCdCT0gnLCAnQm9oZW1pYScsIExBTkQpO1xubGV0IEJVRCA9IG4oJ0JVRCcsICdCdWRhcGVzdCcsIExBTkQpO1xubGV0IEdBTCA9IG4oJ0dBTCcsICdHYWxpY2lhJywgTEFORCk7XG5sZXQgVFJJID0gbignVFJJJywgJ1RyaWVzdGUnLCBMQU5EKTtcbmxldCBUWVIgPSBuKCdUWVInLCAnVHlyb2xpYScsIExBTkQpO1xubGV0IFZJRSA9IG4oJ1ZJRScsICdWaWVubmEnLCBMQU5EKTtcblxuLy8gZW5nbGFuZFxubGV0IENMWSA9IG4oJ0NMWScsICdDbHlkZScsIExBTkQpO1xubGV0IEVESSA9IG4oJ0VESScsICdFZGluYnVyZ2gnLCBMQU5EKTtcbmxldCBMVlAgPSBuKCdMVlAnLCAnTGl2ZXJwb29sJywgTEFORCk7XG5sZXQgTE9OID0gbignTE9OJywgJ0xvbmRvbicsIExBTkQpO1xubGV0IFdBTCA9IG4oJ1dBTCcsICdXYWxlcycsIExBTkQpO1xubGV0IFlPUiA9IG4oJ1lPUicsICdZb3Jrc2hpcmUnLCBMQU5EKTtcblxuLy8gZnJhbmNlXG5sZXQgQlJFID0gbignQlJFJywgJ0JyZXN0JywgTEFORCk7XG5sZXQgQlVSID0gbignQlVSJywgJ0J1cmd1bmR5JywgTEFORCk7XG5sZXQgR0FTID0gbignR0FTJywgJ0dhc2NvbnknLCBMQU5EKTtcbmxldCBNQVIgPSBuKCdNQVInLCAnTWFyc2VpbGxlcycsIExBTkQpO1xubGV0IFBBUiA9IG4oJ1BBUicsICdQYXJpcycsIExBTkQpO1xubGV0IFBJQyA9IG4oJ1BJQycsICdQaWNhcmR5JywgTEFORCk7XG5cbi8vIGdlcm1hbnlcbmxldCBCRVIgPSBuKCdCRVInLCAnQmVybGluJywgTEFORCk7XG5sZXQgS0lFID0gbignS0lFJywgJ0tpZWwnLCBMQU5EKTtcbmxldCBNVU4gPSBuKCdNVU4nLCAnTXVuaWNoJywgTEFORCk7XG5sZXQgUFJVID0gbignUFJVJywgJ1BydXNzaWEnLCBMQU5EKTtcbmxldCBSVUggPSBuKCdSVUgnLCAnUnVocicsIExBTkQpO1xubGV0IFNJTCA9IG4oJ1NJTCcsICdTaWxlc2lhJywgTEFORCk7XG5cbi8vIGl0YWx5XG5sZXQgQVBVID0gbignQVBVJywgJ0FwdWxpYScsIExBTkQpO1xubGV0IE5BUCA9IG4oJ05BUCcsICdOYXBsZXMnLCBMQU5EKTtcbmxldCBQSUUgPSBuKCdQSUUnLCAnUGllZG1vbnQnLCBMQU5EKTtcbmxldCBST00gPSBuKCdST00nLCAnUm9tZScsIExBTkQpO1xubGV0IFRVUyA9IG4oJ1RVUycsICdUdXNjYW55JywgTEFORCk7XG5sZXQgVkVOID0gbignVkVOJywgJ1ZlbmljZScsIExBTkQpO1xuXG4vLyBydXNzaWFcbmxldCBGSU4gPSBuKCdGSU4nLCAnRmlubGFuZCcsIExBTkQpO1xubGV0IExWTiA9IG4oJ0xWTicsICdMaXZvbmlhJywgTEFORCk7XG5sZXQgTU9TID0gbignTU9TJywgJ01vc2NvdycsIExBTkQpO1xubGV0IFNFViA9IG4oJ1NFVicsICdTZXZhc3RvcG9sJywgTEFORCk7XG5sZXQgU1RQID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnJywgTEFORCk7XG5sZXQgVUtSID0gbignVUtSJywgJ1VrcmFpbmUnLCBMQU5EKTtcbmxldCBXQVIgPSBuKCdXQVInLCAnV2Fyc2F3JywgTEFORCk7XG5cbi8vIHR1cmtleVxubGV0IEFOSyA9IG4oJ0FOSycsICdBbmthcmEnLCBMQU5EKTtcbmxldCBBUk0gPSBuKCdBUk0nLCAnQXJtZW5pYScsIExBTkQpO1xubGV0IENPTiA9IG4oJ0NPTicsICdDb25zdGFudGlub3BsZScsIExBTkQpO1xubGV0IFNNWSA9IG4oJ1NNWScsICdTbXlybmEnLCBMQU5EKTtcbmxldCBTWVIgPSBuKCdTWVInLCAnU3lyaWEnLCBMQU5EKTtcblxuLy8gbmV1dHJhbFxubGV0IEFMQiA9IG4oJ0FMQicsICdBbGJhbmlhJywgTEFORCk7XG5sZXQgQkVMID0gbignQkVMJywgJ0JlbGdpdW0nLCBMQU5EKTtcbmxldCBCVUwgPSBuKCdCVUwnLCAnQnVsZ2FyaWEnLCBMQU5EKTtcbmxldCBERU4gPSBuKCdERU4nLCAnRGVubWFyaycsIExBTkQpO1xubGV0IEdSRSA9IG4oJ0dSRScsICdHcmVlY2UnLCBMQU5EKTtcbmxldCBIT0wgPSBuKCdIT0wnLCAnSG9sbGFuZCcsIExBTkQpO1xubGV0IE5XWSA9IG4oJ05XWScsICdOb3J3YXknLCBMQU5EKTtcbmxldCBOQUYgPSBuKCdOQUYnLCAnTm9ydGggQWZyaWNhJywgTEFORCk7XG5sZXQgUE9SID0gbignUE9SJywgJ1BvcnR1Z2FsJywgTEFORCk7XG5sZXQgUlVNID0gbignUlVNJywgJ1J1bWFuaWEnLCBMQU5EKTtcbmxldCBTRVIgPSBuKCdTRVInLCAnU2VyYmlhJywgTEFORCk7XG5sZXQgU1BBID0gbignU1BBJywgJ1NwYWluJywgTEFORCk7XG5sZXQgU1dFID0gbignU1dFJywgJ1N3ZWRlbicsIExBTkQpO1xubGV0IFRVTiA9IG4oJ1RVTicsICdUdW5pcycsIExBTkQpO1xuXG4vLyB3YXRlclxubGV0IEFEUiA9IG4oJ0FEUicsICdBZHJpYXRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQUVHID0gbignQUVHJywgJ0FlZ2VhbiBTZWEnLCBXQVRFUik7XG5sZXQgQkFMID0gbignQkFMJywgJ0JhbHRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQkFSID0gbignQkFSJywgJ0JhcmVudHMgU2VhJywgV0FURVIpO1xubGV0IEJMQSA9IG4oJ0JMQScsICdCbGFjayBTZWEnLCBXQVRFUik7XG5sZXQgRUFTID0gbignRUFTJywgJ0Vhc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcbmxldCBFTkcgPSBuKCdFTkcnLCAnRW5nbGlzaCBDaGFubmVsJywgV0FURVIpO1xubGV0IEJPVCA9IG4oJ0JPVCcsICdHdWxmIG9mIEJvdGhuaWEnLCBXQVRFUik7XG5sZXQgR09MID0gbignR09MJywgJ0d1bGYgb2YgTHlvbicsIFdBVEVSKTtcbmxldCBIRUwgPSBuKCdIRUwnLCAnSGVsZ29sYW5kIEJpZ2h0JywgV0FURVIpO1xubGV0IElPTiA9IG4oJ0lPTicsICdJb25pYW4gU2VhJywgV0FURVIpO1xubGV0IElSSSA9IG4oJ0lSSScsICdJcmlzaCBTZWEnLCBXQVRFUik7XG5sZXQgTUlEID0gbignTUlEJywgJ01pZC1BdGxhbnRpYyBPY2VhbicsIFdBVEVSKTtcbmxldCBOQVQgPSBuKCdOQVQnLCAnTm9ydGggQXRsYW50aWMgT2NlYW4nLCBXQVRFUik7XG5sZXQgTlRIID0gbignTlRIJywgJ05vcnRoIFNlYScsIFdBVEVSKTtcbmxldCBOUkcgPSBuKCdOUkcnLCAnTm9yd2VnaWFuIFNlYScsIFdBVEVSKTtcbmxldCBTS0EgPSBuKCdTS0EnLCAnU2thZ2VycmFjaycsIFdBVEVSKTtcbmxldCBUWU4gPSBuKCdUWU4nLCAnVHlycmhlbmlhbiBTZWEnLCBXQVRFUik7XG5sZXQgV0VTID0gbignV0VTJywgJ1dlc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcblxubGV0IFNUUF9OT1JUSCA9IG4oJ1NUUCcsICdTdC4gUGV0ZXJzYnVyZyAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1RQX1NPVVRIID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IFNQQV9OT1JUSCA9IG4oJ1NQQScsICdTcGFpbiAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1BBX1NPVVRIID0gbignU1BBJywgJ1NwYWluIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IEJVTF9OT1JUSCA9IG4oJ0JVTCcsICdCdWxnYXJpYSAoRWFzdCBDb2FzdCknLCBMQU5EKTtcbmxldCBCVUxfU09VVEggPSBuKCdCVUwnLCAnQnVsZ2FyaWEgKFNvdXRoIENvYXN0KScsIExBTkQpO1xuXG5mdW5jdGlvbiBib3JkZXIobm9kZTogUmVnaW9uLCBhZGphY2VudDogUmVnaW9uW10pIHtcbiAgICBmb3IgKGxldCBvdGhlciBvZiBhZGphY2VudClcbiAgICAgICAgbm9kZS5hZGphY2VudC5hZGQob3RoZXIpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2gobm9kZTogUmVnaW9uLCBhdHRhY2hlZDogUmVnaW9uW10pIHtcbiAgICBsZXQgYWxsID0gW25vZGUsIC4uLmF0dGFjaGVkXTtcbiAgICBmb3IgKGxldCByZWdpb24gb2YgYWxsKSB7XG4gICAgICAgIGZvciAobGV0IG90aGVyIG9mIGFsbCkge1xuICAgICAgICAgICAgaWYgKG90aGVyID09IHJlZ2lvbikgY29udGludWU7XG4gICAgICAgICAgICByZWdpb24uYXR0YWNoZWQuYWRkKG90aGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYm9yZGVyKFNUUF9OT1JUSCwgW0JBUiwgTldZXSk7XG5hdHRhY2goU1RQLCBbU1RQX1NPVVRILCBTVFBfTk9SVEhdKTtcbmJvcmRlcihTVFBfU09VVEgsIFtCT1QsIExWTiwgRklOXSk7XG5cbmJvcmRlcihCVUxfTk9SVEgsIFtCTEEsIENPTiwgUlVNXSk7XG5hdHRhY2goQlVMLCBbQlVMX1NPVVRILCBCVUxfTk9SVEhdKTtcbmJvcmRlcihCVUxfU09VVEgsIFtBRUcsIEdSRSwgQ09OXSk7XG5cbmJvcmRlcihTUEFfTk9SVEgsIFtNSUQsIFBPUiwgR0FTXSk7XG5hdHRhY2goU1BBLCBbU1BBX1NPVVRILCBTUEFfTk9SVEhdKTtcbmJvcmRlcihTUEFfU09VVEgsIFtHT0wsIFdFUywgTUlELCBQT1IsIE1BUl0pO1xuXG5ib3JkZXIoTkFULCBbTlJHLCBDTFksIExWUCwgSVJJLCBNSURdKTtcbmJvcmRlcihOUkcsIFtCQVIsIE5XWSwgTlRILCBFREksIENMWSwgTkFUXSk7XG5ib3JkZXIoQ0xZLCBbTlJHLCBFREksIExWUCwgTkFUXSk7XG5ib3JkZXIoTFZQLCBbQ0xZLCBFREksIFlPUiwgV0FMLCBJUkksIE5BVF0pO1xuYm9yZGVyKElSSSwgW05BVCwgTFZQLCBXQUwsIEVORywgTUlEXSk7XG5ib3JkZXIoTUlELCBbTkFULCBJUkksIEVORywgQlJFLCBHQVMsIFBPUiwgV0VTLCBOQUYsIFNQQV9OT1JUSCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoQkFSLCBbTlJHLCBOV1ksIFNUUF9OT1JUSF0pO1xuYm9yZGVyKE5XWSwgW05SRywgQkFSLCBTVFAsIEZJTiwgU1dFLCBTS0EsIE5USCwgU1RQX05PUlRIXSk7XG5ib3JkZXIoTlRILCBbTlJHLCBOV1ksIFNLQSwgREVOLCBIRUwsIEhPTCwgQkVMLCBFTkcsIExPTiwgWU9SLCBFREldKTtcbmJvcmRlcihFREksIFtOUkcsIE5USCwgWU9SLCBMVlAsIENMWV0pO1xuYm9yZGVyKFlPUiwgW0VESSwgTlRILCBMT04sIFdBTCwgTFZQXSk7XG5ib3JkZXIoV0FMLCBbTFZQLCBZT1IsIExPTiwgRU5HLCBJUkldKTtcbmJvcmRlcihFTkcsIFtJUkksIFdBTCwgTE9OLCBOVEgsIEJFTCwgUElDLCBCUkUsIE1JRF0pO1xuYm9yZGVyKEJSRSwgW0VORywgUElDLCBQQVIsIEdBUywgTUlEXSk7XG5ib3JkZXIoR0FTLCBbQlJFLCBQQVIsIEJVUiwgTUFSLCBTUEEsIE1JRF0pO1xuYm9yZGVyKFNQQSwgW0dBUywgTUFSLCBQT1JdKTtcbmJvcmRlcihQT1IsIFtNSUQsIFNQQSwgU1BBX05PUlRILCBTUEFfU09VVEhdKTtcbmJvcmRlcihXRVMsIFtHT0wsIFRZTiwgVFVOLCBOQUYsIE1JRCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoTkFGLCBbTUlELCBXRVMsIFRVTl0pO1xuYm9yZGVyKFNUUCwgW05XWSwgTU9TLCBMVk4sIEZJTl0pO1xuYm9yZGVyKFNXRSwgW05XWSwgRklOLCBCT1QsIEJBTCwgREVOLCBTS0FdKTtcbmJvcmRlcihGSU4sIFtOV1ksIFNUUCwgQk9ULCBTV0UsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKFNLQSwgW05XWSwgU1dFLCBERU4sIE5USF0pO1xuYm9yZGVyKERFTiwgW1NLQSwgU1dFLCBCQUwsIEtJRSwgSEVMLCBOVEhdKTtcbmJvcmRlcihIRUwsIFtOVEgsIERFTiwgS0lFLCBIT0xdKTtcbmJvcmRlcihIT0wsIFtOVEgsIEhFTCwgS0lFLCBSVUgsIEJFTF0pO1xuYm9yZGVyKEJFTCwgW0VORywgTlRILCBIT0wsIFJVSCwgQlVSLCBQSUNdKTtcbmJvcmRlcihMT04sIFtZT1IsIE5USCwgRU5HLCBXQUxdKTtcbmJvcmRlcihQSUMsIFtFTkcsIEJFTCwgQlVSLCBQQVIsIEJSRV0pO1xuYm9yZGVyKFBBUiwgW1BJQywgQlVSLCBHQVMsIEJSRV0pO1xuYm9yZGVyKEdBUywgW0JSRSwgUEFSLCBCVVIsIE1BUiwgU1BBLCBNSUQsIFNQQV9OT1JUSF0pO1xuYm9yZGVyKEJVUiwgW1BBUiwgUElDLCBCRUwsIFJVSCwgTVVOLCBNQVIsIEdBU10pO1xuYm9yZGVyKE1BUiwgW0dBUywgQlVSLCBQSUUsIEdPTCwgU1BBLCBTUEFfU09VVEhdKTtcbmJvcmRlcihHT0wsIFtNQVIsIFBJRSwgVFVTLCBUWU4sIFdFUywgU1BBX1NPVVRIXSk7XG5ib3JkZXIoVFlOLCBbVFVTLCBST00sIE5BUCwgSU9OLCBUVU4sIFdFUywgR09MXSk7XG5ib3JkZXIoVFVOLCBbV0VTLCBUWU4sIElPTiwgTkFGXSk7XG5ib3JkZXIoTU9TLCBbU1RQLCBTRVYsIFVLUiwgV0FSLCBMVk5dKTtcbmJvcmRlcihMVk4sIFtCT1QsIFNUUCwgTU9TLCBXQVIsIFBSVSwgQkFMLCBTVFBfU09VVEhdKTtcbmJvcmRlcihCT1QsIFtTV0UsIEZJTiwgTFZOLCBCQUwsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKEJBTCwgW0RFTiwgU1dFLCBCT1QsIExWTiwgUFJVLCBCRVIsIEtJRV0pO1xuYm9yZGVyKEtJRSwgW0hFTCwgREVOLCBCQUwsIEJFUiwgTVVOLCBSVUgsIEhPTF0pO1xuYm9yZGVyKFJVSCwgW0JFTCwgSE9MLCBLSUUsIE1VTiwgQlVSXSk7XG5ib3JkZXIoUElFLCBbVFlSLCBWRU4sIFRVUywgR09MLCBNQVJdKTtcbmJvcmRlcihUVVMsIFtQSUUsIFZFTiwgUk9NLCBUWU4sIEdPTF0pO1xuYm9yZGVyKFJPTSwgW1RVUywgVkVOLCBBUFUsIE5BUCwgVFlOXSk7XG5ib3JkZXIoTkFQLCBbUk9NLCBBUFUsIElPTiwgVFlOXSk7XG5ib3JkZXIoSU9OLCBbVFlOLCBOQVAsIEFQVSwgQURSLCBBTEIsIEdSRSwgQUVHLCBFQVMsIFRVTl0pO1xuYm9yZGVyKFNFViwgW1VLUiwgTU9TLCBBUk0sIEJMQSwgUlVNXSk7XG5ib3JkZXIoVUtSLCBbTU9TLCBTRVYsIFJVTSwgR0FMLCBXQVJdKTtcbmJvcmRlcihXQVIsIFtQUlUsIExWTiwgTU9TLCBVS1IsIEdBTCwgU0lMXSk7XG5ib3JkZXIoUFJVLCBbQkFMLCBMVk4sIFdBUiwgU0lMLCBCRVJdKTtcbmJvcmRlcihCRVIsIFtCQUwsIFBSVSwgU0lMLCBNVU4sIEtJRV0pO1xuYm9yZGVyKE1VTiwgW1JVSCwgS0lFLCBCRVIsIFNJTCwgQk9ILCBUWVIsIEJVUl0pO1xuYm9yZGVyKFRZUiwgW01VTiwgQk9ILCBWSUUsIFRSSSwgVkVOLCBQSUVdKTtcbmJvcmRlcihWRU4sIFtUWVIsIFRSSSwgQURSLCBBUFUsIFJPTSwgVFVTLCBQSUVdKTtcbmJvcmRlcihBUFUsIFtWRU4sIEFEUiwgSU9OLCBOQVAsIFJPTV0pO1xuYm9yZGVyKEFEUiwgW1ZFTiwgVFJJLCBBTEIsIElPTiwgQVBVXSk7XG5ib3JkZXIoQUxCLCBbVFJJLCBTRVIsIEdSRSwgSU9OLCBBRFJdKTtcbmJvcmRlcihHUkUsIFtBTEIsIFNFUiwgQlVMLCBBRUcsIElPTiwgQlVMX1NPVVRIXSk7XG5ib3JkZXIoQUVHLCBbR1JFLCBDT04sIFNNWSwgRUFTLCBJT04sIEJVTF9TT1VUSF0pO1xuYm9yZGVyKEVBUywgW0FFRywgU01ZLCBTWVIsIElPTl0pO1xuYm9yZGVyKEFSTSwgW1NFViwgU1lSLCBTTVksIEFOSywgQkxBXSk7XG5ib3JkZXIoQkxBLCBbUlVNLCBTRVYsIEFSTSwgQU5LLCBDT04sIEJVTF9OT1JUSF0pO1xuYm9yZGVyKFJVTSwgW0JVRCwgR0FMLCBVS1IsIFNFViwgQkxBLCBCVUwsIFNFUiwgQlVMX05PUlRIXSk7XG5ib3JkZXIoR0FMLCBbQk9ILCBTSUwsIFdBUiwgVUtSLCBSVU0sIEJVRCwgVklFXSk7XG5ib3JkZXIoU0lMLCBbQkVSLCBQUlUsIFdBUiwgR0FMLCBCT0gsIE1VTl0pO1xuYm9yZGVyKEJPSCwgW01VTiwgU0lMLCBHQUwsIFZJRSwgVFlSXSk7XG5ib3JkZXIoVklFLCBbQk9ILCBHQUwsIEJVRCwgVFJJLCBUWVJdKTtcbmJvcmRlcihUUkksIFtUWVIsIFZJRSwgQlVELCBTRVIsIEFMQiwgQURSLCBWRU5dKTtcbmJvcmRlcihTRVIsIFtCVUQsIFJVTSwgQlVMLCBHUkUsIEFMQiwgVFJJXSk7XG5ib3JkZXIoQlVMLCBbUlVNLCBDT04sIEdSRSwgU0VSXSk7XG5ib3JkZXIoQ09OLCBbQlVMLCBCTEEsIEFOSywgU01ZLCBBRUcsIEJVTF9TT1VUSCwgQlVMX05PUlRIXSk7XG5ib3JkZXIoU01ZLCBbQ09OLCBBTkssIEFSTSwgU1lSLCBFQVMsIEFFR10pO1xuYm9yZGVyKFNZUiwgW1NNWSwgQVJNLCBFQVNdKTtcbmJvcmRlcihCVUQsIFtWSUUsIEdBTCwgUlVNLCBTRVIsIFRSSV0pO1xuYm9yZGVyKEFOSywgW0JMQSwgQVJNLCBTTVksIENPTl0pO1xuXG5leHBvcnQgY29uc3QgZXVyb3BlID0gbmV3IEdhbWVNYXAoW0JPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEhdKTtcblxuZXhwb3J0IGNvbnN0IFJFR0lPTlMgPSB7IEJPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEggfTtcbiIsImV4cG9ydCBmdW5jdGlvbiBlcnJvcihtc2c6IHN0cmluZykge1xuICAgIGRlYnVnZ2VyO1xuICAgIHJldHVybiBuZXcgRXJyb3IobXNnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBtYXRjaGVzKHJlZ2V4OiBSZWdFeHAsIHRhcmdldDogc3RyaW5nKSB7XG4gICAgbGV0IGNvcHkgPSBuZXcgUmVnRXhwKHJlZ2V4LCAnZycpO1xuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAobWF0Y2ggPSBjb3B5LmV4ZWModGFyZ2V0KSlcbiAgICAgICAgeWllbGQgbWF0Y2g7XG59XG4iLCJpbXBvcnQgeyBVbml0LCBSZWdpb24sIFVuaXRUeXBlIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBPcmRlckJhc2U8VCBleHRlbmRzIHN0cmluZz4ge1xuICAgIHJlYWRvbmx5IHR5cGU6IFQsXG4gICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbn1cblxuZXhwb3J0IGNsYXNzIEhvbGRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnaG9sZCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ2hvbGQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlT3JkZXIgaW1wbGVtZW50cyBPcmRlckJhc2U8J21vdmUnPiB7XG4gICAgcmVhZG9ubHkgdHlwZSA9ICdtb3ZlJztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgdGFyZ2V0OiBSZWdpb24sXG4gICAgICAgIHJlYWRvbmx5IHJlcXVpcmVDb252b3k6IGJvb2xlYW4sXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1cHBvcnRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnc3VwcG9ydCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ3N1cHBvcnQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICAgICByZWFkb25seSB0YXJnZXQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgYXR0YWNrPzogUmVnaW9uLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb252b3lPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnY29udm95Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnY29udm95JztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgc3RhcnQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgZW5kOiBSZWdpb24sXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IHR5cGUgQW55T3JkZXIgPSBIb2xkT3JkZXIgfCBNb3ZlT3JkZXIgfCBTdXBwb3J0T3JkZXIgfCBDb252b3lPcmRlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUob3JkZXJzOiBBbnlPcmRlcltdKSB7XG4gICAgZnVuY3Rpb24gY2FuTW92ZSh1bml0OiBVbml0LCBkc3Q6IFJlZ2lvbikge1xuICAgICAgICBpZiAodW5pdC50eXBlID09IFVuaXRUeXBlLldhdGVyKSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFkamFjZW50Lmhhcyhkc3QpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkc3QudHlwZSAhPSBVbml0VHlwZS5XYXRlciAmJiAhZHN0LmlzU2hvcmUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlID09IFVuaXRUeXBlLkxhbmQgJiYgdW5pdC5yZWdpb24udHlwZSA9PSBVbml0VHlwZS5MYW5kKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNob3JlID0gWy4uLnVuaXQucmVnaW9uLmFkamFjZW50XS5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyICYmIGRzdC5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICAgICAgICAgIGlmIChzaG9yZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXVuaXQucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGRzdCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlICE9IFVuaXRUeXBlLkxhbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuUmVhY2godW5pdDogVW5pdCwgZHN0OiBSZWdpb24pIHtcbiAgICAgICAgaWYgKGNhbk1vdmUodW5pdCwgZHN0KSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGxldCBzaG9yZSA9IFsuLi5kc3QuYXR0YWNoZWRdLmZpbmQoYSA9PiB1bml0LnJlZ2lvbi5hZGphY2VudC5oYXMoYSkpO1xuICAgICAgICByZXR1cm4gc2hvcmUgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkKG9yZGVyOiBBbnlPcmRlcikge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScpIHtcbiAgICAgICAgICAgIGlmIChSZWdpb24uYXJlU2FtZShvcmRlci51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChvcmRlci51bml0LnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIgJiYgIWNhbk1vdmUob3JkZXIudW5pdCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUm91dGVzKG9yZGVyOiBNb3ZlT3JkZXIsIHNraXA/OiBSZWdpb24pIHtcbiAgICAgICAgbGV0IGNvbnZveXMgPSBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdjb252b3knXG4gICAgICAgICAgICAmJiBvLnVuaXQucmVnaW9uICE9IHNraXBcbiAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8uc3RhcnQsIG9yZGVyLnVuaXQucmVnaW9uKVxuICAgICAgICAgICAgJiYgcmVzb2x2ZShvKSkgYXMgQ29udm95T3JkZXJbXTtcblxuICAgICAgICBsZXQgdXNlZCA9IGNvbnZveXMubWFwKCgpID0+IGZhbHNlKTtcbiAgICAgICAgbGV0IG5vZGUgPSBvcmRlci51bml0O1xuXG4gICAgICAgIGxldCBwYXRoOiBDb252b3lPcmRlcltdID0gW107XG4gICAgICAgIGxldCBwYXRoczogQ29udm95T3JkZXJbXVtdID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoKCkge1xuICAgICAgICAgICAgaWYgKGNhbk1vdmUobm9kZSwgb3JkZXIudGFyZ2V0KSB8fCBwYXRoLmxlbmd0aCA+IDAgJiYgY2FuUmVhY2gobm9kZSwgb3JkZXIudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2gocGF0aC5zbGljZSgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgbmV4dCA9IDA7IG5leHQgPCBjb252b3lzLmxlbmd0aDsgKytuZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZWRbbmV4dF0gfHwgIW5vZGUucmVnaW9uLmFsbEFkamFjZW50LmluY2x1ZGVzKGNvbnZveXNbbmV4dF0udW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGxldCBwcmV2aW91cyA9IG5vZGU7XG4gICAgICAgICAgICAgICAgdXNlZFtuZXh0XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKGNvbnZveXNbbmV4dF0pO1xuICAgICAgICAgICAgICAgIG5vZGUgPSBjb252b3lzW25leHRdLnVuaXQ7XG5cbiAgICAgICAgICAgICAgICBzZWFyY2goKTtcblxuICAgICAgICAgICAgICAgIG5vZGUgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICBwYXRoLnBvcCgpO1xuICAgICAgICAgICAgICAgIHVzZWRbbmV4dF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlYXJjaCgpO1xuXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChvcmRlci5yZXF1aXJlQ29udm95ICYmIHBhdGhzLmZpbHRlcihhID0+IGEubGVuZ3RoID4gMCkubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4geyBjb252b3lzLCBwYXRocyB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRIb2xkU3VwcG9ydChvcmRlcjogQW55T3JkZXIpIHtcbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuXG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRNb3ZlU3VwcG9ydChvcmRlcjogTW92ZU9yZGVyKSB7XG4gICAgICAgIHJldHVybiBvcmRlcnMuZmlsdGVyKG8gPT4gby50eXBlID09ICdzdXBwb3J0J1xuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZUVxdWFsKG8udGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIFN1cHBvcnRPcmRlcltdO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3JkZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChpc1ZhbGlkKG9yZGVyc1tpXSkpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBsZXQgZHVtcCA9IG9yZGVyc1tpXTtcbiAgICAgICAgb3JkZXJzLnNwbGljZShpLCAxLCBuZXcgSG9sZE9yZGVyKGR1bXAudW5pdCkpO1xuICAgIH1cblxuICAgIGxldCBjaGVja2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcbiAgICBsZXQgcGFzc2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcblxuICAgIGxldCBzdGFjazogQW55T3JkZXJbXSA9IFtdO1xuICAgIGZ1bmN0aW9uIHJlc29sdmUob3JkZXI6IEFueU9yZGVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChzdGFja1swXSA9PSBvcmRlciAmJiBzdGFjay5ldmVyeShvID0+IG8udHlwZSA9PSAnbW92ZScpICYmIHN0YWNrLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSkge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ3JlY3Vyc2l2ZSByZXNvbHZlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hlY2tlZC5oYXMob3JkZXIpKVxuICAgICAgICAgICAgcmV0dXJuIHBhc3NlZC5oYXMob3JkZXIpO1xuICAgICAgICBjaGVja2VkLmFkZChvcmRlcik7XG5cbiAgICAgICAgaWYgKHN0YWNrLmluY2x1ZGVzKG9yZGVyKSlcbiAgICAgICAgICAgIHRocm93IGVycm9yKGByZWN1cnNpdmUgcmVzb2x2ZWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGFjay5wdXNoKG9yZGVyKTtcblxuICAgICAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ2hvbGQnKSB7XG4gICAgICAgICAgICAgICAgcGFzc2VkLmFkZChvcmRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50ID0gb3JkZXJzLmZpbmQobyA9PiBSZWdpb24uYXJlU2FtZShvLnVuaXQucmVnaW9uLCBvcmRlci50YXJnZXQpKTtcblxuICAgICAgICAgICAgICAgIGxldCBiZXN0OiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgICAgICAgICBsZXQgYmVzdERpc2xvZGdlOiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBkaXNsb2RnZVN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgICAgIGxldCBmb3JjZVJlc29sdmVkOiBNb3ZlT3JkZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBmaW5kUm91dGVzKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdXBwb3J0ID0gZmluZE1vdmVTdXBwb3J0KGF0dGFjayk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHByZXZlbnQgZGlzbG9kZ2VkIHVuaXQgZnJvbSBib3VuY2luZyB3aXRoIG90aGVyIHVuaXRzIGVudGVyaW5nIGRpc2xvZGdlcidzIHJlZ2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVuZW1pZXMgPSBzdXBwb3J0LmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJvdXRlcyA9IGZpbmRSb3V0ZXMoY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJvdXRlcyAhPSBudWxsICYmIGN1cnJlbnRSb3V0ZXMuY29udm95cy5sZW5ndGggPT0gMCAmJiByb3V0ZXMuY29udm95cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50QXR0YWNrID0gZmluZE1vdmVTdXBwb3J0KGN1cnJlbnQpLmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGF0dGFjay51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXR0YWNrLmxlbmd0aCA+IGVuZW1pZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZXNvbHZlZCA9IGF0dGFjaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0Lmxlbmd0aCA+IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0ID0gW2F0dGFja107XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlbmd0aCA9IHN1cHBvcnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQubGVuZ3RoID09IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0LnB1c2goYXR0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGF0dGFjay51bml0LnRlYW0gIT0gY3VycmVudC51bml0LnRlYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbmVtaWVzID0gc3VwcG9ydC5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZW1pZXMubGVuZ3RoID4gZGlzbG9kZ2VTdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZSA9IFthdHRhY2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2xvZGdlU3RyZW5ndGggPSBlbmVtaWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW5lbWllcy5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZS5wdXNoKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmVzdC5sZW5ndGggIT0gMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJlc3RbMF0gIT0gb3JkZXIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGJlc3RbMF0gIT0gZm9yY2VSZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYmVzdFswXS51bml0LnJlZ2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiZXN0RGlzbG9kZ2UubGVuZ3RoICE9IDEgfHwgYmVzdFswXSAhPSBiZXN0RGlzbG9kZ2VbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEF0dGFjayA9IGZpbmRNb3ZlU3VwcG9ydChjdXJyZW50KS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBiZXN0WzBdLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yKCdGYWlsZWQgdG8gZmlsdGVyIG91dCBkaXNsb2RnZWQgYXR0YWNrJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudC50eXBlICE9ICdtb3ZlJyB8fCAhcmVzb2x2ZShjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJlc3REaXNsb2RnZS5sZW5ndGggIT0gMSB8fCBiZXN0WzBdICE9IGJlc3REaXNsb2RnZVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kSG9sZFN1cHBvcnQoY3VycmVudCkubGVuZ3RoID49IGRpc2xvZGdlU3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFzc2VkLmFkZChvcmRlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdjb252b3knKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyLnVuaXQucmVnaW9uLnR5cGUgIT0gVW5pdFR5cGUuV2F0ZXIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBvcmRlcnMuZmluZChvID0+IG8udHlwZSA9PSAnbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgJiYgUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udGFyZ2V0LCBvcmRlci5lbmQpKTtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXNzZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ3N1cHBvcnQnKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN1cHBvcnRlZSA9IG9yZGVycy5maW5kKG8gPT4gUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAob3JkZXIuYXR0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUudHlwZSAhPSAnbW92ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICFjYW5SZWFjaChvcmRlci51bml0LCBvcmRlci5hdHRhY2spXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhUmVnaW9uLmFyZUVxdWFsKHN1cHBvcnRlZS50YXJnZXQsIG9yZGVyLmF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZS50eXBlID09ICdtb3ZlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIWNhblJlYWNoKG9yZGVyLnVuaXQsIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0YWNrLnR5cGUgIT0gJ21vdmUnIHx8ICFSZWdpb24uYXJlU2FtZShhdHRhY2sudGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3JkZXIudW5pdC50ZWFtID09IGF0dGFjay51bml0LnRlYW0pXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydGVlLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVnaW9uLmFyZVNhbWUoc3VwcG9ydGVlLnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGlzIGZyb20gdGhlIHRhcmdldCByZWdpb24gb2YgdGhlIHN1cHBvcnRlZCBhdHRhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIG9ubHkgY3V0IHN1cHBvcnQgYnkgZGlzbG9kZ2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5kTW92ZVN1cHBvcnQoYXR0YWNrKS5sZW5ndGggPiBmaW5kSG9sZFN1cHBvcnQob3JkZXIpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBpcyBjb252b3llZCBieSB0aGUgdGFyZ2V0IHJlZ2lvbiBvZiB0aGUgc3VwcG9ydGVkIGF0dGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBjYW4gb25seSBjdXQgc3VwcG9ydCBpZiBpdCBoYXMgYW4gYWx0ZXJuYXRlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2ssIHN1cHBvcnRlZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IGZpbmRSb3V0ZXMoYXR0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXNzZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgZXJyb3IoYEludmFsaWQgb3JkZXJgKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGV2aWN0ZWQ6IFVuaXRbXSA9IFtdO1xuICAgIGxldCByZXNvbHZlZDogTW92ZU9yZGVyW10gPSBbXTtcblxuICAgIGZvciAobGV0IG9yZGVyIG9mIG9yZGVycykge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScgJiYgcmVzb2x2ZShvcmRlcikpIHtcbiAgICAgICAgICAgIHJlc29sdmVkLnB1c2gob3JkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICBldmljdGVkLnB1c2gob3JkZXIudW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyByZXNvbHZlZCwgZXZpY3RlZCB9O1xufVxuIiwiaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJztcbmltcG9ydCB7IGVycm9yLCBtYXRjaGVzIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IEdhbWVTdGF0ZSwgVW5pdCwgVW5pdFR5cGUgfSBmcm9tICcuL2dhbWUnO1xuaW1wb3J0IHsgUkVHSU9OUywgZXVyb3BlIH0gZnJvbSAnLi9kYXRhJztcbmltcG9ydCB7IEhvbGRPcmRlciwgTW92ZU9yZGVyLCBTdXBwb3J0T3JkZXIsIENvbnZveU9yZGVyIH0gZnJvbSAnLi9ydWxlcyc7XG5cbmV4cG9ydCB0eXBlIElucHV0cyA9IHsgW3RlYW06IHN0cmluZ106IHN0cmluZ1tdIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHVybiB7XG4gICAgb3JkZXJzOiBJbnB1dHMsXG4gICAgcmV0cmVhdHM/OiBJbnB1dHMsXG4gICAgYnVpbGRzPzogSW5wdXRzLFxufVxuXG5jb25zdCBzZXNzaW9uX2tleSA9IGAzNDNldmhqMjN2djA1YmVpaXY4ZGxkbG5vNGA7XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXlkaXBsb21hY3kocGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5wbGF5ZGlwbG9tYWN5LmNvbSR7cGF0aH1gO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QodXJsLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdjb29raWUnOiBgUEhQU0VTU0lEPSR7c2Vzc2lvbl9rZXl9YCB9LFxuICAgICAgICAgICAgcmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG4gICAgICAgICAgICBmb2xsb3dSZWRpcmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9IDIwMCkgdGhyb3cgZXJyb3IoJ2ludmFsaWQgc3RhdHVzIGNvZGUnKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdhbWVfaGlzdG9yeShxdWVyeTogc3RyaW5nKSB7XG4gICAgbGV0IGNhY2hlID0gYGNhY2hlLyR7cXVlcnl9YDtcblxuICAgIGxldCBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGUsICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeShgL2dhbWVfaGlzdG9yeS5waHA/JHtxdWVyeX1gKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGNhY2hlLCBkYXRhLCAndXRmOCcpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRfaGlzdG9yeShpZDogbnVtYmVyLCBwaGFzZTogc3RyaW5nLCBkYXRlOiBudW1iZXIpIHtcbiAgICBsZXQgcXVlcnkgPSBgZ2FtZV9pZD0ke2lkfSZwaGFzZT0ke3BoYXNlfSZnZGF0ZT0ke2RhdGV9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IGdhbWVfaGlzdG9yeShxdWVyeSk7XG5cbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICBsZXQgaW5wdXRzOiBJbnB1dHMgPSB7fTtcblxuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPihcXHcrKTxcXC9iPjx1bD4oLio/KTxcXC91bD4vLCBkYXRhKSkge1xuICAgICAgICBsZXQgdGVhbSA9IG1hdGNoWzFdO1xuICAgICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHBhcnQgb2YgbWF0Y2hlcygvPGxpPiguKj8pPFxcL2xpPi8sIG1hdGNoWzJdKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKHBhcnRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKSBjb250aW51ZTtcblxuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1t0ZWFtXSA9IGxpc3Q7XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKVxuICAgICAgICByZXR1cm4gaW5wdXRzO1xuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRfZ2FtZShpZDogbnVtYmVyKSB7XG4gICAgbGV0IHR1cm5zID0gW107XG4gICAgbGV0IGhpc3RvcnkgPSBhd2FpdCBnYW1lX2hpc3RvcnkoYGdhbWVfaWQ9JHtpZH1gKTtcblxuICAgIGZvciAobGV0IGNvbnRlbnQgb2YgaGlzdG9yeS5zcGxpdCgnPC9icj48L2JyPicpKSB7XG4gICAgICAgIGxldCBkYXRlID0gdHVybnMubGVuZ3RoO1xuICAgICAgICBsZXQgdHVybjogVHVybiA9IHsgb3JkZXJzOiB7fSB9O1xuXG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBtYXRjaGVzKC88YSBocmVmPSdnYW1lX2hpc3RvcnlcXC5waHBcXD9nYW1lX2lkPShcXGQrKSZwaGFzZT0oXFx3KSZnZGF0ZT0oXFxkKykvLCBjb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKGlkICE9IHBhcnNlSW50KG1hdGNoWzFdKSkgdGhyb3cgZXJyb3IoYEZhaWxlZCB0byBwYXJzZSBnYW1lIGhpc3Rvcnk6ICR7aWR9YCk7XG4gICAgICAgICAgICBpZiAoZGF0ZSAhPSBwYXJzZUludChtYXRjaFszXSkpIHRocm93IGVycm9yKGBGYWlsZWQgdG8gcGFyc2UgZ2FtZSBoaXN0b3J5OiAke2lkfWApO1xuXG4gICAgICAgICAgICBsZXQgcGhhc2UgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgIGxldCBpbnB1dHMgPSBhd2FpdCBnZXRfaGlzdG9yeShpZCwgcGhhc2UsIGRhdGUpO1xuICAgICAgICAgICAgaWYgKGlucHV0cyA9PSBudWxsKSBjb250aW51ZTtcblxuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ08nOiB0dXJuLm9yZGVycyA9IGlucHV0czsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnUic6IHR1cm4ucmV0cmVhdHMgPSBpbnB1dHM7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0InOiB0dXJuLmJ1aWxkcyA9IGlucHV0czsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSBjb250aW51ZTtcblxuICAgICAgICB0dXJucy5wdXNoKHR1cm4pO1xuICAgIH1cblxuICAgIHJldHVybiB0dXJucztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldF9wYWdlKHBhZ2U6IG51bWJlcikge1xuICAgIGxldCB1cmwgPSBgL2dhbWVzLnBocD9zdWJwYWdlPWFsbF9maW5pc2hlZCZ2YXJpYW50LTA9MSZtYXBfdmFyaWFudC0wPTEmY3VycmVudF9wYWdlPSR7cGFnZX1gO1xuICAgIGxldCBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeSh1cmwpO1xuXG4gICAgbGV0IGlkcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxhIGhyZWY9XCJnYW1lX3BsYXlfZGV0YWlsc1xcLnBocFxcP2dhbWVfaWQ9KFxcZCspLywgZGF0YSkpIHtcbiAgICAgICAgbGV0IGdhbWVJZCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgaWRzLmFkZChnYW1lSWQpO1xuICAgIH1cblxuICAgIHJldHVybiBbLi4uaWRzXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRfZ2FtZShyYXc6IEJ1ZmZlcik6IFR1cm5bXSB7XG4gICAgbGV0IGRhdGEgPSB6bGliLmd1bnppcFN5bmMocmF3KTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhLnRvU3RyaW5nKCd1dGY4JykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVfZ2FtZSh0dXJuczogVHVybltdKSB7XG4gICAgbGV0IGRhdGEgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeSh0dXJucyksICd1dGY4Jyk7XG4gICAgcmV0dXJuIHpsaWIuZ3ppcFN5bmMoZGF0YSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gICAgZnMubWtkaXJwU3luYygnZGF0YScpO1xuICAgIGZzLm1rZGlycFN5bmMoJ2NhY2hlJyk7XG5cbiAgICBsZXQgZXJyb3JzID0gMDtcbiAgICBsZXQgb2xkS25vd247XG4gICAgbGV0IG5ld0tub3duID0geyBuZXdlc3Q6IDAsIGNvdW50OiAwIH07XG4gICAgdHJ5IHtcbiAgICAgICAgb2xkS25vd24gPSBmcy5yZWFkSlNPTlN5bmMoJ2RhdGEva25vd24uanNvbicpIGFzIHR5cGVvZiBuZXdLbm93bjtcbiAgICAgICAgY29uc29sZS5sb2coYGtub3duOiAke29sZEtub3duLm5ld2VzdH0gKyR7b2xkS25vd24uY291bnR9YCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBvbGRLbm93biA9IG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHNraXAgPSAwXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTAwMCAmJiBlcnJvcnMgPCAxMDsgKytpKSB7XG4gICAgICAgIGlmIChza2lwID49IDE1KSB7XG4gICAgICAgICAgICBza2lwIC09IDE1O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgZmV0Y2hpbmcgcGFnZSAke2l9YClcbiAgICAgICAgbGV0IGlkcyA9IGF3YWl0IGdldF9wYWdlKGkpO1xuXG4gICAgICAgIGZvciAobGV0IGlkIG9mIGlkcykge1xuICAgICAgICAgICAgaWYgKG5ld0tub3duLm5ld2VzdCA9PSAwKVxuICAgICAgICAgICAgICAgIG5ld0tub3duLm5ld2VzdCA9IGlkO1xuXG4gICAgICAgICAgICBpZiAob2xkS25vd24gJiYgaWQgPT0gb2xkS25vd24ubmV3ZXN0KSB7XG4gICAgICAgICAgICAgICAgc2tpcCA9IG9sZEtub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIG5ld0tub3duLmNvdW50ICs9IG9sZEtub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIG9sZEtub3duID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNraXAgPj0gMSkge1xuICAgICAgICAgICAgICAgIHNraXAgLT0gMTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgc2tpcHBpbmcgZ2FtZSAke2lkfWApXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmZXRjaGluZyBnYW1lICR7aWR9YClcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IG91dHB1dEZpbGUgPSBgZGF0YS8ke2lkfWA7XG4gICAgICAgICAgICAgICAgaWYgKCFmcy5wYXRoRXhpc3RzU3luYyhvdXRwdXRGaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGEgPSB3cml0ZV9nYW1lKGdhbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyc2VkID0gcmVhZF9nYW1lKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShwYXJzZWQpICE9IEpTT04uc3RyaW5naWZ5KGdhbWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ2dhbWUgZW5jb2RpbmcgZmFpbGVkJylcblxuICAgICAgICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG91dHB1dEZpbGUsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChlcnJvcnMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICArK25ld0tub3duLmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICArK2Vycm9ycztcbiAgICAgICAgICAgICAgICBmcy5hcHBlbmRGaWxlU3luYygnZXJyb3JzLnR4dCcsIGAke2lkfSAke2V9YCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGlkLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGRLbm93biA9PSBudWxsKSB7XG4gICAgICAgICAgICBmcy53cml0ZUpTT05TeW5jKCdkYXRhL2tub3duLmpzb24nLCBuZXdLbm93bik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhga25vd246ICR7bmV3S25vd24ubmV3ZXN0fSArJHtuZXdLbm93bi5jb3VudH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrKCkge1xuICAgIGZzLm1rZGlycFN5bmMoJ2RhdGEnKTtcbiAgICBmcy5ta2RpcnBTeW5jKCdjYWNoZScpO1xuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBsZXQgYWxsSWRzID0gZnMucmVhZGRpclN5bmMoJ2RhdGEnKTtcblxuICAgIGZvciAobGV0IGlkIG9mIGFsbElkcykge1xuICAgICAgICBpZiAoaWQgPT0gJ2tub3duLmpzb24nKSBjb250aW51ZTtcblxuICAgICAgICBsZXQgZ2FtZSA9IHJlYWRfZ2FtZShmcy5yZWFkRmlsZVN5bmMoYGRhdGEvJHtpZH1gKSk7XG5cbiAgICAgICAgbGV0IHR1cm5zID0gMDtcbiAgICAgICAgbGV0IGhpc3RvcnkgPSBhd2FpdCBnYW1lX2hpc3RvcnkoYGdhbWVfaWQ9JHtpZH1gKTtcblxuICAgICAgICBmb3IgKGxldCBjb250ZW50IG9mIGhpc3Rvcnkuc3BsaXQoJzwvYnI+PC9icj4nKSkge1xuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBfIG9mIG1hdGNoZXMoLzxhIGhyZWY9J2dhbWVfaGlzdG9yeVxcLnBocFxcP2dhbWVfaWQ9KFxcZCspJnBoYXNlPShcXHcpJmdkYXRlPShcXGQrKS8sIGNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWZvdW5kKSBjb250aW51ZTtcbiAgICAgICAgICAgICsrdHVybnM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHVybnMgIT0gZ2FtZS5sZW5ndGggfHwgdHVybnMgPT0gMClcbiAgICAgICAgICAgIHRocm93IGVycm9yKGBNaXNtYXRjaDogJHtpZH0gJHt0dXJuc30gJHtnYW1lLmxlbmd0aH1gKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgJHsoKytjb3VudCkudG9TdHJpbmcoKS5wYWRTdGFydChhbGxJZHMubGVuZ3RoLnRvU3RyaW5nKCkubGVuZ3RoKX0gLyAke2FsbElkcy5sZW5ndGh9ICR7aWR9ICR7dHVybnN9YCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Vfb3JkZXJzKGdhbWU6IEdhbWVTdGF0ZSwgaW5wdXRzOiBJbnB1dHMpIHtcbiAgICBsZXQgaXNOZXcgPSBnYW1lLnVuaXRzLnNpemUgPT0gMDtcbiAgICBsZXQgZmxlZXRzID0gbmV3IFNldChbUkVHSU9OUy5MT04sIFJFR0lPTlMuRURJLCBSRUdJT05TLkJSRSwgUkVHSU9OUy5OQVAsIFJFR0lPTlMuS0lFLCBSRUdJT05TLlRSSSwgUkVHSU9OUy5BTkssIFJFR0lPTlMuU0VWLCBSRUdJT05TLlNUUF9TT1VUSF0pO1xuXG4gICAgbGV0IG9yZGVycyA9IFtdO1xuICAgIGxldCByZXNvbHZlZCA9IFtdO1xuXG4gICAgZm9yIChsZXQgdGVhbSBpbiBpbnB1dHMpIHtcbiAgICAgICAgZm9yIChsZXQgcmF3IG9mIGlucHV0c1t0ZWFtXSkge1xuICAgICAgICAgICAgbGV0IG1hdGNoID0gLyguKj8pKEhPTER8TU9WRXxTVVBQT1JUfENPTlZPWSkoLiopLT4oLiopLy5leGVjKHJhdyk7XG4gICAgICAgICAgICBpZiAobWF0Y2ggPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBtYXRjaCBvcmRlcjogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgIGxldCByZWdpb25OYW1lID0gbWF0Y2hbMV0udHJpbSgpO1xuICAgICAgICAgICAgbGV0IG9wID0gbWF0Y2hbMl07XG4gICAgICAgICAgICBsZXQgYXJncyA9IG1hdGNoWzNdLnRyaW0oKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBtYXRjaFs0XS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT0gJ0ludmFsaWQgb3JkZXIgb3Igc3ludGF4IGVycm9yJylcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgbGV0IHJlZ2lvbiA9IGdhbWUubWFwLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByZWdpb25OYW1lKTtcbiAgICAgICAgICAgIGlmIChyZWdpb24gPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3Igb3JkZXI6ICR7cmF3fSBgKTtcblxuICAgICAgICAgICAgbGV0IHVuaXQgPSBbLi4uZ2FtZS51bml0c10uZmluZCh1ID0+IHUucmVnaW9uID09IHJlZ2lvbiAmJiB1LnRlYW0gPT0gdGVhbSk7XG4gICAgICAgICAgICBpZiAodW5pdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV3KSBnYW1lLnVuaXRzLmFkZCh1bml0ID0gbmV3IFVuaXQocmVnaW9uLCBmbGVldHMuaGFzKHJlZ2lvbikgPyBVbml0VHlwZS5XYXRlciA6IFVuaXRUeXBlLkxhbmQsIHRlYW0pKTtcbiAgICAgICAgICAgICAgICBlbHNlIHRocm93IGVycm9yKGBVbml0IGRvZXMgbm90IGV4aXN0OiAke3RlYW19ICR7cmVnaW9uLm5hbWV9IGApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgb3JkZXI7XG5cbiAgICAgICAgICAgIGlmIChvcCA9PSAnSE9MRCcpIHtcbiAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBIb2xkT3JkZXIodW5pdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdNT1ZFJykge1xuICAgICAgICAgICAgICAgIGxldCBtb3ZlQXJncyA9IGFyZ3Muc3BsaXQoJ1ZJQScpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJhd1RhcmdldCA9IG1vdmVBcmdzWzBdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdUYXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHRhcmdldCByZWdpb24gZm9yIG1vdmUgb3JkZXI6ICR7YXJnc30gYCk7XG5cbiAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBNb3ZlT3JkZXIodW5pdCwgdGFyZ2V0LCBtb3ZlQXJncy5sZW5ndGggPiAxKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09ICdyZXNvbHZlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWQucHVzaChvcmRlcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdTVVBQT1JUJykge1xuICAgICAgICAgICAgICAgIGxldCBbcmF3U3JjLCByYXdEc3RdID0gYXJncy5zcGxpdCgnIHRvICcpOyAvLyAnWCB0byBob2xkJyBvciAnWCB0byBZJ1xuXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3U3JjKTtcbiAgICAgICAgICAgICAgICBpZiAoc3JjID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB0YXJnZXQgcmVnaW9uIGZvciBzdXBwb3J0IG9yZGVyOiAke3Jhd1NyY30gYCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmF3RHN0ID09ICdob2xkJylcbiAgICAgICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgU3VwcG9ydE9yZGVyKHVuaXQsIHNyYyk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkc3QgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd0RzdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkc3QgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIGF0dGFjayByZWdpb24gZm9yIHN1cHBvcnQgb3JkZXI6ICR7cmF3RHN0fSBgKTtcblxuICAgICAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBTdXBwb3J0T3JkZXIodW5pdCwgc3JjLCBkc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3AgPT0gJ0NPTlZPWScpIHtcbiAgICAgICAgICAgICAgICBsZXQgW3Jhd1NyYywgcmF3RHN0XSA9IGFyZ3Muc3BsaXQoJyB0byAnKTsgLy8gJ1ggdG8gWSdcblxuICAgICAgICAgICAgICAgIGxldCBzcmMgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1NyYyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYyA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgc3RhcnQgcmVnaW9uIGZvciBjb252b3kgb3JkZXI6ICR7cmF3U3JjfSBgKTtcblxuICAgICAgICAgICAgICAgIGxldCBkc3QgPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd0RzdCk7XG4gICAgICAgICAgICAgICAgaWYgKGRzdCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgZW5kIHJlZ2lvbiBmb3IgY29udm95IG9yZGVyOiAke3Jhd0RzdH0gYCk7XG5cbiAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBDb252b3lPcmRlcih1bml0LCBzcmMsIGRzdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yKGBpbnZhbGlkIG9yZGVyOiAke29wfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9yZGVycy5wdXNoKG9yZGVyKTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb3JkZXJzLCByZXNvbHZlZCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VfcmV0cmVhdHMoZXZpY3RlZDogVW5pdFtdLCBpbnB1dHM6IElucHV0cykge1xuICAgIGxldCByZXRyZWF0cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgdGVhbSBpbiBpbnB1dHMpIHtcbiAgICAgICAgZm9yIChsZXQgcmF3IG9mIGlucHV0c1t0ZWFtXSkge1xuICAgICAgICAgICAgbGV0IG1hdGNoID0gLygoLiopUkVUUkVBVCguKil8KC4qKURFU1RST1kpXFxzKy0+KC4qKS8uZXhlYyhyYXcpO1xuICAgICAgICAgICAgaWYgKG1hdGNoID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gbWF0Y2ggcmV0cmVhdDogJHtyYXd9IGApO1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gbWF0Y2hbNV0udHJpbSgpO1xuICAgICAgICAgICAgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJhd1NyYyA9IG1hdGNoWzJdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBsZXQgcmF3RHN0ID0gbWF0Y2hbM10udHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3U3JjKTtcbiAgICAgICAgICAgICAgICBpZiAoc3JjID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIHJldHJlYXQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IGRzdCA9IGV1cm9wZS5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3RHN0KTtcbiAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIHJldHJlYXQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBldmljdGVkLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSBzcmMgJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB1bml0IGZvciByZXRyZWF0OiAke3Jhd30gJHt0ZWFtfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0cmVhdHMucHVzaCh7IHVuaXQsIHRhcmdldDogZHN0LCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByYXdSZWdpb24gPSBtYXRjaFs0XS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVnaW9uID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdSZWdpb24pO1xuICAgICAgICAgICAgICAgIGlmIChyZWdpb24gPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3IgcmV0cmVhdDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdW5pdCA9IFsuLi5ldmljdGVkXS5maW5kKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uICYmIHUudGVhbSA9PSB0ZWFtKTtcbiAgICAgICAgICAgICAgICBpZiAodW5pdCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgdW5pdCBmb3IgcmV0cmVhdDogJHtyYXd9ICR7dGVhbX1gKTtcblxuICAgICAgICAgICAgICAgIHJldHJlYXRzLnB1c2goeyB1bml0LCB0YXJnZXQ6IG51bGwsIHJlc29sdmVkOiByZXN1bHQgPT0gJ3Jlc29sdmVkJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXRyZWF0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlX2J1aWxkcyhnYW1lOiBHYW1lU3RhdGUsIGlucHV0czogSW5wdXRzKSB7XG4gICAgbGV0IGJ1aWxkcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgdGVhbSBpbiBpbnB1dHMpIHtcbiAgICAgICAgZm9yIChsZXQgcmF3IG9mIGlucHV0c1t0ZWFtXSkge1xuICAgICAgICAgICAgbGV0IG1hdGNoID0gLyhCVUlMRFxccysoZmxlZXR8YXJteSlcXHMrKC4qKXwoLiopREVTVFJPWSlcXHMrLT4oLiopLy5leGVjKHJhdyk7XG4gICAgICAgICAgICBpZiAobWF0Y2ggPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBtYXRjaCBidWlsZDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBtYXRjaFs1XS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gbWF0Y2hbMl0udHJpbSgpO1xuICAgICAgICAgICAgICAgIGxldCByYXdSZWdpb24gPSBtYXRjaFszXS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVnaW9uID0gZXVyb3BlLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdSZWdpb24pO1xuICAgICAgICAgICAgICAgIGlmIChyZWdpb24gPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHJlZ2lvbiBmb3IgYnVpbGQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBuZXcgVW5pdChyZWdpb24sIHR5cGUgPT0gJ2ZsZWV0JyA/IFVuaXRUeXBlLldhdGVyIDogVW5pdFR5cGUuTGFuZCwgdGVhbSk7XG5cbiAgICAgICAgICAgICAgICBidWlsZHMucHVzaCh7IHVuaXQsIHJlc29sdmVkOiByZXN1bHQgPT0gJ3Jlc29sdmVkJyB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHJhd1JlZ2lvbiA9IG1hdGNoWzRdLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGxldCByZWdpb24gPSBldXJvcGUucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1JlZ2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciBidWlsZDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdW5pdCA9IFsuLi5nYW1lLnVuaXRzXS5maW5kKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uICYmIHUudGVhbSA9PSB0ZWFtKTtcbiAgICAgICAgICAgICAgICBpZiAodW5pdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gJ3Jlc29sdmVkJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHVuaXQgZm9yIGJ1aWxkOiAke3Jhd30gJHt0ZWFtfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1aWxkcy5wdXNoKHsgdW5pdCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkcztcbn1cbiIsImltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJztcblxuaW1wb3J0IHsgZXVyb3BlLCBSRUdJT05TIH0gZnJvbSAnLi9kYXRhJztcbmltcG9ydCB7IFVuaXQsIFJlZ2lvbiwgR2FtZVN0YXRlLCBVbml0VHlwZSB9IGZyb20gJy4vZ2FtZSc7XG5pbXBvcnQgeyBBbnlPcmRlciwgTW92ZU9yZGVyLCBIb2xkT3JkZXIsIFN1cHBvcnRPcmRlciwgQ29udm95T3JkZXIsIHJlc29sdmUgfSBmcm9tICcuL3J1bGVzJztcbmltcG9ydCAqIGFzIHNjcmFwZSBmcm9tICcuL3NjcmFwZSc7XG5pbXBvcnQgeyBlcnJvciB9IGZyb20gJy4vdXRpbCc7XG5cbmZ1bmN0aW9uKiBtYXRjaGVzKHJlZ2V4OiBSZWdFeHAsIHRhcmdldDogc3RyaW5nKSB7XG4gICAgbGV0IGNvcHkgPSBuZXcgUmVnRXhwKHJlZ2V4LCAnZycpO1xuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAobWF0Y2ggPSBjb3B5LmV4ZWModGFyZ2V0KSlcbiAgICAgICAgeWllbGQgbWF0Y2g7XG59XG5cbmNvbnN0IGlnbm9yZWRfZ2FtZXMgPSBuZXcgU2V0KFsxNTk1OTQsIDE1ODA5M10pO1xuXG5mdW5jdGlvbiBydW5fZ2FtZShpZDogbnVtYmVyLCB0dXJuczogc2NyYXBlLlR1cm5bXSkge1xuICAgIGxldCBnYW1lID0gbmV3IEdhbWVTdGF0ZShldXJvcGUsIFtdKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHVybnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgcHJvY2Vzc2luZyAke2kgJSAyID8gJ2ZhbGwnIDogJ3NwcmluZyd9ICR7MTkwMSArIE1hdGguZmxvb3IoaSAvIDIpfWApO1xuXG4gICAgICAgIGxldCByZW1vdGUgPSBzY3JhcGUucGFyc2Vfb3JkZXJzKGdhbWUsIHR1cm5zW2ldLm9yZGVycyk7XG4gICAgICAgIGxldCBvcmRlcnMgPSByZW1vdGUub3JkZXJzLnNsaWNlKCk7XG5cbiAgICAgICAgZm9yIChsZXQgdW5pdCBvZiBnYW1lLnVuaXRzKSB7XG4gICAgICAgICAgICBsZXQgb3JkZXIgPSBvcmRlcnMuZmluZChvID0+IG8udW5pdCA9PSB1bml0KTtcbiAgICAgICAgICAgIGlmIChvcmRlcikgY29udGludWU7XG4gICAgICAgICAgICBvcmRlcnMucHVzaChuZXcgSG9sZE9yZGVyKHVuaXQpKVxuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdnZXI7XG4gICAgICAgIGxldCBsb2NhbCA9IHJlc29sdmUob3JkZXJzKTtcblxuICAgICAgICBmb3IgKGxldCBtb3ZlIG9mIGxvY2FsLnJlc29sdmVkKSB7XG4gICAgICAgICAgICBpZiAoIWdhbWUudW5pdHMuaGFzKG1vdmUudW5pdCkpIGRlYnVnZ2VyO1xuICAgICAgICAgICAgZ2FtZS51bml0cy5kZWxldGUobW92ZS51bml0KTtcbiAgICAgICAgICAgIGdhbWUudW5pdHMuYWRkKG5ldyBVbml0KG1vdmUudGFyZ2V0LCBtb3ZlLnVuaXQudHlwZSwgbW92ZS51bml0LnRlYW0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IG9yZGVyIG9mIG9yZGVycykge1xuICAgICAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsLnJlc29sdmVkLmluY2x1ZGVzKG9yZGVyKSAhPSByZW1vdGUucmVzb2x2ZWQuaW5jbHVkZXMob3JkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9yZGVycyk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yKGBNaXNtYXRjaCBpbiBnYW1lICR7aWR9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvY2FsLmV2aWN0ZWQubGVuZ3RoID09IDAgIT0gIXR1cm5zW2ldLnJldHJlYXRzKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcihgTWlzbWF0Y2ggaW4gZ2FtZSAke2lkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvY2FsLmV2aWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgZXZpY3RlZCA9IG5ldyBTZXQobG9jYWwuZXZpY3RlZCk7XG4gICAgICAgICAgICBsZXQgcmV0cmVhdHMgPSBzY3JhcGUucGFyc2VfcmV0cmVhdHMobG9jYWwuZXZpY3RlZCwgdHVybnNbaV0ucmV0cmVhdHMhKTtcbiAgICAgICAgICAgIGZvciAobGV0IHJldHJlYXQgb2YgcmV0cmVhdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmV0cmVhdC5yZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmV0cmVhdC50YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLm1vdmUocmV0cmVhdC51bml0LCByZXRyZWF0LnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKHJldHJlYXQudW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIGV2aWN0ZWQuZGVsZXRlKHJldHJlYXQudW5pdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgdW5pdCBvZiBldmljdGVkKSB7XG4gICAgICAgICAgICAgICAgZ2FtZS51bml0cy5kZWxldGUodW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaSAlIDIgPT0gMSkge1xuICAgICAgICAgICAgbGV0IGJ1aWxkcyA9IHNjcmFwZS5wYXJzZV9idWlsZHMoZ2FtZSwgdHVybnNbaV0uYnVpbGRzISk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGJ1aWxkIG9mIGJ1aWxkcykge1xuICAgICAgICAgICAgICAgIGlmIChidWlsZC5yZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2FtZS51bml0cy5oYXMoYnVpbGQudW5pdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnVuaXRzLmRlbGV0ZShidWlsZC51bml0KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS51bml0cy5hZGQoYnVpbGQudW5pdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgcmVnaW9uIG9mIGdhbWUubWFwLnJlZ2lvbnMpIHtcbiAgICAgICAgICAgIGxldCB1bml0cyA9IFsuLi5nYW1lLnVuaXRzXS5maWx0ZXIodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24pO1xuICAgICAgICAgICAgaWYgKHVuaXRzLmxlbmd0aCA+IDEpIHRocm93IGVycm9yKGBNaXNtYXRjaCBpbiBnYW1lICR7aWR9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICBmcy5ta2RpcnBTeW5jKCdkYXRhJyk7XG4gICAgZnMubWtkaXJwU3luYygnY2FjaGUnKTtcblxuICAgIGxldCBhbGxJZHMgPSBmcy5yZWFkZGlyU3luYygnZGF0YScpO1xuXG4gICAgZm9yIChsZXQgaWQgb2YgYWxsSWRzKSB7XG4gICAgICAgIGlmIChpZCA9PSAna25vd24uanNvbicpIGNvbnRpbnVlO1xuXG4gICAgICAgIGxldCBnYW1lID0gc2NyYXBlLnJlYWRfZ2FtZShmcy5yZWFkRmlsZVN5bmMoYGRhdGEvJHtpZH1gKSk7XG4gICAgICAgIGZvciAobGV0IHR1cm4gb2YgZ2FtZSkge1xuICAgICAgICAgICAgaWYgKHR1cm4uYnVpbGRzICYmIE9iamVjdC5rZXlzKHR1cm4uYnVpbGRzKSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0dXJuLmJ1aWxkcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0dXJuLnJldHJlYXRzICYmIE9iamVjdC5rZXlzKHR1cm4ucmV0cmVhdHMpKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHR1cm4ucmV0cmVhdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModHVybi5vcmRlcnMpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gc29tZXRpbWVzIGdhbWVzIGhhdmUgYW4gZW1wdHkgbGFzdCB0dXJuIHdpdGggbm8gb3JkZXJzXG4gICAgICAgICAgICAgICAgaWYgKHR1cm4uYnVpbGRzIHx8IHR1cm4ucmV0cmVhdHNcbiAgICAgICAgICAgICAgICAgICAgfHwgZ2FtZS5pbmRleE9mKHR1cm4pICsgMSAhPSBnYW1lLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoYG1pc3Npbmcgb3JkZXJzOiAke2lkfSAke2dhbWUuaW5kZXhPZih0dXJuKX1gKTtcbiAgICAgICAgICAgICAgICBnYW1lLnBvcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcnVuX2dhbWUocGFyc2VJbnQoaWQpLCBnYW1lKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgcHJvY2Vzc2VkIGdhbWUgJHtpZH1gKTtcbiAgICB9XG59XG5cbmxldCB4ID0gZ2xvYmFsO1xuXG5pZiAoeC5kZXZ0b29sc0Zvcm1hdHRlcnMgPT0gbnVsbCkgeC5kZXZ0b29sc0Zvcm1hdHRlcnMgPSBbXTtcbnguZGV2dG9vbHNGb3JtYXR0ZXJzLnB1c2goe1xuICAgIGhlYWRlcihvYmosIGNvbmZpZykge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTW92ZU9yZGVyKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGAke29iai51bml0LnRlYW19ICR7b2JqLnVuaXQucmVnaW9uLm5hbWV9IG1vdmUgLT4gJHtvYmoudGFyZ2V0Lm5hbWV9YDtcbiAgICAgICAgICAgIGlmIChvYmoucmVxdWlyZUNvbnZveSkgdGV4dCArPSBgIHZpYSBjb252b3lgO1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIHRleHRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIEhvbGRPcmRlcikge1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai51bml0LnRlYW19ICR7b2JqLnVuaXQucmVnaW9uLm5hbWV9IGhvbGRgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBTdXBwb3J0T3JkZXIpIHtcbiAgICAgICAgICAgIGlmIChvYmouYXR0YWNrKVxuICAgICAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBgJHtvYmoudW5pdC50ZWFtfSAke29iai51bml0LnJlZ2lvbi5uYW1lfSBzdXBwb3J0ICR7b2JqLnRhcmdldC5uYW1lfSAtPiAke29iai5hdHRhY2submFtZX1gXTtcbiAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBgJHtvYmoudW5pdC50ZWFtfSAke29iai51bml0LnJlZ2lvbi5uYW1lfSBzdXBwb3J0ICR7b2JqLnRhcmdldC5uYW1lfSBob2xkYF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgQ29udm95T3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBgJHtvYmoudW5pdC50ZWFtfSAke29iai51bml0LnJlZ2lvbi5uYW1lfSBjb252b3kgJHtvYmouc3RhcnQubmFtZX0gLT4gJHtvYmouZW5kLm5hbWV9YF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgVW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai50ZWFtfSAke29iai50eXBlID09IFVuaXRUeXBlLldhdGVyID8gJ2ZsZWV0JyA6ICdhcm15J30gaW4gJHtvYmoucmVnaW9uLm5hbWV9YF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGhhc0JvZHkob2JqLCBjb25maWcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyByZXR1cm4gb2JqIGluc3RhbmNlb2YgT3JkZXJCYXNlO1xuICAgIH0sXG4gICAgYm9keShvYmosIGNvbmZpZykge1xuICAgICAgICAvLyBsZXQgY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgLy8gZm9yIChsZXQga2V5IGluIG9iaikge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gcmV0dXJuIFtcbiAgICAgICAgLy8gICAgICdvbCcsXG4gICAgICAgIC8vICAgICB7fSxcbiAgICAgICAgLy8gXVxuICAgIH1cbn0pO1xuXG5sZXQgb3AgPSBwcm9jZXNzLmFyZ3ZbMl07XG5cbmlmIChvcCA9PSAnc2NyYXBlJylcbiAgICBzY3JhcGUucnVuKCk7XG5lbHNlIGlmIChvcCA9PSAnY2hlY2snKVxuICAgIHNjcmFwZS5jaGVjaygpO1xuZWxzZSBpZiAob3AgPT0gJ3J1bicpXG4gICAgcnVuKCk7XG5lbHNlIHtcbiAgICBjb25zb2xlLmxvZygndW5rbm93biBvciBtaXNzaW5nIGNvbW1hbmQnKVxufVxuIl0sIm5hbWVzIjpbInNjcmFwZS5wYXJzZV9vcmRlcnMiLCJzY3JhcGUucGFyc2VfcmV0cmVhdHMiLCJzY3JhcGUucGFyc2VfYnVpbGRzIiwicnVuIiwic2NyYXBlLnJlYWRfZ2FtZSIsInNjcmFwZS5ydW4iLCJzY3JhcGUuY2hlY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQWEsTUFBTTtJQUlmLFlBQ2EsRUFBVSxFQUNWLElBQVksRUFDWixJQUFjO1FBRmQsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixTQUFJLEdBQUosSUFBSSxDQUFVO1FBTmxCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzdCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0tBTWpDO0lBRUwsSUFBSSxXQUFXO1FBQ1gsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtRQUNELEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0I7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzdGO0lBRUQsT0FBTyxPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDbkMsT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsT0FBTyxRQUFRLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDcEMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDO0tBQ3JCO0NBQ0o7QUFFRCxBQUFBLElBQVksUUFHWDtBQUhELFdBQVksUUFBUTtJQUNoQix1Q0FBSSxDQUFBO0lBQ0oseUNBQUssQ0FBQTtDQUNSLEVBSFcsUUFBUSxLQUFSLFFBQVEsUUFHbkI7QUFFRCxNQUFhLElBQUk7SUFDYixZQUNhLE1BQWMsRUFDZCxJQUFjLEVBQ2QsSUFBWTtRQUZaLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxTQUFJLEdBQUosSUFBSSxDQUFVO1FBQ2QsU0FBSSxHQUFKLElBQUksQ0FBUTtLQUNwQjtDQUNSO0FBRUQsTUFBYSxPQUFPO0lBQ2hCLFlBQ2EsT0FBaUI7UUFBakIsWUFBTyxHQUFQLE9BQU8sQ0FBVTtLQUN6QjtDQUNSO0FBRUQsTUFBYSxTQUFTO0lBR2xCLFlBQ2EsR0FBWSxFQUNaLEtBQWU7UUFEZixRQUFHLEdBQUgsR0FBRyxDQUFTO1FBQ1osVUFBSyxHQUFMLEtBQUssQ0FBVTtRQUpuQixVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVEsQ0FBQztLQUs1QjtJQUVMLElBQUksQ0FBQyxJQUFVLEVBQUUsTUFBYztRQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUMxRDtDQUNKOzs7QUMvREQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztBQUMzQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBRTdCLFNBQVMsQ0FBQyxDQUFDLEVBQVUsRUFBRSxJQUFZLEVBQUUsSUFBYztJQUMvQyxPQUFPLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDckM7O0FBR0QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUd0QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLENB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S0FDSjtDQUNKO0FBRUQsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbkMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRTdDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0IsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzdELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbEMsQUFBTyxNQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUU3ZCxBQUFPLE1BQU0sT0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFF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
