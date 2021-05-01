import { ExtendedBuffer } from "./ExtendedBuffer";
import { FillStyle } from "./FillStyle";
import { RGBA } from "./RGBA";

export enum CapStyle {
    Round = 0,
    None = 1,
    Square = 2
};

export enum JoinStyle {
    Round = 0,
    Bevel = 1,
    Miter = 2
};

export class LineStyle2 {
    width: number;
    startCapStyle: CapStyle;
    joinStyle: JoinStyle;
    hasFillFlag: boolean;
    noHScaleFlag: boolean;
    noVScaleFlag: boolean;
    pixelHintingFlag: boolean;
    noClose: boolean;
    endCapStyle: CapStyle;

    miterLimitFactor?: number;
    color?: RGBA;
    fillType?: FillStyle;

    constructor(width: number, startCapStyle: CapStyle, joinStyle: JoinStyle, hasFillFlag: boolean, noHScaleFlag: boolean, noVScaleFlag: boolean, pixelHintingFlag: boolean, noClose: boolean, endCapStyle: CapStyle) {
        this.width = width;
        this.startCapStyle = startCapStyle;
        this.joinStyle = joinStyle;
        this.hasFillFlag = hasFillFlag;
        this.noHScaleFlag = noHScaleFlag;
        this.noVScaleFlag = noVScaleFlag;
        this.pixelHintingFlag = pixelHintingFlag;
        this.noClose = noClose;
        this.endCapStyle = endCapStyle;
    }

    get size() {
        return 2 + 2 + (this.joinStyle == JoinStyle.Miter ? 2 : 0) + (this.hasFillFlag ? (this.fillType as FillStyle).size : (this.color as RGBA).size);
    }

    write(buffer: ExtendedBuffer, level?: number) : void {
        buffer.writeUInt16(this.width);
        buffer.writeUBits(this.startCapStyle, 2);
        buffer.writeUBits(this.joinStyle, 2);
        buffer.writeUBits(this.hasFillFlag ? 1 : 0, 1);
        buffer.writeUBits(this.noHScaleFlag ? 1 : 0, 1);
        buffer.writeUBits(this.noVScaleFlag ? 1 : 0, 1);
        buffer.writeUBits(this.pixelHintingFlag ? 1 : 0, 1);
        buffer.writeUBits(0, 5);
        buffer.writeUBits(this.noClose ? 1 : 0, 1);
        buffer.writeUBits(this.endCapStyle, 2);

        if(this.joinStyle == JoinStyle.Miter) {
            buffer.writeUInt16(this.miterLimitFactor as number);
        }

        if(this.hasFillFlag == false) {
            this.color?.write(buffer);
        }
        else {
            this.fillType?.write(buffer);
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : LineStyle2 {
        const width = buffer.readUInt16();
        const startCapStyle = buffer.readUBits(2);
        const joinStyle = buffer.readUBits(2);
        const hasFillFlag = buffer.readUBits(1) == 1;
        const noHScaleFlag = buffer.readUBits(1) == 1;
        const noVScaleFlag = buffer.readUBits(1) == 1;
        const pixelHintingFlag = buffer.readUBits(1) == 1;
        if(buffer.readUBits(5) != 0) { // reserved should be 0
            throw new Error(`Error reading LineStyle2: Reserved was not 0.`);
        }
        const noClose = buffer.readUBits(1) == 1;
        const endCapStyle = buffer.readUBits(2);

        const result = new LineStyle2(width, startCapStyle, joinStyle, hasFillFlag, noHScaleFlag, noVScaleFlag, pixelHintingFlag, noClose, endCapStyle);

        if(joinStyle == JoinStyle.Miter) {
            result.miterLimitFactor = buffer.readUInt16();
        }

        if(hasFillFlag == false) {
            result.color = RGBA.read(buffer);
        }
        else {
            result.fillType = FillStyle.read(buffer);
        }

        return result;
    }
}