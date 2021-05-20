import { isBuffer } from "node:util";
import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { Matrix } from "../modules/Matrix";

export class PlaceObject2 {
    hasClipActionsFlag: boolean = false; // to be done at a later date
    hasClipDepthFlag: boolean;
    hasNameFlag: boolean;
    hasRatioFlag: boolean;
    hasColourTransformFlag: boolean = false; // to be done at a later date
    hasMatrixFlag: boolean;
    hasCharacterFlag: boolean;
    hasMoveFlag: boolean;

    depth: number;
    characterId?: number;
    matrix?: Matrix;
    ratio?: number;
    name?: string;
    clipDepth?: number;
    
    
    constructor(hasClipDepthFlag: boolean, hasNameFlag: boolean, hasRatioFlag: boolean, hasMatrixFlag: boolean, hasCharacterFlag: boolean, hasMoveFlag: boolean, depth: number) {
        this.hasClipDepthFlag = hasClipDepthFlag;
        this.hasNameFlag = hasNameFlag;
        this.hasRatioFlag = hasRatioFlag;
        this.hasMatrixFlag = hasMatrixFlag;
        this.hasCharacterFlag = hasCharacterFlag;
        this.hasMoveFlag = hasMoveFlag;
        this.depth = depth;
    }

    static read(buffer: ExtendedBuffer) : PlaceObject2 {
        const hasClipActionsFlag = buffer.readUBits(1) == 1;
        const hasClipDepthFlag = buffer.readUBits(1) == 1;
        const hasNameFlag = buffer.readUBits(1) == 1;
        const hasRatioFlag = buffer.readUBits(1) == 1;
        const hasColourTransformFlag = buffer.readUBits(1) == 1;
        const hasMatrixFlag = buffer.readUBits(1) == 1;
        const hasCharacterFlag = buffer.readUBits(1) == 1;
        const hasMoveFlag = buffer.readUBits(1) == 1;

        const depth = buffer.readUInt16();

        const placeObject = new PlaceObject2(hasClipDepthFlag, hasNameFlag, hasRatioFlag, hasMatrixFlag, hasCharacterFlag, hasMoveFlag, depth);

        if(hasCharacterFlag) {
            placeObject.characterId = buffer.readUInt16();
        }

        if(hasMatrixFlag) {
            placeObject.matrix = Matrix.read(buffer);
        }

        if(hasColourTransformFlag) {
            throw new Error("Colour transform is currently unsupported");
        }

        if(hasRatioFlag) {
            placeObject.ratio = buffer.readUInt16();
        }

        if(hasNameFlag) {
            placeObject.name = buffer.readString();
        }

        if(hasClipDepthFlag) {
            placeObject.clipDepth = buffer.readUInt16();
        }

        if(hasClipActionsFlag) {
            throw new Error("Clip Actions is currently unsupported");
        }

        return placeObject;
    }

    write(buffer: ExtendedBuffer) : void {
        buffer.writeUBits(this.hasClipActionsFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasClipDepthFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasNameFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasRatioFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasColourTransformFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasMatrixFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasCharacterFlag ? 1 : 0, 1);
        buffer.writeUBits(this.hasMoveFlag ? 1 : 0, 1);

        buffer.writeUInt16(this.depth);

        if(this.hasCharacterFlag) {
            if(!this.characterId) {
                throw new Error("Has Character Flag is true but character id is undefined");
            }
            buffer.writeUInt16(this.characterId);
        }

        if(this.hasMatrixFlag) {
            if(!this.matrix) {
                throw new Error("HasMatrix Flag is true but matrix is undefined");
            }
            this.matrix.write(buffer);
        }

        if(this.hasColourTransformFlag) {
            throw new Error("Colour transform is currently unsupported");
        }

        if(this.hasRatioFlag) {
            if(!this.ratio) {
                throw new Error("Has Ratio Flag is true but ratio is undefined");
            }
            buffer.writeUInt16(this.ratio);
        }

        if(this.hasNameFlag) {
            if(!this.name) {
                throw new Error("Has Name Flag is true but name is undefined");
            }
            buffer.writeString(this.name);
        }

        if(this.hasClipDepthFlag) {
            if(!this.clipDepth) {
                throw new Error("Has Clip Depth Flag is true but clipDepth is undefined");
            }
            buffer.writeUInt16(this.clipDepth);
        }

        if(this.hasClipActionsFlag) {
            throw new Error("Clip Actions is currently unsupported");
        }
    }
}