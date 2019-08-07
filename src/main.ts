import fs from 'fs-extra';
import request from 'request-promise-native';

import { europe, REGIONS } from './data';
import { Unit, Region, GameState, UnitType } from './game';
import { AnyOrder, MoveOrder, HoldOrder, SupportOrder, ConvoyOrder, resolve } from './rules';
import * as scrape from './scrape';

function* matches(regex: RegExp, target: string) {
    let copy = new RegExp(regex, 'g');
    let match;
    while (match = copy.exec(target))
        yield match;
}

const session_key = `343evhj23vv05beiiv8dldlno4`;
const ignored_games = new Set([159594, 158093]);

function error(msg: string) {
    debugger;
    return new Error(msg);
}

async function playdiplomacy(path: string) {
    let url = `https://www.playdiplomacy.com${path}`;
    try {
        let response = await request(url, {
            headers: { 'cookie': `PHPSESSID=${session_key}` },
            resolveWithFullResponse: true,
            followRedirect: false,
        });

        if (response.statusCode != 200) throw error('invalid status code');
        return response.body;
    } catch (e) {
        debugger;
        throw e;
    }
}

async function fetch_games(page: number) {
    let url = `/games.php?subpage=all_finished&variant-0=1&map_variant-0=1&current_page=${page}`;
    let data = await playdiplomacy(url);

    let ids = new Set<number>();
    for (let match of matches(/<a href="game_play_details\.php\?game_id=(\d+)/, data)) {
        let gameId = parseInt(match[1]);
        ids.add(gameId);
    }

    return [...ids];
}

async function game_history(query: string) {
    let cache = `cache/${query}`;

    let data;
    try {
        data = fs.readFileSync(cache, 'utf8');
    } catch (e) {
        data = await playdiplomacy(`/game_history.php?${query}`);
        await fs.writeFile(cache, data, 'utf8');
    }

    return data;
}

async function get_history(id: number, phase: string, date: number) {
    let query = `game_id=${id}&phase=${phase}&gdate=${date}`;
    return await game_history(query);
}

async function get_orders(game: GameState, id: number, date: number) {
    let data = await get_history(id, 'O', date);

    let rawOrders: { unit: Unit, type: string, args: string, result: string }[] = [];
    let fleets = new Set([REGIONS.LON, REGIONS.EDI, REGIONS.BRE, REGIONS.NAP, REGIONS.KIE, REGIONS.TRI, REGIONS.ANK, REGIONS.SEV, REGIONS.STP_SOUTH]);

    let isNew = game.units.size == 0;

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            let match = /(.*?)(HOLD|MOVE|SUPPORT|CONVOY)(.*)->(.*)/.exec(part[1]);
            if (match == null) throw error(`failed to match order: ${part[1]}`);

            let regionName = match[1].trim();
            let type = match[2];
            let args = match[3].trim();
            let result = match[4].trim();

            if (result == 'Invalid order or syntax error')
                continue;

            let region = europe.regions.find(r => r.name == regionName);
            if (region == null) throw error(`failed to find region for order: ${part[1]} `);

            let unit = [...game.units].find(u => u.region == region && u.team == team);
            if (unit == null) {
                if (isNew) game.units.add(unit = new Unit(region, fleets.has(region) ? UnitType.Water : UnitType.Land, team));
                else throw error(`Unit does not exist: ${team} ${region.name} `);
            }

            rawOrders.push({ unit, type, args, result });
        }
    }

    let orders: AnyOrder[] = [];
    let resolved: MoveOrder[] = [];

    for (let raw of rawOrders) {
        let order;

        if (raw.type == 'HOLD') {
            order = new HoldOrder(raw.unit);
        } else if (raw.type == 'MOVE') {
            let args = raw.args.split('VIA');

            let rawTarget = args[0].trim();
            let target = europe.regions.find(r => r.name == rawTarget);
            if (target == null) throw error(`failed to find target region for move order: ${raw.args} `);

            order = new MoveOrder(raw.unit, target, args.length > 1);
            if (raw.result == 'resolved') {
                resolved.push(order)
            }
        } else if (raw.type == 'SUPPORT') {
            let [rawSrc, rawDst] = raw.args.split(' to '); // 'X to hold' or 'X to Y'

            let src = europe.regions.find(r => r.name == rawSrc);
            if (src == null) throw error(`failed to find target region for support order: ${rawSrc} `);

            if (rawDst == 'hold')
                order = new SupportOrder(raw.unit, src);
            else {
                let dst = europe.regions.find(r => r.name == rawDst);
                if (dst == null) throw error(`failed to find attack region for support order: ${rawDst} `);

                order = new SupportOrder(raw.unit, src, dst);
            }
        } else if (raw.type == 'CONVOY') {
            let [rawSrc, rawDst] = raw.args.split(' to '); // 'X to Y'

            let src = europe.regions.find(r => r.name == rawSrc);
            if (src == null) throw error(`failed to find start region for convoy order: ${rawSrc} `);

            let dst = europe.regions.find(r => r.name == rawDst);
            if (dst == null) throw error(`failed to find end region for convoy order: ${rawDst} `);

            order = new ConvoyOrder(raw.unit, src, dst);
        } else {
            throw error(`invalid order type: ${raw.type}`)
        }

        orders.push(order);
    }

    return { orders, resolved };
}

async function get_retreats(evicted: Unit[], id: number, date: number) {
    let data = await get_history(id, 'R', date);

    let retreats: { unit: Unit, target: Region | null, resolved: boolean }[] = [];

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            let match = /((.*)RETREAT(.*)|(.*)DESTROY)\s+->(.*)/.exec(part[1]);
            if (match == null) throw error(`failed to match retreat: ${part[1]} `);

            let result = match[5].trim();
            if (match[2]) {
                let rawSrc = match[2].trim();
                let rawDst = match[3].trim();

                let src = europe.regions.find(r => r.name == rawSrc);
                if (src == null) throw error(`failed to find region for retreat: ${part[1]}`);

                let dst = europe.regions.find(r => r.name == rawDst);
                if (dst == null) throw error(`failed to find region for retreat: ${part[1]}`);

                let unit = evicted.find(u => u.region == src && u.team == team);
                if (unit == null) throw error(`failed to find unit for retreat: ${part[1]} ${team}`);

                retreats.push({ unit, target: dst, resolved: result == 'resolved' });
            } else {
                let rawRegion = match[4].trim();

                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null) throw error(`failed to find region for retreat: ${part[1]}`);

                let unit = [...evicted].find(u => u.region == region && u.team == team);
                if (unit == null) throw error(`failed to find unit for retreat: ${part[1]} ${team}`);

                retreats.push({ unit, target: null, resolved: result == 'resolved' });
            }
        }
    }

    return retreats;
}

async function get_builds(game: GameState, id: number, date: number) {
    let data = await get_history(id, 'B', date);

    let builds: { unit: Unit, resolved: boolean }[] = [];

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            let match = /(BUILD\s+(fleet|army)\s+(.*)|(.*)DESTROY)\s+->(.*)/.exec(part[1]);
            if (match == null) throw error(`failed to match build: ${part[1]}`);

            let result = match[5].trim();

            if (match[2]) {
                let type = match[2].trim();
                let rawRegion = match[3].trim();

                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null) throw error(`failed to find region for build: ${part[1]}`);

                let unit = new Unit(region, type == 'fleet' ? UnitType.Water : UnitType.Land, team);

                builds.push({ unit, resolved: result == 'resolved' });
            } else {
                let rawRegion = match[4].trim();

                let region = europe.regions.find(r => r.name == rawRegion);
                if (region == null) throw error(`failed to find region for build: ${part[1]}`);

                let unit = [...game.units].find(u => u.region == region && u.team == team);
                if (unit == null) {
                    if (result != 'resolved') continue;
                    else throw error(`failed to find unit for build: ${part[1]} ${team}`);
                }

                builds.push({ unit, resolved: result == 'resolved' });
            }
        }
    }

    return builds;
}

async function get_turn(game: GameState, id: number, date: number) {
    let { orders, resolved } = await get_orders(game, id, date);

    for (let unit of game.units) {
        let order = orders.find(o => o.unit == unit);
        if (order) continue;
        orders.push(new HoldOrder(unit))
    }

    let results = resolve(orders);

    for (let move of results.resolved) {
        if (!game.units.has(move.unit)) debugger;
        game.units.delete(move.unit);
        game.units.add(new Unit(move.target, move.unit.type, move.unit.team));
    }

    for (let order of orders) {
        if (order.type == 'move') {
            if (resolved.includes(order) != results.resolved.includes(order)) {
                debugger;
                resolve(orders);
                console.error(order);
            }
        }
    }

    if (results.evicted.length) {
        let evicted = new Set(results.evicted);
        let retreats = await get_retreats(results.evicted, id, date);
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

    if (date % 2 == 1) {
        let builds = await get_builds(game, id, date);

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
        if (units.length > 1) debugger;
    }
}

async function run_game(id: number) {
    let turns = 0;
    let history = await game_history(`game_id=${id}`);
    for (let match of matches(/<a href='game_history\.php\?game_id=(\d+)&phase=O&gdate=(\d+)/, history)) {
        turns = Math.max(turns, parseInt(match[2]));
    }

    console.log(`running game ${id} for ${turns} turns`);
    let game = new GameState(europe, []);
    for (let i = 0; i < turns; ++i) {
        await get_turn(game, id, i);
        console.debug(`processed ${i % 2 ? 'fall' : 'spring'} ${1901 + Math.floor(i / 2)} `);
    }
}

async function run() {
    // for (let path of await fs.readdir('cache')) {
    //     let match = /^game_id=(\d+)$/.exec(path);
    //     if (match == null) continue;

    //     let id = parseInt(match[1]);
    //     await run_game(id);
    // }

    let failed = [];

    for (let i = 1; i <= 1000; ++i) {
        console.log(`page ${i}: `)
        let page = await fetch_games(i);
        for (let id of page) {
            if (ignored_games.has(id))
                continue;

            try {
                await run_game(id);
            } catch (e) {
                failed.push({ id, error: e });
                console.error(`error for game ${id}:`, e);
            }
        }
    }

    console.log(...failed.map(a => a.id));
    console.log(...failed);
}

// run_game(158438);
// run();
scrape.run();

let x = global;

if (x.devtoolsFormatters == null) x.devtoolsFormatters = [];
x.devtoolsFormatters.push({
    header(obj, config) {
        if (obj instanceof MoveOrder) {
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} move -> ${obj.target.name} `];
        }

        if (obj instanceof HoldOrder) {
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} hold`];
        }

        if (obj instanceof SupportOrder) {
            if (obj.attack)
                return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} support ${obj.target.name} -> ${obj.attack.name} `];
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} support ${obj.target.name} hold`];
        }

        if (obj instanceof ConvoyOrder) {
            return ["span", {}, `${obj.unit.team} ${obj.unit.region.name} convoy ${obj.start.name} -> ${obj.end.name} `];
        }

        if (obj instanceof Unit) {
            return ["span", {}, `${obj.team} ${obj.type == UnitType.Water ? 'fleet' : 'army'} in ${obj.region.name} `];
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
