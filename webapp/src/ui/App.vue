<template>
  <v-app>
    <div class="d-flex content">
      <game-map :units="state.units" :orders="state.orders" :readonly="readonly" @click="click" />

      <v-spacer class="d-flex flex-column">
        <div class="section d-flex align-start">
          <v-card v-if="build.regionOptions !== null" class="ma-3">
            <v-card-title class="title">
              <span>What region?</span>
            </v-card-title>
            <v-card-actions key="1">
              <v-layout justify-space-around>
                <v-btn
                  v-for="region in build.regionOptions"
                  :key="region.id"
                  text
                  color="primary"
                  @click="resolveRegionOptions(region)"
                >{{ region.name }}</v-btn>
              </v-layout>
            </v-card-actions>
          </v-card>

          <v-card
            v-else-if="build.unitRegion === null"
            class="align-self-stretch ma-3 textbox d-flex flex-column"
          >
            <div class="mx-3 mt-2 my-1 title">
              <span>Orders:</span>
            </div>
            <v-divider />
            <pre class="grow ma-2 mx-3">{{ state.orders.join('\n') }}</pre>
            <v-divider />
            <v-card-actions key="2">
              <v-btn
                color="primary"
                v-if="!readonly"
                :disabled="state.orders.length == 0"
                @click="resolve()"
              >Resolve Orders</v-btn>
              <v-btn color="primary" v-else @click="restore()">Restore</v-btn>
              <v-spacer />
              <v-btn color="secondary" text v-if="index > 0" @click="preview(index - 1)">Back</v-btn>
              <v-btn color="secondary" text v-if="readonly" @click="preview(index + 1)">Next</v-btn>
              <v-btn color="info" text outlined @click="help = true">
                <v-icon>help</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card v-else-if="build.unitTeam === null" class="ma-3">
            <v-card-title class="title">
              <span>What team is the unit in {{ build.unitRegion.name }}?</span>
            </v-card-title>
            <v-card-actions key="3">
              <v-layout justify-space-around>
                <v-btn
                  v-for="team in teams"
                  :key="team"
                  text
                  color="primary"
                  @click="setUnitTeam(team)"
                >{{ team }}</v-btn>
              </v-layout>
            </v-card-actions>
          </v-card>

          <v-card v-else-if="build.unitType === null" class="ma-3">
            <v-card-title class="title">
              <span>What type of unit in {{ build.unitRegion.name }}?</span>
            </v-card-title>
            <v-card-actions key="4">
              <v-layout justify-space-around>
                <v-btn text color="primary" @click="setUnitType(false)">Army</v-btn>
                <v-btn text color="primary" @click="setUnitType(true)">Fleet</v-btn>
              </v-layout>
            </v-card-actions>
          </v-card>

          <v-card v-else-if="build.orderType === null" class="ma-3">
            <v-card-title class="title">
              <span>What order for the {{ getUnitTypeString(build.unitType) }} in {{ build.unitRegion.name }}?</span>
            </v-card-title>
            <v-card-text class="text--primary">
              <p>Left click to give a move or hold order</p>
              <p>Right click to give a support order</p>
              <p>Right click twice to give a convoy order</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="build.orderType == 'convoy'" class="ma-3">
            <v-card-title>
              <span>Select a convoy destination</span>
            </v-card-title>
          </v-card>

          <v-card v-else-if="build.orderType == 'support'" class="ma-3">
            <v-card-title>
              <span>Select a support destination</span>
            </v-card-title>
            <v-card-text class="text--primary">
              <p>Right click again to give a convoy order</p>
            </v-card-text>
          </v-card>
        </div>

        <div class="section d-flex flex-column">
          <v-card class="textbox mx-3 mb-3 pa-2">
            <pre>{{ state.results }}</pre>
          </v-card>
        </div>
      </v-spacer>
    </div>

    <v-dialog v-model="help" width="30em">
      <v-card>
        <v-card-title>
          <span>Diplomacy Orders Resolver</span>
          <v-spacer />
          <v-btn icon @click="help = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text--primary">
          <p>The list of orders is in the top right.</p>
          <p>Click on a region to place a unit or give orders. Prompts will appear on the right to give the unit a type, team, and orders.</p>
          <p>Once all orders are registered, click resolve orders to process the turn. Dislodged units and unsuccessful orders will be listed in the bottom right.</p>
          <p>Use the back and next buttons to see previous turns. While viewing a previous game state, click restore to revert to it and erase the history past that point</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { resolve, UnitType, Unit, MoveOrder, HoldOrder, ConvoyOrder, SupportOrder, maps, Region } from 'diplomacy-common';

import vuetify from '@/plugins/vuetify';

import GameMap from './GameMap';

export default {
  vuetify,

  name: 'app',

  components: {
    GameMap,
  },

  data() {
    return {
      UnitType,
      teams: ['England', 'France', 'Germany', 'Russia', 'Austria', 'Italy', 'Turkey'],

      help: false,

      build: {
        regionOptions: null,

        unitRegion: null,
        unitType: null,
        unitTeam: null,
        orderType: null,
        orderRegion: null,
      },

      index: 0,
      history: [{
        units: [],
        orders: [],
        results: '',
      }],
    };
  },

  computed: {
    unitTypeString() {
      if (this.build.unitType === UnitType.Water)
        return 'fleet';

      if (this.build.unitType === UnitType.Land)
        return 'army';

      return '?';
    },

    canConvoy() {
      if (this.build.unitType === null || this.build.unitRegion === null)
        return false;

      return this.build.unitType == UnitType.Water && this.build.unitRegion.type == UnitType.Water;
    },

    unit() {
      if (this.build.unitRegion === null)
        return null;

      let unit = this.state.units.find(o => Region.areEqual(o.region, this.build.unitRegion));
      if (unit) return unit;

      if (this.build.unitRegion === null || this.build.unitType === null || this.build.unitTeam === null)
        return null;

      unit = new Unit(this.build.unitRegion, this.build.unitType, this.build.unitTeam);
      this.state.units.push(unit);
      return unit;
    },

    state() {
      return this.history[this.index];
    },

    readonly() {
      return this.index + 1 != this.history.length;
    }
  },

  methods: {
    reset() {
      Object.assign(this.build, this.$options.data().build);
    },

    async click([region, button, pos]) {
      if (this.build.unitRegion === null) {
        if (button == 2) {
          let i = this.state.units.findIndex(o => Region.areSame(o.region, region));
          if (i < 0) return;

          let unit = this.state.units.splice(i, 1)[0];

          let i2 = this.state.orders.findIndex(o => o.unit == unit);
          if (i2 < 0) return this.reset();

          this.state.orders.splice(i2, 1);
          return this.reset();
        }

        let unit = this.state.units.find(o => Region.areSame(o.region, region));
        if (unit == null) {
          region = await this.resolveRegionOptions(region);
          this.build.unitRegion = region;
          if (!region.isShore)
            this.build.unitType = region.type;
          else if (region.attached.size > 0)
            this.build.unitType = UnitType.Water;
          return;
        }

        let old = this.state.orders.findIndex(o => o.unit == unit);
        if (old >= 0) this.state.orders.splice(old, 1);

        this.build.unitRegion = unit.region;
        this.build.unitType = unit.type;
        this.build.unitTeam = unit.team;
        return;
      }

      if (this.unit != null) {
        if (Region.areSame(region, this.unit.region)) {
          return this.emit(new HoldOrder(this.unit));
        }

        if (button == 0) {
          if (this.build.orderType == 'convoy') {
            return this.emit(new ConvoyOrder(this.unit, this.build.orderRegion, region));
          } else if (this.build.orderType == 'support') {
            if (Region.areSame(region, this.build.orderRegion)) {
              return this.emit(new SupportOrder(this.unit, this.build.orderRegion));
            } else {
              region = await this.resolveRegionOptions(region);
              return this.emit(new SupportOrder(this.unit, this.build.orderRegion, region));
            }
          } else {
            if (this.unit.type == UnitType.Water)
              region = await this.resolveRegionOptions(region);
            return this.emit(new MoveOrder(this.unit, region, false));
          }
        }

        if (button == 2) {
          if (this.build.orderType == 'support' &&
            Region.areSame(this.build.orderRegion, region)) {
            this.build.orderType = 'convoy';
            this.build.orderRegion = region;
          } else {
            this.build.orderType = 'support';
            this.build.orderRegion = region;
          }
        }
      }
    },

    setUnitTeam(team) {
      this.build.unitTeam = team;
      this.unit;
    },

    setUnitType(type) {
      this.build.unitType = type ? UnitType.Water : UnitType.Land;
      this.unit;
    },

    emit(order) {
      this.state.orders.push(order);
      console.log(order);
      this.reset();
    },

    getUnitTypeString(val) {
      if (val === UnitType.Water)
        return 'fleet';

      if (val === UnitType.Land)
        return 'army';

      return '?';
    },

    resolveRegionOptions(region) {
      if (this.build.regionOptions === null) {
        if (region.attached.size == 0)
          return region;

        this.build.regionOptions = [region, ...region.attached];
        return new Promise(resolve => {
          this.regionResolve = resolve;
        });
      } else {
        this.build.regionOptions = null;
        this.regionResolve(region);
      }
    },

    resolve() {
      let orders = [...this.state.orders];
      let newUnits = [...this.state.units];
      let newResults = [];

      for (let unit of this.state.units) {
        let order = orders.find(o => o.unit == unit);
        if (order) continue;

        orders.push(new HoldOrder(unit));
      }

      let result = resolve(orders);

      for (let move of result.resolved) {
        let i = newUnits.indexOf(move.unit);
        if (i < 0) debugger;

        let moved = new Unit(move.target, move.unit.type, move.unit.team);
        this.$set(newUnits, i, moved);
      }

      for (let unit of result.evicted) {
        let i = newUnits.indexOf(unit);
        if (i < 0) debugger;

        newUnits.splice(i, 1);
        newResults.push(`The ${this.getUnitTypeString(unit.type)} in ${unit.region.name} was evicted`);
      }

      for (let [order, reason] of result.reasons) {
        if (newResults.length > 0) newResults.push('');
        newResults.push(`${order}: ${reason}`);
      }

      this.index = this.history.length;
      this.history.push({
        orders: [],
        units: newUnits,
        results: newResults.join('\n'),
      });
    },

    preview(index) {
      this.index = index;
    },

    restore() {
      this.history.splice(this.index + 1);
    },
  },
};
</script>

<style lang="scss">
body,
html {
  margin: 0;
  overflow: hidden;
}
</style>

<style scoped lang="scss">
.content {
  width: 100vw;
  height: 100vh;
}

.section {
  flex: 1 1 0;
}

.textbox {
  flex: 1 1 0;
  overflow-y: auto;
}

pre {
  font-size: 10pt;
  white-space: pre-line;
  font-family: "DejaVu Sans Mono", monospace;
}

p:last-child {
  margin-bottom: 0;
}
</style>
