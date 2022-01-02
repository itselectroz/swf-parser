import { ITagData } from "../tags/ITagData";
import { ExtendedBuffer } from "./ExtendedBuffer";

export class Tag {
    type: number;
    length: number;

    data?: Buffer;
    tag?: ITagData;

    constructor(type: number, length: number) {
        this.type = type;
        this.length = length;
    }

    get shortTag() : boolean {
        return this.length < 0x3F;
    }

    get size() {
        return (this.shortTag ? 2 : 6) + this.length;
    }

    static read(buffer: ExtendedBuffer, data: boolean = false) : Tag {
        const tagCodeAndLength = buffer.readUInt16();

        const type = (tagCodeAndLength >> 6);
        let length = (tagCodeAndLength) & 0x3F;
        
        if(length == 0x3F) {
            length = buffer.readUInt32();
        }

        const tag = new Tag(type, length);

        if(data) {
            const data: Buffer = buffer.readBytes(length);
            tag.data = data;
        }
        return tag;
    }

    write(buffer: ExtendedBuffer) : void {
        if(!this.shortTag) {
            buffer.writeUInt16((this.type << 6) | 0x3F);
            buffer.writeUInt32(this.length);
        }
        else {
            buffer.writeUInt16((this.type << 6) | (this.length & 0x3F));
        }

        if(!!this.tag) {
            this.tag.write(buffer);
        }
        else if(this.data != undefined) {
            buffer.writeBytes(this.data);
        }
    }

    skipTag(buffer: ExtendedBuffer) : void {
        buffer.offset += this.length;
    }
}