import { inflateSync } from 'zlib';

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

    static getBitSize(value: number) : number {
        return Math.floor(Math.log2(value)) + 1;
    }

    incrementBitOffset(amount: number) : void {
        const newOffset = this.bitOffset + amount;
        this.offset += Math.floor(newOffset / 8);
        this.bitOffset = newOffset % 8;
    }

    setByteAligned() : void {
        if(this.bitOffset != 0) {
            this.offset++;
            this.bitOffset = 0;
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
        this.setByteAligned();
        const count = data.length;
        data.copy(this.buffer, this.offset, 0, count);
        this.offset += count;
    }

    readUInt8() : number {
        this.setByteAligned();
        return this.buffer.readUInt8(this.offset++);
    }

    writeUInt8(value: number) : void {
        this.setByteAligned();
        this.buffer.writeUInt8((value >>> 0) & 0xFF, this.offset++);
    }

    readInt8() : number {
        this.setByteAligned();
        return this.buffer.readInt8(this.offset++);
    }

    writeInt8(value: number) : void {
        this.setByteAligned();
        this.buffer.writeInt8(value, this.offset++);
    }

    readUInt16() : number {
        this.setByteAligned();
        const value: number = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    
    writeUInt16(value: number) : void {
        this.setByteAligned();
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
        this.setByteAligned();
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
        this.setByteAligned();
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
        this.setByteAligned();
        this.buffer.writeInt32LE(value, this.offset);
        this.offset += 4;
    }

    readString() : string {
        const size = this.readUInt16();
        return this.readBytes(size).toString();
    }

    writeString(value: string) : void {
        this.writeUInt16(value.length);
        this.writeBytes(Buffer.from(value));
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
        if(value < 0) {
            value = ((1 << count - 1) | value) & ((1 << count) - 1);
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
        return this.readUBits(count) / (1 << 16);
    }

    writeFBits(value: number, count: number) : void {
        this.writeUBits(value << 16, count);
    }

    zlibInflate() : void {
        this.buffer = Buffer.concat([this.buffer.slice(0, this.offset), inflateSync(this.buffer.slice(this.offset))])
    }
}