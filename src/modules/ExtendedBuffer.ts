export class ExtendedBuffer {
    buffer: Buffer;
    offset: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    readBytes(count: number) : Buffer {
        const returnBuffer = Buffer.alloc(count);
        this.buffer.copy(returnBuffer, 0, this.offset, this.offset + count);
        this.offset += count;
        return returnBuffer;
    }

    writeBytes(data: Buffer) : void {
        const count = data.length;
        data.copy(this.buffer, this.offset, 0, count);
        this.offset += count;
    }

    readUInt8() : number {
        return this.buffer.readUInt8(this.offset++);
    }

    writeUInt8(value: number) : void {
        this.buffer.writeUInt8(value, this.offset++);
    }

    readInt8() : number {
        return this.buffer.readInt8(this.offset++);
    }

    writeInt8(value: number) : void {
        this.buffer.writeInt8(value, this.offset++);
    }

    readUInt16() : number {
        const value: number = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    
    writeUInt16(value: number) : void {
        this.buffer.writeUInt16LE(value, this.offset);
        this.offset += 2;
    }

    readInt16() : number {
        const value: number = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    
    writeInt16(value: number) : void {
        this.buffer.writeInt16LE(value, this.offset);
        this.offset += 2;
    }

    readUInt32() : number {
        const value: number = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    
    writeUInt32(value: number) : void {
        this.buffer.writeUInt32LE(value, this.offset);
        this.offset += 4;
    }

    readInt32() : number {
        const value: number = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    
    writeInt32(value: number) : void {
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
}