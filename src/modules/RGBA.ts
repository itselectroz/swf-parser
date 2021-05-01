import { ExtendedBuffer } from "./ExtendedBuffer";
import { RGB } from "./RGB";

export class RGBA extends RGB {
    alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
        super(red, green, blue);
        this.alpha = alpha;
    }

    get size() {
        return super.size + 1;
    }

    write(buffer: ExtendedBuffer) {
        super.write(buffer);
        buffer.writeUInt8(this.alpha);
    }

    static read(buffer: ExtendedBuffer) : RGBA {
        const rgb = RGB.read(buffer);
        return new RGBA(rgb.red, rgb.green, rgb.blue, buffer.readUInt8());
    }
}