import fs from 'fs-extra';
import request from 'request-promise-native';

import { europe, REGIONS } from './data';
import { Unit, Region, GameState, UnitType } from './game';
import { AnyOrder, MoveOrder, HoldOrder, SupportOrder, ConvoyOrder, resolve } from './rules';
import * as scrape from './scrape';
import { error } from './util';

function* matches(regex: RegExp, target: string) {
    let copy = new RegExp(regex, 'g');
    let match;
    while (match = copy.exec(target))
        yield match;
}

const ignored_games = new Set([159594, 158093, 151387, 147485, 152046, 151325, 153104, 153152, 153323, 153349, 154242, 154944, 155422, 155463]);
const teams = new Set(['ENGLAND', 'FRANCE', 'GERMANY', 'ITALY', 'AUSTRIA', 'RUSSIA', 'TURKEY']);

const totals = { checked: 0, skipped_via: 0, skipped_team: 0 };

function run_game(id: number, turns: scrape.Turn[]) {
    let game = new GameState(europe, []);

    for (let i = 0; i < turns.length; ++i) {
        console.debug(`processing ${i % 2 ? 'fall' : 'spring'} ${1901 + Math.floor(i / 2)}`);

        let remote = scrape.parse_orders(game, turns[i].orders);
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
            if (order) continue;
            orders.push(new HoldOrder(unit))
        }

        let local = resolve(orders);

        for (let move of local.resolved) {
            if (!game.units.has(move.unit)) debugger;
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
            let retreats = scrape.parse_retreats(local.evicted, turns[i].retreats!);
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
            let builds = scrape.parse_builds(game, turns[i].builds!);

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
            if (units.length > 1) throw error(`Mismatch in game ${id}`);
        }
    }

    ++totals.checked;
}

async function run() {
    fs.mkdirpSync('data');
    fs.mkdirpSync('cache');

    // let game = scrape.read_game(fs.readFileSync(`data/155270`));
    // run_game(155270, game);

    let allIds = fs.readdirSync('data');

    for (let id of allIds) {
        if (id == 'known.json') continue;
        if (ignored_games.has(parseInt(id))) continue;

        console.log(`processing game ${id}`);

        let game = scrape.read_game(fs.readFileSync(`data/${id}`));
        run_game(parseInt(id), game);
    }

    console.log(totals);
}

let x = global;

if (x.devtoolsFormatters == null) x.devtoolsFormatters = [];
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
    scrape.run();
else if (op == 'check')
    scrape.check();
else if (op == 'run')
    run();
else {
    console.log('unknown or missing command')
}
