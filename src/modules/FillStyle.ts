import { ExtendedBuffer } from "./ExtendedBuffer";
import { FocalGradient } from "./FocalGradient";
import { Gradient } from "./Gradient";
import { Matrix } from "./Matrix";
import { RGB } from "./RGB";
import { RGBA } from "./RGBA";

export class FillStyle {
    type: number;
    color?: RGB | RGBA;
    
    gradientMatrix?: Matrix;
    gradient?: Gradient | FocalGradient;

    bitmapId?: number;
    bitmapMatrix?: Matrix;

    constructor(type: number) {
        this.type = type;
    }

    get size() {
        let size = 1;
        switch(this.type) {
            case 0: {
                if(!this.color) {
                    throw new Error(`FillStyle with type ${this.type} is missing color`);
                }
                size += this.color.size;
                break;
            }
            case 0x10:
            case 0x12:
            case 0x13: {
                if(!this.gradientMatrix) {
                    throw new Error(`FillStyle with type ${this.type} is missing gradient matrix`);
                }
                if(!this.gradient) {
                    throw new Error(`FillStyle with type ${this.type} is missing gradient`);
                }
                size += this.gradientMatrix.size;
                size += this.gradient.size;
                break;
            }
            case 0x40:
            case 0x41:
            case 0x42:
            case 0x43: {
                if(this.bitmapId == undefined || !this.bitmapMatrix) {
                    throw new Error(`FillStyle with type ${this.type} is missing bitmap data.`);
                }
                size += 2;
                size += this.bitmapMatrix.size;
                break;
            }
        }
        return size;
    }

    write(buffer: ExtendedBuffer, level?: number) {
        level = level || 1;

        buffer.writeUInt8(this.type);

        // I should really add checks to ensure these objects exist.
        switch(this.type) {
            case 0: {
                if(!this.color) {
                    throw new Error(`FillStyle with type ${this.type} is missing color`);
                }
                this.color?.write(buffer);
                break;
            }
            case 0x10:
            case 0x12:
            case 0x13: {
                if(!this.gradientMatrix) {
                    throw new Error(`FillStyle with type ${this.type} is missing gradient matrix`);
                }
                if(!this.gradient) {
                    throw new Error(`FillStyle with type ${this.type} is missing gradient`);
                }
                this.gradientMatrix?.write(buffer);
                this.gradient?.write(buffer, level);
                break;
            }
            case 0x40:
            case 0x41:
            case 0x42:
            case 0x43: {
                if(this.bitmapId == undefined || !this.bitmapMatrix) {
                    throw new Error(`FillStyle with type ${this.type} is missing bitmap data.`);
                }
                buffer.writeUInt16(this.bitmapId);
                this.bitmapMatrix.write(buffer);
                break;
            }
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : FillStyle {
        level = level || 1;

        const type = buffer.readUInt8();

        const result = new FillStyle(type);

        switch(type) {
            case 0: {
                result.color = level == 3 ? RGBA.read(buffer) : RGB.read(buffer);
                break;
            }
            case 0x10:
            case 0x12:
            case 0x13: {
                result.gradientMatrix = Matrix.read(buffer);
                result.gradient = type == 0x13 ? FocalGradient.read(buffer, level) : Gradient.read(buffer, level);
                break;
            }
            case 0x40:
            case 0x41:
            case 0x42:
            case 0x43: {
                result.bitmapId = buffer.readUInt16();
                result.bitmapMatrix = Matrix.read(buffer);
                break;
            }
        }

        return result;
    }
}