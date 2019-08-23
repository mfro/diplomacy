export * from './game';
export * from './rules';

import formatter from './formatter';

export { formatter };

import * as standard from './maps/standard';

export const maps = {
    standard: {
        map: standard.map,
        regions: standard.allRegions,
    },
};
