import finalData from './data.json';
import { Region, maps, UnitType } from 'diplomacy-common';
import { Path } from './path';
import { Vec } from './vec';

export interface Area {
    region: Region,
    path: Path,
}

let regions: Area[] = [];
let x = document.createElement('canvas');
let ctx = x.getContext('2d')!;

for (let info of finalData.territories) {
    let region = maps.standard.map.regions.find(r => info.name == r.name);
    if (region == null) throw new Error(`Region not found: '${info.name}'`);

    let path = Path.parse(info.area);

    if (info.name == 'Mid-Atlantic Ocean')
        path = path.disjoints()[0];

    if (info.name == 'North Sea')
        path = path.disjoints()[0];

    if (info.name == 'North Atlantic Ocean') {
        let other = finalData.territories.find(a => a.name == 'Mid-Atlantic Ocean')!;
        path = Path.join([path, ...Path.parse(other.area).disjoints().slice(1)]);
    }

    if (info.name == 'Norwegian Sea') {
        let other = finalData.territories.find(a => a.name == 'North Sea')!;
        path = Path.join([path, ...Path.parse(other.area).disjoints().slice(1)]);
    }

    let list = [];
    let islands = path.disjoints();
    for (let p of islands) {
        let wrap = islands.find(a => a != p && ctx.isPointInPath(a.toPath2D(), p.start.x, p.start.y));
        list.push(wrap ? p.reverse() : p);
    }
    path = Path.join(list);

    regions.push({ region, path });
}

export const allRegions = [...regions.values()];
export const deadzones = finalData.deadzones.map(z => Path.parse(z));
export const positions: { [id: string]: [number, number] } = { "BOH": [585, 577], "BUD": [695, 652], "GAL": [721, 584], "TRI": [610, 703], "TYR": [538, 643], "VIE": [616, 622], "CLY": [320, 337], "EDI": [365, 338], "LVP": [336, 400], "LON": [358, 489], "WAL": [298, 486], "YOR": [367, 439], "BRE": [298, 568], "BUR": [411, 616], "GAS": [316, 671], "MAR": [397, 699], "PAR": [357, 593], "PIC": [364, 541], "BER": [563, 495], "KIE": [506, 493], "MUN": [505, 585], "PRU": [630, 465], "RUH": [465, 544], "SIL": [612, 537], "APU": [591, 789], "NAP": [599, 853], "PIE": [463, 686], "ROM": [536, 777], "TUS": [502, 736], "VEN": [523, 688], "FIN": [739, 245], "LVN": [744, 413], "MOS": [877, 430], "SEV": [934, 579], "UKR": [819, 561], "WAR": [697, 524], "ANK": [945, 790], "ARM": [1107, 801], "CON": [838, 817], "SMY": [908, 881], "SYR": [1071, 909], "ALB": [667, 804], "BEL": [412, 532], "DEN": [517, 406], "GRE": [715, 859], "HOL": [440, 489], "NWY": [538, 272], "NAF": [230, 925], "POR": [117, 739], "RUM": [795, 697], "SER": [691, 746], "SWE": [600, 337], "TUN": [454, 928], "ADR": [585, 754], "AEG": [780, 908], "BAL": [640, 422], "BAR": [846, 30], "BLA": [925, 727], "EAS": [878, 942], "ENG": [283, 526], "BOT": [677, 320], "GOL": [391, 765], "HEL": [455, 427], "ION": [631, 914], "IRI": [238, 460], "MID": [66, 616], "NAT": [137, 322], "NTH": [429, 350], "NRG": [457, 139], "SKA": [519, 359], "TYN": [510, 830], "WES": [338, 848], "STP": [857, 256], "BUL": [769, 762], "SPA": [219, 749], "STPN": [841, 74], "STPS": [756, 322], "SPAN": [204, 661], "SPAS": [221, 845], "BULE": [815, 753], "BULS": [775, 802] };

let bbox = [
    new Vec(557.6677246, 16.4444447),
    new Vec(1709.666626, 981.4444447),
];
let scale = window.innerHeight / (bbox[1].y - bbox[0].y);

for (let key in positions) {
    positions[key] = positions[key].map(a => a * scale) as any;
}
