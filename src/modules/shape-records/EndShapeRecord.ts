import { ExtendedBuffer } from "../ExtendedBuffer";

export class EndShapeRecord {
    type: number = 0;
    endOfShape: number = 0;

    constructor() {
    }

    get size() {
        return 1;
    }

    write(buffer: ExtendedBuffer) {
        buffer.writeUBits(this.endOfShape, 5);
    }
}