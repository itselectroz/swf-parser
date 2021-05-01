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

    get hasScale() {
        return this.scaleX != undefined || this.scaleY != undefined;
    }

    get hasRotation() {
        return this.rotateSkew0 != undefined || this.rotateSkew1 != undefined;
    }

    get size() {
        let bits = 2; // hasScale and hasRotation
        if(this.hasScale) {
            bits += 5;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize((this.scaleX || 0) << 16),
                ExtendedBuffer.getBitSize((this.scaleY || 0) << 16)
            );
            bits += nbits * 2;
        }
        if(this.hasRotation) {
            bits += 5;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize((this.rotateSkew0 || 0) << 16),
                ExtendedBuffer.getBitSize((this.rotateSkew1 || 0) << 16)
            );
            bits += nbits * 2;
        }

        const ntranslateBits = Math.max(
            ExtendedBuffer.getBitSize(this.translateX),
            ExtendedBuffer.getBitSize(this.translateY)
        );
        bits += ntranslateBits * 2;
        return Math.ceil(bits / 8);
    }

    write(buffer: ExtendedBuffer) {
        const hasScale = this.hasScale;
        buffer.writeUBits(hasScale ? 1 : 0, 1);
        if(this.hasScale) {
            if(this.scaleX == undefined) {
                this.scaleX = 1;
            }
            if(this.scaleY == undefined) {
                this.scaleY = 1;
            }

            const fScaleX = this.scaleX << 16;
            const fScaleY = this.scaleY << 16;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize(fScaleX),
                ExtendedBuffer.getBitSize(fScaleY)
            );

            buffer.writeUBits(nbits, 5);

            buffer.writeFBits(this.scaleX, nbits);
            buffer.writeFBits(this.scaleY, nbits);
        }

        const hasRotation = this.hasRotation;
        buffer.writeUBits(hasRotation ? 1 : 0, 1);
        if(this.hasRotation) {
            if(this.rotateSkew0 == undefined) {
                this.rotateSkew0 = 1;
            }
            if(this.rotateSkew1 == undefined) {
                this.rotateSkew1 = 1;
            }

            const frotateSkew0 = this.rotateSkew0 << 16;
            const frotateSkew1 = this.rotateSkew1 << 16;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize(frotateSkew0),
                ExtendedBuffer.getBitSize(frotateSkew1)
            );

            buffer.writeUBits(nbits, 5);

            buffer.writeFBits(this.rotateSkew0, nbits);
            buffer.writeFBits(this.rotateSkew1, nbits);
        }

        const ntranslateBits = Math.max(
            ExtendedBuffer.getBitSize(this.translateX),
            ExtendedBuffer.getBitSize(this.translateY)
        );
        buffer.writeBits(this.translateX, ntranslateBits);
        buffer.writeBits(this.translateY, ntranslateBits);
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