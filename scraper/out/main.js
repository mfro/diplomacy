'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs-extra'));
var diplomacyCommon = require('diplomacy-common');
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

const session_key = `j25t6nh2t4nkt6u0haq2p301b3`;
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
    let fleets = new Set([diplomacyCommon.maps.standard.regions.LON, diplomacyCommon.maps.standard.regions.EDI, diplomacyCommon.maps.standard.regions.BRE, diplomacyCommon.maps.standard.regions.NAP, diplomacyCommon.maps.standard.regions.KIE, diplomacyCommon.maps.standard.regions.TRI, diplomacyCommon.maps.standard.regions.ANK, diplomacyCommon.maps.standard.regions.SEV, diplomacyCommon.maps.standard.regions.STP_SOUTH]);
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
                    game.units.add(unit = new diplomacyCommon.Unit(region, fleets.has(region) ? diplomacyCommon.UnitType.Water : diplomacyCommon.UnitType.Land, team));
                else
                    throw error(`Unit does not exist: ${team} ${region.name} `);
            }
            let order;
            if (op == 'HOLD' || result == 'Illegal order replaced with Hold order') {
                order = new diplomacyCommon.HoldOrder(unit);
            }
            else if (op == 'MOVE') {
                let moveArgs = args.split('VIA');
                let rawTarget = moveArgs[0].trim();
                let target = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawTarget);
                if (target == null)
                    throw error(`failed to find target region for move order: ${args} `);
                order = new diplomacyCommon.MoveOrder(unit, target, moveArgs.length > 1);
                if (result == 'resolved') {
                    resolved.push(order);
                }
            }
            else if (op == 'SUPPORT') {
                let [rawSrc, rawDst] = args.split(' to '); // 'X to hold' or 'X to Y'
                let src = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find target region for support order: ${rawSrc} `);
                if (rawDst == 'hold')
                    order = new diplomacyCommon.SupportOrder(unit, src);
                else {
                    let dst = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawDst);
                    if (dst == null)
                        throw error(`failed to find attack region for support order: ${rawDst} `);
                    order = new diplomacyCommon.SupportOrder(unit, src, dst);
                }
            }
            else if (op == 'CONVOY') {
                let [rawSrc, rawDst] = args.split(' to '); // 'X to Y'
                let src = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find start region for convoy order: ${rawSrc} `);
                let dst = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawDst);
                if (dst == null)
                    throw error(`failed to find end region for convoy order: ${rawDst} `);
                order = new diplomacyCommon.ConvoyOrder(unit, src, dst);
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
                let src = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawSrc);
                if (src == null)
                    throw error(`failed to find region for retreat: ${raw}`);
                let dst = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawDst);
                if (dst == null)
                    throw error(`failed to find region for retreat: ${raw}`);
                let unit = evicted.find(u => u.region == src && u.team == team);
                if (unit == null)
                    throw error(`failed to find unit for retreat: ${raw} ${team}`);
                retreats.push({ unit, target: dst, resolved: result == 'resolved' });
            }
            else {
                let rawRegion = match[4].trim();
                let region = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawRegion);
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
                let region = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawRegion);
                if (region == null)
                    throw error(`failed to find region for build: ${raw}`);
                let unit = new diplomacyCommon.Unit(region, type == 'fleet' ? diplomacyCommon.UnitType.Water : diplomacyCommon.UnitType.Land, team);
                builds.push({ unit, resolved: result == 'resolved' });
            }
            else {
                let rawRegion = match[4].trim();
                let region = diplomacyCommon.maps.standard.map.regions.find(r => r.name == rawRegion);
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

const ignored_games = new Set([
    150551,
    152046,
    153104,
    153323,
    153349,
    154242,
    154944,
    155422,
    141931,
    143505,
    144582,
    139460,
    139815,
    141277,
    142580,
    144825,
    145645,
    147521,
    149280,
    149871,
    149890,
]);
const teams = new Set(['ENGLAND', 'FRANCE', 'GERMANY', 'ITALY', 'AUSTRIA', 'RUSSIA', 'TURKEY']);
const totals = { checked: 0, skipped_via: 0, skipped_team: 0 };
function run_game(id, turns) {
    let game = new diplomacyCommon.GameState(diplomacyCommon.maps.standard.map, []);
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
            orders.push(new diplomacyCommon.HoldOrder(unit));
        }
        let local = diplomacyCommon.resolve(orders);
        for (let move of local.resolved) {
            if (!game.units.has(move.unit))
                debugger;
            game.units.delete(move.unit);
            game.units.add(new diplomacyCommon.Unit(move.target, move.unit.type, move.unit.team));
        }
        for (let order of orders) {
            if (order.type == 'move') {
                if (local.resolved.includes(order) != remote.resolved.includes(order)) {
                    for (let pair of local.reasons) {
                        console.log(`${pair[0]}: ${pair[1]}`);
                    }
                    console.log(order);
                    debugger;
                    diplomacyCommon.resolve(orders);
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
        // run_game(150168, scrape.read_game(fs.readFileSync('data/150168')));
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
x.devtoolsFormatters.push(diplomacyCommon.formatter);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWwudHMiLCIuLi9zcmMvc2NyYXBlLnRzIiwiLi4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGVycm9yKG1zZzogc3RyaW5nKSB7XG4gICAgZGVidWdnZXI7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihtc2cpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24qIG1hdGNoZXMocmVnZXg6IFJlZ0V4cCwgdGFyZ2V0OiBzdHJpbmcpIHtcbiAgICBsZXQgY29weSA9IG5ldyBSZWdFeHAocmVnZXgsICdnJyk7XG4gICAgbGV0IG1hdGNoO1xuICAgIHdoaWxlIChtYXRjaCA9IGNvcHkuZXhlYyh0YXJnZXQpKVxuICAgICAgICB5aWVsZCBtYXRjaDtcbn1cbiIsImltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdC1wcm9taXNlLW5hdGl2ZSc7XG5cbmltcG9ydCB7IGVycm9yLCBtYXRjaGVzIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IEdhbWVTdGF0ZSwgbWFwcywgSG9sZE9yZGVyLCBVbml0LCBNb3ZlT3JkZXIsIFN1cHBvcnRPcmRlciwgQ29udm95T3JkZXIsIFVuaXRUeXBlIH0gZnJvbSAnZGlwbG9tYWN5LWNvbW1vbic7XG5cbmV4cG9ydCB0eXBlIElucHV0cyA9IHsgW3RlYW06IHN0cmluZ106IHN0cmluZ1tdIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHVybiB7XG4gICAgb3JkZXJzOiBJbnB1dHMsXG4gICAgcmV0cmVhdHM/OiBJbnB1dHMsXG4gICAgYnVpbGRzPzogSW5wdXRzLFxufVxuXG5jb25zdCBzZXNzaW9uX2tleSA9IGBqMjV0Nm5oMnQ0bmt0NnUwaGFxMnAzMDFiM2A7XG5cbmFzeW5jIGZ1bmN0aW9uIHBsYXlkaXBsb21hY3kocGF0aDogc3RyaW5nKSB7XG4gICAgbGV0IHVybCA9IGBodHRwczovL3d3dy5wbGF5ZGlwbG9tYWN5LmNvbSR7cGF0aH1gO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QodXJsLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdjb29raWUnOiBgUEhQU0VTU0lEPSR7c2Vzc2lvbl9rZXl9YCB9LFxuICAgICAgICAgICAgcmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUsXG4gICAgICAgICAgICBmb2xsb3dSZWRpcmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9IDIwMCkgdGhyb3cgZXJyb3IoJ2ludmFsaWQgc3RhdHVzIGNvZGUnKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdhbWVfaGlzdG9yeShxdWVyeTogc3RyaW5nKSB7XG4gICAgbGV0IGNhY2hlID0gYGNhY2hlLyR7cXVlcnl9YDtcblxuICAgIGxldCBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoY2FjaGUsICd1dGY4Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhID0gYXdhaXQgcGxheWRpcGxvbWFjeShgL2dhbWVfaGlzdG9yeS5waHA/JHtxdWVyeX1gKTtcbiAgICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGNhY2hlLCBkYXRhLCAndXRmOCcpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRfaGlzdG9yeShpZDogbnVtYmVyLCBwaGFzZTogc3RyaW5nLCBkYXRlOiBudW1iZXIpIHtcbiAgICBsZXQgcXVlcnkgPSBgZ2FtZV9pZD0ke2lkfSZwaGFzZT0ke3BoYXNlfSZnZGF0ZT0ke2RhdGV9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IGdhbWVfaGlzdG9yeShxdWVyeSk7XG5cbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICBsZXQgaW5wdXRzOiBJbnB1dHMgPSB7fTtcblxuICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPihcXHcrKTxcXC9iPjx1bD4oLio/KTxcXC91bD4vLCBkYXRhKSkge1xuICAgICAgICBsZXQgdGVhbSA9IG1hdGNoWzFdO1xuICAgICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IHBhcnQgb2YgbWF0Y2hlcygvPGxpPiguKj8pPFxcL2xpPi8sIG1hdGNoWzJdKSkge1xuICAgICAgICAgICAgbGlzdC5wdXNoKHBhcnRbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKSBjb250aW51ZTtcblxuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1t0ZWFtXSA9IGxpc3Q7XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKVxuICAgICAgICByZXR1cm4gaW5wdXRzO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldF9nYW1lKGlkOiBudW1iZXIpIHtcbiAgICBsZXQgdHVybnMgPSBbXTtcbiAgICBsZXQgaGlzdG9yeSA9IGF3YWl0IGdhbWVfaGlzdG9yeShgZ2FtZV9pZD0ke2lkfWApO1xuXG4gICAgZm9yIChsZXQgY29udGVudCBvZiBoaXN0b3J5LnNwbGl0KCc8L2JyPjwvYnI+JykpIHtcbiAgICAgICAgbGV0IGRhdGUgPSB0dXJucy5sZW5ndGg7XG4gICAgICAgIGxldCB0dXJuOiBUdXJuID0geyBvcmRlcnM6IHt9IH07XG5cbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IG1hdGNoIG9mIG1hdGNoZXMoLzxiPjxhIGhyZWY9J2dhbWVfaGlzdG9yeVxcLnBocFxcP2dhbWVfaWQ9KFxcZCspJnBoYXNlPShcXHcpJmdkYXRlPShcXGQrKSc+W148XSs8XFwvYT48XFwvYj4mbmJzcDsmbmJzcDsvLCBjb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKGlkICE9IHBhcnNlSW50KG1hdGNoWzFdKSkgdGhyb3cgZXJyb3IoYEZhaWxlZCB0byBwYXJzZSBnYW1lIGhpc3Rvcnk6ICR7aWR9YCk7XG4gICAgICAgICAgICBpZiAoZGF0ZSAhPSBwYXJzZUludChtYXRjaFszXSkpIHRocm93IGVycm9yKGBGYWlsZWQgdG8gcGFyc2UgZ2FtZSBoaXN0b3J5OiAke2lkfWApO1xuXG4gICAgICAgICAgICBsZXQgcGhhc2UgPSBtYXRjaFsyXTtcbiAgICAgICAgICAgIGxldCBpbnB1dHMgPSBhd2FpdCBnZXRfaGlzdG9yeShpZCwgcGhhc2UsIGRhdGUpO1xuICAgICAgICAgICAgaWYgKGlucHV0cyA9PSBudWxsICYmIHBoYXNlICE9ICdPJykgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdPJzogdHVybi5vcmRlcnMgPSBpbnB1dHMgfHwge307IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1InOiB0dXJuLnJldHJlYXRzID0gaW5wdXRzOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdCJzogdHVybi5idWlsZHMgPSBpbnB1dHM7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFmb3VuZCkgY29udGludWU7XG5cbiAgICAgICAgdHVybnMucHVzaCh0dXJuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHVybnM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRfcGFnZShwYWdlOiBudW1iZXIpIHtcbiAgICBsZXQgdXJsID0gYC9nYW1lcy5waHA/c3VicGFnZT1hbGxfZmluaXNoZWQmdmFyaWFudC0wPTEmbWFwX3ZhcmlhbnQtMD0xJmN1cnJlbnRfcGFnZT0ke3BhZ2V9YDtcbiAgICBsZXQgZGF0YSA9IGF3YWl0IHBsYXlkaXBsb21hY3kodXJsKTtcblxuICAgIGxldCBpZHMgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgICBmb3IgKGxldCBtYXRjaCBvZiBtYXRjaGVzKC88YSBocmVmPVwiZ2FtZV9wbGF5X2RldGFpbHNcXC5waHBcXD9nYW1lX2lkPShcXGQrKS8sIGRhdGEpKSB7XG4gICAgICAgIGxldCBnYW1lSWQgPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgIGlkcy5hZGQoZ2FtZUlkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gWy4uLmlkc107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkX2dhbWUocmF3OiBCdWZmZXIpIHtcbiAgICBsZXQgZGF0YSA9IHpsaWIuZ3VuemlwU3luYyhyYXcpO1xuICAgIGxldCBnYW1lID0gSlNPTi5wYXJzZShkYXRhLnRvU3RyaW5nKCd1dGY4JykpIGFzIFR1cm5bXTtcblxuICAgIGZvciAobGV0IHR1cm4gb2YgZ2FtZSkge1xuICAgICAgICBpZiAodHVybi5idWlsZHMgJiYgT2JqZWN0LmtleXModHVybi5idWlsZHMpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBkZWxldGUgdHVybi5idWlsZHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR1cm4ucmV0cmVhdHMgJiYgT2JqZWN0LmtleXModHVybi5yZXRyZWF0cykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0dXJuLnJldHJlYXRzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh0dXJuLm9yZGVycykubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIC8vIHNvbWV0aW1lcyBnYW1lcyBoYXZlIGFuIGVtcHR5IGxhc3QgdHVybiB3aXRoIG5vIG9yZGVyc1xuICAgICAgICAgICAgaWYgKHR1cm4uYnVpbGRzIHx8IHR1cm4ucmV0cmVhdHNcbiAgICAgICAgICAgICAgICB8fCBnYW1lLmluZGV4T2YodHVybikgKyAxICE9IGdhbWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yKGBtaXNzaW5nIG9yZGVyczogJHtnYW1lLmluZGV4T2YodHVybil9YCk7XG4gICAgICAgICAgICBnYW1lLnBvcCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2FtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlX2dhbWUodHVybnM6IFR1cm5bXSkge1xuICAgIGxldCBkYXRhID0gQnVmZmVyLmZyb20oSlNPTi5zdHJpbmdpZnkodHVybnMpLCAndXRmOCcpO1xuICAgIHJldHVybiB6bGliLmd6aXBTeW5jKGRhdGEpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgIGZzLm1rZGlycFN5bmMoJ2RhdGEnKTtcbiAgICBmcy5ta2RpcnBTeW5jKCdjYWNoZScpO1xuXG4gICAgbGV0IGVycm9ycyA9IDA7XG4gICAgbGV0IG9sZEtub3duO1xuICAgIGxldCBuZXdLbm93biA9IHsgbmV3ZXN0OiAwLCBjb3VudDogMCB9O1xuICAgIHRyeSB7XG4gICAgICAgIG9sZEtub3duID0gZnMucmVhZEpTT05TeW5jKCdkYXRhL2tub3duLmpzb24nKSBhcyB0eXBlb2YgbmV3S25vd247XG4gICAgICAgIGNvbnNvbGUubG9nKGBrbm93bjogJHtvbGRLbm93bi5uZXdlc3R9ICske29sZEtub3duLmNvdW50fWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgb2xkS25vd24gPSBudWxsO1xuICAgIH1cblxuICAgIGxldCBza2lwID0gMFxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDEwMDAgJiYgZXJyb3JzIDwgMTA7ICsraSkge1xuICAgICAgICBpZiAoc2tpcCA+PSAxNSkge1xuICAgICAgICAgICAgc2tpcCAtPSAxNTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYGZldGNoaW5nIHBhZ2UgJHtpfWApXG4gICAgICAgIGxldCBpZHMgPSBhd2FpdCBnZXRfcGFnZShpKTtcblxuICAgICAgICBmb3IgKGxldCBpZCBvZiBpZHMpIHtcbiAgICAgICAgICAgIGlmIChuZXdLbm93bi5uZXdlc3QgPT0gMClcbiAgICAgICAgICAgICAgICBuZXdLbm93bi5uZXdlc3QgPSBpZDtcblxuICAgICAgICAgICAgaWYgKG9sZEtub3duICYmIGlkID09IG9sZEtub3duLm5ld2VzdCkge1xuICAgICAgICAgICAgICAgIHNraXAgPSBvbGRLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICBuZXdLbm93bi5jb3VudCArPSBvbGRLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICBvbGRLbm93biA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChza2lwID49IDEpIHtcbiAgICAgICAgICAgICAgICBza2lwIC09IDE7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHNraXBwaW5nIGdhbWUgJHtpZH1gKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZmV0Y2hpbmcgZ2FtZSAke2lkfWApXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBvdXRwdXRGaWxlID0gYGRhdGEvJHtpZH1gO1xuICAgICAgICAgICAgICAgIGlmICghZnMucGF0aEV4aXN0c1N5bmMob3V0cHV0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWUgPSBhd2FpdCBnZXRfZ2FtZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gd3JpdGVfZ2FtZShnYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnNlZCA9IHJlYWRfZ2FtZShkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkocGFyc2VkKSAhPSBKU09OLnN0cmluZ2lmeShnYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yKCdnYW1lIGVuY29kaW5nIGZhaWxlZCcpXG5cbiAgICAgICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRGaWxlLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKytuZXdLbm93bi5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgKytlcnJvcnM7XG4gICAgICAgICAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoJ2Vycm9ycy50eHQnLCBgJHtpZH0gJHtlfWAsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpZCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2xkS25vd24gPT0gbnVsbCkge1xuICAgICAgICAgICAgZnMud3JpdGVKU09OU3luYygnZGF0YS9rbm93bi5qc29uJywgbmV3S25vd24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGtub3duOiAke25ld0tub3duLm5ld2VzdH0gKyR7bmV3S25vd24uY291bnR9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVjaygpIHtcbiAgICBmcy5ta2RpcnBTeW5jKCdkYXRhJyk7XG4gICAgZnMubWtkaXJwU3luYygnY2FjaGUnKTtcblxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IGFsbElkcyA9IGZzLnJlYWRkaXJTeW5jKCdkYXRhJyk7XG5cbiAgICBmb3IgKGxldCBpZCBvZiBhbGxJZHMpIHtcbiAgICAgICAgaWYgKGlkID09ICdrbm93bi5qc29uJykgY29udGludWU7XG5cbiAgICAgICAgbGV0IGdhbWUgPSByZWFkX2dhbWUoZnMucmVhZEZpbGVTeW5jKGBkYXRhLyR7aWR9YCkpO1xuXG4gICAgICAgIGxldCB0dXJucyA9IDA7XG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgZ2FtZV9oaXN0b3J5KGBnYW1lX2lkPSR7aWR9YCk7XG5cbiAgICAgICAgZm9yIChsZXQgY29udGVudCBvZiBoaXN0b3J5LnNwbGl0KCc8L2JyPjwvYnI+JykpIHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgXyBvZiBtYXRjaGVzKC88Yj48YSBocmVmPSdnYW1lX2hpc3RvcnlcXC5waHBcXD9nYW1lX2lkPShcXGQrKSZwaGFzZT0oXFx3KSZnZGF0ZT0oXFxkKyknPltePF0rPFxcL2E+PFxcL2I+Jm5ic3A7Jm5ic3A7LywgY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZm91bmQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgKyt0dXJucztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0dXJucyAhPSBnYW1lLmxlbmd0aCkge1xuICAgICAgICAgICAgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKHBhcnNlSW50KGlkKSk7XG4gICAgICAgICAgICBpZiAodHVybnMgIT0gZ2FtZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgTWlzbWF0Y2g6ICR7aWR9ICR7dHVybnN9ICR7Z2FtZS5sZW5ndGh9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnVpbGRzID0gMDtcbiAgICAgICAgbGV0IHJldHJlYXRzID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnYW1lLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoZ2FtZVtpXS5idWlsZHMpIGJ1aWxkcysrO1xuICAgICAgICAgICAgaWYgKGdhbWVbaV0ucmV0cmVhdHMpIHJldHJlYXRzKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnVpbGRzID09IDAgJiYgcmV0cmVhdHMgPT0gMCkge1xuICAgICAgICAgICAgZ2FtZSA9IGF3YWl0IGdldF9nYW1lKHBhcnNlSW50KGlkKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHsoKytjb3VudCkudG9TdHJpbmcoKS5wYWRTdGFydChhbGxJZHMubGVuZ3RoLnRvU3RyaW5nKCkubGVuZ3RoKX0gLyAke2FsbElkcy5sZW5ndGh9ICR7aWR9ICR7dHVybnN9ICpgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAkeygrK2NvdW50KS50b1N0cmluZygpLnBhZFN0YXJ0KGFsbElkcy5sZW5ndGgudG9TdHJpbmcoKS5sZW5ndGgpfSAvICR7YWxsSWRzLmxlbmd0aH0gJHtpZH0gJHt0dXJuc31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRhID0gd3JpdGVfZ2FtZShnYW1lKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgZGF0YS8ke2lkfWAsIGRhdGEpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlX29yZGVycyhnYW1lOiBHYW1lU3RhdGUsIGlucHV0czogSW5wdXRzKSB7XG4gICAgbGV0IGlzTmV3ID0gZ2FtZS51bml0cy5zaXplID09IDA7XG4gICAgbGV0IGZsZWV0cyA9IG5ldyBTZXQoW21hcHMuc3RhbmRhcmQucmVnaW9ucy5MT04sIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5FREksIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5CUkUsIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5OQVAsIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5LSUUsIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5UUkksIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5BTkssIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5TRVYsIG1hcHMuc3RhbmRhcmQucmVnaW9ucy5TVFBfU09VVEhdKTtcblxuICAgIGxldCBvcmRlcnMgPSBbXTtcbiAgICBsZXQgcmVzb2x2ZWQgPSBbXTtcblxuICAgIGZvciAobGV0IHRlYW0gaW4gaW5wdXRzKSB7XG4gICAgICAgIGZvciAobGV0IHJhdyBvZiBpbnB1dHNbdGVhbV0pIHtcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IC8oLio/KShIT0xEfE1PVkV8U1VQUE9SVHxDT05WT1kpKC4qKS0+KC4qKS8uZXhlYyhyYXcpO1xuICAgICAgICAgICAgaWYgKG1hdGNoID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gbWF0Y2ggb3JkZXI6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICBsZXQgcmVnaW9uTmFtZSA9IG1hdGNoWzFdLnRyaW0oKTtcbiAgICAgICAgICAgIGxldCBvcCA9IG1hdGNoWzJdO1xuICAgICAgICAgICAgbGV0IGFyZ3MgPSBtYXRjaFszXS50cmltKCk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gbWF0Y2hbNF0udHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09ICdJbnZhbGlkIG9yZGVyIG9yIHN5bnRheCBlcnJvcicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGxldCByZWdpb24gPSBnYW1lLm1hcC5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmVnaW9uTmFtZSk7XG4gICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIG9yZGVyOiAke3Jhd30gYCk7XG5cbiAgICAgICAgICAgIGxldCB1bml0ID0gWy4uLmdhbWUudW5pdHNdLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24gJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgaWYgKHVuaXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChpc05ldykgZ2FtZS51bml0cy5hZGQodW5pdCA9IG5ldyBVbml0KHJlZ2lvbiwgZmxlZXRzLmhhcyhyZWdpb24pID8gVW5pdFR5cGUuV2F0ZXIgOiBVbml0VHlwZS5MYW5kLCB0ZWFtKSk7XG4gICAgICAgICAgICAgICAgZWxzZSB0aHJvdyBlcnJvcihgVW5pdCBkb2VzIG5vdCBleGlzdDogJHt0ZWFtfSAke3JlZ2lvbi5uYW1lfSBgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG9yZGVyO1xuXG4gICAgICAgICAgICBpZiAob3AgPT0gJ0hPTEQnIHx8IHJlc3VsdCA9PSAnSWxsZWdhbCBvcmRlciByZXBsYWNlZCB3aXRoIEhvbGQgb3JkZXInKSB7XG4gICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgSG9sZE9yZGVyKHVuaXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcCA9PSAnTU9WRScpIHtcbiAgICAgICAgICAgICAgICBsZXQgbW92ZUFyZ3MgPSBhcmdzLnNwbGl0KCdWSUEnKTtcblxuICAgICAgICAgICAgICAgIGxldCByYXdUYXJnZXQgPSBtb3ZlQXJnc1swXS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IG1hcHMuc3RhbmRhcmQubWFwLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdUYXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHRhcmdldCByZWdpb24gZm9yIG1vdmUgb3JkZXI6ICR7YXJnc30gYCk7XG5cbiAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBNb3ZlT3JkZXIodW5pdCwgdGFyZ2V0LCBtb3ZlQXJncy5sZW5ndGggPiAxKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09ICdyZXNvbHZlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWQucHVzaChvcmRlcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdTVVBQT1JUJykge1xuICAgICAgICAgICAgICAgIGxldCBbcmF3U3JjLCByYXdEc3RdID0gYXJncy5zcGxpdCgnIHRvICcpOyAvLyAnWCB0byBob2xkJyBvciAnWCB0byBZJ1xuXG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IG1hcHMuc3RhbmRhcmQubWFwLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdTcmMpO1xuICAgICAgICAgICAgICAgIGlmIChzcmMgPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHRhcmdldCByZWdpb24gZm9yIHN1cHBvcnQgb3JkZXI6ICR7cmF3U3JjfSBgKTtcblxuICAgICAgICAgICAgICAgIGlmIChyYXdEc3QgPT0gJ2hvbGQnKVxuICAgICAgICAgICAgICAgICAgICBvcmRlciA9IG5ldyBTdXBwb3J0T3JkZXIodW5pdCwgc3JjKTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRzdCA9IG1hcHMuc3RhbmRhcmQubWFwLnJlZ2lvbnMuZmluZChyID0+IHIubmFtZSA9PSByYXdEc3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCBhdHRhY2sgcmVnaW9uIGZvciBzdXBwb3J0IG9yZGVyOiAke3Jhd0RzdH0gYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgb3JkZXIgPSBuZXcgU3VwcG9ydE9yZGVyKHVuaXQsIHNyYywgZHN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdDT05WT1knKSB7XG4gICAgICAgICAgICAgICAgbGV0IFtyYXdTcmMsIHJhd0RzdF0gPSBhcmdzLnNwbGl0KCcgdG8gJyk7IC8vICdYIHRvIFknXG5cbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gbWFwcy5zdGFuZGFyZC5tYXAucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1NyYyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYyA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgc3RhcnQgcmVnaW9uIGZvciBjb252b3kgb3JkZXI6ICR7cmF3U3JjfSBgKTtcblxuICAgICAgICAgICAgICAgIGxldCBkc3QgPSBtYXBzLnN0YW5kYXJkLm1hcC5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3RHN0KTtcbiAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCBlbmQgcmVnaW9uIGZvciBjb252b3kgb3JkZXI6ICR7cmF3RHN0fSBgKTtcblxuICAgICAgICAgICAgICAgIG9yZGVyID0gbmV3IENvbnZveU9yZGVyKHVuaXQsIHNyYywgZHN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3IoYGludmFsaWQgb3JkZXI6ICR7b3B9YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3JkZXJzLnB1c2gob3JkZXIpO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBvcmRlcnMsIHJlc29sdmVkIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZV9yZXRyZWF0cyhldmljdGVkOiBVbml0W10sIGlucHV0czogSW5wdXRzKSB7XG4gICAgbGV0IHJldHJlYXRzID0gW107XG5cbiAgICBmb3IgKGxldCB0ZWFtIGluIGlucHV0cykge1xuICAgICAgICBmb3IgKGxldCByYXcgb2YgaW5wdXRzW3RlYW1dKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSAvKCguKilSRVRSRUFUKC4qKXwoLiopREVTVFJPWSlcXHMrLT4oLiopLy5leGVjKHJhdyk7XG4gICAgICAgICAgICBpZiAobWF0Y2ggPT0gbnVsbCkgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBtYXRjaCByZXRyZWF0OiAke3Jhd30gYCk7XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBtYXRjaFs1XS50cmltKCk7XG4gICAgICAgICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmF3U3JjID0gbWF0Y2hbMl0udHJpbSgpO1xuICAgICAgICAgICAgICAgIGxldCByYXdEc3QgPSBtYXRjaFszXS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgc3JjID0gbWFwcy5zdGFuZGFyZC5tYXAucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1NyYyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYyA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciByZXRyZWF0OiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCBkc3QgPSBtYXBzLnN0YW5kYXJkLm1hcC5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3RHN0KTtcbiAgICAgICAgICAgICAgICBpZiAoZHN0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIHJldHJlYXQ6ICR7cmF3fWApO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBldmljdGVkLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSBzcmMgJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB1bml0IGZvciByZXRyZWF0OiAke3Jhd30gJHt0ZWFtfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0cmVhdHMucHVzaCh7IHVuaXQsIHRhcmdldDogZHN0LCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByYXdSZWdpb24gPSBtYXRjaFs0XS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVnaW9uID0gbWFwcy5zdGFuZGFyZC5tYXAucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1JlZ2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciByZXRyZWF0OiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gWy4uLmV2aWN0ZWRdLmZpbmQodSA9PiB1LnJlZ2lvbiA9PSByZWdpb24gJiYgdS50ZWFtID09IHRlYW0pO1xuICAgICAgICAgICAgICAgIGlmICh1bml0ID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCB1bml0IGZvciByZXRyZWF0OiAke3Jhd30gJHt0ZWFtfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0cmVhdHMucHVzaCh7IHVuaXQsIHRhcmdldDogbnVsbCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHJlYXRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VfYnVpbGRzKGdhbWU6IEdhbWVTdGF0ZSwgaW5wdXRzOiBJbnB1dHMpIHtcbiAgICBsZXQgYnVpbGRzID0gW107XG5cbiAgICBmb3IgKGxldCB0ZWFtIGluIGlucHV0cykge1xuICAgICAgICBmb3IgKGxldCByYXcgb2YgaW5wdXRzW3RlYW1dKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSAvKEJVSUxEXFxzKyhmbGVldHxhcm15KVxccysoLiopfCguKilERVNUUk9ZKVxccystPiguKikvLmV4ZWMocmF3KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIG1hdGNoIGJ1aWxkOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IG1hdGNoWzVdLnRyaW0oKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSBtYXRjaFsyXS50cmltKCk7XG4gICAgICAgICAgICAgICAgbGV0IHJhd1JlZ2lvbiA9IG1hdGNoWzNdLnRyaW0oKTtcblxuICAgICAgICAgICAgICAgIGxldCByZWdpb24gPSBtYXBzLnN0YW5kYXJkLm1hcC5yZWdpb25zLmZpbmQociA9PiByLm5hbWUgPT0gcmF3UmVnaW9uKTtcbiAgICAgICAgICAgICAgICBpZiAocmVnaW9uID09IG51bGwpIHRocm93IGVycm9yKGBmYWlsZWQgdG8gZmluZCByZWdpb24gZm9yIGJ1aWxkOiAke3Jhd31gKTtcblxuICAgICAgICAgICAgICAgIGxldCB1bml0ID0gbmV3IFVuaXQocmVnaW9uLCB0eXBlID09ICdmbGVldCcgPyBVbml0VHlwZS5XYXRlciA6IFVuaXRUeXBlLkxhbmQsIHRlYW0pO1xuXG4gICAgICAgICAgICAgICAgYnVpbGRzLnB1c2goeyB1bml0LCByZXNvbHZlZDogcmVzdWx0ID09ICdyZXNvbHZlZCcgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCByYXdSZWdpb24gPSBtYXRjaFs0XS50cmltKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVnaW9uID0gbWFwcy5zdGFuZGFyZC5tYXAucmVnaW9ucy5maW5kKHIgPT4gci5uYW1lID09IHJhd1JlZ2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbiA9PSBudWxsKSB0aHJvdyBlcnJvcihgZmFpbGVkIHRvIGZpbmQgcmVnaW9uIGZvciBidWlsZDogJHtyYXd9YCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgdW5pdCA9IFsuLi5nYW1lLnVuaXRzXS5maW5kKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uICYmIHUudGVhbSA9PSB0ZWFtKTtcbiAgICAgICAgICAgICAgICBpZiAodW5pdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gJ3Jlc29sdmVkJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgdGhyb3cgZXJyb3IoYGZhaWxlZCB0byBmaW5kIHVuaXQgZm9yIGJ1aWxkOiAke3Jhd30gJHt0ZWFtfWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1aWxkcy5wdXNoKHsgdW5pdCwgcmVzb2x2ZWQ6IHJlc3VsdCA9PSAncmVzb2x2ZWQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkcztcbn1cbiIsImltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5cbmltcG9ydCB7IEdhbWVTdGF0ZSwgbWFwcywgSG9sZE9yZGVyLCByZXNvbHZlLCBVbml0LCBNb3ZlT3JkZXIsIFN1cHBvcnRPcmRlciwgQ29udm95T3JkZXIsIFVuaXRUeXBlLCBmb3JtYXR0ZXIgfSBmcm9tICdkaXBsb21hY3ktY29tbW9uJztcblxuaW1wb3J0ICogYXMgc2NyYXBlIGZyb20gJy4vc2NyYXBlJztcbmltcG9ydCB7IGVycm9yIH0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgaWdub3JlZF9nYW1lcyA9IG5ldyBTZXQoW1xuICAgIDE1MDU1MSwgLy8gRmFsbCAxOTA1IGluY29ycmVjdCBqdWRnZW1lbnRcbiAgICAxNTIwNDYsIC8vIEZhbGwgMTkwNCBpbnZhbGlkIGJ1aWxkL2Rlc3Ryb3kgaW5wdXRzXG4gICAgMTUzMTA0LCAvLyBTcHJpbmcgMTkwNSByZXRyZWF0IHRvIG9jY3VwaWVkIG11bmljaCAoUEFSU0lORyBFUlJPUiwgc2hvdWxkIGhhdmUgaWdub3JlZCBzcHJpbmcgMTkwNSByZXRyZWF0IGJlY2F1c2UgaXQgd2FzIG5vdCBjb25jbHVkZWQpXG4gICAgMTUzMzIzLCAvLyBGYWxsIDE5MDMgaW52YWxpZCBidWlsZC9kZXN0cm95IGlucHV0c1xuICAgIDE1MzM0OSwgLy8gRmFsbCAxOTA0IGludmFsaWQgYnVpbGQvZGVzdHJveSBpbnB1dHNcbiAgICAxNTQyNDIsIC8vIEZhbGwgMTkwNCBpbnZhbGlkIGJ1aWxkL2Rlc3Ryb3kgaW5wdXRzXG4gICAgMTU0OTQ0LCAvLyBGYWxsIDE5MDIgaW52YWxpZCBidWlsZC9kZXN0cm95IGlucHV0c1xuICAgIDE1NTQyMiwgLy8gU3ByaW5nIDE5MDMgZW5nbGlzaCBmbGVldCBpbiBpcmlzaCBzZWEgYmVjb21lcyBpdGFsaWFuXG4gICAgMTQxOTMxLCAvLyBTcHJpbmcgMTkwMSBpbnZhbGlkIG9yZGVyIGlucHV0c1xuICAgIDE0MzUwNSwgLy8gU3ByaW5nIDE5MDQgdHVya2lzaCBmbGVldCBpbiBhZWdlYW4gc2VhIGJlY29tZXMgYXVzdHJpYW5cbiAgICAxNDQ1ODIsIC8vIFNwcmluZyAxOTEzIGZyZW5jaCBmbGVldCBpbiBraWVsIGJlY29tZXMgcnVzc2lhblxuICAgIDEzOTQ2MCwgLy8gaWRla1xuICAgIDEzOTgxNSwgLy8gU3ByaW5nIDE5MTQgc3BhaW5cbiAgICAxNDEyNzcsIC8vIEZhbGwgMTkwMSBtZXNzZWQgdXAgY29udm95IHN0dWZmXG4gICAgMTQyNTgwLCAvLyBGYWxsIDE5MDIgVmVuY2llIG1vdmUgVHVzY2FueSBmYWlscyBmb3Igbm8gcmVhc29uXG4gICAgMTQ0ODI1LCAvLyBGYWxsIDE5MDggQnVyZ3VuZHkgbW92ZSBNdW5pY2ggZmFpbHMgZm9yIG5vIHJlYXNvblxuICAgIDE0NTY0NSwgLy8gRmFsbCAxOTA0IEJ1aWxkIGZsZWV0IFN0LiBQZXRlcnNidXJnIGlzIGFjdHVhbGx5IGFuIGFybXlcbiAgICAxNDc1MjEsIC8vIFNwcmluZyAxOTA2IFJldHJlYXQgRW5nbGlzaCBmbGVldCBpbiBzdC4gcGV0ZXJzYnVyZyBiZWNvbWVzIHJ1c3NpYW5cbiAgICAxNDkyODAsIC8vIEZhbGwgMTkwNCBCdWlsZCBkZXN0cm95IGZvcmVpZ24gdW5pdFxuICAgIDE0OTg3MSwgLy8gRmFsbCAxOTAxIG1lc3NlZCB1cCBjb252b3kgc3R1ZmZcbiAgICAxNDk4OTAsIC8vIEZhbGwgMTkwNiBpbnZhbGlkIGJ1aWxkL2Rlc3Ryb3kgaW5wdXRzXG5dKTtcbmNvbnN0IHRlYW1zID0gbmV3IFNldChbJ0VOR0xBTkQnLCAnRlJBTkNFJywgJ0dFUk1BTlknLCAnSVRBTFknLCAnQVVTVFJJQScsICdSVVNTSUEnLCAnVFVSS0VZJ10pO1xuXG5jb25zdCB0b3RhbHMgPSB7IGNoZWNrZWQ6IDAsIHNraXBwZWRfdmlhOiAwLCBza2lwcGVkX3RlYW06IDAgfTtcblxuZnVuY3Rpb24gcnVuX2dhbWUoaWQ6IG51bWJlciwgdHVybnM6IHNjcmFwZS5UdXJuW10pIHtcbiAgICBsZXQgZ2FtZSA9IG5ldyBHYW1lU3RhdGUobWFwcy5zdGFuZGFyZC5tYXAsIFtdKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHVybnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhgcHJvY2Vzc2luZyAke2kgJSAyID8gJ2ZhbGwnIDogJ3NwcmluZyd9ICR7MTkwMSArIE1hdGguZmxvb3IoaSAvIDIpfWApO1xuXG4gICAgICAgIGxldCByZW1vdGUgPSBzY3JhcGUucGFyc2Vfb3JkZXJzKGdhbWUsIHR1cm5zW2ldLm9yZGVycyk7XG4gICAgICAgIGxldCBvcmRlcnMgPSByZW1vdGUub3JkZXJzLnNsaWNlKCk7XG5cbiAgICAgICAgaWYgKG9yZGVycy5maW5kKG8gPT4gby50eXBlID09ICdtb3ZlJyAmJiBvLnJlcXVpcmVDb252b3kpKSB7XG4gICAgICAgICAgICArK3RvdGFscy5za2lwcGVkX3ZpYTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBza2lwcGluZyAke2lkfSAtIGZvdW5kIFZJQSBDT05WT1kgKCR7dG90YWxzLnNraXBwZWRfdmlhfSB0b3RhbClgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB4ID0gWy4uLmdhbWUudW5pdHNdLmZpbmQodSA9PiAhdGVhbXMuaGFzKHUudGVhbSkpO1xuICAgICAgICBpZiAoeCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYHNraXBwaW5nICR7aWR9IC0gZm91bmQgdGVhbSAke3gudGVhbX0gKCR7dG90YWxzLnNraXBwZWRfdGVhbX0gdG90YWwpYCk7XG4gICAgICAgICAgICArK3RvdGFscy5za2lwcGVkX3RlYW07XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCB1bml0IG9mIGdhbWUudW5pdHMpIHtcbiAgICAgICAgICAgIGxldCBvcmRlciA9IG9yZGVycy5maW5kKG8gPT4gby51bml0ID09IHVuaXQpO1xuICAgICAgICAgICAgaWYgKG9yZGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIG9yZGVycy5wdXNoKG5ldyBIb2xkT3JkZXIodW5pdCkpXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbG9jYWwgPSByZXNvbHZlKG9yZGVycyk7XG5cbiAgICAgICAgZm9yIChsZXQgbW92ZSBvZiBsb2NhbC5yZXNvbHZlZCkge1xuICAgICAgICAgICAgaWYgKCFnYW1lLnVuaXRzLmhhcyhtb3ZlLnVuaXQpKSBkZWJ1Z2dlcjtcbiAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKG1vdmUudW5pdCk7XG4gICAgICAgICAgICBnYW1lLnVuaXRzLmFkZChuZXcgVW5pdChtb3ZlLnRhcmdldCwgbW92ZS51bml0LnR5cGUsIG1vdmUudW5pdC50ZWFtKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBvcmRlciBvZiBvcmRlcnMpIHtcbiAgICAgICAgICAgIGlmIChvcmRlci50eXBlID09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC5yZXNvbHZlZC5pbmNsdWRlcyhvcmRlcikgIT0gcmVtb3RlLnJlc29sdmVkLmluY2x1ZGVzKG9yZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYWlyIG9mIGxvY2FsLnJlYXNvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke3BhaXJbMF19OiAke3BhaXJbMV19YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob3JkZXIpO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShvcmRlcnMpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcihgTWlzbWF0Y2ggaW4gZ2FtZSAke2lkfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChsb2NhbC5ldmljdGVkLmxlbmd0aCA9PSAwICE9ICF0dXJuc1tpXS5yZXRyZWF0cykge1xuICAgICAgICAvLyAgICAgdGhyb3cgZXJyb3IoYE1pc21hdGNoIGluIGdhbWUgJHtpZH1gKTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmIChsb2NhbC5ldmljdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGV2aWN0ZWQgPSBuZXcgU2V0KGxvY2FsLmV2aWN0ZWQpO1xuICAgICAgICAgICAgbGV0IHJldHJlYXRzID0gc2NyYXBlLnBhcnNlX3JldHJlYXRzKGxvY2FsLmV2aWN0ZWQsIHR1cm5zW2ldLnJldHJlYXRzISk7XG4gICAgICAgICAgICBmb3IgKGxldCByZXRyZWF0IG9mIHJldHJlYXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJldHJlYXQucmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJlYXQudGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5tb3ZlKHJldHJlYXQudW5pdCwgcmV0cmVhdC50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnVuaXRzLmRlbGV0ZShyZXRyZWF0LnVuaXQpO1xuICAgICAgICAgICAgICAgICAgICBldmljdGVkLmRlbGV0ZShyZXRyZWF0LnVuaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IHVuaXQgb2YgZXZpY3RlZCkge1xuICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuZGVsZXRlKHVuaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGkgJSAyID09IDEpIHtcbiAgICAgICAgICAgIGxldCBidWlsZHMgPSBzY3JhcGUucGFyc2VfYnVpbGRzKGdhbWUsIHR1cm5zW2ldLmJ1aWxkcyEpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBidWlsZCBvZiBidWlsZHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnVpbGQucmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWUudW5pdHMuaGFzKGJ1aWxkLnVuaXQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS51bml0cy5kZWxldGUoYnVpbGQudW5pdCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUudW5pdHMuYWRkKGJ1aWxkLnVuaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IHJlZ2lvbiBvZiBnYW1lLm1hcC5yZWdpb25zKSB7XG4gICAgICAgICAgICBsZXQgdW5pdHMgPSBbLi4uZ2FtZS51bml0c10uZmlsdGVyKHUgPT4gdS5yZWdpb24gPT0gcmVnaW9uKTtcbiAgICAgICAgICAgIGlmICh1bml0cy5sZW5ndGggPiAxKSB0aHJvdyBlcnJvcihgTWlzbWF0Y2ggaW4gZ2FtZSAke2lkfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKyt0b3RhbHMuY2hlY2tlZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgIGZzLm1rZGlycFN5bmMoJ2RhdGEnKTtcbiAgICBmcy5ta2RpcnBTeW5jKCdjYWNoZScpO1xuXG4gICAgLy8gcnVuX2dhbWUoMTUwMTY4LCBzY3JhcGUucmVhZF9nYW1lKGZzLnJlYWRGaWxlU3luYygnZGF0YS8xNTAxNjgnKSkpO1xuICAgIFxuICAgIGxldCBhbGxJZHMgPSBmcy5yZWFkZGlyU3luYygnZGF0YScpO1xuXG4gICAgZm9yIChsZXQgaWQgb2YgYWxsSWRzKSB7XG4gICAgICAgIGlmIChpZCA9PSAna25vd24uanNvbicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaWdub3JlZF9nYW1lcy5oYXMocGFyc2VJbnQoaWQpKSkgY29udGludWU7XG5cbiAgICAgICAgY29uc29sZS5sb2coYHByb2Nlc3NpbmcgZ2FtZSAke2lkfWApO1xuXG4gICAgICAgIGxldCBnYW1lID0gc2NyYXBlLnJlYWRfZ2FtZShmcy5yZWFkRmlsZVN5bmMoYGRhdGEvJHtpZH1gKSk7XG4gICAgICAgIHJ1bl9nYW1lKHBhcnNlSW50KGlkKSwgZ2FtZSk7XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2codG90YWxzKTtcbn1cblxubGV0IHggPSBnbG9iYWwgYXMgYW55O1xuaWYgKHguZGV2dG9vbHNGb3JtYXR0ZXJzID09IG51bGwpIHguZGV2dG9vbHNGb3JtYXR0ZXJzID0gW107XG54LmRldnRvb2xzRm9ybWF0dGVycy5wdXNoKGZvcm1hdHRlcik7XG5cbmxldCBvcCA9IHByb2Nlc3MuYXJndlsyXTtcblxuaWYgKG9wID09ICdzY3JhcGUnKVxuICAgIHNjcmFwZS5ydW4oKTtcbmVsc2UgaWYgKG9wID09ICdjaGVjaycpXG4gICAgc2NyYXBlLmNoZWNrKCk7XG5lbHNlIGlmIChvcCA9PSAncnVuJylcbiAgICBydW4oKTtcbmVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCd1bmtub3duIG9yIG1pc3NpbmcgY29tbWFuZCcpXG59XG4iXSwibmFtZXMiOlsibWFwcyIsIlVuaXQiLCJVbml0VHlwZSIsIkhvbGRPcmRlciIsIk1vdmVPcmRlciIsIlN1cHBvcnRPcmRlciIsIkNvbnZveU9yZGVyIiwiR2FtZVN0YXRlIiwic2NyYXBlLnBhcnNlX29yZGVycyIsInJlc29sdmUiLCJzY3JhcGUucGFyc2VfcmV0cmVhdHMiLCJzY3JhcGUucGFyc2VfYnVpbGRzIiwicnVuIiwic2NyYXBlLnJlYWRfZ2FtZSIsImZvcm1hdHRlciIsInNjcmFwZS5ydW4iLCJzY3JhcGUuY2hlY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUFnQixLQUFLLENBQUMsR0FBVztJQUM3QixTQUFTO0lBQ1QsT0FBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN6QjtBQUVELFVBQWlCLE9BQU8sQ0FBQyxLQUFhLEVBQUUsTUFBYztJQUNsRCxJQUFJLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEMsSUFBSSxLQUFLLENBQUM7SUFDVixPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM1QixNQUFNLEtBQUssQ0FBQztDQUNuQjs7QUNNRCxNQUFNLFdBQVcsR0FBRyw0QkFBNEIsQ0FBQztBQUVqRCxTQUFlLGFBQWEsQ0FBQyxJQUFZOztRQUNyQyxJQUFJLEdBQUcsR0FBRyxnQ0FBZ0MsSUFBSSxFQUFFLENBQUM7UUFDakQsSUFBSTtZQUNBLElBQUksUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDOUIsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsV0FBVyxFQUFFLEVBQUU7Z0JBQ2pELHVCQUF1QixFQUFFLElBQUk7Z0JBQzdCLGNBQWMsRUFBRSxLQUFLO2FBQ3hCLENBQUMsQ0FBQztZQUVILElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxHQUFHO2dCQUFFLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbkUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixTQUFTO1lBQ1QsTUFBTSxDQUFDLENBQUM7U0FDWDtLQUNKO0NBQUE7QUFFRCxTQUFlLFlBQVksQ0FBQyxLQUFhOztRQUNyQyxJQUFJLEtBQUssR0FBRyxTQUFTLEtBQUssRUFBRSxDQUFDO1FBRTdCLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSTtZQUNBLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSSxHQUFHLE1BQU0sYUFBYSxDQUFDLHFCQUFxQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzNDO1FBRUQsT0FBTyxJQUFJLENBQUM7S0FDZjtDQUFBO0FBRUQsU0FBZSxXQUFXLENBQUMsRUFBVSxFQUFFLEtBQWEsRUFBRSxJQUFZOztRQUM5RCxJQUFJLEtBQUssR0FBRyxXQUFXLEVBQUUsVUFBVSxLQUFLLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekQsSUFBSSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztRQUV4QixLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM3RCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWQsS0FBSyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEI7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxTQUFTO1lBRS9CLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxLQUFLO1lBQ0wsT0FBTyxNQUFNLENBQUM7UUFFbEIsT0FBTyxTQUFTLENBQUM7S0FDcEI7Q0FBQTtBQUVELFNBQXNCLFFBQVEsQ0FBQyxFQUFVOztRQUNyQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbEQsS0FBSyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzdDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDeEIsSUFBSSxJQUFJLEdBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFFaEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLGtHQUFrRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNwSSxJQUFJLEVBQUUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFFLE1BQU0sS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFFLE1BQU0sS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUVuRixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksR0FBRztvQkFBRSxTQUFTO2dCQUU3QyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUNiLFFBQVEsS0FBSztvQkFDVCxLQUFLLEdBQUc7d0JBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO3dCQUFDLE1BQU07b0JBQzVDLEtBQUssR0FBRzt3QkFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzt3QkFBQyxNQUFNO29CQUN4QyxLQUFLLEdBQUc7d0JBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7d0JBQUMsTUFBTTtpQkFDekM7YUFDSjtZQUVELElBQUksQ0FBQyxLQUFLO2dCQUFFLFNBQVM7WUFFckIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjtRQUVELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0NBQUE7QUFFRCxTQUFzQixRQUFRLENBQUMsSUFBWTs7UUFDdkMsSUFBSSxHQUFHLEdBQUcsNEVBQTRFLElBQUksRUFBRSxDQUFDO1FBQzdGLElBQUksSUFBSSxHQUFHLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDNUIsS0FBSyxJQUFJLEtBQUssSUFBSSxPQUFPLENBQUMsZ0RBQWdELEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDL0UsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztLQUNuQjtDQUFBO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQVc7SUFDakMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQVcsQ0FBQztJQUV2RCxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNuQixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNyRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDdEI7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN6RCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDeEI7UUFDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7O1lBRXRDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUTttQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU07Z0JBQ3hDLE1BQU0sS0FBSyxDQUFDLG1CQUFtQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDWCxNQUFNO1NBQ1Q7S0FDSjtJQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2Y7QUFFRCxTQUFnQixVQUFVLENBQUMsS0FBYTtJQUNwQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzlCO0FBRUQsU0FBc0IsR0FBRzs7UUFDckIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXZCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxRQUFRLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2QyxJQUFJO1lBQ0EsUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQW9CLENBQUM7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVEsQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDbkI7UUFFRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUE7UUFDWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLE1BQU0sR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDM0MsSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFO2dCQUNaLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1gsU0FBUzthQUNaO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNqQyxJQUFJLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1QixLQUFLLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFDaEIsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQ3BCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUV6QixJQUFJLFFBQVEsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDbkMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ3RCLFFBQVEsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDakMsUUFBUSxHQUFHLElBQUksQ0FBQztpQkFDbkI7Z0JBRUQsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO29CQUNYLElBQUksSUFBSSxDQUFDLENBQUM7b0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtvQkFDbEMsU0FBUztpQkFDWjtnQkFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUNsQyxJQUFJO29CQUNBLElBQUksVUFBVSxHQUFHLFFBQVEsRUFBRSxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUNoQyxJQUFJLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM1QixJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTdCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzs0QkFDOUMsTUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTt3QkFFdkMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQ3RDO29CQUVELElBQUksTUFBTSxJQUFJLENBQUMsRUFBRTt3QkFDYixFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7cUJBQ3BCO2lCQUNKO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNSLEVBQUUsTUFBTSxDQUFDO29CQUNULEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN0RCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDeEI7YUFDSjtZQUVELElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDbEIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFFBQVEsQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDL0Q7U0FDSjtLQUNKO0NBQUE7QUFFRCxTQUFzQixLQUFLOztRQUN2QixFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwQyxLQUFLLElBQUksRUFBRSxJQUFJLE1BQU0sRUFBRTtZQUNuQixJQUFJLEVBQUUsSUFBSSxZQUFZO2dCQUFFLFNBQVM7WUFFakMsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFcEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWxELEtBQUssSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNsQixLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxrR0FBa0csRUFBRSxPQUFPLENBQUMsRUFBRTtvQkFDaEksS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDYixNQUFNO2lCQUNUO2dCQUVELElBQUksQ0FBQyxLQUFLO29CQUFFLFNBQVM7Z0JBQ3JCLEVBQUUsS0FBSyxDQUFDO2FBQ1g7WUFFRCxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN0QixJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ3RCLE1BQU0sS0FBSyxDQUFDLGFBQWEsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztpQkFDMUQ7YUFDSjtZQUVELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNmLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtvQkFBRSxNQUFNLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTtvQkFBRSxRQUFRLEVBQUUsQ0FBQzthQUNwQztZQUVELElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO2dCQUM5QixJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7YUFDeEg7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQzthQUN0SDtZQUVELElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEM7S0FDSjtDQUFBO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQWUsRUFBRSxNQUFjO0lBQ3hELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVoUixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBRWxCLEtBQUssSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFO1FBQ3JCLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksS0FBSyxHQUFHLDJDQUEyQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRSxJQUFJLEtBQUssSUFBSSxJQUFJO2dCQUFFLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQyxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUU3QixJQUFJLE1BQU0sSUFBSSwrQkFBK0I7Z0JBQ3pDLFNBQVM7WUFFYixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLENBQUM7WUFDOUQsSUFBSSxNQUFNLElBQUksSUFBSTtnQkFBRSxNQUFNLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUU1RSxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztZQUMzRSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ2QsSUFBSSxLQUFLO29CQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJQyxvQkFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHQyx3QkFBUSxDQUFDLEtBQUssR0FBR0Esd0JBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7b0JBQ3pHLE1BQU0sS0FBSyxDQUFDLHdCQUF3QixJQUFJLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7YUFDcEU7WUFFRCxJQUFJLEtBQUssQ0FBQztZQUVWLElBQUksRUFBRSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksd0NBQXdDLEVBQUU7Z0JBQ3BFLEtBQUssR0FBRyxJQUFJQyx5QkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQy9CO2lCQUFNLElBQUksRUFBRSxJQUFJLE1BQU0sRUFBRTtnQkFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFakMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuQyxJQUFJLE1BQU0sR0FBR0gsb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksTUFBTSxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsZ0RBQWdELElBQUksR0FBRyxDQUFDLENBQUM7Z0JBRXpGLEtBQUssR0FBRyxJQUFJSSx5QkFBUyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekQsSUFBSSxNQUFNLElBQUksVUFBVSxFQUFFO29CQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUN2QjthQUNKO2lCQUFNLElBQUksRUFBRSxJQUFJLFNBQVMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUUxQyxJQUFJLEdBQUcsR0FBR0osb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksR0FBRyxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsbURBQW1ELE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBRTNGLElBQUksTUFBTSxJQUFJLE1BQU07b0JBQ2hCLEtBQUssR0FBRyxJQUFJSyw0QkFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDbkM7b0JBQ0QsSUFBSSxHQUFHLEdBQUdMLG9CQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDO29CQUNoRSxJQUFJLEdBQUcsSUFBSSxJQUFJO3dCQUFFLE1BQU0sS0FBSyxDQUFDLG1EQUFtRCxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUUzRixLQUFLLEdBQUcsSUFBSUssNEJBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QzthQUNKO2lCQUFNLElBQUksRUFBRSxJQUFJLFFBQVEsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUUxQyxJQUFJLEdBQUcsR0FBR0wsb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksR0FBRyxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsaURBQWlELE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBRXpGLElBQUksR0FBRyxHQUFHQSxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxHQUFHLElBQUksSUFBSTtvQkFBRSxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFdkYsS0FBSyxHQUFHLElBQUlNLDJCQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUMzQztpQkFBTTtnQkFDSCxNQUFNLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQTthQUN0QztZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FFdEI7S0FDSjtJQUVELE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7Q0FDL0I7QUFFRCxTQUFnQixjQUFjLENBQUMsT0FBZSxFQUFFLE1BQWM7SUFDMUQsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBRWxCLEtBQUssSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFO1FBQ3JCLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksS0FBSyxHQUFHLHdDQUF3QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvRCxJQUFJLEtBQUssSUFBSSxJQUFJO2dCQUFFLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRW5FLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDVixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzdCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFN0IsSUFBSSxHQUFHLEdBQUdOLG9CQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLEdBQUcsSUFBSSxJQUFJO29CQUFFLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUUxRSxJQUFJLEdBQUcsR0FBR0Esb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksR0FBRyxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsc0NBQXNDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTFFLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBQ2hFLElBQUksSUFBSSxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsb0NBQW9DLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUVqRixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE1BQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQ3hFO2lCQUFNO2dCQUNILElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFaEMsSUFBSSxNQUFNLEdBQUdBLG9CQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLE1BQU0sSUFBSSxJQUFJO29CQUFFLE1BQU0sS0FBSyxDQUFDLHNDQUFzQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUU3RSxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUN4RSxJQUFJLElBQUksSUFBSSxJQUFJO29CQUFFLE1BQU0sS0FBSyxDQUFDLG9DQUFvQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFFakYsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQzthQUN6RTtTQUNKO0tBQ0o7SUFFRCxPQUFPLFFBQVEsQ0FBQztDQUNuQjtBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFlLEVBQUUsTUFBYztJQUN4RCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFFaEIsS0FBSyxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7UUFDckIsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsSUFBSSxLQUFLLEdBQUcsb0RBQW9ELENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLElBQUksS0FBSyxJQUFJLElBQUk7Z0JBQUUsTUFBTSxLQUFLLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTdCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNWLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVoQyxJQUFJLE1BQU0sR0FBR0Esb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksTUFBTSxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTNFLElBQUksSUFBSSxHQUFHLElBQUlDLG9CQUFJLENBQUMsTUFBTSxFQUFFLElBQUksSUFBSSxPQUFPLEdBQUdDLHdCQUFRLENBQUMsS0FBSyxHQUFHQSx3QkFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDekQ7aUJBQU07Z0JBQ0gsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVoQyxJQUFJLE1BQU0sR0FBR0Ysb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksTUFBTSxJQUFJLElBQUk7b0JBQUUsTUFBTSxLQUFLLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTNFLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7b0JBQ2QsSUFBSSxNQUFNLElBQUksVUFBVTt3QkFBRSxTQUFTOzt3QkFDOUIsTUFBTSxLQUFLLENBQUMsa0NBQWtDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUNyRTtnQkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQzthQUN6RDtTQUNKO0tBQ0o7SUFFRCxPQUFPLE1BQU0sQ0FBQztDQUNqQjs7QUN4YUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDMUIsTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0NBQ1QsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBRWhHLE1BQU0sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUUvRCxTQUFTLFFBQVEsQ0FBQyxFQUFVLEVBQUUsS0FBb0I7SUFDOUMsSUFBSSxJQUFJLEdBQUcsSUFBSU8seUJBQVMsQ0FBQ1Asb0JBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRWhELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyRixJQUFJLE1BQU0sR0FBR1EsWUFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbkMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDdkQsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLHdCQUF3QixNQUFNLENBQUMsV0FBVyxTQUFTLENBQUMsQ0FBQztZQUMvRSxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxFQUFFO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLFlBQVksU0FBUyxDQUFDLENBQUM7WUFDcEYsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQ3RCLE9BQU87U0FDVjtRQUVELEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN6QixJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksS0FBSztnQkFBRSxTQUFTO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSUwseUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQ25DO1FBRUQsSUFBSSxLQUFLLEdBQUdNLHVCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFNUIsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUFFLFNBQVM7WUFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUlSLG9CQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDekU7UUFFRCxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUN0QixJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO2dCQUN0QixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNuRSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7d0JBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDekM7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbkIsU0FBUztvQkFDVFEsdUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDaEIsTUFBTSxLQUFLLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3pDO2FBQ0o7U0FDSjs7OztRQU1ELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLElBQUksUUFBUSxHQUFHQyxjQUFxQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxDQUFDO1lBQ3hFLEtBQUssSUFBSSxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUMxQixJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7b0JBQ2xCLElBQUksT0FBTyxDQUFDLE1BQU07d0JBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7d0JBRXhDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hDO2FBQ0o7WUFDRCxLQUFLLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtnQkFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0I7U0FDSjtRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDWixJQUFJLE1BQU0sR0FBR0MsWUFBbUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU8sQ0FBQyxDQUFDO1lBRXpELEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFO2dCQUN0QixJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQ2hCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOzt3QkFFOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNsQzthQUNKO1NBQ0o7UUFFRCxLQUFLLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ2pDLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1lBQzVELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUFFLE1BQU0sS0FBSyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO0tBQ0o7SUFFRCxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUM7Q0FDcEI7QUFFRCxTQUFlQyxLQUFHOztRQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7UUFJdkIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwQyxLQUFLLElBQUksRUFBRSxJQUFJLE1BQU0sRUFBRTtZQUNuQixJQUFJLEVBQUUsSUFBSSxZQUFZO2dCQUFFLFNBQVM7WUFDakMsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFBRSxTQUFTO1lBRTlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFckMsSUFBSSxJQUFJLEdBQUdDLFNBQWdCLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzRCxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2QjtDQUFBO0FBRUQsSUFBSSxDQUFDLEdBQUcsTUFBYSxDQUFDO0FBQ3RCLElBQUksQ0FBQyxDQUFDLGtCQUFrQixJQUFJLElBQUk7SUFBRSxDQUFDLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBQzVELENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUNDLHlCQUFTLENBQUMsQ0FBQztBQUVyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXpCLElBQUksRUFBRSxJQUFJLFFBQVE7SUFDZEMsR0FBVSxFQUFFLENBQUM7S0FDWixJQUFJLEVBQUUsSUFBSSxPQUFPO0lBQ2xCQyxLQUFZLEVBQUUsQ0FBQztLQUNkLElBQUksRUFBRSxJQUFJLEtBQUs7SUFDaEJKLEtBQUcsRUFBRSxDQUFDO0tBQ0w7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUE7Q0FDNUMifQ==
