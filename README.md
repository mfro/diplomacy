## Diplomacy rules solver

### Code overview:

`game.ts` : Structures to define game map and game state including regions and units.

`data.ts` : Description of standard game map, including all regions and adjacency data. 

`rules.ts` : Structures to define orders and core order resolution logic.

`scrape.ts` : Logic to scrape game data from playdiploacy.com and save it in a gzipped format, and logic to load and parse previously scraped data.

`main.ts` : Runs through all saved game data and runes it through the order resolver to compare the results.

### Can be run as follows:

`node . scrape` Scrape public game data from playdiplomacy.com and saves it, gzipped, in the `data` folder.

`node . run` Runs the saved game data through the rules resolver, comparing it against the expected results from playdiplomacy.com's rules resolver.
