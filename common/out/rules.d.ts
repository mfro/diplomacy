import { Unit, AnyOrder, MoveOrder } from './game';
export declare function resolve(orders: AnyOrder[]): {
    resolved: MoveOrder[];
    evicted: Unit[];
    reasons: Map<AnyOrder, string>;
};
