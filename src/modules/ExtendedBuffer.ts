import { deflateSync, inflateSync } from 'zlib';

export const MASKS = [0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535,131071,262143,524287,1048575,2097151,4194303,8388607,16777215,33554431,67108863,134217727,268435455,536870911,1073741823,2147483647,-1];

export class ExtendedBuffer {
    buffer: Buffer;
    offset: number;

    bitOffset: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.offset = 0;
        this.bitOffset = 0;
    }

    get bytesAvailable() {
        return this.buffer.length - this.offset;
    }

    static getBitSize(value: number, signed: boolean = false) : number {
        if(signed) {
            let counter = 32;
            let mask = 0x80000000;
            let val = (value < 0) ? -value : value;
            while (((val & mask) == 0) && (counter > 0)) {
                mask >>>= 1;
                counter -= 1;
            }
            return counter + 1;
        }
        else {
            if (value == 0) {
                return 0;
            }
    
            value = Math.abs(value);
            let x = 1;
            let nBits;
    
            for (nBits = 1; nBits <= 64; nBits++) {
                x <<= 1;
                if (x > value) {
                    break;
                }
            }
            return nBits;
        }
    }

    static truncateTo31Bit(value: number) : number {
        if (value > 0x3fffffff) {
            value = 0x3fffffff;
        }
        if (value < -0x3fffffff) {
            value = -0x3fffffff;
        }
        return value;
    }

    resize(size: number) : void {
        const newBuffer = Buffer.alloc(size);
        this.buffer.copy(newBuffer);
        this.buffer = newBuffer;
    }

    incrementBitOffset(amount: number) : void {
        const newOffset = this.bitOffset + amount;
        this.offset += Math.floor(newOffset / 8);
        this.bitOffset = newOffset % 8;
    }

    setByteAligned(write?: boolean) : void {
        if(this.bitOffset != 0) {
            if(write) {
                this.writeUBits(0, 8 - this.bitOffset);
            }
            else {
                this.offset++;
                this.bitOffset = 0;
            }
        }
    }

    readBytes(count: number) : Buffer {
        this.setByteAligned();
        const returnBuffer = Buffer.alloc(count);
        this.buffer.copy(returnBuffer, 0, this.offset, this.offset + count);
        this.offset += count;
        return returnBuffer;
    }

    writeBytes(data: Buffer) : void {
        this.setByteAligned(true);
        const count = data.length;
        data.copy(this.buffer, this.offset, 0, count);
        this.offset += count;
    }

    readUInt8() : number {
        this.setByteAligned();
        return this.buffer.readUInt8(this.offset++);
    }

    writeUInt8(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeUInt8((value >>> 0) & 0xFF, this.offset++);
    }

    readInt8() : number {
        this.setByteAligned();
        return this.buffer.readInt8(this.offset++);
    }

    writeInt8(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeInt8(value, this.offset++);
    }

    readUInt16() : number {
        this.setByteAligned();
        const value: number = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    
    writeUInt16(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeUInt16LE((value >>> 0) & 0xFFFF, this.offset);
        this.offset += 2;
    }

    readInt16() : number {
        this.setByteAligned();
        const value: number = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    
    writeInt16(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeInt16LE(value, this.offset);
        this.offset += 2;
    }

    readUInt32() : number {
        this.setByteAligned();
        const value: number = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    
    writeUInt32(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeUInt32LE(value >>> 0, this.offset);
        this.offset += 4;
    }

    readInt32() : number {
        this.setByteAligned();
        const value: number = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    
    writeInt32(value: number) : void {
        this.setByteAligned(true);
        this.buffer.writeInt32LE(value, this.offset);
        this.offset += 4;
    }

    readString() : string {
        let str = "";

        let bit = this.readUInt8();
        while(bit != 0) {
            str += String.fromCharCode(bit);
            bit = this.readUInt8();
        }
        
        return str;
    }

    writeString(value: string) : void {
        for(let i = 0; i < value.length; i++) {
            this.writeUInt8(value.charCodeAt(i));
        }
        this.writeUInt8(0);
    }

    readBits(count: number) : number {
        const originalCount = count;

        let result = 0;

        while(count > 0) {
            const byteOffset = this.offset;
            const bitOffset = this.bitOffset;

            const bitsRemaining = 8 - bitOffset;

            let bitsRead;
            if(count < bitsRemaining) {
                bitsRead = count;
            }
            else {
                bitsRead = bitsRemaining;
            }

            const bits = (this.buffer[byteOffset] & MASKS[bitsRemaining]) >>> (bitsRemaining - bitsRead);

            result |= bits << (count - bitsRead);

            count -= bitsRead;
            this.incrementBitOffset(bitsRead);
        }


        if(result & (1 << originalCount - 1)) {
            result = ~result & ((1 << originalCount - 1) - 1);
            result = -(result + 1);
        }

        return result;
    }

    writeBits(value: number, count: number) : void {
        const byteCount = Math.ceil(count / 8);
        if(byteCount > this.bytesAvailable) {
            this.resize(this.offset + byteCount);
        }

        while(count > 0) {
            const byteOffset = this.offset;
            const bitOffset = this.bitOffset;

            const bitsRemaining = 8 - bitOffset;

            let bitsToWrite;
            if(count < bitsRemaining) {
                bitsToWrite = count;
            }
            else {
                bitsToWrite = bitsRemaining;
            }

            const bits = (value & MASKS[count]) >>> (count - bitsToWrite);
            this.buffer[byteOffset] |= bits << (bitsRemaining - bitsToWrite);

            count -= bitsToWrite;
            this.incrementBitOffset(bitsToWrite);
        }
    }

    readUBits(count: number) : number {
        return this.readBits(count) & ((1 << count) - 1);
    }

    writeUBits(value: number, count: number) : void {
        this.writeBits(value & ((1 << count) - 1), count);
    }

    readFBits(count: number) : number {
        return this.readBits(count) / (1 << 16);
    }

    writeFBits(value: number, count: number) : void {
        this.writeBits(Math.floor((value * 65536) + 0.5), count);
    }

    zlibInflate() : void {
        this.buffer = Buffer.concat([this.buffer.slice(0, this.offset), inflateSync(this.buffer.slice(this.offset))])
    }

    zlibDeflate(offset: number = 8) : void {
        this.buffer = Buffer.concat([this.buffer.slice(0, offset), deflateSync(this.buffer.slice(offset), {
            level: 7
        })])
    }
}