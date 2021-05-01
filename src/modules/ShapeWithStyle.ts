import { ExtendedBuffer } from "./ExtendedBuffer";
import { FillStyleArray } from "./FillStyleArray";
import { LineStyleArray } from "./LineStyleArray";
import { EndShapeRecord } from "./shape-records/EndShapeRecord";
import { StyleChangeRecord } from "./shape-records/StyleChangeRecord";

// TODO:
//  move everything other than the fillStyle and lineStyle into a new Shape class and make this extend that

export class ShapeWithStyle {
    static read(buffer: ExtendedBuffer, level?: number) : ShapeWithStyle {
        level = level || 1;
        const fillStyleArray = FillStyleArray.read(buffer, level);
        const lineStyleArray = LineStyleArray.read(buffer, level);

        // Number of bits required to hold max index of arrays
        const numFillBits = buffer.readUBits(4);
        const numLineBits = buffer.readUBits(4);
        
        let fillBits = numFillBits;
        let lineBits = numLineBits;

        const records: any[] = [];

        while(buffer.bytesAvailable > 0) {
            const type = buffer.readUBits(1);

            let endRecord = false;

            switch(type) {
                case 0: {
                    const record = StyleChangeRecord.read(buffer, fillBits, lineBits);

                    if(record instanceof EndShapeRecord) {
                        endRecord = true;
                        break;
                    }

                    if(record.numFillBits != undefined && record.numLineBits != undefined) {
                        fillBits = record.numFillBits;
                        lineBits = record.numLineBits;
                    }

                    records.push(record);

                    break;
                }
                case 1: {
                    
                    break;
                }
            }

            if(endRecord) {
                break;
            }
        }

        return new ShapeWithStyle();
    }
}