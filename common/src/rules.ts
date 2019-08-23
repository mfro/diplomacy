import { Unit, Region, UnitType, AnyOrder, MoveOrder, ConvoyOrder, SupportOrder, HoldOrder } from './game';

export function resolve(orders: AnyOrder[]) {
    function canMove(unit: Unit, dst: Region) {
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
        } else {
            if (!unit.region.allAdjacent.includes(dst))
                return false;
            if (dst.type != UnitType.Land)
                return false;
        }

        return true;
    }

    function canReach(unit: Unit, dst: Region) {
        if (canMove(unit, dst))
            return true;

        let shore = [...dst.attached].find(a => unit.region.adjacent.has(a));
        return shore != null;
    }

    function isValid(order: AnyOrder) {
        if (order.type == 'move') {
            if (Region.areSame(order.unit.region, order.target))
                return false;

            if (order.unit.type == UnitType.Water && !canMove(order.unit, order.target))
                return false;
        }

        return true;
    }

    function findRoutes(order: MoveOrder, skip?: Region) {
        let convoys = orders.filter(o => o.type == 'convoy'
            && o.unit.region != skip
            && Region.areSame(o.start, order.unit.region)
            && resolve(o)) as ConvoyOrder[];

        let used = convoys.map(() => false);
        let node = order.unit;

        let path: ConvoyOrder[] = [];
        let paths: ConvoyOrder[][] = [];

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

    function findHoldSupport(order: AnyOrder) {
        if (order.type == 'move')
            return [];

        return orders.filter(o => o.type == 'support'
            && Region.areEqual(o.target, order.unit.region)
            && resolve(o)) as SupportOrder[];
    }

    function findMoveSupport(order: MoveOrder) {
        return orders.filter(o => o.type == 'support'
            && Region.areEqual(o.target, order.unit.region)
            && resolve(o)) as SupportOrder[];
    }

    for (let i = 0; i < orders.length; ++i) {
        if (isValid(orders[i]))
            continue;

        let dump = orders[i];
        orders.splice(i, 1, new HoldOrder(dump.unit));
    }

    let assumed = new Set<AnyOrder>();

    let passed = new Set<AnyOrder>();
    let checked = new Set<AnyOrder>();
    let reasons = new Map<AnyOrder, string>();

    let stack: AnyOrder[] = [];

    function fail(order: AnyOrder, reason: string): false {
        stack.pop();
        if (assumed.size == 0)
            reasons.set(order, reason);
        return false;
    }

    function pass(order: AnyOrder): true {
        stack.pop();
        if (assumed.size == 0)
            passed.add(order);
        return true;
    }

    function resolve(order: AnyOrder, force = false): boolean {
        if (stack[0] == order && stack.every(o => o.type == 'move') && stack.length > 2) {
            return true;
        } else if (stack.includes(order)) {
            if (stack.indexOf(order) != stack.lastIndexOf(order))
                throw error('recursive resolve');
        } else if (!force && assumed.size == 0) {
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

            let best: MoveOrder[] = [];
            let strength = 0;

            let bestDislodge: MoveOrder[] = [];
            let dislodgeStrength = 0;

            let forceResolved: MoveOrder | null = null;

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
                    let enemies = support.filter(o => o.unit.team != current!.unit.team);
                    let currentRoutes = findRoutes(current);

                    // to fail to swap places, both must have no routes via convoy
                    if (currentRoutes == null) {
                        if (enemies.length == 0) {
                            if (attack == order)
                                return fail(order, `Overpowered by '${current}' with support '' vs '${enemies.join("', '")}'`);

                            continue;
                        }
                    } else if (currentRoutes.paths.filter(o => o.length > 0).length == 0 && routes.paths.filter(o => o.length > 0).length == 0) {
                        let currentAttack = findMoveSupport(current).filter(o => o.unit.team != attack.unit.team);
                        if (currentAttack.length > enemies.length) {
                            if (attack == order)
                                return fail(order, `Overpowered by '${current}' with support '${currentAttack.join("', '")}' vs '${enemies.join("', '")}'`);

                            continue;
                        }
                    } else {
                        forceResolved = attack;
                    }
                }

                if (support.length > strength) {
                    best = [attack];
                    strength = support.length;
                } else if (support.length == strength) {
                    best.push(attack);
                }

                if (current && attack.unit.team != current.unit.team) {
                    let enemies = support.filter(o => o.unit.team != current!.unit.team);
                    if (enemies.length > dislodgeStrength) {
                        bestDislodge = [attack];
                        dislodgeStrength = enemies.length;
                    } else if (enemies.length == dislodgeStrength) {
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
                        return fail(order, `Balanced faceoff '${currentAttack.join("', '")}' vs '${findMoveSupport(order).filter(o => o.unit.team != current!.unit.team).join("', '")}'`);

                    if (currentAttack.length > dislodgeStrength)
                        throw error('Failed to filter out dislodged attack');
                } else if (current.type != 'move' || !resolve(current)) {
                    if (bestDislodge.length != 1 || best[0] != bestDislodge[0])
                        return fail(order, `Avoiding self-dislodgement`);

                    if (dislodgeStrength == 0)
                        return fail(order, `Held with ?? vs nothing`);

                    let holdSupport = findHoldSupport(current);
                    if (holdSupport.length >= dislodgeStrength)
                        return fail(order, `Held with '${holdSupport.join(', ')}' vs '${findMoveSupport(order).filter(o => o.unit.team != current!.unit.team).join("', '")}'`);
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
            } else {
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
                    } else {
                        // if it is convoyed by the target region of the supported attack,
                        // it can only cut support if it has an alternate path
                        let routes = findRoutes(attack, supportee.target);
                        if (routes != null)
                            return fail(order, `Disrupted by '${attack}'`);

                        // or if the support doesn't break the convoy
                        assumed.add(order);
                        if (resolve(attack)) {
                            assumed.delete(order)
                            return fail(order, `Dislodged by '${attack}'`);
                        }
                        assumed.delete(order)
                    }
                } else {
                    let routes = findRoutes(attack);
                    if (routes != null)
                        return fail(order, `Disrupted by '${attack}'`);
                }
            }

            return pass(order);
        }

        throw error(`Invalid order`);
    }

    let evicted: Unit[] = [];
    let resolved: MoveOrder[] = [];

    for (let order of orders) {
        let valid = resolve(order);

        if (order.type == 'move' && valid) {
            resolved.push(order);
        } else {
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

function error(msg: string) {
    debugger;
    return new Error(msg);
}
