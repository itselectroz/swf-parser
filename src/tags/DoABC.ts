import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { ITagData } from "./ITagData";

export class DoABC implements ITagData{
    flags: number;
    name: string;
    ABCData: Buffer;
    
    constructor(flags: number, name: string, abcdata: Buffer) {
        this.flags = flags;
        this.name = name;
        this.ABCData = abcdata;
    }

    get size() {
        return 4 // flags
             + this.name.length + 1
             + this.ABCData.length;
    }

    static read(buffer: ExtendedBuffer) : DoABC {
        const flags = buffer.readUInt32();
        const name = buffer.readString();
        const data = buffer.readBytes(buffer.bytesAvailable);

        return new DoABC(flags, name, data);
    }

    write(buffer: ExtendedBuffer): void { 
        buffer.writeUInt32(this.flags);
        buffer.writeString(this.name);
        buffer.writeBytes(this.ABCData);
    }
}