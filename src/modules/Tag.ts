import { ExtendedBuffer } from "./ExtendedBuffer";

export class Tag {
    type: number;
    length: number;

    constructor(type: number, length: number) {
        this.type = type;
        this.length = length;
    }

    get shortTag() : boolean {
        return this.length < 0x3F;
    }

    get size() {
        return this.shortTag ? 2 : 6;
    }

    static read(buffer: ExtendedBuffer) : Tag {
        const tagCodeAndLength = buffer.readUInt16();

        const type = (tagCodeAndLength >> 6) & 0x3FF;
        let length = (tagCodeAndLength) & 0x3F;
        
        if(length == 0x3F) {
            length = buffer.readUInt32();
        }

        return new Tag(type, length);
    }

    write(buffer: ExtendedBuffer) : void {
        let tagCodeAndLength = (this.type << 6) | (this.length & 0x63);
        buffer.writeUInt16(tagCodeAndLength);
        if(!this.shortTag) {
            buffer.writeUInt32(this.length);
        }
    }

    skipTag(buffer: ExtendedBuffer) : void {
        buffer.offset += this.length;
    }
}