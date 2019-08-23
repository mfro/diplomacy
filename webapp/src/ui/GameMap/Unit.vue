<template>
  <div class="root" :style="style" @click="$emit('delete')">
    <img :src="image" />
  </div>
</template>

<script>
import { Unit, UnitType } from 'diplomacy-common';

import { positions } from '@/data';

import * as images from './images';

export default {
  name: 'unit',

  props: {
    unit: Unit,
  },

  data() {
    return {
      images,
      style: {
        top: positions[this.unit.region.id][1] + 'px',
        left: positions[this.unit.region.id][0] + 'px',
      },
    };
  },

  computed: {
    image() {
      let key1 = this.unit.type == UnitType.Water ? 'fleet' : 'army';
      let key2 = this.unit.team;
      return this.images[key1][key2];
    },
  },
};
</script>

<style scoped lang="scss">
.root {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
