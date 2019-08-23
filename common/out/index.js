'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
        return this.type == exports.UnitType.Land
            && [...this.adjacent].find(a => a.type == exports.UnitType.Water) != null;
    }
    static areSame(lhs, rhs) {
        return lhs == rhs || lhs.attached.has(rhs);
    }
    static areEqual(lhs, rhs) {
        return lhs == rhs;
    }
}
(function (UnitType) {
    UnitType[UnitType["Land"] = 0] = "Land";
    UnitType[UnitType["Water"] = 1] = "Water";
})(exports.UnitType || (exports.UnitType = {}));
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
        let text = `${this.unit.team} ${this.unit.region.name} -> ${this.target.name}`;
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
        if (unit.type == exports.UnitType.Water) {
            if (!unit.region.adjacent.has(dst))
                return false;
            if (dst.type != exports.UnitType.Water && !dst.isShore)
                return false;
            if (dst.type == exports.UnitType.Land && unit.region.type == exports.UnitType.Land) {
                let shore = [...unit.region.adjacent].find(a => a.type == exports.UnitType.Water && dst.adjacent.has(a));
                if (shore == null)
                    return false;
            }
        }
        else {
            if (!unit.region.allAdjacent.includes(dst))
                return false;
            if (dst.type != exports.UnitType.Land)
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
            if (order.unit.type == exports.UnitType.Water && !canMove(order.unit, order.target))
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
    let assumed = new Set();
    let passed = new Set();
    let checked = new Set();
    let reasons = new Map();
    let stack = [];
    function fail(order, reason) {
        stack.pop();
        if (assumed.size == 0)
            reasons.set(order, reason);
        return false;
    }
    function pass(order) {
        stack.pop();
        if (assumed.size == 0)
            passed.add(order);
        return true;
    }
    function resolve(order, force = false) {
        if (stack[0] == order && stack.every(o => o.type == 'move') && stack.length > 2) {
            return true;
        }
        else if (stack.includes(order)) {
            if (stack.indexOf(order) != stack.lastIndexOf(order))
                throw error('recursive resolve');
        }
        else if (!force && assumed.size == 0) {
            if (checked.has(order))
                return passed.has(order);
            checked.add(order);
        }
        if (assumed.has(order))
            return true;
        stack.push(order);
        if (order.type == 'hold') {
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (resolve(attack))
                    return fail(order, `Dislodged by '${attack}'`);
            }
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
                if (routes == null) {
                    if (attack == order)
                        return fail(order, `No valid route`);
                    continue;
                }
                let support = findMoveSupport(attack);
                if (current && current.type == 'move' && Region.areSame(current.target, attack.unit.region)) {
                    // prevent dislodged unit from bouncing with other units entering dislodger's region
                    let enemies = support.filter(o => o.unit.team != current.unit.team);
                    let currentRoutes = findRoutes(current);
                    // to fail to swap places, both must have no routes via convoy
                    if (currentRoutes == null) {
                        if (enemies.length == 0) {
                            if (attack == order)
                                return fail(order, `Overpowered by '${current}' with support '' vs '${enemies.join("', '")}'`);
                            continue;
                        }
                    }
                    else if (currentRoutes.paths.filter(o => o.length > 0).length == 0 && routes.paths.filter(o => o.length > 0).length == 0) {
                        let currentAttack = findMoveSupport(current).filter(o => o.unit.team != attack.unit.team);
                        if (currentAttack.length > enemies.length) {
                            if (attack == order)
                                return fail(order, `Overpowered by '${current}' with support '${currentAttack.join("', '")}' vs '${enemies.join("', '")}'`);
                            continue;
                        }
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
                return fail(order, `Overpowered by '${best.join("', '")}' with strength ${strength} vs ${findMoveSupport(order).length} `);
            if (best.length != 1)
                return fail(order, `Standoff with '${best.join("', '")}' with strength ${strength} `);
            if (current && best[0] != forceResolved) {
                if (current.type == 'move' && Region.areSame(current.target, best[0].unit.region)) {
                    if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                        return fail(order, `Avoiding self-dislodgement`);
                    let currentAttack = findMoveSupport(current).filter(o => o.unit.team != best[0].unit.team);
                    if (currentAttack.length == dislodgeStrength)
                        return fail(order, `Balanced faceoff '${currentAttack.join("', '")}' vs '${findMoveSupport(order).filter(o => o.unit.team != current.unit.team).join("', '")}'`);
                    if (currentAttack.length > dislodgeStrength)
                        throw error('Failed to filter out dislodged attack');
                }
                else if (current.type != 'move' || !resolve(current)) {
                    if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                        return fail(order, `Avoiding self-dislodgement`);
                    if (dislodgeStrength == 0)
                        return fail(order, `Held with ?? vs nothing`);
                    let holdSupport = findHoldSupport(current);
                    if (holdSupport.length >= dislodgeStrength)
                        return fail(order, `Held with '${holdSupport.join(', ')}' vs '${findMoveSupport(order).filter(o => o.unit.team != current.unit.team).join("', '")}'`);
                }
            }
            return pass(order);
        }
        if (order.type == 'convoy') {
            if (order.unit.region.type != exports.UnitType.Water)
                return fail(order, 'Only water units can convoy');
            let target = orders.find(o => o.type == 'move'
                && o.unit.type == exports.UnitType.Land
                && Region.areSame(o.unit.region, order.start)
                && Region.areSame(o.target, order.end));
            if (target == null)
                return fail(order, 'No matching target');
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (resolve(attack))
                    return fail(order, `Dislodged by '${attack}'`);
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
                            return fail(order, `Dislodged by '${attack}'`);
                    }
                    else {
                        // if it is convoyed by the target region of the supported attack,
                        // it can only cut support if it has an alternate path
                        let routes = findRoutes(attack, supportee.target);
                        if (routes != null)
                            return fail(order, `Disrupted by '${attack}'`);
                        // or if the support doesn't break the convoy
                        assumed.add(order);
                        if (resolve(attack)) {
                            assumed.delete(order);
                            return fail(order, `Dislodged by '${attack}'`);
                        }
                        assumed.delete(order);
                    }
                }
                else {
                    let routes = findRoutes(attack);
                    if (routes != null)
                        return fail(order, `Disrupted by '${attack}'`);
                }
            }
            return pass(order);
        }
        throw error(`Invalid order`);
    }
    let evicted = [];
    let resolved = [];
    for (let order of orders) {
        let valid = resolve(order);
        if (order.type == 'move' && valid) {
            resolved.push(order);
        }
        else {
            for (let attack of orders) {
                if (attack.type != 'move' || !Region.areSame(attack.target, order.unit.region))
                    continue;
                if (resolve(attack)) {
                    evicted.push(order.unit);
                    if (!reasons.has(order)) {
                        debugger;
                        resolve(order, true);
                        debugger;
                        resolve(attack, true);
                    }
                }
            }
        }
    }
    return { resolved, evicted, reasons };
}
function error(msg) {
    debugger;
    return new Error(msg);
}

var formatter = {
    header(obj, config) {
        if (obj instanceof MoveOrder || obj instanceof HoldOrder || obj instanceof SupportOrder || obj instanceof ConvoyOrder) {
            return ["span", {}, obj.toString()];
        }
        if (obj instanceof Unit) {
            return ["span", {}, `${obj.team} ${obj.type == exports.UnitType.Water ? 'fleet' : 'army'} in ${obj.region.name}`];
        }
        return null;
    },
    hasBody(obj, config) {
        return false;
    },
    body(obj, config) {
    }
};

const LAND = exports.UnitType.Land;
const WATER = exports.UnitType.Water;
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
let STP_NORTH = n('STPN', 'St. Petersburg (North Coast)', LAND);
let STP_SOUTH = n('STPS', 'St. Petersburg (South Coast)', LAND);
let SPA_NORTH = n('SPAN', 'Spain (North Coast)', LAND);
let SPA_SOUTH = n('SPAS', 'Spain (South Coast)', LAND);
let BUL_NORTH = n('BULE', 'Bulgaria (East Coast)', LAND);
let BUL_SOUTH = n('BULS', 'Bulgaria (South Coast)', LAND);
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
const map = new GameMap([BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH]);
const allRegions = { BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH };

const maps = {
    standard: {
        map: map,
        regions: allRegions,
    },
};

exports.ConvoyOrder = ConvoyOrder;
exports.GameMap = GameMap;
exports.GameState = GameState;
exports.HoldOrder = HoldOrder;
exports.MoveOrder = MoveOrder;
exports.Region = Region;
exports.SupportOrder = SupportOrder;
exports.Unit = Unit;
exports.formatter = formatter;
exports.maps = maps;
exports.resolve = resolve;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9nYW1lLnRzIiwiLi4vc3JjL3J1bGVzLnRzIiwiLi4vc3JjL2Zvcm1hdHRlci50cyIsIi4uL3NyYy9tYXBzL3N0YW5kYXJkLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBSZWdpb24ge1xuICAgIHJlYWRvbmx5IGF0dGFjaGVkID0gbmV3IFNldDxSZWdpb24+KCk7XG4gICAgcmVhZG9ubHkgYWRqYWNlbnQgPSBuZXcgU2V0PFJlZ2lvbj4oKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSBpZDogc3RyaW5nLFxuICAgICAgICByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHJlYWRvbmx5IHR5cGU6IFVuaXRUeXBlLFxuICAgICkgeyB9XG5cbiAgICBnZXQgYWxsQWRqYWNlbnQoKSB7XG4gICAgICAgIGxldCBsaXN0ID0gWy4uLnRoaXMuYWRqYWNlbnRdO1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMuYXR0YWNoZWQpIHtcbiAgICAgICAgICAgIGxpc3QucHVzaCguLi5ub2RlLmFkamFjZW50KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBub2RlIG9mIGxpc3Quc2xpY2UoKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKC4uLm5vZGUuYXR0YWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIGdldCBpc1Nob3JlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09IFVuaXRUeXBlLkxhbmRcbiAgICAgICAgICAgICYmIFsuLi50aGlzLmFkamFjZW50XS5maW5kKGEgPT4gYS50eXBlID09IFVuaXRUeXBlLldhdGVyKSAhPSBudWxsO1xuICAgIH1cblxuICAgIHN0YXRpYyBhcmVTYW1lKGxoczogUmVnaW9uLCByaHM6IFJlZ2lvbikge1xuICAgICAgICByZXR1cm4gbGhzID09IHJocyB8fCBsaHMuYXR0YWNoZWQuaGFzKHJocyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFyZUVxdWFsKGxoczogUmVnaW9uLCByaHM6IFJlZ2lvbikge1xuICAgICAgICByZXR1cm4gbGhzID09IHJocztcbiAgICB9XG59XG5cbmV4cG9ydCBlbnVtIFVuaXRUeXBlIHtcbiAgICBMYW5kLFxuICAgIFdhdGVyLFxufVxuXG5leHBvcnQgY2xhc3MgVW5pdCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHJlZ2lvbjogUmVnaW9uLFxuICAgICAgICByZWFkb25seSB0eXBlOiBVbml0VHlwZSxcbiAgICAgICAgcmVhZG9ubHkgdGVhbTogc3RyaW5nLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgcmVnaW9uczogUmVnaW9uW10sXG4gICAgKSB7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhbWVTdGF0ZSB7XG4gICAgcmVhZG9ubHkgdW5pdHMgPSBuZXcgU2V0PFVuaXQ+KCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgbWFwOiBHYW1lTWFwLFxuICAgICAgICByZWFkb25seSB0ZWFtczogc3RyaW5nW10sXG4gICAgKSB7IH1cblxuICAgIG1vdmUodW5pdDogVW5pdCwgdGFyZ2V0OiBSZWdpb24pIHtcbiAgICAgICAgdGhpcy51bml0cy5kZWxldGUodW5pdCk7XG4gICAgICAgIHRoaXMudW5pdHMuYWRkKG5ldyBVbml0KHRhcmdldCwgdW5pdC50eXBlLCB1bml0LnRlYW0pKTtcbiAgICB9XG59XG5cblxuaW50ZXJmYWNlIE9yZGVyQmFzZTxUIGV4dGVuZHMgc3RyaW5nPiB7XG4gICAgcmVhZG9ubHkgdHlwZTogVCxcbiAgICByZWFkb25seSB1bml0OiBVbml0LFxufVxuXG5leHBvcnQgY2xhc3MgSG9sZE9yZGVyIGltcGxlbWVudHMgT3JkZXJCYXNlPCdob2xkJz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnaG9sZCc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy51bml0LnRlYW19ICR7dGhpcy51bml0LnJlZ2lvbi5uYW1lfSBob2xkYDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlT3JkZXIgaW1wbGVtZW50cyBPcmRlckJhc2U8J21vdmUnPiB7XG4gICAgcmVhZG9ubHkgdHlwZSA9ICdtb3ZlJztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgdGFyZ2V0OiBSZWdpb24sXG4gICAgICAgIHJlYWRvbmx5IHJlcXVpcmVDb252b3k6IGJvb2xlYW4sXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgdGV4dCA9IGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gLT4gJHt0aGlzLnRhcmdldC5uYW1lfWA7XG4gICAgICAgIGlmICh0aGlzLnJlcXVpcmVDb252b3kpIHRleHQgKz0gYCB2aWEgY29udm95YDtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3VwcG9ydE9yZGVyIGltcGxlbWVudHMgT3JkZXJCYXNlPCdzdXBwb3J0Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnc3VwcG9ydCc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgICAgIHJlYWRvbmx5IHRhcmdldDogUmVnaW9uLFxuICAgICAgICByZWFkb25seSBhdHRhY2s/OiBSZWdpb24sXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgdGV4dCA9IGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gc3VwcG9ydCAke3RoaXMudGFyZ2V0Lm5hbWV9YDtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNrKSB0ZXh0ICs9IGAgLT4gJHt0aGlzLmF0dGFjay5uYW1lfWA7XG4gICAgICAgIGVsc2UgdGV4dCArPSBgIHRvIGhvbGRgO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb252b3lPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnY29udm95Jz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnY29udm95JztcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbiAgICAgICAgcmVhZG9ubHkgc3RhcnQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgZW5kOiBSZWdpb24sXG4gICAgKSB7IH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy51bml0LnRlYW19ICR7dGhpcy51bml0LnJlZ2lvbi5uYW1lfSBjb252b3kgJHt0aGlzLnN0YXJ0Lm5hbWV9IHRvICR7dGhpcy5lbmQubmFtZX1gO1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgQW55T3JkZXIgPSBIb2xkT3JkZXIgfCBNb3ZlT3JkZXIgfCBTdXBwb3J0T3JkZXIgfCBDb252b3lPcmRlcjtcbiIsImltcG9ydCB7IFVuaXQsIFJlZ2lvbiwgVW5pdFR5cGUsIEFueU9yZGVyLCBNb3ZlT3JkZXIsIENvbnZveU9yZGVyLCBTdXBwb3J0T3JkZXIsIEhvbGRPcmRlciB9IGZyb20gJy4vZ2FtZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKG9yZGVyczogQW55T3JkZXJbXSkge1xuICAgIGZ1bmN0aW9uIGNhbk1vdmUodW5pdDogVW5pdCwgZHN0OiBSZWdpb24pIHtcbiAgICAgICAgaWYgKHVuaXQudHlwZSA9PSBVbml0VHlwZS5XYXRlcikge1xuICAgICAgICAgICAgaWYgKCF1bml0LnJlZ2lvbi5hZGphY2VudC5oYXMoZHN0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZHN0LnR5cGUgIT0gVW5pdFR5cGUuV2F0ZXIgJiYgIWRzdC5pc1Nob3JlKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkc3QudHlwZSA9PSBVbml0VHlwZS5MYW5kICYmIHVuaXQucmVnaW9uLnR5cGUgPT0gVW5pdFR5cGUuTGFuZCkge1xuICAgICAgICAgICAgICAgIGxldCBzaG9yZSA9IFsuLi51bml0LnJlZ2lvbi5hZGphY2VudF0uZmluZChhID0+IGEudHlwZSA9PSBVbml0VHlwZS5XYXRlciAmJiBkc3QuYWRqYWNlbnQuaGFzKGEpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2hvcmUgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF1bml0LnJlZ2lvbi5hbGxBZGphY2VudC5pbmNsdWRlcyhkc3QpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmIChkc3QudHlwZSAhPSBVbml0VHlwZS5MYW5kKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblJlYWNoKHVuaXQ6IFVuaXQsIGRzdDogUmVnaW9uKSB7XG4gICAgICAgIGlmIChjYW5Nb3ZlKHVuaXQsIGRzdCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBsZXQgc2hvcmUgPSBbLi4uZHN0LmF0dGFjaGVkXS5maW5kKGEgPT4gdW5pdC5yZWdpb24uYWRqYWNlbnQuaGFzKGEpKTtcbiAgICAgICAgcmV0dXJuIHNob3JlICE9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNWYWxpZChvcmRlcjogQW55T3JkZXIpIHtcbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICBpZiAoUmVnaW9uLmFyZVNhbWUob3JkZXIudW5pdC5yZWdpb24sIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAob3JkZXIudW5pdC50eXBlID09IFVuaXRUeXBlLldhdGVyICYmICFjYW5Nb3ZlKG9yZGVyLnVuaXQsIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZFJvdXRlcyhvcmRlcjogTW92ZU9yZGVyLCBza2lwPzogUmVnaW9uKSB7XG4gICAgICAgIGxldCBjb252b3lzID0gb3JkZXJzLmZpbHRlcihvID0+IG8udHlwZSA9PSAnY29udm95J1xuICAgICAgICAgICAgJiYgby51bml0LnJlZ2lvbiAhPSBza2lwXG4gICAgICAgICAgICAmJiBSZWdpb24uYXJlU2FtZShvLnN0YXJ0LCBvcmRlci51bml0LnJlZ2lvbilcbiAgICAgICAgICAgICYmIHJlc29sdmUobykpIGFzIENvbnZveU9yZGVyW107XG5cbiAgICAgICAgbGV0IHVzZWQgPSBjb252b3lzLm1hcCgoKSA9PiBmYWxzZSk7XG4gICAgICAgIGxldCBub2RlID0gb3JkZXIudW5pdDtcblxuICAgICAgICBsZXQgcGF0aDogQ29udm95T3JkZXJbXSA9IFtdO1xuICAgICAgICBsZXQgcGF0aHM6IENvbnZveU9yZGVyW11bXSA9IFtdO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcbiAgICAgICAgICAgIGlmIChjYW5Nb3ZlKG5vZGUsIG9yZGVyLnRhcmdldCkgfHwgcGF0aC5sZW5ndGggPiAwICYmIGNhblJlYWNoKG5vZGUsIG9yZGVyLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBwYXRocy5wdXNoKHBhdGguc2xpY2UoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IG5leHQgPSAwOyBuZXh0IDwgY29udm95cy5sZW5ndGg7ICsrbmV4dCkge1xuICAgICAgICAgICAgICAgIGlmICh1c2VkW25leHRdIHx8ICFub2RlLnJlZ2lvbi5hbGxBZGphY2VudC5pbmNsdWRlcyhjb252b3lzW25leHRdLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgcHJldmlvdXMgPSBub2RlO1xuICAgICAgICAgICAgICAgIHVzZWRbbmV4dF0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHBhdGgucHVzaChjb252b3lzW25leHRdKTtcbiAgICAgICAgICAgICAgICBub2RlID0gY29udm95c1tuZXh0XS51bml0O1xuXG4gICAgICAgICAgICAgICAgc2VhcmNoKCk7XG5cbiAgICAgICAgICAgICAgICBub2RlID0gcHJldmlvdXM7XG4gICAgICAgICAgICAgICAgcGF0aC5wb3AoKTtcbiAgICAgICAgICAgICAgICB1c2VkW25leHRdID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWFyY2goKTtcblxuICAgICAgICBpZiAocGF0aHMubGVuZ3RoID09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBpZiAob3JkZXIucmVxdWlyZUNvbnZveSAmJiBwYXRocy5maWx0ZXIoYSA9PiBhLmxlbmd0aCA+IDApLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHsgY29udm95cywgcGF0aHMgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kSG9sZFN1cHBvcnQob3JkZXI6IEFueU9yZGVyKSB7XG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJylcbiAgICAgICAgICAgIHJldHVybiBbXTtcblxuICAgICAgICByZXR1cm4gb3JkZXJzLmZpbHRlcihvID0+IG8udHlwZSA9PSAnc3VwcG9ydCdcbiAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVFcXVhbChvLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pXG4gICAgICAgICAgICAmJiByZXNvbHZlKG8pKSBhcyBTdXBwb3J0T3JkZXJbXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kTW92ZVN1cHBvcnQob3JkZXI6IE1vdmVPcmRlcikge1xuICAgICAgICByZXR1cm4gb3JkZXJzLmZpbHRlcihvID0+IG8udHlwZSA9PSAnc3VwcG9ydCdcbiAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVFcXVhbChvLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pXG4gICAgICAgICAgICAmJiByZXNvbHZlKG8pKSBhcyBTdXBwb3J0T3JkZXJbXTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9yZGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoaXNWYWxpZChvcmRlcnNbaV0pKVxuICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgbGV0IGR1bXAgPSBvcmRlcnNbaV07XG4gICAgICAgIG9yZGVycy5zcGxpY2UoaSwgMSwgbmV3IEhvbGRPcmRlcihkdW1wLnVuaXQpKTtcbiAgICB9XG5cbiAgICBsZXQgYXNzdW1lZCA9IG5ldyBTZXQ8QW55T3JkZXI+KCk7XG5cbiAgICBsZXQgcGFzc2VkID0gbmV3IFNldDxBbnlPcmRlcj4oKTtcbiAgICBsZXQgY2hlY2tlZCA9IG5ldyBTZXQ8QW55T3JkZXI+KCk7XG4gICAgbGV0IHJlYXNvbnMgPSBuZXcgTWFwPEFueU9yZGVyLCBzdHJpbmc+KCk7XG5cbiAgICBsZXQgc3RhY2s6IEFueU9yZGVyW10gPSBbXTtcblxuICAgIGZ1bmN0aW9uIGZhaWwob3JkZXI6IEFueU9yZGVyLCByZWFzb246IHN0cmluZyk6IGZhbHNlIHtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgIGlmIChhc3N1bWVkLnNpemUgPT0gMClcbiAgICAgICAgICAgIHJlYXNvbnMuc2V0KG9yZGVyLCByZWFzb24pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFzcyhvcmRlcjogQW55T3JkZXIpOiB0cnVlIHtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICAgIGlmIChhc3N1bWVkLnNpemUgPT0gMClcbiAgICAgICAgICAgIHBhc3NlZC5hZGQob3JkZXIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlKG9yZGVyOiBBbnlPcmRlciwgZm9yY2UgPSBmYWxzZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoc3RhY2tbMF0gPT0gb3JkZXIgJiYgc3RhY2suZXZlcnkobyA9PiBvLnR5cGUgPT0gJ21vdmUnKSAmJiBzdGFjay5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFjay5pbmNsdWRlcyhvcmRlcikpIHtcbiAgICAgICAgICAgIGlmIChzdGFjay5pbmRleE9mKG9yZGVyKSAhPSBzdGFjay5sYXN0SW5kZXhPZihvcmRlcikpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ3JlY3Vyc2l2ZSByZXNvbHZlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWZvcmNlICYmIGFzc3VtZWQuc2l6ZSA9PSAwKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlZC5oYXMob3JkZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXNzZWQuaGFzKG9yZGVyKTtcbiAgICAgICAgICAgIGNoZWNrZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhc3N1bWVkLmhhcyhvcmRlcikpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBzdGFjay5wdXNoKG9yZGVyKTtcblxuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnaG9sZCcpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrLnR5cGUgIT0gJ21vdmUnIHx8ICFSZWdpb24uYXJlU2FtZShhdHRhY2sudGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNsb2RnZWQgYnkgJyR7YXR0YWNrfSdgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhc3Mob3JkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IG9yZGVycy5maW5kKG8gPT4gUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSk7XG5cbiAgICAgICAgICAgIGxldCBiZXN0OiBNb3ZlT3JkZXJbXSA9IFtdO1xuICAgICAgICAgICAgbGV0IHN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgbGV0IGJlc3REaXNsb2RnZTogTW92ZU9yZGVyW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBkaXNsb2RnZVN0cmVuZ3RoID0gMDtcblxuICAgICAgICAgICAgbGV0IGZvcmNlUmVzb2x2ZWQ6IE1vdmVPcmRlciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2spO1xuICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0YWNrID09IG9yZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBObyB2YWxpZCByb3V0ZWApO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBzdXBwb3J0ID0gZmluZE1vdmVTdXBwb3J0KGF0dGFjayk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LnR5cGUgPT0gJ21vdmUnICYmIFJlZ2lvbi5hcmVTYW1lKGN1cnJlbnQudGFyZ2V0LCBhdHRhY2sudW5pdC5yZWdpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXZlbnQgZGlzbG9kZ2VkIHVuaXQgZnJvbSBib3VuY2luZyB3aXRoIG90aGVyIHVuaXRzIGVudGVyaW5nIGRpc2xvZGdlcidzIHJlZ2lvblxuICAgICAgICAgICAgICAgICAgICBsZXQgZW5lbWllcyA9IHN1cHBvcnQuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gY3VycmVudCEudW5pdC50ZWFtKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRSb3V0ZXMgPSBmaW5kUm91dGVzKGN1cnJlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGZhaWwgdG8gc3dhcCBwbGFjZXMsIGJvdGggbXVzdCBoYXZlIG5vIHJvdXRlcyB2aWEgY29udm95XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Um91dGVzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjayA9PSBvcmRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBPdmVycG93ZXJlZCBieSAnJHtjdXJyZW50fScgd2l0aCBzdXBwb3J0ICcnIHZzICcke2VuZW1pZXMuam9pbihcIicsICdcIil9J2ApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFJvdXRlcy5wYXRocy5maWx0ZXIobyA9PiBvLmxlbmd0aCA+IDApLmxlbmd0aCA9PSAwICYmIHJvdXRlcy5wYXRocy5maWx0ZXIobyA9PiBvLmxlbmd0aCA+IDApLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEF0dGFjayA9IGZpbmRNb3ZlU3VwcG9ydChjdXJyZW50KS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBhdHRhY2sudW5pdC50ZWFtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXR0YWNrLmxlbmd0aCA+IGVuZW1pZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjayA9PSBvcmRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBPdmVycG93ZXJlZCBieSAnJHtjdXJyZW50fScgd2l0aCBzdXBwb3J0ICcke2N1cnJlbnRBdHRhY2suam9pbihcIicsICdcIil9JyB2cyAnJHtlbmVtaWVzLmpvaW4oXCInLCAnXCIpfSdgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZXNvbHZlZCA9IGF0dGFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0Lmxlbmd0aCA+IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3QgPSBbYXR0YWNrXTtcbiAgICAgICAgICAgICAgICAgICAgc3RyZW5ndGggPSBzdXBwb3J0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQubGVuZ3RoID09IHN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3QucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGF0dGFjay51bml0LnRlYW0gIT0gY3VycmVudC51bml0LnRlYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVuZW1pZXMgPSBzdXBwb3J0LmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmVtaWVzLmxlbmd0aCA+IGRpc2xvZGdlU3RyZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZSA9IFthdHRhY2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzbG9kZ2VTdHJlbmd0aCA9IGVuZW1pZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVuZW1pZXMubGVuZ3RoID09IGRpc2xvZGdlU3RyZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3REaXNsb2RnZS5wdXNoKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghYmVzdC5pbmNsdWRlcyhvcmRlcikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBPdmVycG93ZXJlZCBieSAnJHtiZXN0LmpvaW4oXCInLCAnXCIpfScgd2l0aCBzdHJlbmd0aCAke3N0cmVuZ3RofSB2cyAke2ZpbmRNb3ZlU3VwcG9ydChvcmRlcikubGVuZ3RofSBgKTtcblxuICAgICAgICAgICAgaWYgKGJlc3QubGVuZ3RoICE9IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdGFuZG9mZiB3aXRoICcke2Jlc3Quam9pbihcIicsICdcIil9JyB3aXRoIHN0cmVuZ3RoICR7c3RyZW5ndGh9IGApO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudCAmJiBiZXN0WzBdICE9IGZvcmNlUmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYmVzdFswXS51bml0LnJlZ2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJlc3REaXNsb2RnZS5sZW5ndGggIT0gMSB8fCBiZXN0WzBdICE9IGJlc3REaXNsb2RnZVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgQXZvaWRpbmcgc2VsZi1kaXNsb2RnZW1lbnRgKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEF0dGFjayA9IGZpbmRNb3ZlU3VwcG9ydChjdXJyZW50KS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBiZXN0WzBdLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXR0YWNrLmxlbmd0aCA9PSBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBCYWxhbmNlZCBmYWNlb2ZmICcke2N1cnJlbnRBdHRhY2suam9pbihcIicsICdcIil9JyB2cyAnJHtmaW5kTW92ZVN1cHBvcnQob3JkZXIpLmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSkuam9pbihcIicsICdcIil9J2ApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXR0YWNrLmxlbmd0aCA+IGRpc2xvZGdlU3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcignRmFpbGVkIHRvIGZpbHRlciBvdXQgZGlzbG9kZ2VkIGF0dGFjaycpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudC50eXBlICE9ICdtb3ZlJyB8fCAhcmVzb2x2ZShjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmVzdERpc2xvZGdlLmxlbmd0aCAhPSAxIHx8IGJlc3RbMF0gIT0gYmVzdERpc2xvZGdlWzBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBBdm9pZGluZyBzZWxmLWRpc2xvZGdlbWVudGApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXNsb2RnZVN0cmVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYEhlbGQgd2l0aCA/PyB2cyBub3RoaW5nYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGhvbGRTdXBwb3J0ID0gZmluZEhvbGRTdXBwb3J0KGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG9sZFN1cHBvcnQubGVuZ3RoID49IGRpc2xvZGdlU3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYEhlbGQgd2l0aCAnJHtob2xkU3VwcG9ydC5qb2luKCcsICcpfScgdnMgJyR7ZmluZE1vdmVTdXBwb3J0KG9yZGVyKS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pLmpvaW4oXCInLCAnXCIpfSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdjb252b3knKSB7XG4gICAgICAgICAgICBpZiAob3JkZXIudW5pdC5yZWdpb24udHlwZSAhPSBVbml0VHlwZS5XYXRlcilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgJ09ubHkgd2F0ZXIgdW5pdHMgY2FuIGNvbnZveScpO1xuXG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gb3JkZXJzLmZpbmQobyA9PiBvLnR5cGUgPT0gJ21vdmUnXG4gICAgICAgICAgICAgICAgJiYgby51bml0LnR5cGUgPT0gVW5pdFR5cGUuTGFuZFxuICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udW5pdC5yZWdpb24sIG9yZGVyLnN0YXJ0KVxuICAgICAgICAgICAgICAgICYmIFJlZ2lvbi5hcmVTYW1lKG8udGFyZ2V0LCBvcmRlci5lbmQpKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgJ05vIG1hdGNoaW5nIHRhcmdldCcpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlKGF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzbG9kZ2VkIGJ5ICcke2F0dGFja30nYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdzdXBwb3J0Jykge1xuICAgICAgICAgICAgbGV0IHN1cHBvcnRlZSA9IG9yZGVycy5maW5kKG8gPT4gUmVnaW9uLmFyZVNhbWUoby51bml0LnJlZ2lvbiwgb3JkZXIudGFyZ2V0KSk7XG4gICAgICAgICAgICBpZiAoc3VwcG9ydGVlID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsICdObyBtYXRjaGluZyB0YXJnZXQnKTtcblxuICAgICAgICAgICAgaWYgKG9yZGVyLmF0dGFjaykge1xuICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUudHlwZSAhPSAnbW92ZScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3VwcG9ydCBhdHRhY2tlZCAke29yZGVyLmF0dGFjay5uYW1lfSB0YXJnZXQgd2FzICR7c3VwcG9ydGVlfWApO1xuICAgICAgICAgICAgICAgIGlmICghY2FuUmVhY2gob3JkZXIudW5pdCwgb3JkZXIuYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdXBwb3J0IGF0dGFja2VkICR7b3JkZXIuYXR0YWNrLm5hbWV9IGJ1dCBjb3VsZCBub3QgcmVhY2hgKTtcbiAgICAgICAgICAgICAgICBpZiAoIVJlZ2lvbi5hcmVFcXVhbChzdXBwb3J0ZWUudGFyZ2V0LCBvcmRlci5hdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYFN1cHBvcnQgYXR0YWNrZWQgJHtvcmRlci5hdHRhY2submFtZX0gYnV0IHRhcmdldCBhdHRhY2tlZCAke3N1cHBvcnRlZS50YXJnZXR9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzdXBwb3J0ZWUudHlwZSA9PSAnbW92ZScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3VwcG9ydCBoZWxkIGJ1dCB0YXJnZXQgd2FzICR7c3VwcG9ydGVlfWApO1xuICAgICAgICAgICAgICAgIGlmICghY2FuUmVhY2gob3JkZXIudW5pdCwgb3JkZXIudGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdXBwb3J0IGhlbGQgJHtvcmRlci50YXJnZXQubmFtZX0gYnV0IGNvdWxkIG5vdCByZWFjaGApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChvcmRlci51bml0LnRlYW0gPT0gYXR0YWNrLnVuaXQudGVhbSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydGVlLnR5cGUgPT0gJ21vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChSZWdpb24uYXJlU2FtZShzdXBwb3J0ZWUudGFyZ2V0LCBhdHRhY2sudW5pdC5yZWdpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBpcyBmcm9tIHRoZSB0YXJnZXQgcmVnaW9uIG9mIHRoZSBzdXBwb3J0ZWQgYXR0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIG9ubHkgY3V0IHN1cHBvcnQgYnkgZGlzbG9kZ2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYERpc2xvZGdlZCBieSAnJHthdHRhY2t9J2ApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgaXMgY29udm95ZWQgYnkgdGhlIHRhcmdldCByZWdpb24gb2YgdGhlIHN1cHBvcnRlZCBhdHRhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCBjYW4gb25seSBjdXQgc3VwcG9ydCBpZiBpdCBoYXMgYW4gYWx0ZXJuYXRlIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBmaW5kUm91dGVzKGF0dGFjaywgc3VwcG9ydGVlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVzICE9IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNydXB0ZWQgYnkgJyR7YXR0YWNrfSdgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3IgaWYgdGhlIHN1cHBvcnQgZG9lc24ndCBicmVhayB0aGUgY29udm95XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3N1bWVkLmFkZChvcmRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzdW1lZC5kZWxldGUob3JkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNsb2RnZWQgYnkgJyR7YXR0YWNrfSdgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc3VtZWQuZGVsZXRlKG9yZGVyKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IGZpbmRSb3V0ZXMoYXR0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlcyAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNydXB0ZWQgYnkgJyR7YXR0YWNrfSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycm9yKGBJbnZhbGlkIG9yZGVyYCk7XG4gICAgfVxuXG4gICAgbGV0IGV2aWN0ZWQ6IFVuaXRbXSA9IFtdO1xuICAgIGxldCByZXNvbHZlZDogTW92ZU9yZGVyW10gPSBbXTtcblxuICAgIGZvciAobGV0IG9yZGVyIG9mIG9yZGVycykge1xuICAgICAgICBsZXQgdmFsaWQgPSByZXNvbHZlKG9yZGVyKTtcblxuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScgJiYgdmFsaWQpIHtcbiAgICAgICAgICAgIHJlc29sdmVkLnB1c2gob3JkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2aWN0ZWQucHVzaChvcmRlci51bml0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFzb25zLmhhcyhvcmRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvcmRlciwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYXR0YWNrLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IHJlc29sdmVkLCBldmljdGVkLCByZWFzb25zIH07XG59XG5cbmZ1bmN0aW9uIGVycm9yKG1zZzogc3RyaW5nKSB7XG4gICAgZGVidWdnZXI7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtc2cpO1xufVxuIiwiaW1wb3J0IHsgTW92ZU9yZGVyLCBIb2xkT3JkZXIsIFN1cHBvcnRPcmRlciwgQ29udm95T3JkZXIsIFVuaXQsIFVuaXRUeXBlIH0gZnJvbSBcIi4vZ2FtZVwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgaGVhZGVyKG9iajogYW55LCBjb25maWc6IGFueSkge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTW92ZU9yZGVyIHx8IG9iaiBpbnN0YW5jZW9mIEhvbGRPcmRlciB8fCBvYmogaW5zdGFuY2VvZiBTdXBwb3J0T3JkZXIgfHwgb2JqIGluc3RhbmNlb2YgQ29udm95T3JkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBvYmoudG9TdHJpbmcoKV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgVW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcInNwYW5cIiwge30sIGAke29iai50ZWFtfSAke29iai50eXBlID09IFVuaXRUeXBlLldhdGVyID8gJ2ZsZWV0JyA6ICdhcm15J30gaW4gJHtvYmoucmVnaW9uLm5hbWV9YF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGhhc0JvZHkob2JqOiBhbnksIGNvbmZpZzogYW55KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGJvZHkob2JqOiBhbnksIGNvbmZpZzogYW55KSB7XG4gICAgfVxufTtcbiIsImltcG9ydCB7IFJlZ2lvbiwgR2FtZU1hcCwgVW5pdFR5cGUgfSBmcm9tICcuLi9nYW1lJztcblxuY29uc3QgTEFORCA9IFVuaXRUeXBlLkxhbmQ7XG5jb25zdCBXQVRFUiA9IFVuaXRUeXBlLldhdGVyO1xuXG5mdW5jdGlvbiBuKGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgdHlwZTogVW5pdFR5cGUpOiBSZWdpb24ge1xuICAgIHJldHVybiBuZXcgUmVnaW9uKGlkLCBuYW1lLCB0eXBlKTtcbn1cblxuLy8gYXVzdHJpYVxubGV0IEJPSCA9IG4oJ0JPSCcsICdCb2hlbWlhJywgTEFORCk7XG5sZXQgQlVEID0gbignQlVEJywgJ0J1ZGFwZXN0JywgTEFORCk7XG5sZXQgR0FMID0gbignR0FMJywgJ0dhbGljaWEnLCBMQU5EKTtcbmxldCBUUkkgPSBuKCdUUkknLCAnVHJpZXN0ZScsIExBTkQpO1xubGV0IFRZUiA9IG4oJ1RZUicsICdUeXJvbGlhJywgTEFORCk7XG5sZXQgVklFID0gbignVklFJywgJ1ZpZW5uYScsIExBTkQpO1xuXG4vLyBlbmdsYW5kXG5sZXQgQ0xZID0gbignQ0xZJywgJ0NseWRlJywgTEFORCk7XG5sZXQgRURJID0gbignRURJJywgJ0VkaW5idXJnaCcsIExBTkQpO1xubGV0IExWUCA9IG4oJ0xWUCcsICdMaXZlcnBvb2wnLCBMQU5EKTtcbmxldCBMT04gPSBuKCdMT04nLCAnTG9uZG9uJywgTEFORCk7XG5sZXQgV0FMID0gbignV0FMJywgJ1dhbGVzJywgTEFORCk7XG5sZXQgWU9SID0gbignWU9SJywgJ1lvcmtzaGlyZScsIExBTkQpO1xuXG4vLyBmcmFuY2VcbmxldCBCUkUgPSBuKCdCUkUnLCAnQnJlc3QnLCBMQU5EKTtcbmxldCBCVVIgPSBuKCdCVVInLCAnQnVyZ3VuZHknLCBMQU5EKTtcbmxldCBHQVMgPSBuKCdHQVMnLCAnR2FzY29ueScsIExBTkQpO1xubGV0IE1BUiA9IG4oJ01BUicsICdNYXJzZWlsbGVzJywgTEFORCk7XG5sZXQgUEFSID0gbignUEFSJywgJ1BhcmlzJywgTEFORCk7XG5sZXQgUElDID0gbignUElDJywgJ1BpY2FyZHknLCBMQU5EKTtcblxuLy8gZ2VybWFueVxubGV0IEJFUiA9IG4oJ0JFUicsICdCZXJsaW4nLCBMQU5EKTtcbmxldCBLSUUgPSBuKCdLSUUnLCAnS2llbCcsIExBTkQpO1xubGV0IE1VTiA9IG4oJ01VTicsICdNdW5pY2gnLCBMQU5EKTtcbmxldCBQUlUgPSBuKCdQUlUnLCAnUHJ1c3NpYScsIExBTkQpO1xubGV0IFJVSCA9IG4oJ1JVSCcsICdSdWhyJywgTEFORCk7XG5sZXQgU0lMID0gbignU0lMJywgJ1NpbGVzaWEnLCBMQU5EKTtcblxuLy8gaXRhbHlcbmxldCBBUFUgPSBuKCdBUFUnLCAnQXB1bGlhJywgTEFORCk7XG5sZXQgTkFQID0gbignTkFQJywgJ05hcGxlcycsIExBTkQpO1xubGV0IFBJRSA9IG4oJ1BJRScsICdQaWVkbW9udCcsIExBTkQpO1xubGV0IFJPTSA9IG4oJ1JPTScsICdSb21lJywgTEFORCk7XG5sZXQgVFVTID0gbignVFVTJywgJ1R1c2NhbnknLCBMQU5EKTtcbmxldCBWRU4gPSBuKCdWRU4nLCAnVmVuaWNlJywgTEFORCk7XG5cbi8vIHJ1c3NpYVxubGV0IEZJTiA9IG4oJ0ZJTicsICdGaW5sYW5kJywgTEFORCk7XG5sZXQgTFZOID0gbignTFZOJywgJ0xpdm9uaWEnLCBMQU5EKTtcbmxldCBNT1MgPSBuKCdNT1MnLCAnTW9zY293JywgTEFORCk7XG5sZXQgU0VWID0gbignU0VWJywgJ1NldmFzdG9wb2wnLCBMQU5EKTtcbmxldCBTVFAgPSBuKCdTVFAnLCAnU3QuIFBldGVyc2J1cmcnLCBMQU5EKTtcbmxldCBVS1IgPSBuKCdVS1InLCAnVWtyYWluZScsIExBTkQpO1xubGV0IFdBUiA9IG4oJ1dBUicsICdXYXJzYXcnLCBMQU5EKTtcblxuLy8gdHVya2V5XG5sZXQgQU5LID0gbignQU5LJywgJ0Fua2FyYScsIExBTkQpO1xubGV0IEFSTSA9IG4oJ0FSTScsICdBcm1lbmlhJywgTEFORCk7XG5sZXQgQ09OID0gbignQ09OJywgJ0NvbnN0YW50aW5vcGxlJywgTEFORCk7XG5sZXQgU01ZID0gbignU01ZJywgJ1NteXJuYScsIExBTkQpO1xubGV0IFNZUiA9IG4oJ1NZUicsICdTeXJpYScsIExBTkQpO1xuXG4vLyBuZXV0cmFsXG5sZXQgQUxCID0gbignQUxCJywgJ0FsYmFuaWEnLCBMQU5EKTtcbmxldCBCRUwgPSBuKCdCRUwnLCAnQmVsZ2l1bScsIExBTkQpO1xubGV0IEJVTCA9IG4oJ0JVTCcsICdCdWxnYXJpYScsIExBTkQpO1xubGV0IERFTiA9IG4oJ0RFTicsICdEZW5tYXJrJywgTEFORCk7XG5sZXQgR1JFID0gbignR1JFJywgJ0dyZWVjZScsIExBTkQpO1xubGV0IEhPTCA9IG4oJ0hPTCcsICdIb2xsYW5kJywgTEFORCk7XG5sZXQgTldZID0gbignTldZJywgJ05vcndheScsIExBTkQpO1xubGV0IE5BRiA9IG4oJ05BRicsICdOb3J0aCBBZnJpY2EnLCBMQU5EKTtcbmxldCBQT1IgPSBuKCdQT1InLCAnUG9ydHVnYWwnLCBMQU5EKTtcbmxldCBSVU0gPSBuKCdSVU0nLCAnUnVtYW5pYScsIExBTkQpO1xubGV0IFNFUiA9IG4oJ1NFUicsICdTZXJiaWEnLCBMQU5EKTtcbmxldCBTUEEgPSBuKCdTUEEnLCAnU3BhaW4nLCBMQU5EKTtcbmxldCBTV0UgPSBuKCdTV0UnLCAnU3dlZGVuJywgTEFORCk7XG5sZXQgVFVOID0gbignVFVOJywgJ1R1bmlzJywgTEFORCk7XG5cbi8vIHdhdGVyXG5sZXQgQURSID0gbignQURSJywgJ0FkcmlhdGljIFNlYScsIFdBVEVSKTtcbmxldCBBRUcgPSBuKCdBRUcnLCAnQWVnZWFuIFNlYScsIFdBVEVSKTtcbmxldCBCQUwgPSBuKCdCQUwnLCAnQmFsdGljIFNlYScsIFdBVEVSKTtcbmxldCBCQVIgPSBuKCdCQVInLCAnQmFyZW50cyBTZWEnLCBXQVRFUik7XG5sZXQgQkxBID0gbignQkxBJywgJ0JsYWNrIFNlYScsIFdBVEVSKTtcbmxldCBFQVMgPSBuKCdFQVMnLCAnRWFzdGVybiBNZWRpdGVycmFuZWFuJywgV0FURVIpO1xubGV0IEVORyA9IG4oJ0VORycsICdFbmdsaXNoIENoYW5uZWwnLCBXQVRFUik7XG5sZXQgQk9UID0gbignQk9UJywgJ0d1bGYgb2YgQm90aG5pYScsIFdBVEVSKTtcbmxldCBHT0wgPSBuKCdHT0wnLCAnR3VsZiBvZiBMeW9uJywgV0FURVIpO1xubGV0IEhFTCA9IG4oJ0hFTCcsICdIZWxnb2xhbmQgQmlnaHQnLCBXQVRFUik7XG5sZXQgSU9OID0gbignSU9OJywgJ0lvbmlhbiBTZWEnLCBXQVRFUik7XG5sZXQgSVJJID0gbignSVJJJywgJ0lyaXNoIFNlYScsIFdBVEVSKTtcbmxldCBNSUQgPSBuKCdNSUQnLCAnTWlkLUF0bGFudGljIE9jZWFuJywgV0FURVIpO1xubGV0IE5BVCA9IG4oJ05BVCcsICdOb3J0aCBBdGxhbnRpYyBPY2VhbicsIFdBVEVSKTtcbmxldCBOVEggPSBuKCdOVEgnLCAnTm9ydGggU2VhJywgV0FURVIpO1xubGV0IE5SRyA9IG4oJ05SRycsICdOb3J3ZWdpYW4gU2VhJywgV0FURVIpO1xubGV0IFNLQSA9IG4oJ1NLQScsICdTa2FnZXJyYWNrJywgV0FURVIpO1xubGV0IFRZTiA9IG4oJ1RZTicsICdUeXJyaGVuaWFuIFNlYScsIFdBVEVSKTtcbmxldCBXRVMgPSBuKCdXRVMnLCAnV2VzdGVybiBNZWRpdGVycmFuZWFuJywgV0FURVIpO1xuXG5sZXQgU1RQX05PUlRIID0gbignU1RQTicsICdTdC4gUGV0ZXJzYnVyZyAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1RQX1NPVVRIID0gbignU1RQUycsICdTdC4gUGV0ZXJzYnVyZyAoU291dGggQ29hc3QpJywgTEFORCk7XG5cbmxldCBTUEFfTk9SVEggPSBuKCdTUEFOJywgJ1NwYWluIChOb3J0aCBDb2FzdCknLCBMQU5EKTtcbmxldCBTUEFfU09VVEggPSBuKCdTUEFTJywgJ1NwYWluIChTb3V0aCBDb2FzdCknLCBMQU5EKTtcblxubGV0IEJVTF9OT1JUSCA9IG4oJ0JVTEUnLCAnQnVsZ2FyaWEgKEVhc3QgQ29hc3QpJywgTEFORCk7XG5sZXQgQlVMX1NPVVRIID0gbignQlVMUycsICdCdWxnYXJpYSAoU291dGggQ29hc3QpJywgTEFORCk7XG5cbmZ1bmN0aW9uIGJvcmRlcihub2RlOiBSZWdpb24sIGFkamFjZW50OiBSZWdpb25bXSkge1xuICAgIGZvciAobGV0IG90aGVyIG9mIGFkamFjZW50KVxuICAgICAgICBub2RlLmFkamFjZW50LmFkZChvdGhlcik7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaChub2RlOiBSZWdpb24sIGF0dGFjaGVkOiBSZWdpb25bXSkge1xuICAgIGxldCBhbGwgPSBbbm9kZSwgLi4uYXR0YWNoZWRdO1xuICAgIGZvciAobGV0IHJlZ2lvbiBvZiBhbGwpIHtcbiAgICAgICAgZm9yIChsZXQgb3RoZXIgb2YgYWxsKSB7XG4gICAgICAgICAgICBpZiAob3RoZXIgPT0gcmVnaW9uKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJlZ2lvbi5hdHRhY2hlZC5hZGQob3RoZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5ib3JkZXIoU1RQX05PUlRILCBbQkFSLCBOV1ldKTtcbmF0dGFjaChTVFAsIFtTVFBfU09VVEgsIFNUUF9OT1JUSF0pO1xuYm9yZGVyKFNUUF9TT1VUSCwgW0JPVCwgTFZOLCBGSU5dKTtcblxuYm9yZGVyKEJVTF9OT1JUSCwgW0JMQSwgQ09OLCBSVU1dKTtcbmF0dGFjaChCVUwsIFtCVUxfU09VVEgsIEJVTF9OT1JUSF0pO1xuYm9yZGVyKEJVTF9TT1VUSCwgW0FFRywgR1JFLCBDT05dKTtcblxuYm9yZGVyKFNQQV9OT1JUSCwgW01JRCwgUE9SLCBHQVNdKTtcbmF0dGFjaChTUEEsIFtTUEFfU09VVEgsIFNQQV9OT1JUSF0pO1xuYm9yZGVyKFNQQV9TT1VUSCwgW0dPTCwgV0VTLCBNSUQsIFBPUiwgTUFSXSk7XG5cbmJvcmRlcihOQVQsIFtOUkcsIENMWSwgTFZQLCBJUkksIE1JRF0pO1xuYm9yZGVyKE5SRywgW0JBUiwgTldZLCBOVEgsIEVESSwgQ0xZLCBOQVRdKTtcbmJvcmRlcihDTFksIFtOUkcsIEVESSwgTFZQLCBOQVRdKTtcbmJvcmRlcihMVlAsIFtDTFksIEVESSwgWU9SLCBXQUwsIElSSSwgTkFUXSk7XG5ib3JkZXIoSVJJLCBbTkFULCBMVlAsIFdBTCwgRU5HLCBNSURdKTtcbmJvcmRlcihNSUQsIFtOQVQsIElSSSwgRU5HLCBCUkUsIEdBUywgUE9SLCBXRVMsIE5BRiwgU1BBX05PUlRILCBTUEFfU09VVEhdKTtcbmJvcmRlcihCQVIsIFtOUkcsIE5XWSwgU1RQX05PUlRIXSk7XG5ib3JkZXIoTldZLCBbTlJHLCBCQVIsIFNUUCwgRklOLCBTV0UsIFNLQSwgTlRILCBTVFBfTk9SVEhdKTtcbmJvcmRlcihOVEgsIFtOUkcsIE5XWSwgU0tBLCBERU4sIEhFTCwgSE9MLCBCRUwsIEVORywgTE9OLCBZT1IsIEVESV0pO1xuYm9yZGVyKEVESSwgW05SRywgTlRILCBZT1IsIExWUCwgQ0xZXSk7XG5ib3JkZXIoWU9SLCBbRURJLCBOVEgsIExPTiwgV0FMLCBMVlBdKTtcbmJvcmRlcihXQUwsIFtMVlAsIFlPUiwgTE9OLCBFTkcsIElSSV0pO1xuYm9yZGVyKEVORywgW0lSSSwgV0FMLCBMT04sIE5USCwgQkVMLCBQSUMsIEJSRSwgTUlEXSk7XG5ib3JkZXIoQlJFLCBbRU5HLCBQSUMsIFBBUiwgR0FTLCBNSURdKTtcbmJvcmRlcihHQVMsIFtCUkUsIFBBUiwgQlVSLCBNQVIsIFNQQSwgTUlEXSk7XG5ib3JkZXIoU1BBLCBbR0FTLCBNQVIsIFBPUl0pO1xuYm9yZGVyKFBPUiwgW01JRCwgU1BBLCBTUEFfTk9SVEgsIFNQQV9TT1VUSF0pO1xuYm9yZGVyKFdFUywgW0dPTCwgVFlOLCBUVU4sIE5BRiwgTUlELCBTUEFfU09VVEhdKTtcbmJvcmRlcihOQUYsIFtNSUQsIFdFUywgVFVOXSk7XG5ib3JkZXIoU1RQLCBbTldZLCBNT1MsIExWTiwgRklOXSk7XG5ib3JkZXIoU1dFLCBbTldZLCBGSU4sIEJPVCwgQkFMLCBERU4sIFNLQV0pO1xuYm9yZGVyKEZJTiwgW05XWSwgU1RQLCBCT1QsIFNXRSwgU1RQX1NPVVRIXSk7XG5ib3JkZXIoU0tBLCBbTldZLCBTV0UsIERFTiwgTlRIXSk7XG5ib3JkZXIoREVOLCBbU0tBLCBTV0UsIEJBTCwgS0lFLCBIRUwsIE5USF0pO1xuYm9yZGVyKEhFTCwgW05USCwgREVOLCBLSUUsIEhPTF0pO1xuYm9yZGVyKEhPTCwgW05USCwgSEVMLCBLSUUsIFJVSCwgQkVMXSk7XG5ib3JkZXIoQkVMLCBbRU5HLCBOVEgsIEhPTCwgUlVILCBCVVIsIFBJQ10pO1xuYm9yZGVyKExPTiwgW1lPUiwgTlRILCBFTkcsIFdBTF0pO1xuYm9yZGVyKFBJQywgW0VORywgQkVMLCBCVVIsIFBBUiwgQlJFXSk7XG5ib3JkZXIoUEFSLCBbUElDLCBCVVIsIEdBUywgQlJFXSk7XG5ib3JkZXIoR0FTLCBbQlJFLCBQQVIsIEJVUiwgTUFSLCBTUEEsIE1JRCwgU1BBX05PUlRIXSk7XG5ib3JkZXIoQlVSLCBbUEFSLCBQSUMsIEJFTCwgUlVILCBNVU4sIE1BUiwgR0FTXSk7XG5ib3JkZXIoTUFSLCBbR0FTLCBCVVIsIFBJRSwgR09MLCBTUEEsIFNQQV9TT1VUSF0pO1xuYm9yZGVyKEdPTCwgW01BUiwgUElFLCBUVVMsIFRZTiwgV0VTLCBTUEFfU09VVEhdKTtcbmJvcmRlcihUWU4sIFtUVVMsIFJPTSwgTkFQLCBJT04sIFRVTiwgV0VTLCBHT0xdKTtcbmJvcmRlcihUVU4sIFtXRVMsIFRZTiwgSU9OLCBOQUZdKTtcbmJvcmRlcihNT1MsIFtTVFAsIFNFViwgVUtSLCBXQVIsIExWTl0pO1xuYm9yZGVyKExWTiwgW0JPVCwgU1RQLCBNT1MsIFdBUiwgUFJVLCBCQUwsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKEJPVCwgW1NXRSwgRklOLCBMVk4sIEJBTCwgU1RQX1NPVVRIXSk7XG5ib3JkZXIoQkFMLCBbREVOLCBTV0UsIEJPVCwgTFZOLCBQUlUsIEJFUiwgS0lFXSk7XG5ib3JkZXIoS0lFLCBbSEVMLCBERU4sIEJBTCwgQkVSLCBNVU4sIFJVSCwgSE9MXSk7XG5ib3JkZXIoUlVILCBbQkVMLCBIT0wsIEtJRSwgTVVOLCBCVVJdKTtcbmJvcmRlcihQSUUsIFtUWVIsIFZFTiwgVFVTLCBHT0wsIE1BUl0pO1xuYm9yZGVyKFRVUywgW1BJRSwgVkVOLCBST00sIFRZTiwgR09MXSk7XG5ib3JkZXIoUk9NLCBbVFVTLCBWRU4sIEFQVSwgTkFQLCBUWU5dKTtcbmJvcmRlcihOQVAsIFtST00sIEFQVSwgSU9OLCBUWU5dKTtcbmJvcmRlcihJT04sIFtUWU4sIE5BUCwgQVBVLCBBRFIsIEFMQiwgR1JFLCBBRUcsIEVBUywgVFVOXSk7XG5ib3JkZXIoU0VWLCBbVUtSLCBNT1MsIEFSTSwgQkxBLCBSVU1dKTtcbmJvcmRlcihVS1IsIFtNT1MsIFNFViwgUlVNLCBHQUwsIFdBUl0pO1xuYm9yZGVyKFdBUiwgW1BSVSwgTFZOLCBNT1MsIFVLUiwgR0FMLCBTSUxdKTtcbmJvcmRlcihQUlUsIFtCQUwsIExWTiwgV0FSLCBTSUwsIEJFUl0pO1xuYm9yZGVyKEJFUiwgW0JBTCwgUFJVLCBTSUwsIE1VTiwgS0lFXSk7XG5ib3JkZXIoTVVOLCBbUlVILCBLSUUsIEJFUiwgU0lMLCBCT0gsIFRZUiwgQlVSXSk7XG5ib3JkZXIoVFlSLCBbTVVOLCBCT0gsIFZJRSwgVFJJLCBWRU4sIFBJRV0pO1xuYm9yZGVyKFZFTiwgW1RZUiwgVFJJLCBBRFIsIEFQVSwgUk9NLCBUVVMsIFBJRV0pO1xuYm9yZGVyKEFQVSwgW1ZFTiwgQURSLCBJT04sIE5BUCwgUk9NXSk7XG5ib3JkZXIoQURSLCBbVkVOLCBUUkksIEFMQiwgSU9OLCBBUFVdKTtcbmJvcmRlcihBTEIsIFtUUkksIFNFUiwgR1JFLCBJT04sIEFEUl0pO1xuYm9yZGVyKEdSRSwgW0FMQiwgU0VSLCBCVUwsIEFFRywgSU9OLCBCVUxfU09VVEhdKTtcbmJvcmRlcihBRUcsIFtHUkUsIENPTiwgU01ZLCBFQVMsIElPTiwgQlVMX1NPVVRIXSk7XG5ib3JkZXIoRUFTLCBbQUVHLCBTTVksIFNZUiwgSU9OXSk7XG5ib3JkZXIoQVJNLCBbU0VWLCBTWVIsIFNNWSwgQU5LLCBCTEFdKTtcbmJvcmRlcihCTEEsIFtSVU0sIFNFViwgQVJNLCBBTkssIENPTiwgQlVMX05PUlRIXSk7XG5ib3JkZXIoUlVNLCBbQlVELCBHQUwsIFVLUiwgU0VWLCBCTEEsIEJVTCwgU0VSLCBCVUxfTk9SVEhdKTtcbmJvcmRlcihHQUwsIFtCT0gsIFNJTCwgV0FSLCBVS1IsIFJVTSwgQlVELCBWSUVdKTtcbmJvcmRlcihTSUwsIFtCRVIsIFBSVSwgV0FSLCBHQUwsIEJPSCwgTVVOXSk7XG5ib3JkZXIoQk9ILCBbTVVOLCBTSUwsIEdBTCwgVklFLCBUWVJdKTtcbmJvcmRlcihWSUUsIFtCT0gsIEdBTCwgQlVELCBUUkksIFRZUl0pO1xuYm9yZGVyKFRSSSwgW1RZUiwgVklFLCBCVUQsIFNFUiwgQUxCLCBBRFIsIFZFTl0pO1xuYm9yZGVyKFNFUiwgW0JVRCwgUlVNLCBCVUwsIEdSRSwgQUxCLCBUUkldKTtcbmJvcmRlcihCVUwsIFtSVU0sIENPTiwgR1JFLCBTRVJdKTtcbmJvcmRlcihDT04sIFtCVUwsIEJMQSwgQU5LLCBTTVksIEFFRywgQlVMX1NPVVRILCBCVUxfTk9SVEhdKTtcbmJvcmRlcihTTVksIFtDT04sIEFOSywgQVJNLCBTWVIsIEVBUywgQUVHXSk7XG5ib3JkZXIoU1lSLCBbU01ZLCBBUk0sIEVBU10pO1xuYm9yZGVyKEJVRCwgW1ZJRSwgR0FMLCBSVU0sIFNFUiwgVFJJXSk7XG5ib3JkZXIoQU5LLCBbQkxBLCBBUk0sIFNNWSwgQ09OXSk7XG5cbmV4cG9ydCBjb25zdCBtYXAgPSBuZXcgR2FtZU1hcChbQk9ILCBCVUQsIEdBTCwgVFJJLCBUWVIsIFZJRSwgQ0xZLCBFREksIExWUCwgTE9OLCBXQUwsIFlPUiwgQlJFLCBCVVIsIEdBUywgTUFSLCBQQVIsIFBJQywgQkVSLCBLSUUsIE1VTiwgUFJVLCBSVUgsIFNJTCwgQVBVLCBOQVAsIFBJRSwgUk9NLCBUVVMsIFZFTiwgRklOLCBMVk4sIE1PUywgU0VWLCBTVFAsIFVLUiwgV0FSLCBBTkssIEFSTSwgQ09OLCBTTVksIFNZUiwgQUxCLCBCRUwsIEJVTCwgREVOLCBHUkUsIEhPTCwgTldZLCBOQUYsIFBPUiwgUlVNLCBTRVIsIFNQQSwgU1dFLCBUVU4sIEFEUiwgQUVHLCBCQUwsIEJBUiwgQkxBLCBFQVMsIEVORywgQk9ULCBHT0wsIEhFTCwgSU9OLCBJUkksIE1JRCwgTkFULCBOVEgsIE5SRywgU0tBLCBUWU4sIFdFUywgU1RQX05PUlRILCBTVFBfU09VVEgsIFNQQV9OT1JUSCwgU1BBX1NPVVRILCBCVUxfTk9SVEgsIEJVTF9TT1VUSF0pO1xuXG5leHBvcnQgY29uc3QgYWxsUmVnaW9ucyA9IHsgQk9ILCBCVUQsIEdBTCwgVFJJLCBUWVIsIFZJRSwgQ0xZLCBFREksIExWUCwgTE9OLCBXQUwsIFlPUiwgQlJFLCBCVVIsIEdBUywgTUFSLCBQQVIsIFBJQywgQkVSLCBLSUUsIE1VTiwgUFJVLCBSVUgsIFNJTCwgQVBVLCBOQVAsIFBJRSwgUk9NLCBUVVMsIFZFTiwgRklOLCBMVk4sIE1PUywgU0VWLCBTVFAsIFVLUiwgV0FSLCBBTkssIEFSTSwgQ09OLCBTTVksIFNZUiwgQUxCLCBCRUwsIEJVTCwgREVOLCBHUkUsIEhPTCwgTldZLCBOQUYsIFBPUiwgUlVNLCBTRVIsIFNQQSwgU1dFLCBUVU4sIEFEUiwgQUVHLCBCQUwsIEJBUiwgQkxBLCBFQVMsIEVORywgQk9ULCBHT0wsIEhFTCwgSU9OLCBJUkksIE1JRCwgTkFULCBOVEgsIE5SRywgU0tBLCBUWU4sIFdFUywgU1RQX05PUlRILCBTVFBfU09VVEgsIFNQQV9OT1JUSCwgU1BBX1NPVVRILCBCVUxfTk9SVEgsIEJVTF9TT1VUSCB9O1xuIiwiZXhwb3J0ICogZnJvbSAnLi9nYW1lJztcbmV4cG9ydCAqIGZyb20gJy4vcnVsZXMnO1xuXG5pbXBvcnQgZm9ybWF0dGVyIGZyb20gJy4vZm9ybWF0dGVyJztcblxuZXhwb3J0IHsgZm9ybWF0dGVyIH07XG5cbmltcG9ydCAqIGFzIHN0YW5kYXJkIGZyb20gJy4vbWFwcy9zdGFuZGFyZCc7XG5cbmV4cG9ydCBjb25zdCBtYXBzID0ge1xuICAgIHN0YW5kYXJkOiB7XG4gICAgICAgIG1hcDogc3RhbmRhcmQubWFwLFxuICAgICAgICByZWdpb25zOiBzdGFuZGFyZC5hbGxSZWdpb25zLFxuICAgIH0sXG59O1xuIl0sIm5hbWVzIjpbIlVuaXRUeXBlIiwic3RhbmRhcmQubWFwIiwic3RhbmRhcmQuYWxsUmVnaW9ucyJdLCJtYXBwaW5ncyI6Ijs7OztNQUFhLE1BQU07SUFJZixZQUNhLEVBQVUsRUFDVixJQUFZLEVBQ1osSUFBYztRQUZkLE9BQUUsR0FBRixFQUFFLENBQVE7UUFDVixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osU0FBSSxHQUFKLElBQUksQ0FBVTtRQU5sQixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUM3QixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztLQU1qQztJQUVMLElBQUksV0FBVztRQUNYLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUIsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDL0I7UUFDRCxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSUEsZ0JBQVEsQ0FBQyxJQUFJO2VBQzFCLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJQSxnQkFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztLQUN6RTtJQUVELE9BQU8sT0FBTyxDQUFDLEdBQVcsRUFBRSxHQUFXO1FBQ25DLE9BQU8sR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM5QztJ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QUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0MsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN4QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVks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QUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzlDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUVsQyxBQUFPLE1BQU0sR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTFkLEFBQU8sTUFBTSxVQUFVLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDOztNQ2hOemMsSUFBSSxHQUFHO0lBQ2hCLFFBQVEsRUFBRTtRQUNOLEdBQUcsRUFBRUMsR0FBWTtRQUNqQixPQUFPLEVBQUVDLFVBQW1CO0tBQy9CO0NBQ0o7Ozs7Ozs7Ozs7Ozs7OyJ9
