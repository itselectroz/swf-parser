import { ExtendedBuffer } from "./ExtendedBuffer";
import { Rect } from "./Rect";
import { HEADER_COMPRESSION, SWFHeader } from "./SWFHeader";
import { Tag } from "./Tag";

export const DEFAULT_SWF_HEADER = new SWFHeader(HEADER_COMPRESSION.uncompressed, 15, 0, new Rect(-10000, 10000, -10000, 10000), 24.0, 1);

export class SWFFile {
    header: SWFHeader;
    tags: Tag[];

    constructor(header: SWFHeader = DEFAULT_SWF_HEADER, tags: Tag[] = []) { 
        this.header = header;
        this.tags = tags;
    }

    write() {
        this.header.fileLength = this.header.size + this.tags.reduce((size, tag) => size + tag.size, 0);
        const buffer = new ExtendedBuffer(Buffer.alloc(this.header.fileLength));
        this.header.write(buffer);
        for(const tag of this.tags) {
            tag.write(buffer);
        }

        if(this.header.compression == HEADER_COMPRESSION.zlib) {
            buffer.zlibDeflate(SWFHeader.COMPRESSION_OFFSET);
        }
        else if(this.header.compression == HEADER_COMPRESSION.lzma) {
            throw new Error("LZMA Compression is not currently supported.");
        }

        return buffer;
    }

    static load(data: Buffer) : SWFFile {
        const buffer = new ExtendedBuffer(data);
        const header = SWFHeader.read(buffer);

        if(!header) {
            throw new Error("Invalid SWF file.");
        }

        const tags: Tag[] = [];
        while(buffer.bytesAvailable > 0) {
            let tag: Tag = Tag.read(buffer, true);
        
            tags.push(tag);
        }

        return new SWFFile(header, tags);
    }
}