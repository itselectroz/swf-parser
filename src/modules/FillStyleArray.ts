import { ExtendedBuffer } from "./ExtendedBuffer";
import { FillStyle } from "./FillStyle";

export class FillStyleArray {
    fillStyles: FillStyle[];

    constructor(fillStyles: FillStyle[]) {
        this.fillStyles = fillStyles;
    }
    
    write(buffer: ExtendedBuffer, level?: number) {
        level = level || 1;
        buffer.writeUInt8(this.fillStyles.length & 0xFF);
        if(this.fillStyles.length > 0xFF) {
            buffer.writeUInt16(this.fillStyles.length);
        }

        for(let i = 0; i < this.fillStyles.length; i++) {
            this.fillStyles[i].write(buffer, level);
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : FillStyleArray {
        level = level || 1;
        let fillStyleCount = buffer.readUInt8();

        // I don't know if DefineShape4 supports an extended fillstylecount - the specification says ONLY shape 2 and 3 so I'm going to assume it doesn't
        if((level == 2 || level == 3) && fillStyleCount == 0xFF) {
            fillStyleCount = buffer.readUInt16();
        }

        let fillStyles: FillStyle[] = [];
        for(let i = 0; i < fillStyleCount; i++) {
            fillStyles[i] = FillStyle.read(buffer, level);
        }

        return new FillStyleArray(fillStyles);
    }
}