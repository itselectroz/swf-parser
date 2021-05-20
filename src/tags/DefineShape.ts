import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { Rect } from "../modules/Rect";
import { ShapeWithStyle } from "../modules/ShapeWithStyle";

export class DefineShape {
    id: number;
    bounds: Rect;
    shapes: ShapeWithStyle;
    
    constructor(id: number, bounds: Rect, shapes: ShapeWithStyle) {
        this.id = id;
        this.bounds = bounds;
        this.shapes = shapes;
    }

    static read(buffer: ExtendedBuffer) : DefineShape {
        const id = buffer.readUInt16();
        
        const bounds = Rect.read(buffer);

        const shapes = ShapeWithStyle.read(buffer, 3);

        return new DefineShape(id, bounds, shapes);
    }
}