import { ExtendedBuffer } from "./ExtendedBuffer";
import { RGB } from "./RGB";

export class ARGB extends RGB {
    alpha: number;

    constructor(alpha: number, red: number, green: number, blue: number) {
        super(red, green, blue);
        this.alpha = alpha;
    }

    get size() {
        return super.size + 1;
    }

    write(buffer: ExtendedBuffer) {
        buffer.writeUInt8(this.alpha);
        super.write(buffer);
    }

    static read(buffer: ExtendedBuffer) : ARGB {
        const alpha = buffer.readUInt8();
        const rgb = RGB.read(buffer);
        return new ARGB(rgb.red, rgb.green, rgb.blue, alpha);
    }
}