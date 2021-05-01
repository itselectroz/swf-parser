import { ExtendedBuffer } from "./ExtendedBuffer";
import { LineStyle } from "./LineStyle";
import { LineStyle2 } from "./LineStyle2";

export type LineStyleEntry = LineStyle | LineStyle2

export class LineStyleArray {
    lineStyles: LineStyleEntry[];

    constructor(lineStyles: LineStyleEntry[]) {
        this.lineStyles = lineStyles;
    }

    get size() {
        return 1 + (this.lineStyles.length > 0xFF ? 2 : 0) + this.lineStyles.reduce((size, v) => size + v.size, 0);
    }
    
    write(buffer: ExtendedBuffer, level?: number) {
        level = level || 1;
        buffer.writeUInt8(this.lineStyles.length & 0xFF);
        if(this.lineStyles.length > 0xFF) {
            buffer.writeUInt16(this.lineStyles.length);
        }

        for(let i = 0; i < this.lineStyles.length; i++) {
            this.lineStyles[i].write(buffer, level);
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : LineStyleArray {
        level = level || 1;
        let lineStyleCount = buffer.readUInt8();

        if(lineStyleCount == 0xFF) {
            lineStyleCount = buffer.readUInt16();
        }

        let lineStyles: LineStyleEntry[] = [];
        for(let i = 0; i < lineStyleCount; i++) {
            lineStyles[i] = level == 4 ? LineStyle2.read(buffer, level) : LineStyle.read(buffer, level);
        }

        return new LineStyleArray(lineStyles);
    }
}