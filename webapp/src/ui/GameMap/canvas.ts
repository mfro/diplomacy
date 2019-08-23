import { UnitType } from 'diplomacy-common';

import { deadzones, allRegions, Area } from '../../data';
import { Vec } from '../../data/vec';

const events = new Map<string, Function[]>();

let bbox = [
    new Vec(557.6677246, 16.4444447),
    new Vec(1709.666626, 981.4444447),
];

function run(canvas: HTMLCanvasElement) {
    let scale = window.innerHeight / (bbox[1].y - bbox[0].y);

    canvas.width = (bbox[1].x - bbox[0].x) * scale;
    canvas.height = window.innerHeight;

    let transform = [[scale, 0], [0, scale]];

    let context = canvas.getContext('2d')!;

    let paths = new Map<Area, Path2D>();
    let deadPaths = deadzones.map(p => p.apply(transform).toPath2D());

    let hover: Area | undefined;
    let changed: Area[] = [];

    for (let t of allRegions) {
        let path = t.path.apply(transform);
        paths.set(t, path.toPath2D());
    }

    changed.push(...allRegions);

    function render() {
        changed.sort((a, b) => b.region.type - a.region.type);

        for (let t of changed) {
            if (t.region.type == UnitType.Land)
                context.strokeStyle = '1px black';
            else
                context.strokeStyle = '0.8px black';

            let path = paths.get(t)!;
            if (hover && hover == t) {
                context.fillStyle = '#388e3c';
            } else {
                if (t.region.type == UnitType.Land) {
                    context.fillStyle = '#98674c';
                } else {
                    context.fillStyle = '#5C6BC0';
                }
            }

            context.fill(path);
            context.stroke(path);
        }

        context.fillStyle = 'white';
        context.strokeStyle = '1px black';
        for (let path of deadPaths) {
            context.fill(path);
            context.stroke(path);
        }
        if (changed.length > 0) changed = [];
        requestAnimationFrame(render);
    }

    window.addEventListener('mouseout', e => {
        if (hover) {
            changed.push(hover);
        }

        hover = undefined;
        emit('hover', undefined);
    });

    canvas.addEventListener('mousemove', e => {
        let node = allRegions.find(t => context.isPointInPath(paths.get(t)!, e.offsetX, e.offsetY));
        if (node == hover) return;

        if (hover) {
            changed.push(hover);
        }

        hover = node;
        emit('hover', hover && hover.region);

        if (hover) {
            changed.push(hover);
        }
    });

    canvas.addEventListener('mousedown', e => {
        if (!hover) return;
        emit('click', hover.region, e.button, new Vec(e.offsetX, e.offsetY));
    });

    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false;
    });

    render();
}

function emit(event: string, ...args: any[]) {
    let list = events.get(event);
    if (list == null) return;
    for (let fn of list) fn.apply(null, args);
}

function on(event: string, callback: Function) {
    let list = events.get(event);
    if (!list) events.set(event, list = []);
    list.push(callback);
}

export default {
    run,
    on,
};
