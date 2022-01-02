import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { ITagData } from "./ITagData";

export class RemoveObject2 implements ITagData {
    depth: number;
    
    get size() : number {
        return 2;
    }

    constructor(depth: number) {
        this.depth = depth;
    }

    static read(buffer: ExtendedBuffer) : RemoveObject2 {
        const depth = buffer.readUInt16();
        return new RemoveObject2(depth);
    }

    write(buffer: ExtendedBuffer) : void {
        buffer.writeUInt16(this.depth);
    }
}