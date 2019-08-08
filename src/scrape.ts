import zlib from 'zlib';

import fs from 'fs-extra';
import request from 'request-promise-native';
import { error, matches } from './util';

type Inputs = { [team: string]: string[] };

interface Turn {
    orders: Inputs,
    retreats?: Inputs,
    builds?: Inputs,
}

const session_key = `343evhj23vv05beiiv8dldlno4`;

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

export async function get_orders(id: number, date: number) {
    let data = await get_history(id, 'O', date);
    let orders: Inputs = {};

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];
        let list = [];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            list.push(part[1]);
        }

        orders[team] = list;
    }

    return orders;
}

export async function get_retreats(id: number, date: number) {
    let data = await get_history(id, 'R', date);

    let retreats: Inputs = {};

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];
        let list = [];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            list.push(part[1]);
        }

        retreats[team] = list;
    }

    return retreats;
}

export async function get_builds(id: number, date: number) {
    let data = await get_history(id, 'B', date);

    let builds: Inputs = {};

    for (let match of matches(/<b>(\w+)<\/b><ul>(.*?)<\/ul>/, data)) {
        let team = match[1];
        let list = [];

        for (let part of matches(/<li>(.*?)<\/li>/, match[2])) {
            list.push(part[1]);
        }

        builds[team] = list;
    }

    return builds;
}

export async function get_game(id: number) {
    let turns = [];
    let history = await game_history(`game_id=${id}`);

    for (let content of history.split('</br></br>')) {
        let date = turns.length;
        let turn: Turn = {
            orders: {},
        };

        let found = false;
        for (let match of matches(/<a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)/, content)) {
            if (id != parseInt(match[1])) throw error(`Failed to parse game history: ${id}`);
            if (date != parseInt(match[3])) throw error(`Failed to parse game history: ${id}`);

            found = true;
            switch (match[2]) {
                case 'O':
                    turn.orders = await get_orders(id, date);
                    break;
                case 'R':
                    turn.retreats = await get_retreats(id, date);
                    break;
                case 'B':
                    turn.builds = await get_builds(id, date);
                    break;
            }
        }

        if (!found) continue;

        turns.push(turn);
    }

    return turns;
}

export async function get_page(page: number) {
    let url = `/games.php?subpage=all_finished&variant-0=1&map_variant-0=1&current_page=${page}`;
    let data = await playdiplomacy(url);

    let ids = new Set<number>();
    for (let match of matches(/<a href="game_play_details\.php\?game_id=(\d+)/, data)) {
        let gameId = parseInt(match[1]);
        ids.add(gameId);
    }

    return [...ids];
}

export function read_game(raw: Buffer): Turn[] {
    let data = zlib.gunzipSync(raw);
    return JSON.parse(data.toString('utf8'));
}

export function write_game(turns: Turn[]) {
    let data = Buffer.from(JSON.stringify(turns), 'utf8');
    return zlib.gzipSync(data);
}

export async function run() {
    fs.mkdirpSync('data');
    fs.mkdirpSync('cache');

    let errors = 0;
    let oldKnown;
    let newKnown = { newest: 0, count: 0 };
    try {
        oldKnown = fs.readJSONSync('data/known.json') as typeof newKnown;
    } catch (e) {
        oldKnown = null;
    }

    for (let i = 1; i <= 1000 && errors < 10; ++i) {
        console.log(`fetching page ${i}:`)
        let ids = await get_page(i);

        for (let id of ids) {
            if (newKnown.newest == 0)
                newKnown.newest = id;

            if (oldKnown && id == oldKnown.newest) {
                let skip = Math.floor(oldKnown.count / 15) - 1;
                i += skip;

                console.log(`found known, skipping to page ${i + 1} (${oldKnown.count} games)`);

                if (skip == 0) {
                    oldKnown = null;
                } else {
                    newKnown.count += oldKnown.count;
                    oldKnown = null;
                    break;
                }
            }

            console.log(`fetching game ${id}`)
            try {
                let outputFile = `data/${id}`;
                if (!fs.pathExistsSync(outputFile)) {
                    let game = await get_game(id);
                    let data = write_game(game);
                    let parsed = read_game(data);

                    if (JSON.stringify(parsed) != JSON.stringify(game))
                        throw error('game encoding failed')

                    fs.writeFileSync(outputFile, data);
                }

                ++newKnown.count;
            } catch (e) {
                ++errors;
                console.error(id, e);
            }
        }

        if (oldKnown == null) {
            fs.writeJSONSync('data/known.json', newKnown);
            console.log(`known: ${newKnown.newest} +${newKnown.count}`);
        }
    }
}

export async function check() {
    fs.mkdirpSync('data');
    fs.mkdirpSync('cache');

    let count = 0;
    let allIds = fs.readdirSync('data');

    for (let id of allIds) {
        if (id == 'known.json') continue;

        let game = read_game(fs.readFileSync(`data/${id}`));

        let turns = 0;
        let history = await game_history(`game_id=${id}`);

        for (let content of history.split('</br></br>')) {
            let found = false;
            for (let _ of matches(/<a href='game_history\.php\?game_id=(\d+)&phase=(\w)&gdate=(\d+)/, content)) {
                found = true;
                break;
            }

            if (!found) continue;
            ++turns;
        }

        if (turns != game.length || turns == 0)
            throw error(`Mismatch: ${id} ${turns} ${game.length}`);

        console.log(`${(++count).toString().padStart(allIds.length.toString().length)} / ${allIds.length} ${id} ${turns}`);
    }
}
