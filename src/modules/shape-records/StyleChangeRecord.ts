import { ExtendedBuffer } from "../ExtendedBuffer";
import { FillStyleArray } from "../FillStyleArray";
import { LineStyleArray } from "../LineStyleArray";
import { EndShapeRecord } from "./EndShapeRecord";

export class StyleChangeRecord {
    type: number = 0;
    stateNewStyles: boolean;
    stateLineStyle: boolean;
    stateFillStyle1: boolean;
    stateFillStyle0: boolean;
    stateMoveTo: boolean;

    moveDeltaX?: number;
    moveDeltaY?: number;
    
    fillStyle0?: number;
    fillStyle1?: number;

    lineStyle?: number;

    fillStyles?: FillStyleArray;
    lineStyles?: LineStyleArray;

    numFillBits?: number; // read only
    numLineBits?: number; // read only

    constructor(stateNewStyles: boolean, stateLineStyle: boolean, stateFillStyle1: boolean, stateFillStyle0: boolean, stateMoveTo: boolean) {
        this.stateNewStyles = stateNewStyles;
        this.stateLineStyle = stateLineStyle;
        this.stateFillStyle1 = stateFillStyle1;
        this.stateFillStyle0 = stateFillStyle0;
        this.stateMoveTo = stateMoveTo;
    }

    get size() {
        // I really shouldn't have this as 1 statement...
        // Also: This is inaccurate, realistically I need to know the value of fillBits and lineBits,
        // here we are just estimating it. I doubt this will EVER be a problem... but it's possible.
        return 1 + (this.stateMoveTo ? 1 : 0) + 
            (this.stateMoveTo ? 1 + Math.ceil(Math.max(
                ExtendedBuffer.getBitSize(this.moveDeltaX as number),
                ExtendedBuffer.getBitSize(this.moveDeltaY as number)
            ) / 4) : 0) +
            (this.stateFillStyle0 ? Math.ceil(ExtendedBuffer.getBitSize(this.fillStyle0 as number) / 8) : 0) +
            (this.stateFillStyle1 ? Math.ceil(ExtendedBuffer.getBitSize(this.fillStyle1 as number) / 8) : 0) +
            (this.stateLineStyle ? Math.ceil(ExtendedBuffer.getBitSize(this.lineStyle as number) / 8) : 0) +
            (this.stateNewStyles ? (this.fillStyles as FillStyleArray).size + (this.lineStyles as LineStyleArray).size + Math.ceil(ExtendedBuffer.getBitSize(this.fillStyles?.fillStyles.length as number) / 8) + Math.ceil(ExtendedBuffer.getBitSize(this.lineStyles?.lineStyles.length as number) / 8) : 0);
    }

    write(buffer: ExtendedBuffer, fillBits: number, lineBits: number, level?: number) {
        buffer.writeBits(this.stateNewStyles ? 1 : 0, 1);
        buffer.writeBits(this.stateLineStyle ? 1 : 0, 1);
        buffer.writeBits(this.stateFillStyle1 ? 1 : 0, 1);
        buffer.writeBits(this.stateFillStyle0 ? 1 : 0, 1);
        buffer.writeBits(this.stateMoveTo ? 1 : 0, 1);

        if(this.stateMoveTo) {
            const nbits = Math.max(
                ExtendedBuffer.getBitSize(this.moveDeltaX as number),
                ExtendedBuffer.getBitSize(this.moveDeltaY as number)
            );

            buffer.writeUBits(nbits, 5);
            buffer.writeBits(this.moveDeltaX as number, nbits);
            buffer.writeBits(this.moveDeltaY as number, nbits);
        }

        if(this.stateFillStyle0) {
            buffer.writeUBits(this.fillStyle0 as number, fillBits);
        }

        if(this.stateFillStyle1) {
            buffer.writeUBits(this.fillStyle1 as number, fillBits);
        }

        if(this.stateLineStyle) {
            buffer.writeUBits(this.lineStyle as number, lineBits);
        }

        if(this.stateNewStyles) {
            this.fillStyles?.write(buffer, level);
            this.lineStyles?.write(buffer, level);

            const nFillBits = ExtendedBuffer.getBitSize(this.fillStyles?.fillStyles.length as number);
            const nLineBits = ExtendedBuffer.getBitSize(this.lineStyles?.lineStyles.length as number);

            buffer.writeUBits(nFillBits, 4);
            buffer.writeUBits(nLineBits, 4);
        }
    }

    static read(buffer: ExtendedBuffer, fillBits: number, lineBits: number, level?: number) : StyleChangeRecord | EndShapeRecord {
        level = level || 1;

        const stateNewStyles = buffer.readBits(1) != 0;
        const stateLineStyle = buffer.readBits(1) != 0;
        const stateFillStyle1 = buffer.readBits(1) != 0;
        const stateFillStyle0 = buffer.readBits(1) != 0;
        const stateMoveTo = buffer.readBits(1) != 0;

        if(!stateNewStyles && !stateLineStyle && !stateFillStyle1 && !stateFillStyle0 && !stateMoveTo) {
            return new EndShapeRecord();
        }

        const result = new StyleChangeRecord(stateNewStyles, stateLineStyle, stateFillStyle1, stateFillStyle0, stateMoveTo);

        if(stateMoveTo) {
            const moveBits = buffer.readUBits(5);        
            result.moveDeltaX = buffer.readBits(moveBits);
            result.moveDeltaY = buffer.readBits(moveBits);
        }

        if(stateFillStyle0) {
            result.fillStyle0 = buffer.readUBits(fillBits);
        }

        if(stateFillStyle1) {
            result.fillStyle1 = buffer.readUBits(fillBits);
        }

        if(stateLineStyle) {
            result.lineStyle = buffer.readUBits(lineBits);
        }

        if(stateNewStyles) {
            result.fillStyles = FillStyleArray.read(buffer, level);
            result.lineStyles = LineStyleArray.read(buffer, level);

            result.numFillBits = buffer.readUBits(4);
            result.numLineBits = buffer.readUBits(4);
        }

        return result;
    }
}