import { ExtendedBuffer } from "./ExtendedBuffer";
import { FillStyle } from "./FillStyle";

export class FillStyleArray {

    static read(buffer: ExtendedBuffer, level?: number) : FillStyleArray {
        level = level || 1;
        let fillStyleCount = buffer.readUInt8();
        if((level == 2 || level == 3) && fillStyleCount == 0xFF) {
            fillStyleCount = buffer.readUInt16();
        }

        let fillStyles: FillStyle[] = [];
        for(let i = 0; i < fillStyleCount; i++) {
            fillStyles[i] = FillStyle.read(buffer, level);
        }

        return new FillStyleArray();
    }
}