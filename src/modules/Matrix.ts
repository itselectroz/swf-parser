import { ExtendedBuffer } from "./ExtendedBuffer";

export class Matrix {
    scaleX?: number;
    scaleY?: number;

    rotateSkew0?: number;
    rotateSkew1?: number;

    translateX: number;
    translateY: number;

    constructor(scaleX?: number, scaleY?: number, rotateSkew0?: number, rotateSkew1?: number, translateX?: number, translateY?: number) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.rotateSkew0 = rotateSkew0;
        this.rotateSkew1 = rotateSkew1;
        this.translateX = translateX || 0;
        this.translateY = translateY || 0;
    }

    
    
    static read(buffer: ExtendedBuffer) : Matrix {
        const matrix = new Matrix();

        if(buffer.readUBits(1) != 0) { // has scale
            const nbits = buffer.readUBits(5);

            matrix.scaleX = buffer.readFBits(nbits);
            matrix.scaleY = buffer.readFBits(nbits);
        }

        if(buffer.readUBits(1) != 0) { // has rotation
            const nbits = buffer.readUBits(5);

            matrix.rotateSkew0 = buffer.readFBits(nbits);
            matrix.rotateSkew1 = buffer.readFBits(nbits);
        }

        const ntranslateBits = buffer.readUBits(5);
        matrix.translateX = buffer.readBits(ntranslateBits);
        matrix.translateY = buffer.readBits(ntranslateBits);

        return matrix;
    }
}