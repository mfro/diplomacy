import { MoveOrder, HoldOrder, SupportOrder, ConvoyOrder, Unit, UnitType } from "./game";

export default {
    header(obj: any, config: any) {
        if (obj instanceof MoveOrder || obj instanceof HoldOrder || obj instanceof SupportOrder || obj instanceof ConvoyOrder) {
            return ["span", {}, obj.toString()];
        }

        if (obj instanceof Unit) {
            return ["span", {}, `${obj.team} ${obj.type == UnitType.Water ? 'fleet' : 'army'} in ${obj.region.name}`];
        }

        return null;
    },
    hasBody(obj: any, config: any) {
        return false;
    },
    body(obj: any, config: any) {
    }
};
