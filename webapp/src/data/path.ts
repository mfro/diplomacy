import { Vec, epsilon } from './vec';

function round(value: number, decimals: number) {
    return Number(Math.round(parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
}

function numToString(num: number) {
    return num.toString();
    // return round(num, 9).toString();
}

function coordToString(vec: Vec) {
    return `${numToString(vec.x)},${numToString(vec.y)}`;
}

function apply(self: Vec, mat2: number[][]) {
    let x = self.x * mat2[0][0] + self.y * mat2[1][0];
    let y = self.x * mat2[0][1] + self.y * mat2[1][1];
    return new Vec(x, y);
}

export interface Segment {
    readonly start: Vec,
    readonly end: Vec,

    bbox(): Bounds;

    render(chain?: Segment): [string, (Vec | number)[]];

    length(): number;
    split(ratio: number): [Segment, Segment];

    apply(mat2: number[][]): Segment;
    reverse(): Segment;
}

export namespace Segment {
    export function equals(a: Segment, b: Segment) {
        let aRender = a.render();
        let bRender = b.render();
        if (aRender[0] != bRender[0] || aRender[1].length != bRender[1].length)
            return false;

        for (let i = 0; i < aRender[1].length; ++i) {
            let left = aRender[1][i];
            let right = aRender[1][i];

            if (left instanceof Vec && right instanceof Vec) {
                if (!Vec.equals(left, right))
                    return false;
            } else if (typeof left == 'number' && typeof right == 'number') {
                if (left != right)
                    return false;
            } else {
                return false;
            }
        }

        return true;
    }
}

export class Bounds {
    constructor(
        readonly min: Vec,
        readonly max: Vec,
    ) { }

    contains(pos: Vec) {
        return pos.x >= this.min.x && pos.y >= this.min.y
            && pos.y <= this.max.x && pos.y <= this.max.y;
    }

    static intersect(a: Bounds, b: Bounds): Bounds | null {
        let min = new Vec(
            Math.max(a.min.x, b.min.x),
            Math.max(a.min.y, b.min.y),
        );

        let max = new Vec(
            Math.min(a.max.x, b.max.x),
            Math.min(a.max.y, b.max.y),
        )

        if (min.x > max.x || min.y > max.y)
            return null;

        return new Bounds(min, max);
    }
}

export namespace Bounds {
    export class Helper {
        private minX?: number;
        private minY?: number;
        private maxX?: number;
        private maxY?: number;

        build() {
            if (this.minX === undefined || this.minY === undefined
                || this.maxX === undefined || this.maxY === undefined)
                throw new Error('Not built');

            return new Bounds(new Vec(this.minX, this.minY), new Vec(this.maxX, this.maxY));
        }

        include(value: Vec) {
            this.includeX(value.x);
            this.includeY(value.y);
        }

        includeX(value: number) {
            if (this.minX === undefined || value < this.minX)
                this.minX = value;
            if (this.maxX === undefined || value > this.maxX)
                this.maxX = value;
        }

        includeY(value: number) {
            if (this.minY === undefined || value < this.minY)
                this.minY = value;
            if (this.maxY === undefined || value > this.maxY)
                this.maxY = value;
        }
    }
}

export class Bezier implements Segment {
    constructor(
        readonly points: Vec[],
    ) { }

    get order() { return this.points.length - 1; }

    get start() { return this.points[0]; }
    get end() { return this.points[this.points.length - 1]; }

    bbox(): Bounds {
        let helper = new Bounds.Helper();

        for (let p of this.points) {
            helper.include(p);
        }

        return helper.build();
    }

    render(chain?: Segment): [string, (Vec | number)[]] {
        if (chain instanceof Bezier && chain.order == this.order &&
            Vec.equals(chain.points[chain.order - 1], this.points[this.order - 1])) {

            return [this.order == 3 ? 'S' : 'T', this.points.slice(2)];
        }

        return [this.order == 3 ? 'C' : 'Q', this.points.slice(1)];
    }

    length(): number {
        let chord = this.points[2].len;
        let net = this.points[0].len
            + Vec.sub(this.points[1], this.points[0]).len
            + Vec.sub(this.points[2], this.points[1]).len;

        return (net + chord) / 2;
    }

    split(ratio: number): [Bezier, Bezier] {
        function* lerp(ratio: number, points: Vec[]) {
            for (let i = 1; i < points.length; ++i) {
                let prev = points[i - 1];
                let curr = points[i];
                let delta = Vec.sub(curr, prev);
                // prev + (curr - prev) * ratio;
                yield Vec.add(prev, delta.scale(ratio));
            }
        }

        let points = this.points;

        let pointsA: Vec[] = [];
        let pointsB: Vec[] = [];

        while (true) {
            pointsA.push(points[0]);
            pointsB.unshift(points[points.length - 1]);

            if (points.length == 1) break;

            points = [...lerp(ratio, points)];
        }

        return [
            new Bezier(pointsA),
            new Bezier(pointsB),
        ];
    }

    apply(mat2: number[][]): Bezier {
        return new Bezier(this.points.map(p => apply(p, mat2)));
    }

    reverse(): Bezier {
        let points = [...this.points].reverse();
        return new Bezier(points);
    }
}

export class Line implements Segment {
    constructor(
        readonly start: Vec,
        readonly end: Vec,
    ) { }

    render(chain?: Segment): [string, (Vec | number)[]] {
        if (epsilon(this.end.x, this.start.x)) {
            return ['V', [this.end.y]];
        }

        if (epsilon(this.end.y, this.start.y)) {
            return ['H', [this.end.x]];
        }

        return ['L', [this.end]];
    }

    bbox(): Bounds {
        let helper = new Bounds.Helper();

        helper.include(this.start);
        helper.include(this.end);

        return helper.build();
    }

    length(): number {
        return Vec.sub(this.end, this.start).len;
    }

    split(ratio: number): [Line, Line] {
        let mid = Vec.add(this.start, Vec.sub(this.end, this.start).scale(ratio));

        if (isNaN(mid.x)) debugger;

        return [
            new Line(this.start, mid),
            new Line(mid, this.end),
        ];
    }

    apply(mat2: number[][]): Line {
        return new Line(apply(this.start, mat2), apply(this.end, mat2));
    }

    reverse(): Line {
        return new Line(this.end, this.start);
    }
}

export class Path {
    constructor(
        readonly parts: Segment[],
    ) { }

    get start() { return this.parts[0].start; }
    get end() { return this.parts[this.parts.length - 1].end; }

    toString() {
        let words = [];

        let code: string | undefined;
        let prev: Segment | undefined;

        for (let part of this.parts) {
            let render;

            if (prev && Vec.equals(prev.end, part.start)) {
                render = part.render(prev);
            } else {
                words.push(`M ${coordToString(part.start)}`);
                render = part.render();
                code = prev = undefined;
            }

            prev = part;
            if (code != render[0]) {
                code = render[0];
                words.push(code);
            }

            for (let arg of render[1]) {
                if (arg instanceof Vec)
                    words.push(coordToString(arg));
                else
                    words.push(numToString(arg));
            }
        }

        return words.join(' ');
    }

    toPath2D() {
        let out = new Path2D(this.toString());

        return out;
    }

    bbox(): Bounds {
        let helper = new Bounds.Helper();

        for (let p of this.parts) {
            let box = p.bbox();
            helper.include(box.min);
            helper.include(box.max);
        }

        return helper.build();
    }

    length(): number {
        let lengths = this.parts.map(s => s.length());
        let total = lengths.reduce((a, b) => a + b, 0);

        return total;
    }

    split(ratio: number): [Path, Path] {
        let lengths = this.parts.map(s => s.length());
        let total = lengths.reduce((a, b) => a + b, 0);
        let target = total * ratio;

        for (let i = 0; i < this.parts.length; ++i) {
            if (target > lengths[i] && !epsilon(target, lengths[i])) {
                target -= lengths[i];
            } else {
                let split = this.parts[i].split(target / lengths[i]);

                let before = this.parts.slice(0, i);
                let after = this.parts.slice(i + 1);

                return [
                    new Path([...before, split[0]]),
                    new Path([split[1], ...after]),
                ];
            }
        }

        throw new Error('?');
    }

    apply(mat2: number[][]) {
        let parts = this.parts.map(p => p.apply(mat2));
        return new Path(parts);
    }

    reverse(): Path {
        let parts = this.parts.map(p => p.reverse()).reverse();
        return new Path(parts);
    }

    disjoints(): Path[] {
        let list = [];
        let point = this.start;
        let split = [];

        for (let part of this.parts) {
            if (!Vec.equals(point, part.start)) {
                list.push(new Path(split));
                split = [];
            }

            split.push(part);
            point = part.end;
        }

        if (split.length > 0)
            list.push(new Path(split));

        return list;
    }

    static join(paths: Path[]) {
        let parts = [];
        for (let island of paths) {
            parts.push(...island.parts);
        }
        return new Path(parts);
    }

    static parse(data: string) {
        return parsePath(data);
    }
}

/*{
    let num = '([-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?)';
    let flag = '(0|1)';
    let delim = '\\s+|\\s*,\\s*';
    let coord = `${num}${delim}${num}`;

    let sequence = (arg: string, delim = '') => `${arg}(${delim}${arg})*`;

    let move = `M\\s*(${sequence(coord)})`
    let line = `M\\s*(${sequence(coord)})`
    let hline = `M\\s*(${sequence(num)})`
    let vline = `V\\s*(${sequence(num)})`
    let close = `Z`
    let cbezier = `C\\s*(${sequence(`${coord}${delim}${coord}${delim}${coord}`)})`
    let sbezier = `S\\s*(${sequence(`${coord}${delim}${coord}`)})`
    let qbezier = `Q\\s*(${sequence(`${coord}${delim}${coord}`)})`
    let tbezier = `T\\s*(${sequence(coord)})`
    let arc = `A\\s*(${sequence(`${coord}${delim}${num}${delim}${flag}${delim}${flag}${delim}${coord}`)})`;
    let command = `\s*(${move}|${line}|${hline}|${vline}|${close}|${cbezier}|${sbezier}|${qbezier}|${tbezier}|${arc})`;

    let regex = new RegExp(command, 'i');
}*/

function parsePath(data: string) {
    function parseBezier(order: number, smooth: boolean) {
        let points = [position];
        if (smooth) {
            let previous = parts[parts.length - 1];

            if (previous instanceof Bezier && previous.points.length == 3)
                points.push(previous.points[2]);
            else
                points.push(position);
        } else {
            points.push(readPoint());
        }

        for (let i = 1; i < order; ++i)
            points.push(readPoint());

        parts.push(new Bezier(points));
        position = points[points.length - 1];
    }

    const commands: { [s: string]: () => void } = {
        M() {
            parse = commands['L'];
            position = readPoint();
            shapeStart = position;
        },
        L() {
            let end = readPoint();
            if (Vec.equals(position, end)) return;
            parts.push(new Line(position, end));
            position = end;
        },
        H() {
            let x = readNum(position.x);
            if (epsilon(position.x, x)) return;
            let end = new Vec(x, position.y)
            parts.push(new Line(position, end));
            position = end;
        },
        V() {
            let y = readNum(position.y);
            if (epsilon(position.y, y)) return;
            let end = new Vec(position.x, y)
            parts.push(new Line(position, end));
            position = end;
        },
        Z() {
            if (Vec.equals(position, shapeStart)) return;
            parts.push(new Line(position, shapeStart));
            position = shapeStart;
        },

        C() { parseBezier(3, false); },
        S() { parseBezier(3, true); },

        Q() { parseBezier(2, true); },
        T() { parseBezier(2, true); },

        A() { throw new Error('not implemented'); },
    };

    data = data.replace(/\s+/g, ' ');

    let shapeStart = Vec.zero;
    let position = Vec.zero;
    let parts: Segment[] = [];
    let index = 0;

    let parse: (() => void) | undefined;
    let delim = false;
    let relative = false;

    while (index < data.length) {
        let regex = /^\s*([MLHVZCSQTA])\s*/i;
        let match = regex.exec(data.substr(index))
        if (match) {
            let code = match[1];
            parse = commands[code.toUpperCase()];
            relative = code == code.toLowerCase();
            index += match[0].length;
            delim = false;
        } else if (!parse) {
            throw new Error('no command');
        }

        parse();
    }

    function readNum(base: number) {
        let regex = /(^[\s,]*)([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;
        let match = regex.exec(data.substr(index));
        if (match == null) throw new Error('invalid argument');
        if (match[1] && !delim) throw new Error('invalid argument');

        index += match[0].length;
        delim = true;

        let value = parseFloat(match[2]);
        if (relative) value += base;

        return value;
    }

    function readPoint() {
        let x = readNum(position.x);
        let y = readNum(position.y);
        return new Vec(x, y);
    }

    return new Path(parts);
}
