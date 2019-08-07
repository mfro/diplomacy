import { Region, GameMap, UnitType } from './game';

const LAND = UnitType.Land;
const WATER = UnitType.Water;

function n(id: string, name: string, type: UnitType): Region {
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

function border(node: Region, adjacent: Region[]) {
    for (let other of adjacent)
        node.adjacent.add(other);
}

function attach(node: Region, attached: Region[]) {
    let all = [node, ...attached];
    for (let region of all) {
        for (let other of all) {
            if (other == region) continue;
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

export const europe = new GameMap([BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH]);

export const REGIONS = { BOH, BUD, GAL, TRI, TYR, VIE, CLY, EDI, LVP, LON, WAL, YOR, BRE, BUR, GAS, MAR, PAR, PIC, BER, KIE, MUN, PRU, RUH, SIL, APU, NAP, PIE, ROM, TUS, VEN, FIN, LVN, MOS, SEV, STP, UKR, WAR, ANK, ARM, CON, SMY, SYR, ALB, BEL, BUL, DEN, GRE, HOL, NWY, NAF, POR, RUM, SER, SPA, SWE, TUN, ADR, AEG, BAL, BAR, BLA, EAS, ENG, BOT, GOL, HEL, ION, IRI, MID, NAT, NTH, NRG, SKA, TYN, WES, STP_NORTH, STP_SOUTH, SPA_NORTH, SPA_SOUTH, BUL_NORTH, BUL_SOUTH };
