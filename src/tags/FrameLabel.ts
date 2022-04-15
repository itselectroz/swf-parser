import { Tag } from "../main";
import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { Rect } from "../modules/Rect";
import { ShapeWithStyle } from "../modules/ShapeWithStyle";
import { ITagData } from "./ITagData";

export class FrameLabel implements ITagData{
    name: string;
    
    constructor(name: string) {
        this.name = name;
    }

    static read(buffer: ExtendedBuffer) : FrameLabel {
        return new FrameLabel(buffer.readString());
    }

    write(buffer: ExtendedBuffer): void { 
        buffer.writeString(this.name);
    }
}