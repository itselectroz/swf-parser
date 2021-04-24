import { ExtendedBuffer } from "./ExtendedBuffer";
import { Rect } from "./Rect";

export enum HEADER_COMPRESSION {
    uncompressed = 0x46, // F
    zlib = 0x43, // C
    lzma = 0x5A // Z
}

const Signature = "WS";

export class SWFHeader {
    compression: HEADER_COMPRESSION;
    version: number;
    fileLength: number;
    frameSize: Rect;
    frameRate: number;
    frameCount: Number;

    constructor(compression: HEADER_COMPRESSION, version: number, fileLength: number, frameSize: Rect, frameRate: number, frameCount: number) {
        this.compression = compression;
        this.version = version;
        this.fileLength = fileLength;
        this.frameSize = frameSize;
        this.frameRate = frameRate;
        this.frameCount = frameCount;
    }

    get size() {
        return 3 + 1 + 4 + this.frameSize.size + 2 + 2;
    }

    static read(buffer: ExtendedBuffer) : SWFHeader | false {
        const compression: HEADER_COMPRESSION = buffer.readUInt8();
        const signature1 = buffer.readUInt8();
        const signature2 = buffer.readUInt8();
        if(String.fromCharCode(signature1, signature2) != Signature) {
            return false;
        }
        const version = buffer.readUInt8();
        const fileLength = buffer.readUInt32();

        if(compression == HEADER_COMPRESSION.zlib) {
            buffer.zlibInflate();
        }
        
        const frameSize = Rect.read(buffer);
        const frameRate = buffer.readUInt16() / 256; // 1 << 8
        let frameCount = buffer.readUInt16();

        return new SWFHeader(compression, version, fileLength, frameSize, frameRate, frameCount);
    }
}