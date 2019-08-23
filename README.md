### common:

`game.ts` : Structures to define game map and game state including regions and units.

`rules.ts` : Structures to define orders and core order resolution logic.

`maps/standard.ts` : Description of standard game map, including all regions and adjacency data. 

`formatter.ts` : Chrome devtools formatter to aid in debugging orders

### scraper:

Contains logic for downloading game data from playdiplomacy.com and saving it to `scraper/data`. Also has logic for loading and parsing that data.

Run as `node . run` to run all the saved data against the orders resolver to compare the results against playdiplomacy.com's resolver

### web app:

Web interface to input orders to the orders resolver with a fancy interface.
