import { ExtendedBuffer } from "../ExtendedBuffer";
import { StraightEdgeRecord } from "./StraightEdgeRecord";

export class EdgeRecord {
    type: number = 1;

    constructor() {
    }

    static read(buffer: ExtendedBuffer, level?: number) : StraightEdgeRecord | null {
        level = level || 1;

        const straightFlag = buffer.readUBits(1);

        return straightFlag == 1 ? StraightEdgeRecord.read(buffer, level) : null;
    }
}