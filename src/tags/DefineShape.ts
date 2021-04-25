import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { Rect } from "../modules/Rect";

export class DefineShape {
    id: number;
    bounds: Rect;
    
    constructor(id: number, bounds: Rect) {
        this.id = id;
        this.bounds = bounds;
    }

    static read(buffer: ExtendedBuffer) : DefineShape {
        const id = buffer.readUInt16();
        const bounds = Rect.read(buffer);

        return new DefineShape(id, bounds);
    }
}