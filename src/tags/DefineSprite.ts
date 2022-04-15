import { Tag } from "../main";
import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { Rect } from "../modules/Rect";
import { ShapeWithStyle } from "../modules/ShapeWithStyle";
import { ITagData } from "./ITagData";

export class DefineSprite implements ITagData{
    id: number;
    frameCount: number;
    tags: Tag[];
    
    constructor(id: number, frameCount: number, tags: Tag[]) {
        this.id = id;
        this.frameCount = frameCount;
        this.tags = tags;
    }

    static read(buffer: ExtendedBuffer) : DefineSprite {
        const id = buffer.readUInt16();
        const frameCount = buffer.readUInt16();
        const tags = [];
        while(buffer.bytesAvailable > 0) {
            const tag = Tag.read(buffer, true);
            tags.push(tag);
        }
        return new DefineSprite(id, frameCount, tags);
    }

    write(buffer: ExtendedBuffer): void { 
        buffer.writeUInt16(this.id);
        buffer.writeUInt16(this.frameCount);
        this.tags.forEach(tag => tag.write(buffer));
    }
}