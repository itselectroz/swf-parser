import { ExtendedBuffer } from "../ExtendedBuffer";

export class StraightEdgeRecord {
    type: number = 1;

    generalLineFlag: boolean;
    verticalLineFlag: boolean;

    deltaX?: number;
    deltaY?: number;

    constructor(generalLineFlag: boolean, verticalLineFlag: boolean) {
        this.generalLineFlag = generalLineFlag;
        this.verticalLineFlag = verticalLineFlag;
    }

    get size() {
        let numBits = Math.max(
            ExtendedBuffer.getBitSize(this.deltaX || 0),
            ExtendedBuffer.getBitSize(this.deltaY || 0),
        );
        if(numBits < 2) {
            numBits = 2;
        }

        return Math.ceil((4 + (this.generalLineFlag ? 1 : 2) + (this.generalLineFlag ? numBits*2 : numBits)) / 8);
    }

    write(buffer: ExtendedBuffer, level?: number) {
        let numBits = Math.max(
            ExtendedBuffer.getBitSize(this.deltaX || 0),
            ExtendedBuffer.getBitSize(this.deltaY || 0),
        );
        if(numBits < 2) {
            numBits = 2;
        }

        buffer.writeUBits(numBits - 2, 4);

        buffer.writeUBits(this.generalLineFlag ? 1 : 0, 1);
        if(!this.generalLineFlag) {
            buffer.writeUBits(this.verticalLineFlag ? 1 : 0, 1);
        }

        if(this.generalLineFlag || !this.verticalLineFlag) {
            buffer.writeBits(this.deltaX || 0, numBits);
        }
        if(this.generalLineFlag || this.verticalLineFlag) {
            buffer.writeBits(this.deltaY || 0, numBits);
        }
    }

    static read(buffer: ExtendedBuffer, level?: number) : StraightEdgeRecord {
        level = level || 1;

        const numBits = buffer.readUBits(4);

        const generalLineFlag = buffer.readUBits(1) == 1;
        const verticalLineFlag = generalLineFlag == true ? false : buffer.readUBits(1) == 1;
        
        const result = new StraightEdgeRecord(generalLineFlag, verticalLineFlag);
        if(generalLineFlag || !verticalLineFlag) {
            result.deltaX = buffer.readBits(numBits + 2);
        }
        if(generalLineFlag || verticalLineFlag) {
            result.deltaY = buffer.readBits(numBits + 2);
        }

        return result;
    }
}