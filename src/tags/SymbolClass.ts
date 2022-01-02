import { ExtendedBuffer } from "../modules/ExtendedBuffer";
import { ITagData } from "./ITagData";

export type Symbol = {
    characterId: number;
    name: string;
}

export class SymbolClass implements ITagData{

    symbols: Symbol[];
    
    constructor(symbols: Symbol[] = []) {
        this.symbols = symbols;
    }

    get size(): number {
        return 2 + this.symbols.length * 2 + this.symbols.reduce((size, str) => size + str.name.length + 1, 0);
    }

    static read(buffer: ExtendedBuffer) : SymbolClass {
        
        const numSymbols = buffer.readUInt16();

        const symbols: Symbol[] = [];
        for(let i = 0; i < numSymbols; i++) {
            const characterId = buffer.readUInt16();
            const name = buffer.readString();
            symbols.push({
                characterId,
                name
            });
        }

        return new SymbolClass(symbols);
    }

    write(buffer: ExtendedBuffer): void { 
        buffer.writeUInt16(this.symbols.length);

        for(let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            buffer.writeUInt16(symbol.characterId);
            buffer.writeString(symbol.name);
        }
    }
}