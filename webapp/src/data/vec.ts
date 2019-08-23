export class Vec {
    static zero = new Vec(0, 0);

    constructor(
        readonly x: number,
        readonly y: number
    ) { }

    get a(): [number, number] { return [this.x, this.y]; }
    get len() { return Math.sqrt(Vec.dot(this, this)); }
    get unit() { return this.scale(1 / this.len); }

    scale(v: number): Vec {
        return this.apply(x => x * v);
    }

    apply(op: (n: number) => number): Vec {
        return new Vec(op(this.x), op(this.y));
    }

    static zip(a: Vec, b: Vec, op: (a: number, b: number) => number): Vec {
        return new Vec(op(a.x, b.x), op(a.y, b.y));
    }

    static add(a: Vec, b: Vec): Vec {
        return this.zip(a, b, (L, R) => L + R);
    }

    static sub(a: Vec, b: Vec): Vec {
        return this.zip(a, b, (L, R) => L - R);
    }

    static dot(a: Vec, b: Vec): number {
        return a.x * b.x + a.y * b.y;
    }

    static hadamard(a: Vec, b: Vec): Vec {
        return this.zip(a, b, (L, R) => L * R);
    }

    static equals(a: Vec, b: Vec, e = 1e-8) {
        return epsilon(a.x, b.x, e) && epsilon(a.y, b.y, e);
    }
}

export function epsilon(a: number, b: number, e = 1e-8) {
    let diff = a - b;
    return diff < e && diff > -e;
}
