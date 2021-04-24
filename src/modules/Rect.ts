import { ExtendedBuffer } from "./ExtendedBuffer";

export class Rect {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;

    constructor(xmin: number, xmax: number, ymin: number, ymax: number) {
        this.xmin = xmin;
        this.xmax = xmax;
        this.ymin = ymin;
        this.ymax = ymax;
    }

    get numBits() {
        return Math.max(
            ExtendedBuffer.getBitSize(this.xmin),
            ExtendedBuffer.getBitSize(this.xmax),
            ExtendedBuffer.getBitSize(this.ymin),
            ExtendedBuffer.getBitSize(this.xmax)
        );
    }

    get size() {
        return Math.ceil((5 + this.numBits * 4) / 8);
    }

    static read(buffer: ExtendedBuffer) : Rect{
        buffer.setByteAligned();
        const numBits = buffer.readUBits(5);

        const xmin = buffer.readBits(numBits);
        const xmax = buffer.readBits(numBits);
        const ymin = buffer.readBits(numBits);
        const ymax = buffer.readBits(numBits);

        return new Rect(xmin, xmax, ymin, ymax);
    }

    write(buffer: ExtendedBuffer) {
        buffer.setByteAligned();
        const numBits = this.numBits;
        buffer.writeUBits(numBits, 5);
        buffer.writeBits(this.xmin, numBits);
        buffer.writeBits(this.xmax, numBits);
        buffer.writeBits(this.ymin, numBits);
        buffer.writeBits(this.ymax, numBits);
    }
}