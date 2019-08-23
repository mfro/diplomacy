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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2dhbWUudHMiLCIuLi9zcmMvcnVsZXMudHMiLCIuLi9zcmMvZm9ybWF0dGVyLnRzIiwiLi4vc3JjL21hcHMvc3RhbmRhcmQudHMiLCIuLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgUmVnaW9uIHtcbiAgICByZWFkb25seSBhdHRhY2hlZCA9IG5ldyBTZXQ8UmVnaW9uPigpO1xuICAgIHJlYWRvbmx5IGFkamFjZW50ID0gbmV3IFNldDxSZWdpb24+KCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcmVhZG9ubHkgaWQ6IHN0cmluZyxcbiAgICAgICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuICAgICAgICByZWFkb25seSB0eXBlOiBVbml0VHlwZSxcbiAgICApIHsgfVxuXG4gICAgZ2V0IGFsbEFkamFjZW50KCkge1xuICAgICAgICBsZXQgbGlzdCA9IFsuLi50aGlzLmFkamFjZW50XTtcbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLmF0dGFjaGVkKSB7XG4gICAgICAgICAgICBsaXN0LnB1c2goLi4ubm9kZS5hZGphY2VudCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBsaXN0LnNsaWNlKCkpIHtcbiAgICAgICAgICAgIGxpc3QucHVzaCguLi5ub2RlLmF0dGFjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG5cbiAgICBnZXQgaXNTaG9yZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PSBVbml0VHlwZS5MYW5kXG4gICAgICAgICAgICAmJiBbLi4udGhpcy5hZGphY2VudF0uZmluZChhID0+IGEudHlwZSA9PSBVbml0VHlwZS5XYXRlcikgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXJlU2FtZShsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHMgfHwgbGhzLmF0dGFjaGVkLmhhcyhyaHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhcmVFcXVhbChsaHM6IFJlZ2lvbiwgcmhzOiBSZWdpb24pIHtcbiAgICAgICAgcmV0dXJuIGxocyA9PSByaHM7XG4gICAgfVxufVxuXG5leHBvcnQgZW51bSBVbml0VHlwZSB7XG4gICAgTGFuZCxcbiAgICBXYXRlcixcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSByZWdpb246IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogVW5pdFR5cGUsXG4gICAgICAgIHJlYWRvbmx5IHRlYW06IHN0cmluZyxcbiAgICApIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZU1hcCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHJlZ2lvbnM6IFJlZ2lvbltdLFxuICAgICkgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU3RhdGUge1xuICAgIHJlYWRvbmx5IHVuaXRzID0gbmV3IFNldDxVbml0PigpO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IG1hcDogR2FtZU1hcCxcbiAgICAgICAgcmVhZG9ubHkgdGVhbXM6IHN0cmluZ1tdLFxuICAgICkgeyB9XG5cbiAgICBtb3ZlKHVuaXQ6IFVuaXQsIHRhcmdldDogUmVnaW9uKSB7XG4gICAgICAgIHRoaXMudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICB0aGlzLnVuaXRzLmFkZChuZXcgVW5pdCh0YXJnZXQsIHVuaXQudHlwZSwgdW5pdC50ZWFtKSk7XG4gICAgfVxufVxuXG5cbmludGVyZmFjZSBPcmRlckJhc2U8VCBleHRlbmRzIHN0cmluZz4ge1xuICAgIHJlYWRvbmx5IHR5cGU6IFQsXG4gICAgcmVhZG9ubHkgdW5pdDogVW5pdCxcbn1cblxuZXhwb3J0IGNsYXNzIEhvbGRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnaG9sZCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ2hvbGQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gaG9sZGA7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW92ZU9yZGVyIGltcGxlbWVudHMgT3JkZXJCYXNlPCdtb3ZlJz4ge1xuICAgIHJlYWRvbmx5IHR5cGUgPSAnbW92ZSc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgICAgIHJlYWRvbmx5IHRhcmdldDogUmVnaW9uLFxuICAgICAgICByZWFkb25seSByZXF1aXJlQ29udm95OiBib29sZWFuLFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IHRleHQgPSBgJHt0aGlzLnVuaXQudGVhbX0gJHt0aGlzLnVuaXQucmVnaW9uLm5hbWV9IC0+ICR7dGhpcy50YXJnZXQubmFtZX1gO1xuICAgICAgICBpZiAodGhpcy5yZXF1aXJlQ29udm95KSB0ZXh0ICs9IGAgdmlhIGNvbnZveWA7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1cHBvcnRPcmRlciBpbXBsZW1lbnRzIE9yZGVyQmFzZTwnc3VwcG9ydCc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ3N1cHBvcnQnO1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWFkb25seSB1bml0OiBVbml0LFxuICAgICAgICByZWFkb25seSB0YXJnZXQ6IFJlZ2lvbixcbiAgICAgICAgcmVhZG9ubHkgYXR0YWNrPzogUmVnaW9uLFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgbGV0IHRleHQgPSBgJHt0aGlzLnVuaXQudGVhbX0gJHt0aGlzLnVuaXQucmVnaW9uLm5hbWV9IHN1cHBvcnQgJHt0aGlzLnRhcmdldC5uYW1lfWA7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaykgdGV4dCArPSBgIC0+ICR7dGhpcy5hdHRhY2submFtZX1gO1xuICAgICAgICBlbHNlIHRleHQgKz0gYCB0byBob2xkYDtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29udm95T3JkZXIgaW1wbGVtZW50cyBPcmRlckJhc2U8J2NvbnZveSc+IHtcbiAgICByZWFkb25seSB0eXBlID0gJ2NvbnZveSc7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHJlYWRvbmx5IHVuaXQ6IFVuaXQsXG4gICAgICAgIHJlYWRvbmx5IHN0YXJ0OiBSZWdpb24sXG4gICAgICAgIHJlYWRvbmx5IGVuZDogUmVnaW9uLFxuICAgICkgeyB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudW5pdC50ZWFtfSAke3RoaXMudW5pdC5yZWdpb24ubmFtZX0gY29udm95ICR7dGhpcy5zdGFydC5uYW1lfSB0byAke3RoaXMuZW5kLm5hbWV9YDtcbiAgICB9XG59XG5cbmV4cG9ydCB0eXBlIEFueU9yZGVyID0gSG9sZE9yZGVyIHwgTW92ZU9yZGVyIHwgU3VwcG9ydE9yZGVyIHwgQ29udm95T3JkZXI7XG4iLCJpbXBvcnQgeyBVbml0LCBSZWdpb24sIFVuaXRUeXBlLCBBbnlPcmRlciwgTW92ZU9yZGVyLCBDb252b3lPcmRlciwgU3VwcG9ydE9yZGVyLCBIb2xkT3JkZXIgfSBmcm9tICcuL2dhbWUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZShvcmRlcnM6IEFueU9yZGVyW10pIHtcbiAgICBmdW5jdGlvbiBjYW5Nb3ZlKHVuaXQ6IFVuaXQsIGRzdDogUmVnaW9uKSB7XG4gICAgICAgIGlmICh1bml0LnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIpIHtcbiAgICAgICAgICAgIGlmICghdW5pdC5yZWdpb24uYWRqYWNlbnQuaGFzKGRzdCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGRzdC50eXBlICE9IFVuaXRUeXBlLldhdGVyICYmICFkc3QuaXNTaG9yZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZHN0LnR5cGUgPT0gVW5pdFR5cGUuTGFuZCAmJiB1bml0LnJlZ2lvbi50eXBlID09IFVuaXRUeXBlLkxhbmQpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2hvcmUgPSBbLi4udW5pdC5yZWdpb24uYWRqYWNlbnRdLmZpbmQoYSA9PiBhLnR5cGUgPT0gVW5pdFR5cGUuV2F0ZXIgJiYgZHN0LmFkamFjZW50LmhhcyhhKSk7XG4gICAgICAgICAgICAgICAgaWYgKHNob3JlID09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdW5pdC5yZWdpb24uYWxsQWRqYWNlbnQuaW5jbHVkZXMoZHN0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZHN0LnR5cGUgIT0gVW5pdFR5cGUuTGFuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5SZWFjaCh1bml0OiBVbml0LCBkc3Q6IFJlZ2lvbikge1xuICAgICAgICBpZiAoY2FuTW92ZSh1bml0LCBkc3QpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgbGV0IHNob3JlID0gWy4uLmRzdC5hdHRhY2hlZF0uZmluZChhID0+IHVuaXQucmVnaW9uLmFkamFjZW50LmhhcyhhKSk7XG4gICAgICAgIHJldHVybiBzaG9yZSAhPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVmFsaWQob3JkZXI6IEFueU9yZGVyKSB7XG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgaWYgKFJlZ2lvbi5hcmVTYW1lKG9yZGVyLnVuaXQucmVnaW9uLCBvcmRlci50YXJnZXQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKG9yZGVyLnVuaXQudHlwZSA9PSBVbml0VHlwZS5XYXRlciAmJiAhY2FuTW92ZShvcmRlci51bml0LCBvcmRlci50YXJnZXQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRSb3V0ZXMob3JkZXI6IE1vdmVPcmRlciwgc2tpcD86IFJlZ2lvbikge1xuICAgICAgICBsZXQgY29udm95cyA9IG9yZGVycy5maWx0ZXIobyA9PiBvLnR5cGUgPT0gJ2NvbnZveSdcbiAgICAgICAgICAgICYmIG8udW5pdC5yZWdpb24gIT0gc2tpcFxuICAgICAgICAgICAgJiYgUmVnaW9uLmFyZVNhbWUoby5zdGFydCwgb3JkZXIudW5pdC5yZWdpb24pXG4gICAgICAgICAgICAmJiByZXNvbHZlKG8pKSBhcyBDb252b3lPcmRlcltdO1xuXG4gICAgICAgIGxldCB1c2VkID0gY29udm95cy5tYXAoKCkgPT4gZmFsc2UpO1xuICAgICAgICBsZXQgbm9kZSA9IG9yZGVyLnVuaXQ7XG5cbiAgICAgICAgbGV0IHBhdGg6IENvbnZveU9yZGVyW10gPSBbXTtcbiAgICAgICAgbGV0IHBhdGhzOiBDb252b3lPcmRlcltdW10gPSBbXTtcblxuICAgICAgICBmdW5jdGlvbiBzZWFyY2goKSB7XG4gICAgICAgICAgICBpZiAoY2FuTW92ZShub2RlLCBvcmRlci50YXJnZXQpIHx8IHBhdGgubGVuZ3RoID4gMCAmJiBjYW5SZWFjaChub2RlLCBvcmRlci50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgcGF0aHMucHVzaChwYXRoLnNsaWNlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGxldCBuZXh0ID0gMDsgbmV4dCA8IGNvbnZveXMubGVuZ3RoOyArK25leHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlZFtuZXh0XSB8fCAhbm9kZS5yZWdpb24uYWxsQWRqYWNlbnQuaW5jbHVkZXMoY29udm95c1tuZXh0XS51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgbGV0IHByZXZpb3VzID0gbm9kZTtcbiAgICAgICAgICAgICAgICB1c2VkW25leHRdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goY29udm95c1tuZXh0XSk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbnZveXNbbmV4dF0udW5pdDtcblxuICAgICAgICAgICAgICAgIHNlYXJjaCgpO1xuXG4gICAgICAgICAgICAgICAgbm9kZSA9IHByZXZpb3VzO1xuICAgICAgICAgICAgICAgIHBhdGgucG9wKCk7XG4gICAgICAgICAgICAgICAgdXNlZFtuZXh0XSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VhcmNoKCk7XG5cbiAgICAgICAgaWYgKHBhdGhzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKG9yZGVyLnJlcXVpcmVDb252b3kgJiYgcGF0aHMuZmlsdGVyKGEgPT4gYS5sZW5ndGggPiAwKS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB7IGNvbnZveXMsIHBhdGhzIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZEhvbGRTdXBwb3J0KG9yZGVyOiBBbnlPcmRlcikge1xuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnbW92ZScpXG4gICAgICAgICAgICByZXR1cm4gW107XG5cbiAgICAgICAgcmV0dXJuIG9yZGVycy5maWx0ZXIobyA9PiBvLnR5cGUgPT0gJ3N1cHBvcnQnXG4gICAgICAgICAgICAmJiBSZWdpb24uYXJlRXF1YWwoby50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKVxuICAgICAgICAgICAgJiYgcmVzb2x2ZShvKSkgYXMgU3VwcG9ydE9yZGVyW107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZE1vdmVTdXBwb3J0KG9yZGVyOiBNb3ZlT3JkZXIpIHtcbiAgICAgICAgcmV0dXJuIG9yZGVycy5maWx0ZXIobyA9PiBvLnR5cGUgPT0gJ3N1cHBvcnQnXG4gICAgICAgICAgICAmJiBSZWdpb24uYXJlRXF1YWwoby50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKVxuICAgICAgICAgICAgJiYgcmVzb2x2ZShvKSkgYXMgU3VwcG9ydE9yZGVyW107XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGlzVmFsaWQob3JkZXJzW2ldKSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGxldCBkdW1wID0gb3JkZXJzW2ldO1xuICAgICAgICBvcmRlcnMuc3BsaWNlKGksIDEsIG5ldyBIb2xkT3JkZXIoZHVtcC51bml0KSk7XG4gICAgfVxuXG4gICAgbGV0IGFzc3VtZWQgPSBuZXcgU2V0PEFueU9yZGVyPigpO1xuXG4gICAgbGV0IHBhc3NlZCA9IG5ldyBTZXQ8QW55T3JkZXI+KCk7XG4gICAgbGV0IGNoZWNrZWQgPSBuZXcgU2V0PEFueU9yZGVyPigpO1xuICAgIGxldCByZWFzb25zID0gbmV3IE1hcDxBbnlPcmRlciwgc3RyaW5nPigpO1xuXG4gICAgbGV0IHN0YWNrOiBBbnlPcmRlcltdID0gW107XG5cbiAgICBmdW5jdGlvbiBmYWlsKG9yZGVyOiBBbnlPcmRlciwgcmVhc29uOiBzdHJpbmcpOiBmYWxzZSB7XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICBpZiAoYXNzdW1lZC5zaXplID09IDApXG4gICAgICAgICAgICByZWFzb25zLnNldChvcmRlciwgcmVhc29uKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhc3Mob3JkZXI6IEFueU9yZGVyKTogdHJ1ZSB7XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICBpZiAoYXNzdW1lZC5zaXplID09IDApXG4gICAgICAgICAgICBwYXNzZWQuYWRkKG9yZGVyKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZShvcmRlcjogQW55T3JkZXIsIGZvcmNlID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHN0YWNrWzBdID09IG9yZGVyICYmIHN0YWNrLmV2ZXJ5KG8gPT4gby50eXBlID09ICdtb3ZlJykgJiYgc3RhY2subGVuZ3RoID4gMikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhY2suaW5jbHVkZXMob3JkZXIpKSB7XG4gICAgICAgICAgICBpZiAoc3RhY2suaW5kZXhPZihvcmRlcikgIT0gc3RhY2subGFzdEluZGV4T2Yob3JkZXIpKVxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yKCdyZWN1cnNpdmUgcmVzb2x2ZScpO1xuICAgICAgICB9IGVsc2UgaWYgKCFmb3JjZSAmJiBhc3N1bWVkLnNpemUgPT0gMCkge1xuICAgICAgICAgICAgaWYgKGNoZWNrZWQuaGFzKG9yZGVyKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFzc2VkLmhhcyhvcmRlcik7XG4gICAgICAgICAgICBjaGVja2VkLmFkZChvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXNzdW1lZC5oYXMob3JkZXIpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgc3RhY2sucHVzaChvcmRlcik7XG5cbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ2hvbGQnKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBhdHRhY2sgb2Ygb3JkZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlICE9ICdtb3ZlJyB8fCAhUmVnaW9uLmFyZVNhbWUoYXR0YWNrLnRhcmdldCwgb3JkZXIudW5pdC5yZWdpb24pKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlKGF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzbG9kZ2VkIGJ5ICcke2F0dGFja30nYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXNzKG9yZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcmRlcnMuZmluZChvID0+IFJlZ2lvbi5hcmVTYW1lKG8udW5pdC5yZWdpb24sIG9yZGVyLnRhcmdldCkpO1xuXG4gICAgICAgICAgICBsZXQgYmVzdDogTW92ZU9yZGVyW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBzdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgICAgIGxldCBiZXN0RGlzbG9kZ2U6IE1vdmVPcmRlcltdID0gW107XG4gICAgICAgICAgICBsZXQgZGlzbG9kZ2VTdHJlbmd0aCA9IDA7XG5cbiAgICAgICAgICAgIGxldCBmb3JjZVJlc29sdmVkOiBNb3ZlT3JkZXIgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJvdXRlcyA9IGZpbmRSb3V0ZXMoYXR0YWNrKTtcbiAgICAgICAgICAgICAgICBpZiAocm91dGVzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGFjayA9PSBvcmRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgTm8gdmFsaWQgcm91dGVgKTtcblxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgc3VwcG9ydCA9IGZpbmRNb3ZlU3VwcG9ydChhdHRhY2spO1xuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC50eXBlID09ICdtb3ZlJyAmJiBSZWdpb24uYXJlU2FtZShjdXJyZW50LnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IGRpc2xvZGdlZCB1bml0IGZyb20gYm91bmNpbmcgd2l0aCBvdGhlciB1bml0cyBlbnRlcmluZyBkaXNsb2RnZXIncyByZWdpb25cbiAgICAgICAgICAgICAgICAgICAgbGV0IGVuZW1pZXMgPSBzdXBwb3J0LmZpbHRlcihvID0+IG8udW5pdC50ZWFtICE9IGN1cnJlbnQhLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50Um91dGVzID0gZmluZFJvdXRlcyhjdXJyZW50KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB0byBmYWlsIHRvIHN3YXAgcGxhY2VzLCBib3RoIG11c3QgaGF2ZSBubyByb3V0ZXMgdmlhIGNvbnZveVxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFJvdXRlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRhY2sgPT0gb3JkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgT3ZlcnBvd2VyZWQgYnkgJyR7Y3VycmVudH0nIHdpdGggc3VwcG9ydCAnJyB2cyAnJHtlbmVtaWVzLmpvaW4oXCInLCAnXCIpfSdgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRSb3V0ZXMucGF0aHMuZmlsdGVyKG8gPT4gby5sZW5ndGggPiAwKS5sZW5ndGggPT0gMCAmJiByb3V0ZXMucGF0aHMuZmlsdGVyKG8gPT4gby5sZW5ndGggPiAwKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRBdHRhY2sgPSBmaW5kTW92ZVN1cHBvcnQoY3VycmVudCkuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gYXR0YWNrLnVuaXQudGVhbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBlbmVtaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRhY2sgPT0gb3JkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgT3ZlcnBvd2VyZWQgYnkgJyR7Y3VycmVudH0nIHdpdGggc3VwcG9ydCAnJHtjdXJyZW50QXR0YWNrLmpvaW4oXCInLCAnXCIpfScgdnMgJyR7ZW5lbWllcy5qb2luKFwiJywgJ1wiKX0nYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmVzb2x2ZWQgPSBhdHRhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydC5sZW5ndGggPiBzdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0ID0gW2F0dGFja107XG4gICAgICAgICAgICAgICAgICAgIHN0cmVuZ3RoID0gc3VwcG9ydC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0Lmxlbmd0aCA9PSBzdHJlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0LnB1c2goYXR0YWNrKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAmJiBhdHRhY2sudW5pdC50ZWFtICE9IGN1cnJlbnQudW5pdC50ZWFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmVtaWVzID0gc3VwcG9ydC5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW5lbWllcy5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0RGlzbG9kZ2UgPSBbYXR0YWNrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2xvZGdlU3RyZW5ndGggPSBlbmVtaWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbmVtaWVzLmxlbmd0aCA9PSBkaXNsb2RnZVN0cmVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiZXN0RGlzbG9kZ2UucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJlc3QuaW5jbHVkZXMob3JkZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgT3ZlcnBvd2VyZWQgYnkgJyR7YmVzdC5qb2luKFwiJywgJ1wiKX0nIHdpdGggc3RyZW5ndGggJHtzdHJlbmd0aH0gdnMgJHtmaW5kTW92ZVN1cHBvcnQob3JkZXIpLmxlbmd0aH0gYCk7XG5cbiAgICAgICAgICAgIGlmIChiZXN0Lmxlbmd0aCAhPSAxKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3RhbmRvZmYgd2l0aCAnJHtiZXN0LmpvaW4oXCInLCAnXCIpfScgd2l0aCBzdHJlbmd0aCAke3N0cmVuZ3RofSBgKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgYmVzdFswXSAhPSBmb3JjZVJlc29sdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQudHlwZSA9PSAnbW92ZScgJiYgUmVnaW9uLmFyZVNhbWUoY3VycmVudC50YXJnZXQsIGJlc3RbMF0udW5pdC5yZWdpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiZXN0RGlzbG9kZ2UubGVuZ3RoICE9IDEgfHwgYmVzdFswXSAhPSBiZXN0RGlzbG9kZ2VbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYEF2b2lkaW5nIHNlbGYtZGlzbG9kZ2VtZW50YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRBdHRhY2sgPSBmaW5kTW92ZVN1cHBvcnQoY3VycmVudCkuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gYmVzdFswXS51bml0LnRlYW0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPT0gZGlzbG9kZ2VTdHJlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgQmFsYW5jZWQgZmFjZW9mZiAnJHtjdXJyZW50QXR0YWNrLmpvaW4oXCInLCAnXCIpfScgdnMgJyR7ZmluZE1vdmVTdXBwb3J0KG9yZGVyKS5maWx0ZXIobyA9PiBvLnVuaXQudGVhbSAhPSBjdXJyZW50IS51bml0LnRlYW0pLmpvaW4oXCInLCAnXCIpfSdgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEF0dGFjay5sZW5ndGggPiBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoJ0ZhaWxlZCB0byBmaWx0ZXIgb3V0IGRpc2xvZGdlZCBhdHRhY2snKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnQudHlwZSAhPSAnbW92ZScgfHwgIXJlc29sdmUoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJlc3REaXNsb2RnZS5sZW5ndGggIT0gMSB8fCBiZXN0WzBdICE9IGJlc3REaXNsb2RnZVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgQXZvaWRpbmcgc2VsZi1kaXNsb2RnZW1lbnRgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzbG9kZ2VTdHJlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBIZWxkIHdpdGggPz8gdnMgbm90aGluZ2ApO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBob2xkU3VwcG9ydCA9IGZpbmRIb2xkU3VwcG9ydChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvbGRTdXBwb3J0Lmxlbmd0aCA+PSBkaXNsb2RnZVN0cmVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBIZWxkIHdpdGggJyR7aG9sZFN1cHBvcnQuam9pbignLCAnKX0nIHZzICcke2ZpbmRNb3ZlU3VwcG9ydChvcmRlcikuZmlsdGVyKG8gPT4gby51bml0LnRlYW0gIT0gY3VycmVudCEudW5pdC50ZWFtKS5qb2luKFwiJywgJ1wiKX0nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFzcyhvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnY29udm95Jykge1xuICAgICAgICAgICAgaWYgKG9yZGVyLnVuaXQucmVnaW9uLnR5cGUgIT0gVW5pdFR5cGUuV2F0ZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsICdPbmx5IHdhdGVyIHVuaXRzIGNhbiBjb252b3knKTtcblxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IG9yZGVycy5maW5kKG8gPT4gby50eXBlID09ICdtb3ZlJ1xuICAgICAgICAgICAgICAgICYmIG8udW5pdC50eXBlID09IFVuaXRUeXBlLkxhbmRcbiAgICAgICAgICAgICAgICAmJiBSZWdpb24uYXJlU2FtZShvLnVuaXQucmVnaW9uLCBvcmRlci5zdGFydClcbiAgICAgICAgICAgICAgICAmJiBSZWdpb24uYXJlU2FtZShvLnRhcmdldCwgb3JkZXIuZW5kKSk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsICdObyBtYXRjaGluZyB0YXJnZXQnKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZShhdHRhY2spKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYERpc2xvZGdlZCBieSAnJHthdHRhY2t9J2ApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFzcyhvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3JkZXIudHlwZSA9PSAnc3VwcG9ydCcpIHtcbiAgICAgICAgICAgIGxldCBzdXBwb3J0ZWUgPSBvcmRlcnMuZmluZChvID0+IFJlZ2lvbi5hcmVTYW1lKG8udW5pdC5yZWdpb24sIG9yZGVyLnRhcmdldCkpO1xuICAgICAgICAgICAgaWYgKHN1cHBvcnRlZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCAnTm8gbWF0Y2hpbmcgdGFyZ2V0Jyk7XG5cbiAgICAgICAgICAgIGlmIChvcmRlci5hdHRhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydGVlLnR5cGUgIT0gJ21vdmUnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYFN1cHBvcnQgYXR0YWNrZWQgJHtvcmRlci5hdHRhY2submFtZX0gdGFyZ2V0IHdhcyAke3N1cHBvcnRlZX1gKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlYWNoKG9yZGVyLnVuaXQsIG9yZGVyLmF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3VwcG9ydCBhdHRhY2tlZCAke29yZGVyLmF0dGFjay5uYW1lfSBidXQgY291bGQgbm90IHJlYWNoYCk7XG4gICAgICAgICAgICAgICAgaWYgKCFSZWdpb24uYXJlRXF1YWwoc3VwcG9ydGVlLnRhcmdldCwgb3JkZXIuYXR0YWNrKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBTdXBwb3J0IGF0dGFja2VkICR7b3JkZXIuYXR0YWNrLm5hbWV9IGJ1dCB0YXJnZXQgYXR0YWNrZWQgJHtzdXBwb3J0ZWUudGFyZ2V0fWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydGVlLnR5cGUgPT0gJ21vdmUnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFpbChvcmRlciwgYFN1cHBvcnQgaGVsZCBidXQgdGFyZ2V0IHdhcyAke3N1cHBvcnRlZX1gKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlYWNoKG9yZGVyLnVuaXQsIG9yZGVyLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgU3VwcG9ydCBoZWxkICR7b3JkZXIudGFyZ2V0Lm5hbWV9IGJ1dCBjb3VsZCBub3QgcmVhY2hgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgYXR0YWNrIG9mIG9yZGVycykge1xuICAgICAgICAgICAgICAgIGlmIChhdHRhY2sudHlwZSAhPSAnbW92ZScgfHwgIVJlZ2lvbi5hcmVTYW1lKGF0dGFjay50YXJnZXQsIG9yZGVyLnVuaXQucmVnaW9uKSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICBpZiAob3JkZXIudW5pdC50ZWFtID09IGF0dGFjay51bml0LnRlYW0pXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRlZS50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoUmVnaW9uLmFyZVNhbWUoc3VwcG9ydGVlLnRhcmdldCwgYXR0YWNrLnVuaXQucmVnaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXQgaXMgZnJvbSB0aGUgdGFyZ2V0IHJlZ2lvbiBvZiB0aGUgc3VwcG9ydGVkIGF0dGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0IGNhbiBvbmx5IGN1dCBzdXBwb3J0IGJ5IGRpc2xvZGdpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlKGF0dGFjaykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhaWwob3JkZXIsIGBEaXNsb2RnZWQgYnkgJyR7YXR0YWNrfSdgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGl0IGlzIGNvbnZveWVkIGJ5IHRoZSB0YXJnZXQgcmVnaW9uIG9mIHRoZSBzdXBwb3J0ZWQgYXR0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIG9ubHkgY3V0IHN1cHBvcnQgaWYgaXQgaGFzIGFuIGFsdGVybmF0ZSBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcm91dGVzID0gZmluZFJvdXRlcyhhdHRhY2ssIHN1cHBvcnRlZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlcyAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzcnVwdGVkIGJ5ICcke2F0dGFja30nYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9yIGlmIHRoZSBzdXBwb3J0IGRvZXNuJ3QgYnJlYWsgdGhlIGNvbnZveVxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzdW1lZC5hZGQob3JkZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc3VtZWQuZGVsZXRlKG9yZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzbG9kZ2VkIGJ5ICcke2F0dGFja30nYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3N1bWVkLmRlbGV0ZShvcmRlcilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByb3V0ZXMgPSBmaW5kUm91dGVzKGF0dGFjayk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZXMgIT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWlsKG9yZGVyLCBgRGlzcnVwdGVkIGJ5ICcke2F0dGFja30nYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFzcyhvcmRlcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnJvcihgSW52YWxpZCBvcmRlcmApO1xuICAgIH1cblxuICAgIGxldCBldmljdGVkOiBVbml0W10gPSBbXTtcbiAgICBsZXQgcmVzb2x2ZWQ6IE1vdmVPcmRlcltdID0gW107XG5cbiAgICBmb3IgKGxldCBvcmRlciBvZiBvcmRlcnMpIHtcbiAgICAgICAgbGV0IHZhbGlkID0gcmVzb2x2ZShvcmRlcik7XG5cbiAgICAgICAgaWYgKG9yZGVyLnR5cGUgPT0gJ21vdmUnICYmIHZhbGlkKSB7XG4gICAgICAgICAgICByZXNvbHZlZC5wdXNoKG9yZGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IGF0dGFjayBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrLnR5cGUgIT0gJ21vdmUnIHx8ICFSZWdpb24uYXJlU2FtZShhdHRhY2sudGFyZ2V0LCBvcmRlci51bml0LnJlZ2lvbikpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlc29sdmUoYXR0YWNrKSkge1xuICAgICAgICAgICAgICAgICAgICBldmljdGVkLnB1c2gob3JkZXIudW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVhc29ucy5oYXMob3JkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JkZXIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGF0dGFjaywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyByZXNvbHZlZCwgZXZpY3RlZCwgcmVhc29ucyB9O1xufVxuXG5mdW5jdGlvbiBlcnJvcihtc2c6IHN0cmluZykge1xuICAgIGRlYnVnZ2VyO1xuICAgIHJldHVybiBuZXcgRXJyb3IobXNnKTtcbn1cbiIsImltcG9ydCB7IE1vdmVPcmRlciwgSG9sZE9yZGVyLCBTdXBwb3J0T3JkZXIsIENvbnZveU9yZGVyLCBVbml0LCBVbml0VHlwZSB9IGZyb20gXCIuL2dhbWVcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGhlYWRlcihvYmo6IGFueSwgY29uZmlnOiBhbnkpIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE1vdmVPcmRlciB8fCBvYmogaW5zdGFuY2VvZiBIb2xkT3JkZXIgfHwgb2JqIGluc3RhbmNlb2YgU3VwcG9ydE9yZGVyIHx8IG9iaiBpbnN0YW5jZW9mIENvbnZveU9yZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gW1wic3BhblwiLCB7fSwgb2JqLnRvU3RyaW5nKCldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFVuaXQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXCJzcGFuXCIsIHt9LCBgJHtvYmoudGVhbX0gJHtvYmoudHlwZSA9PSBVbml0VHlwZS5XYXRlciA/ICdmbGVldCcgOiAnYXJteSd9IGluICR7b2JqLnJlZ2lvbi5uYW1lfWBdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBoYXNCb2R5KG9iajogYW55LCBjb25maWc6IGFueSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBib2R5KG9iajogYW55LCBjb25maWc6IGFueSkge1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBSZWdpb24sIEdhbWVNYXAsIFVuaXRUeXBlIH0gZnJvbSAnLi4vZ2FtZSc7XG5cbmNvbnN0IExBTkQgPSBVbml0VHlwZS5MYW5kO1xuY29uc3QgV0FURVIgPSBVbml0VHlwZS5XYXRlcjtcblxuZnVuY3Rpb24gbihpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGU6IFVuaXRUeXBlKTogUmVnaW9uIHtcbiAgICByZXR1cm4gbmV3IFJlZ2lvbihpZCwgbmFtZSwgdHlwZSk7XG59XG5cbi8vIGF1c3RyaWFcbmxldCBCT0ggPSBuKCdCT0gnLCAnQm9oZW1pYScsIExBTkQpO1xubGV0IEJVRCA9IG4oJ0JVRCcsICdCdWRhcGVzdCcsIExBTkQpO1xubGV0IEdBTCA9IG4oJ0dBTCcsICdHYWxpY2lhJywgTEFORCk7XG5sZXQgVFJJID0gbignVFJJJywgJ1RyaWVzdGUnLCBMQU5EKTtcbmxldCBUWVIgPSBuKCdUWVInLCAnVHlyb2xpYScsIExBTkQpO1xubGV0IFZJRSA9IG4oJ1ZJRScsICdWaWVubmEnLCBMQU5EKTtcblxuLy8gZW5nbGFuZFxubGV0IENMWSA9IG4oJ0NMWScsICdDbHlkZScsIExBTkQpO1xubGV0IEVESSA9IG4oJ0VESScsICdFZGluYnVyZ2gnLCBMQU5EKTtcbmxldCBMVlAgPSBuKCdMVlAnLCAnTGl2ZXJwb29sJywgTEFORCk7XG5sZXQgTE9OID0gbignTE9OJywgJ0xvbmRvbicsIExBTkQpO1xubGV0IFdBTCA9IG4oJ1dBTCcsICdXYWxlcycsIExBTkQpO1xubGV0IFlPUiA9IG4oJ1lPUicsICdZb3Jrc2hpcmUnLCBMQU5EKTtcblxuLy8gZnJhbmNlXG5sZXQgQlJFID0gbignQlJFJywgJ0JyZXN0JywgTEFORCk7XG5sZXQgQlVSID0gbignQlVSJywgJ0J1cmd1bmR5JywgTEFORCk7XG5sZXQgR0FTID0gbignR0FTJywgJ0dhc2NvbnknLCBMQU5EKTtcbmxldCBNQVIgPSBuKCdNQVInLCAnTWFyc2VpbGxlcycsIExBTkQpO1xubGV0IFBBUiA9IG4oJ1BBUicsICdQYXJpcycsIExBTkQpO1xubGV0IFBJQyA9IG4oJ1BJQycsICdQaWNhcmR5JywgTEFORCk7XG5cbi8vIGdlcm1hbnlcbmxldCBCRVIgPSBuKCdCRVInLCAnQmVybGluJywgTEFORCk7XG5sZXQgS0lFID0gbignS0lFJywgJ0tpZWwnLCBMQU5EKTtcbmxldCBNVU4gPSBuKCdNVU4nLCAnTXVuaWNoJywgTEFORCk7XG5sZXQgUFJVID0gbignUFJVJywgJ1BydXNzaWEnLCBMQU5EKTtcbmxldCBSVUggPSBuKCdSVUgnLCAnUnVocicsIExBTkQpO1xubGV0IFNJTCA9IG4oJ1NJTCcsICdTaWxlc2lhJywgTEFORCk7XG5cbi8vIGl0YWx5XG5sZXQgQVBVID0gbignQVBVJywgJ0FwdWxpYScsIExBTkQpO1xubGV0IE5BUCA9IG4oJ05BUCcsICdOYXBsZXMnLCBMQU5EKTtcbmxldCBQSUUgPSBuKCdQSUUnLCAnUGllZG1vbnQnLCBMQU5EKTtcbmxldCBST00gPSBuKCdST00nLCAnUm9tZScsIExBTkQpO1xubGV0IFRVUyA9IG4oJ1RVUycsICdUdXNjYW55JywgTEFORCk7XG5sZXQgVkVOID0gbignVkVOJywgJ1ZlbmljZScsIExBTkQpO1xuXG4vLyBydXNzaWFcbmxldCBGSU4gPSBuKCdGSU4nLCAnRmlubGFuZCcsIExBTkQpO1xubGV0IExWTiA9IG4oJ0xWTicsICdMaXZvbmlhJywgTEFORCk7XG5sZXQgTU9TID0gbignTU9TJywgJ01vc2NvdycsIExBTkQpO1xubGV0IFNFViA9IG4oJ1NFVicsICdTZXZhc3RvcG9sJywgTEFORCk7XG5sZXQgU1RQID0gbignU1RQJywgJ1N0LiBQZXRlcnNidXJnJywgTEFORCk7XG5sZXQgVUtSID0gbignVUtSJywgJ1VrcmFpbmUnLCBMQU5EKTtcbmxldCBXQVIgPSBuKCdXQVInLCAnV2Fyc2F3JywgTEFORCk7XG5cbi8vIHR1cmtleVxubGV0IEFOSyA9IG4oJ0FOSycsICdBbmthcmEnLCBMQU5EKTtcbmxldCBBUk0gPSBuKCdBUk0nLCAnQXJtZW5pYScsIExBTkQpO1xubGV0IENPTiA9IG4oJ0NPTicsICdDb25zdGFudGlub3BsZScsIExBTkQpO1xubGV0IFNNWSA9IG4oJ1NNWScsICdTbXlybmEnLCBMQU5EKTtcbmxldCBTWVIgPSBuKCdTWVInLCAnU3lyaWEnLCBMQU5EKTtcblxuLy8gbmV1dHJhbFxubGV0IEFMQiA9IG4oJ0FMQicsICdBbGJhbmlhJywgTEFORCk7XG5sZXQgQkVMID0gbignQkVMJywgJ0JlbGdpdW0nLCBMQU5EKTtcbmxldCBCVUwgPSBuKCdCVUwnLCAnQnVsZ2FyaWEnLCBMQU5EKTtcbmxldCBERU4gPSBuKCdERU4nLCAnRGVubWFyaycsIExBTkQpO1xubGV0IEdSRSA9IG4oJ0dSRScsICdHcmVlY2UnLCBMQU5EKTtcbmxldCBIT0wgPSBuKCdIT0wnLCAnSG9sbGFuZCcsIExBTkQpO1xubGV0IE5XWSA9IG4oJ05XWScsICdOb3J3YXknLCBMQU5EKTtcbmxldCBOQUYgPSBuKCdOQUYnLCAnTm9ydGggQWZyaWNhJywgTEFORCk7XG5sZXQgUE9SID0gbignUE9SJywgJ1BvcnR1Z2FsJywgTEFORCk7XG5sZXQgUlVNID0gbignUlVNJywgJ1J1bWFuaWEnLCBMQU5EKTtcbmxldCBTRVIgPSBuKCdTRVInLCAnU2VyYmlhJywgTEFORCk7XG5sZXQgU1BBID0gbignU1BBJywgJ1NwYWluJywgTEFORCk7XG5sZXQgU1dFID0gbignU1dFJywgJ1N3ZWRlbicsIExBTkQpO1xubGV0IFRVTiA9IG4oJ1RVTicsICdUdW5pcycsIExBTkQpO1xuXG4vLyB3YXRlclxubGV0IEFEUiA9IG4oJ0FEUicsICdBZHJpYXRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQUVHID0gbignQUVHJywgJ0FlZ2VhbiBTZWEnLCBXQVRFUik7XG5sZXQgQkFMID0gbignQkFMJywgJ0JhbHRpYyBTZWEnLCBXQVRFUik7XG5sZXQgQkFSID0gbignQkFSJywgJ0JhcmVudHMgU2VhJywgV0FURVIpO1xubGV0IEJMQSA9IG4oJ0JMQScsICdCbGFjayBTZWEnLCBXQVRFUik7XG5sZXQgRUFTID0gbignRUFTJywgJ0Vhc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcbmxldCBFTkcgPSBuKCdFTkcnLCAnRW5nbGlzaCBDaGFubmVsJywgV0FURVIpO1xubGV0IEJPVCA9IG4oJ0JPVCcsICdHdWxmIG9mIEJvdGhuaWEnLCBXQVRFUik7XG5sZXQgR09MID0gbignR09MJywgJ0d1bGYgb2YgTHlvbicsIFdBVEVSKTtcbmxldCBIRUwgPSBuKCdIRUwnLCAnSGVsZ29sYW5kIEJpZ2h0JywgV0FURVIpO1xubGV0IElPTiA9IG4oJ0lPTicsICdJb25pYW4gU2VhJywgV0FURVIpO1xubGV0IElSSSA9IG4oJ0lSSScsICdJcmlzaCBTZWEnLCBXQVRFUik7XG5sZXQgTUlEID0gbignTUlEJywgJ01pZC1BdGxhbnRpYyBPY2VhbicsIFdBVEVSKTtcbmxldCBOQVQgPSBuKCdOQVQnLCAnTm9ydGggQXRsYW50aWMgT2NlYW4nLCBXQVRFUik7XG5sZXQgTlRIID0gbignTlRIJywgJ05vcnRoIFNlYScsIFdBVEVSKTtcbmxldCBOUkcgPSBuKCdOUkcnLCAnTm9yd2VnaWFuIFNlYScsIFdBVEVSKTtcbmxldCBTS0EgPSBuKCdTS0EnLCAnU2thZ2VycmFjaycsIFdBVEVSKTtcbmxldCBUWU4gPSBuKCdUWU4nLCAnVHlycmhlbmlhbiBTZWEnLCBXQVRFUik7XG5sZXQgV0VTID0gbignV0VTJywgJ1dlc3Rlcm4gTWVkaXRlcnJhbmVhbicsIFdBVEVSKTtcblxubGV0IFNUUF9OT1JUSCA9IG4oJ1NUUE4nLCAnU3QuIFBldGVyc2J1cmcgKE5vcnRoIENvYXN0KScsIExBTkQpO1xubGV0IFNUUF9TT1VUSCA9IG4oJ1NUUFMnLCAnU3QuIFBldGVyc2J1cmcgKFNvdXRoIENvYXN0KScsIExBTkQpO1xuXG5sZXQgU1BBX05PUlRIID0gbignU1BBTicsICdTcGFpbiAoTm9ydGggQ29hc3QpJywgTEFORCk7XG5sZXQgU1BBX1NPVVRIID0gbignU1BBUycsICdTcGFpbiAoU291dGggQ29hc3QpJywgTEFORCk7XG5cbmxldCBCVUxfTk9SVEggPSBuKCdCVUxFJywgJ0J1bGdhcmlhIChFYXN0IENvYXN0KScsIExBTkQpO1xubGV0IEJVTF9TT1VUSCA9IG4oJ0JVTFMnLCAnQnVsZ2FyaWEgKFNvdXRoIENvYXN0KScsIExBTkQpO1xuXG5mdW5jdGlvbiBib3JkZXIobm9kZTogUmVnaW9uLCBhZGphY2VudDogUmVnaW9uW10pIHtcbiAgICBmb3IgKGxldCBvdGhlciBvZiBhZGphY2VudClcbiAgICAgICAgbm9kZS5hZGphY2VudC5hZGQob3RoZXIpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2gobm9kZTogUmVnaW9uLCBhdHRhY2hlZDogUmVnaW9uW10pIHtcbiAgICBsZXQgYWxsID0gW25vZGUsIC4uLmF0dGFjaGVkXTtcbiAgICBmb3IgKGxldCByZWdpb24gb2YgYWxsKSB7XG4gICAgICAgIGZvciAobGV0IG90aGVyIG9mIGFsbCkge1xuICAgICAgICAgICAgaWYgKG90aGVyID09IHJlZ2lvbikgY29udGludWU7XG4gICAgICAgICAgICByZWdpb24uYXR0YWNoZWQuYWRkKG90aGVyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuYm9yZGVyKFNUUF9OT1JUSCwgW0JBUiwgTldZXSk7XG5hdHRhY2goU1RQLCBbU1RQX1NPVVRILCBTVFBfTk9SVEhdKTtcbmJvcmRlcihTVFBfU09VVEgsIFtCT1QsIExWTiwgRklOXSk7XG5cbmJvcmRlcihCVUxfTk9SVEgsIFtCTEEsIENPTiwgUlVNXSk7XG5hdHRhY2goQlVMLCBbQlVMX1NPVVRILCBCVUxfTk9SVEhdKTtcbmJvcmRlcihCVUxfU09VVEgsIFtBRUcsIEdSRSwgQ09OXSk7XG5cbmJvcmRlcihTUEFfTk9SVEgsIFtNSUQsIFBPUiwgR0FTXSk7XG5hdHRhY2goU1BBLCBbU1BBX1NPVVRILCBTUEFfTk9SVEhdKTtcbmJvcmRlcihTUEFfU09VVEgsIFtHT0wsIFdFUywgTUlELCBQT1IsIE1BUl0pO1xuXG5ib3JkZXIoTkFULCBbTlJHLCBDTFksIExWUCwgSVJJLCBNSURdKTtcbmJvcmRlcihOUkcsIFtCQVIsIE5XWSwgTlRILCBFREksIENMWSwgTkFUXSk7XG5ib3JkZXIoQ0xZLCBbTlJHLCBFREksIExWUCwgTkFUXSk7XG5ib3JkZXIoTFZQLCBbQ0xZLCBFREksIFlPUiwgV0FMLCBJUkksIE5BVF0pO1xuYm9yZGVyKElSSSwgW05BVCwgTFZQLCBXQUwsIEVORywgTUlEXSk7XG5ib3JkZXIoTUlELCBbTkFULCBJUkksIEVORywgQlJFLCBHQVMsIFBPUiwgV0VTLCBOQUYsIFNQQV9OT1JUSCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoQkFSLCBbTlJHLCBOV1ksIFNUUF9OT1JUSF0pO1xuYm9yZGVyKE5XWSwgW05SRywgQkFSLCBTVFAsIEZJTiwgU1dFLCBTS0EsIE5USCwgU1RQX05PUlRIXSk7XG5ib3JkZXIoTlRILCBbTlJHLCBOV1ksIFNLQSwgREVOLCBIRUwsIEhPTCwgQkVMLCBFTkcsIExPTiwgWU9SLCBFREldKTtcbmJvcmRlcihFREksIFtOUkcsIE5USCwgWU9SLCBMVlAsIENMWV0pO1xuYm9yZGVyKFlPUiwgW0VESSwgTlRILCBMT04sIFdBTCwgTFZQXSk7XG5ib3JkZXIoV0FMLCBbTFZQLCBZT1IsIExPTiwgRU5HLCBJUkldKTtcbmJvcmRlcihFTkcsIFtJUkksIFdBTCwgTE9OLCBOVEgsIEJFTCwgUElDLCBCUkUsIE1JRF0pO1xuYm9yZGVyKEJSRSwgW0VORywgUElDLCBQQVIsIEdBUywgTUlEXSk7XG5ib3JkZXIoR0FTLCBbQlJFLCBQQVIsIEJVUiwgTUFSLCBTUEEsIE1JRF0pO1xuYm9yZGVyKFNQQSwgW0dBUywgTUFSLCBQT1JdKTtcbmJvcmRlcihQT1IsIFtNSUQsIFNQQSwgU1BBX05PUlRILCBTUEFfU09VVEhdKTtcbmJvcmRlcihXRVMsIFtHT0wsIFRZTiwgVFVOLCBOQUYsIE1JRCwgU1BBX1NPVVRIXSk7XG5ib3JkZXIoTkFGLCBbTUlELCBXRVMsIFRVTl0pO1xuYm9yZGVyKFNUUCwgW05XWSwgTU9TLCBMVk4sIEZJTl0pO1xuYm9yZGVyKFNXRSwgW05XWSwgRklOLCBCT1QsIEJBTCwgREVOLCBTS0FdKTtcbmJvcmRlcihGSU4sIFtOV1ksIFNUUCwgQk9ULCBTV0UsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKFNLQSwgW05XWSwgU1dFLCBERU4sIE5USF0pO1xuYm9yZGVyKERFTiwgW1NLQSwgU1dFLCBCQUwsIEtJRSwgSEVMLCBOVEhdKTtcbmJvcmRlcihIRUwsIFtOVEgsIERFTiwgS0lFLCBIT0xdKTtcbmJvcmRlcihIT0wsIFtOVEgsIEhFTCwgS0lFLCBSVUgsIEJFTF0pO1xuYm9yZGVyKEJFTCwgW0VORywgTlRILCBIT0wsIFJVSCwgQlVSLCBQSUNdKTtcbmJvcmRlcihMT04sIFtZT1IsIE5USCwgRU5HLCBXQUxdKTtcbmJvcmRlcihQSUMsIFtFTkcsIEJFTCwgQlVSLCBQQVIsIEJSRV0pO1xuYm9yZGVyKFBBUiwgW1BJQywgQlVSLCBHQVMsIEJSRV0pO1xuYm9yZGVyKEdBUywgW0JSRSwgUEFSLCBCVVIsIE1BUiwgU1BBLCBNSUQsIFNQQV9OT1JUSF0pO1xuYm9yZGVyKEJVUiwgW1BBUiwgUElDLCBCRUwsIFJVSCwgTVVOLCBNQVIsIEdBU10pO1xuYm9yZGVyKE1BUiwgW0dBUywgQlVSLCBQSUUsIEdPTCwgU1BBLCBTUEFfU09VVEhdKTtcbmJvcmRlcihHT0wsIFtNQVIsIFBJRSwgVFVTLCBUWU4sIFdFUywgU1BBX1NPVVRIXSk7XG5ib3JkZXIoVFlOLCBbVFVTLCBST00sIE5BUCwgSU9OLCBUVU4sIFdFUywgR09MXSk7XG5ib3JkZXIoVFVOLCBbV0VTLCBUWU4sIElPTiwgTkFGXSk7XG5ib3JkZXIoTU9TLCBbU1RQLCBTRVYsIFVLUiwgV0FSLCBMVk5dKTtcbmJvcmRlcihMVk4sIFtCT1QsIFNUUCwgTU9TLCBXQVIsIFBSVSwgQkFMLCBTVFBfU09VVEhdKTtcbmJvcmRlcihCT1QsIFtTV0UsIEZJTiwgTFZOLCBCQUwsIFNUUF9TT1VUSF0pO1xuYm9yZGVyKEJBTCwgW0RFTiwgU1dFLCBCT1QsIExWTiwgUFJVLCBCRVIsIEtJRV0pO1xuYm9yZGVyKEtJRSwgW0hFTCwgREVOLCBCQUwsIEJFUiwgTVVOLCBSVUgsIEhPTF0pO1xuYm9yZGVyKFJVSCwgW0JFTCwgSE9MLCBLSUUsIE1VTiwgQlVSXSk7XG5ib3JkZXIoUElFLCBbVFlSLCBWRU4sIFRVUywgR09MLCBNQVJdKTtcbmJvcmRlcihUVVMsIFtQSUUsIFZFTiwgUk9NLCBUWU4sIEdPTF0pO1xuYm9yZGVyKFJPTSwgW1RVUywgVkVOLCBBUFUsIE5BUCwgVFlOXSk7XG5ib3JkZXIoTkFQLCBbUk9NLCBBUFUsIElPTiwgVFlOXSk7XG5ib3JkZXIoSU9OLCBbVFlOLCBOQVAsIEFQVSwgQURSLCBBTEIsIEdSRSwgQUVHLCBFQVMsIFRVTl0pO1xuYm9yZGVyKFNFViwgW1VLUiwgTU9TLCBBUk0sIEJMQSwgUlVNXSk7XG5ib3JkZXIoVUtSLCBbTU9TLCBTRVYsIFJVTSwgR0FMLCBXQVJdKTtcbmJvcmRlcihXQVIsIFtQUlUsIExWTiwgTU9TLCBVS1IsIEdBTCwgU0lMXSk7XG5ib3JkZXIoUFJVLCBbQkFMLCBMVk4sIFdBUiwgU0lMLCBCRVJdKTtcbmJvcmRlcihCRVIsIFtCQUwsIFBSVSwgU0lMLCBNVU4sIEtJRV0pO1xuYm9yZGVyKE1VTiwgW1JVSCwgS0lFLCBCRVIsIFNJTCwgQk9ILCBUWVIsIEJVUl0pO1xuYm9yZGVyKFRZUiwgW01VTiwgQk9ILCBWSUUsIFRSSSwgVkVOLCBQSUVdKTtcbmJvcmRlcihWRU4sIFtUWVIsIFRSSSwgQURSLCBBUFUsIFJPTSwgVFVTLCBQSUVdKTtcbmJvcmRlcihBUFUsIFtWRU4sIEFEUiwgSU9OLCBOQVAsIFJPTV0pO1xuYm9yZGVyKEFEUiwgW1ZFTiwgVFJJLCBBTEIsIElPTiwgQVBVXSk7XG5ib3JkZXIoQUxCLCBbVFJJLCBTRVIsIEdSRSwgSU9OLCBBRFJdKTtcbmJvcmRlcihHUkUsIFtBTEIsIFNFUiwgQlVMLCBBRUcsIElPTiwgQlVMX1NPVVRIXSk7XG5ib3JkZXIoQUVHLCBbR1JFLCBDT04sIFNNWSwgRUFTLCBJT04sIEJVTF9TT1VUSF0pO1xuYm9yZGVyKEVBUywgW0FFRywgU01ZLCBTWVIsIElPTl0pO1xuYm9yZGVyKEFSTSwgW1NFViwgU1lSLCBTTVksIEFOSywgQkxBXSk7XG5ib3JkZXIoQkxBLCBbUlVNLCBTRVYsIEFSTSwgQU5LLCBDT04sIEJVTF9OT1JUSF0pO1xuYm9yZGVyKFJVTSwgW0JVRCwgR0FMLCBVS1IsIFNFViwgQkxBLCBCVUwsIFNFUiwgQlVMX05PUlRIXSk7XG5ib3JkZXIoR0FMLCBbQk9ILCBTSUwsIFdBUiwgVUtSLCBSVU0sIEJVRCwgVklFXSk7XG5ib3JkZXIoU0lMLCBbQkVSLCBQUlUsIFdBUiwgR0FMLCBCT0gsIE1VTl0pO1xuYm9yZGVyKEJPSCwgW01VTiwgU0lMLCBHQUwsIFZJRSwgVFlSXSk7XG5ib3JkZXIoVklFLCBbQk9ILCBHQUwsIEJVRCwgVFJJLCBUWVJdKTtcbmJvcmRlcihUUkksIFtUWVIsIFZJRSwgQlVELCBTRVIsIEFMQiwgQURSLCBWRU5dKTtcbmJvcmRlcihTRVIsIFtCVUQsIFJVTSwgQlVMLCBHUkUsIEFMQiwgVFJJXSk7XG5ib3JkZXIoQlVMLCBbUlVNLCBDT04sIEdSRSwgU0VSXSk7XG5ib3JkZXIoQ09OLCBbQlVMLCBCTEEsIEFOSywgU01ZLCBBRUcsIEJVTF9TT1VUSCwgQlVMX05PUlRIXSk7XG5ib3JkZXIoU01ZLCBbQ09OLCBBTkssIEFSTSwgU1lSLCBFQVMsIEFFR10pO1xuYm9yZGVyKFNZUiwgW1NNWSwgQVJNLCBFQVNdKTtcbmJvcmRlcihCVUQsIFtWSUUsIEdBTCwgUlVNLCBTRVIsIFRSSV0pO1xuYm9yZGVyKEFOSywgW0JMQSwgQVJNLCBTTVksIENPTl0pO1xuXG5leHBvcnQgY29uc3QgbWFwID0gbmV3IEdhbWVNYXAoW0JPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEhdKTtcblxuZXhwb3J0IGNvbnN0IGFsbFJlZ2lvbnMgPSB7IEJPSCwgQlVELCBHQUwsIFRSSSwgVFlSLCBWSUUsIENMWSwgRURJLCBMVlAsIExPTiwgV0FMLCBZT1IsIEJSRSwgQlVSLCBHQVMsIE1BUiwgUEFSLCBQSUMsIEJFUiwgS0lFLCBNVU4sIFBSVSwgUlVILCBTSUwsIEFQVSwgTkFQLCBQSUUsIFJPTSwgVFVTLCBWRU4sIEZJTiwgTFZOLCBNT1MsIFNFViwgU1RQLCBVS1IsIFdBUiwgQU5LLCBBUk0sIENPTiwgU01ZLCBTWVIsIEFMQiwgQkVMLCBCVUwsIERFTiwgR1JFLCBIT0wsIE5XWSwgTkFGLCBQT1IsIFJVTSwgU0VSLCBTUEEsIFNXRSwgVFVOLCBBRFIsIEFFRywgQkFMLCBCQVIsIEJMQSwgRUFTLCBFTkcsIEJPVCwgR09MLCBIRUwsIElPTiwgSVJJLCBNSUQsIE5BVCwgTlRILCBOUkcsIFNLQSwgVFlOLCBXRVMsIFNUUF9OT1JUSCwgU1RQX1NPVVRILCBTUEFfTk9SVEgsIFNQQV9TT1VUSCwgQlVMX05PUlRILCBCVUxfU09VVEggfTtcbiIsImV4cG9ydCAqIGZyb20gJy4vZ2FtZSc7XG5leHBvcnQgKiBmcm9tICcuL3J1bGVzJztcblxuaW1wb3J0IGZvcm1hdHRlciBmcm9tICcuL2Zvcm1hdHRlcic7XG5cbmV4cG9ydCB7IGZvcm1hdHRlciB9O1xuXG5pbXBvcnQgKiBhcyBzdGFuZGFyZCBmcm9tICcuL21hcHMvc3RhbmRhcmQnO1xuXG5leHBvcnQgY29uc3QgbWFwcyA9IHtcbiAgICBzdGFuZGFyZDoge1xuICAgICAgICBtYXA6IHN0YW5kYXJkLm1hcCxcbiAgICAgICAgcmVnaW9uczogc3RhbmRhcmQuYWxsUmVnaW9ucyxcbiAgICB9LFxufTtcbiJdLCJuYW1lcyI6WyJVbml0VHlwZSIsInN0YW5kYXJkLm1hcCIsInN0YW5kYXJkLmFsbFJlZ2lvbnMiXSwibWFwcGluZ3MiOiI7Ozs7TUFBYSxNQUFNO0lBSWYsWUFDYSxFQUFVLEVBQ1YsSUFBWSxFQUNaLElBQWM7UUFGZCxPQUFFLEdBQUYsRUFBRSxDQUFRO1FBQ1YsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVU7UUFObEIsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDN0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7S0FNakM7SUFFTCxJQUFJLFdBQVc7UUFDWCxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUlBLGdCQUFRLENBQUMsSUFBSTtlQUMxQixDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSUEsZ0JBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7S0FDekU7SUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUNuQyxPQUFPLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDOUM7SUFF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QyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUd0QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBR3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUduQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25DLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUdsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFHbEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDMUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxZQUFZLEVB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QUssSUFBSSxNQUFNO2dCQUFFLFNBQVM7WUFDOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUI7S0FDSjtDQUNKO0FBRUQsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbkMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRTdDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0IsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDdkQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNsRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQzdELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbEMsQUFBTyxNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUUxZCxBQUFPLE1BQU0sVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQzs7TUNoTnpjLElBQUksR0FBRztJQUNoQixRQUFRLEVBQUU7UUFDTixHQUFHLEVBQUVDLEdBQVk7UUFDakIsT0FBTyxFQUFFQyxVQUFtQjtLQUMvQjtDQUNKOzs7Ozs7Ozs7Ozs7OzsifQ==
