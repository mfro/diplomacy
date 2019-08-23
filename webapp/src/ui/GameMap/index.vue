<template>
  <div>
    <div class="overlay">
      <v-card v-if="hoverRegion" class="ma-3 py-1 px-3">
        <span>{{ hoverRegion.name }}</span>
        <span v-if="hoverOrder">: {{ hoverOrder }}</span>
        <span v-else-if="hoverUnit">: {{ hoverUnit.team }}</span>
      </v-card>
      <v-card v-if="todo.length" class="ma-3 py-1 px-3">{{ todo[0].name }}</v-card>
    </div>

    <div class="overlay">
      <svg class="orders" :viewBox="viewBox">
        <order v-for="order in orders" :key="order.unit.region.id" :order="order" />
      </svg>
    </div>

    <div class="overlay">
      <unit v-for="unit in units" :key="unit.region.id" :unit="unit" />
    </div>

    <canvas ref="canvas" />
  </div>
</template>

<script>
import { maps, UnitType } from 'diplomacy-common';

import { positions } from '@/data';

import Unit from './Unit';
import Order from './Order';
import canvas from './canvas';

export default {
  name: 'game-map',

  components: {
    Unit,
    Order,
  },

  props: {
    units: Array,
    orders: Array,
    readonly: Boolean,
  },

  data() {
    return {
      hoverRegion: null,

      todo: [...maps.standard.map.regions].filter(a => !positions[a.id]),
    };
  },

  computed: {
    viewBox() {
      return `0 0 ${window.innerWidth} ${window.innerHeight}`;
    },

    hoverUnit() {
      return this.hoverRegion && this.units.find(u => u.region == this.hoverRegion);
    },

    hoverOrder() {
      return this.hoverUnit && this.orders.find(u => u.unit == this.hoverUnit);
    },
  },

  mounted() {
    canvas.run(this.$refs.canvas);
    canvas.on('click', this.click);
    canvas.on('hover', this.hover);
  },

  methods: {
    hover(region) {
      this.hoverRegion = region;
    },

    click(region, button, pos) {
      if (this.readonly) {
        return;
      }

      if (this.todo.length) {
        positions[this.todo[0].id] = [pos.x, pos.y];
        this.todo.shift();
        console.log(JSON.stringify(positions));
        return;
      }

      this.$emit('click', [region, button, pos]);
    },
  }
};
</script>

<style scoped lang="scss">
.overlay {
  pointer-events: none;
  position: absolute;
}

.orders {
  width: 100vw;
  height: 100vh;
}

svg,
canvas {
  display: block;
}
</style>
