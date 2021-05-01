import { ExtendedBuffer } from "./ExtendedBuffer";
import { FillStyleArray } from "./FillStyleArray";
import { LineStyleArray } from "./LineStyleArray";

export class ShapeWithStyle {
    static read(buffer: ExtendedBuffer, level?: number) : ShapeWithStyle {
        level = level || 1;
        const fillStyleArray = FillStyleArray.read(buffer, level);
        const lineStyleArray = LineStyleArray.read(buffer, level);

        const numFillBits = buffer.readUBits(4);
        const numLineBits = buffer.readUBits(4);
        

        return new ShapeWithStyle();
    }
}