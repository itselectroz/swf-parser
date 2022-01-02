import { ExtendedBuffer } from "../modules/ExtendedBuffer";

export interface ITagData {
    write(buffer: ExtendedBuffer) : void;
}