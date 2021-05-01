import { ExtendedBuffer } from "./ExtendedBuffer";
import { RGB } from "./RGB";
import { RGBA } from "./RGBA";

export class GradientRecord {
    ratio: number;
    color: RGB | RGBA;

    constructor(ratio: number, color: RGB | RGBA) {
        this.ratio = ratio;
        this.color = color;
    }

    get size() {
        return 1 + (this.color instanceof RGBA ? 4 : 3);
    }

    /*
        The level parameter here is useless HOWEVER I have kept it
        in to remind me and others that the output size can vary
    */
    write(buffer: ExtendedBuffer, level?: number) : void {
        level = level || 1;
        buffer.writeUInt8(this.ratio);
        
        this.color.write(buffer);
    }

    static read(buffer: ExtendedBuffer, level?: number) : GradientRecord {
        const ratio = buffer.readUInt8();

        const color = level == 3 ? RGBA.read(buffer) : RGB.read(buffer);

        return new GradientRecord(ratio, color);
    }
}