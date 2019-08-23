<template>
  <g class="root">
    <path
      v-for="(path, i) in paths"
      :key="i"
      :d="path.path"
      :style="path.style"
      :transform="path.transform"
    />
  </g>
</template>

<script>
import { Unit, UnitType, MoveOrder, SupportOrder, ConvoyOrder } from 'diplomacy-common';

import { Path, Line } from '@/data/path';
import { Vec } from '@/data/vec';
import { positions } from '@/data';

function pos(region) {
  let data = positions[region.id];
  return new Vec(data[0], data[1]);
}

function arrowPath(list, color, start, end) {
  list.push({
    path: new Path([new Line(start, end)]),
    style: {
      stroke: color,
    }
  });

  let mid = Vec.add(start, end).scale(0.5);
  let diff = Vec.sub(end, start);
  let degs = Math.atan2(diff.y, diff.x) / Math.PI * 180;

  list.push({
    path: 'M -5 -5 L 5 0 L -5 5 z',
    transform: `translate(${mid.x},${mid.y}) rotate(${degs})`,
    style: {
      fill: color,
      stroke: color,
    }
  });
}

function circlePath(list, color, start, end) {
  list.push({
    path: new Path([new Line(start, end)]),
    style: {
      stroke: color,
    }
  });

  let mid = Vec.add(start, end).scale(0.5);

  list.push({
    path: 'M -5 0 A 5 5 0 1 1 5 0 A 5 5 0 1 1 -5 0',
    transform: `translate(${mid.x},${mid.y})`,
    style: {
      fill: color,
      stroke: color,
    }
  });
}

export default {
  name: 'order',

  props: {
    order: Object,
  },

  data() {
    let o = pos(this.order.unit.region);

    let paths = [];

    if (this.order instanceof MoveOrder) {
      arrowPath(paths, 'black', o, pos(this.order.target));
    }

    if (this.order instanceof ConvoyOrder) {
      circlePath(paths, 'darkblue', o, pos(this.order.start));
      arrowPath(paths, 'darkblue', o, pos(this.order.end));
    }

    if (this.order instanceof SupportOrder) {
      circlePath(paths, 'darkGreen', o, pos(this.order.target));
      if (this.order.attack) {
        arrowPath(paths, 'darkGreen', o, pos(this.order.attack));
      }
    }

    return { paths };
  },

};
</script>

<style scoped lang="scss">
path {
  stroke: black;
  stroke-width: 5px;
  stroke-linecap: round;

  &.convoy {
    stroke: darkblue;
  }

  &.supp {
    stroke: darkgreen;
  }
}
</style>
