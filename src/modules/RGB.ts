import { ExtendedBuffer } from "./ExtendedBuffer";

export class RGB {
    red: number;
    green: number;
    blue: number;

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    write(buffer: ExtendedBuffer) {
        buffer.writeUInt8(this.red);
        buffer.writeUInt8(this.green);
        buffer.writeUInt8(this.blue);
    }

    static read(buffer: ExtendedBuffer) : RGB {
        return new RGB(buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8());
    }
}