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
        if(this.scaleX == 1 && this.scaleY == 1) {
            return false;
        }
        return this.scaleX != undefined || this.scaleY != undefined;
    }

    get hasRotation() {
        if(this.rotateSkew0 == 0 && this.rotateSkew1 == 0) {
            return false;
        }
        return this.rotateSkew0 != undefined || this.rotateSkew1 != undefined;
    }

    get size() {
        let bits = 2; // hasScale and hasRotation
        if(this.hasScale) {
            bits += 5;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize(Math.floor(((this.scaleX || 0) * 65536) + 0.5), true),
                ExtendedBuffer.getBitSize(Math.floor(((this.scaleY || 0) * 65536) + 0.5), true)
            );
            bits += nbits * 2;
        }
        if(this.hasRotation) {
            bits += 5;
            const nbits = Math.max(
                ExtendedBuffer.getBitSize(Math.floor(((this.rotateSkew0 || 0) * 65536) + 0.5), true),
                ExtendedBuffer.getBitSize(Math.floor(((this.rotateSkew1 || 0) * 65536) + 0.5), true)
            );
            bits += nbits * 2;
        }

        const ntranslateBits = Math.max(
            ExtendedBuffer.getBitSize(Math.floor(this.translateX + 0.5), true),
            ExtendedBuffer.getBitSize(Math.floor(this.translateY + 0.5), true)
        );
        bits += 5;
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

            const scaleX = ExtendedBuffer.truncateTo31Bit(this.scaleX);
            const scaleY = ExtendedBuffer.truncateTo31Bit(this.scaleY);

            const nbits = Math.max(
                ExtendedBuffer.getBitSize(Math.floor((scaleX * 65536) + 0.5), true),
                ExtendedBuffer.getBitSize(Math.floor((scaleY * 65536) + 0.5), true)
            );

            buffer.writeUBits(nbits, 5);

            buffer.writeFBits(scaleX, nbits);
            buffer.writeFBits(scaleY, nbits);
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

            const rotateSkew0 = ExtendedBuffer.truncateTo31Bit(this.rotateSkew0);
            const rotateSkew1 = ExtendedBuffer.truncateTo31Bit(this.rotateSkew1);


            const nbits = Math.max(
                ExtendedBuffer.getBitSize(Math.floor((rotateSkew0 * 65536) + 0.5), true),
                ExtendedBuffer.getBitSize(Math.floor((rotateSkew1 * 65536) + 0.5), true)
            );

            buffer.writeUBits(nbits, 5);

            buffer.writeFBits(rotateSkew0, nbits);
            buffer.writeFBits(rotateSkew1, nbits);
        }

        if(this.translateX == 0 && this.translateY == 0) {
            buffer.writeUBits(0, 5);
        }
        else {
            const translateX = ExtendedBuffer.truncateTo31Bit(this.translateX);
            const translateY = ExtendedBuffer.truncateTo31Bit(this.translateY);
            
            const ntranslateBits = Math.max(
                ExtendedBuffer.getBitSize(Math.floor(translateX + 0.5), true),
                ExtendedBuffer.getBitSize(Math.floor(translateY + 0.5), true)
            );
    
            buffer.writeUBits(ntranslateBits, 5);
    
            buffer.writeBits(translateX, ntranslateBits);
            buffer.writeBits(translateY, ntranslateBits);
        }
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