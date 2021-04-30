import { ExtendedBuffer } from "./ExtendedBuffer";
import { Gradient, InterpolationMode, SpreadMode } from "./Gradient";
import { GradientRecord } from "./GradientRecord";

export class FocalGradient extends Gradient {
    focalPoint: number;
    
    constructor(spreadMode: SpreadMode, interpolationMode: InterpolationMode, gradients: GradientRecord[], focalPoint: number) {
        super(spreadMode, interpolationMode, gradients);
        this.focalPoint = focalPoint;
    }

    write(buffer: ExtendedBuffer, level?: number) {
        level = level || 1;
        
        if(level < 4) {
            throw new Error(`FocalGradient cannot be used in DefineShape${level}!`);
        }
        
        super.write(buffer, level);

        // Convert focal point to FIXED8
        const focalPoint = this.focalPoint * (1 << 8);
        buffer.writeUInt8(focalPoint);
    }

    static read(buffer: ExtendedBuffer, level?: number) : FocalGradient {
        level = level || 1;

        if(level < 4) {
            throw new Error(`FocalGradient cannot be read from DefineShape${level}!`);
        }

        const gradient = super.read(buffer, level);
        
        const focalPoint = buffer.readUInt8() / (1 << 8);

        return new FocalGradient(gradient.spreadMode, gradient.interpolationMode, gradient.gradients, focalPoint);
    }
}