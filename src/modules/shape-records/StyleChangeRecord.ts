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

    numFillBits?: number;
    numLineBits?: number;

    constructor(stateNewStyles: boolean, stateLineStyle: boolean, stateFillStyle1: boolean, stateFillStyle0: boolean, stateMoveTo: boolean) {
        this.stateNewStyles = stateNewStyles;
        this.stateLineStyle = stateLineStyle;
        this.stateFillStyle1 = stateFillStyle1;
        this.stateFillStyle0 = stateFillStyle0;
        this.stateMoveTo = stateMoveTo;
    }

    get size() {
        return 1;
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