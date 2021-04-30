import { ExtendedBuffer } from "./ExtendedBuffer";
import { RGB } from "./RGB";
import { RGBA } from "./RGBA";

export class FillStyle {
    type: number;
    color?: RGB | RGBA;

    static read(buffer: ExtendedBuffer, level?: number) : FillStyle {
        level = level || 1;

        const type = buffer.readUInt8();

        const result = new FillStyle();

        switch(type) {
            case 0: {
                result.color = level == 3 ? RGBA.read(buffer) : RGB.read(buffer);
                break;
            }
            case 0x10:
            case 0x12:
            case 0x13: {
                
                break;
            }
        }

        return result;
    }
}