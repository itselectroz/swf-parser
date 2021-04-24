import { Rect } from "./Rect";

export enum HEADER_COMPRESSION {
    uncompressed = 0x46, // F
    zlib = 0x43, // C
    lzma = 0x5A // Z
}

export class SWFHeader {
    compression: HEADER_COMPRESSION;

    constructor(compression: HEADER_COMPRESSION, version: number, fileLength: number, frameSize: Rect, frameRate: number, frameCount: number) {
        this.compression = compression;
    }
}