import { ExtendedBuffer } from "./ExtendedBuffer";
import { RGB } from "./RGB";
import { RGBA } from "./RGBA";

export class LineStyle {
    width: number;
    color: RGB | RGBA;

    constructor(width: number, color: RGB | RGBA) {
        this.width = width;
        this.color = color;
    }

    get size() {
        return 2 + this.color.size;
    }

    // level is functionally useless, I have kept it in to remind me and others that the output size can vary
    write(buffer: ExtendedBuffer, level?: number) : void {
        buffer.writeUInt16(this.width);
        this.color.write(buffer);
    }

    static read(buffer: ExtendedBuffer, level?: number) : LineStyle {
        level = level || 1;

        const width = buffer.readUInt16();
        const color = level == 3 ? RGBA.read(buffer) : RGB.read(buffer);

        return new LineStyle(width, color);
    }
}