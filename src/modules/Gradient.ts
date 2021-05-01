import { ExtendedBuffer } from "./ExtendedBuffer";
import { GradientRecord } from "./GradientRecord";

export enum SpreadMode {
    Pad = 0,
    Reflect = 1,
    Repeat = 2,
    Reserved = 3
}

export enum InterpolationMode {
    Normal = 0,
    Linear = 1,
    Reserved0 = 2,
    Reserved1 = 3
}

export class Gradient {
    spreadMode: SpreadMode;
    interpolationMode: InterpolationMode;
    gradients: GradientRecord[];
    
    constructor(spreadMode: SpreadMode, interpolationMode: InterpolationMode, gradients: GradientRecord[]) {
        this.spreadMode = spreadMode;
        this.interpolationMode = interpolationMode;
        this.gradients = gradients;
    }

    get size() {
        return 1 + this.gradients.reduce((size, v) => size + v.size, 0);
    }

    write(buffer: ExtendedBuffer, level?: number) {
        level = level || 1;

        if(level > 0 && level < 4) {
            if(this.spreadMode != 0) {
                throw new Error(`SpreadMode must be SpreadMode.Pad for DefineShape${level}!`);
            }
            
            if(this.interpolationMode != 0) {
                throw new Error(`InterpolationMode must be InterpolationMode.Normal for DefineShape${level}!`);
            }

            if(this.gradients.length > 8) {
                throw new Error(`Number of gradients cannot exceed 8 for DefineShape${level}!`);
            }
        }
        buffer.writeUBits(this.spreadMode, 2);
        buffer.writeUBits(this.interpolationMode, 2);
        buffer.writeUBits(this.gradients.length, 4);
        
        for(let i = 0; this.gradients.length; i++) {
            this.gradients[i].write(buffer, level);
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : Gradient {
        level = level || 1;

        const spreadMode = buffer.readUBits(2);
        const interpolationMode = buffer.readUBits(2);
        const gradientsLength = buffer.readUBits(4);

        const gradients = [];

        for(let i = 0; i < gradientsLength; i++) {
            gradients.push(GradientRecord.read(buffer, level));
        }

        return new Gradient(spreadMode, interpolationMode, gradients);
    }
}