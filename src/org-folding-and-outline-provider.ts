import {
    CancellationToken,
    DocumentSymbolProvider,
    FoldingRange,
    FoldingRangeProvider,
    Position,
    ProviderResult,
    Range,
    SymbolInformation,
    SymbolKind,
    TextDocument
} from 'vscode';
import * as utils from './utils';

// ChunkType value is used as SymbolKind for outline
enum ChunkType {
    SECTION = SymbolKind.Constant,
    BLOCK = SymbolKind.Number
}
interface Chunk { type: ChunkType, title: string, level: number, startLine: number }

export class OrgFoldingAndOutlineProvider implements FoldingRangeProvider, DocumentSymbolProvider {

    private documentStateRegistry: WeakMap<TextDocument, OrgFoldingAndOutlineDocumentState>;

    constructor() {
        this.documentStateRegistry = new WeakMap();
    }

    public provideFoldingRanges(document: TextDocument, token: CancellationToken): ProviderResult<FoldingRange[]> {
        const state = this.getOrCreateDocumentState(document);
        return state.getRanges(document);
    }

    public provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        const state = this.getOrCreateDocumentState(document);
        return state.getSymbols(document);
    }

    private getOrCreateDocumentState(document: TextDocument): OrgFoldingAndOutlineDocumentState {
        let state = this.documentStateRegistry.get(document);
        if (!state) {
            state = new OrgFoldingAndOutlineDocumentState();
            this.documentStateRegistry.set(document, state);
        }
        return state;
    }
}

class OrgFoldingAndOutlineDocumentState {
    private computedForDocumentVersion: number = null;
    private ranges: FoldingRange[] = [];
    private symbols: SymbolInformation[] = [];

    public getRanges(document: TextDocument): FoldingRange[] {
        this.compute(document);
        return this.ranges;
    }

    public getSymbols(document: TextDocument): SymbolInformation[] {
        this.compute(document);
        return this.symbols;
    }

    private compute(document: TextDocument) {
        if (document.version === this.computedForDocumentVersion) {
            return;
        }
        this.computedForDocumentVersion = document.version;
        this.ranges = [];
        this.symbols = [];

        const count = document.lineCount;
        const stack: Chunk[] = [];
        let inBlock = false;

        for (let lineNumber = 0; lineNumber < count; lineNumber++) {
            const element = document.lineAt(lineNumber);
            const text = element.text;

            if (inBlock) {
                if (utils.isBlockEndLine(text)) {
                    inBlock = false;
                    if (stack.length > 0 && stack[stack.length - 1].type === ChunkType.BLOCK) {
                        const top = stack.pop();
                        this.createSection(top, lineNumber);
                    }
                }
            } else if (utils.isBlockStartLine(text)) {
                inBlock = true;
                const title = this.extractBlockTitle(text);
                stack.push({ type: ChunkType.BLOCK, title, level: Number.MAX_SAFE_INTEGER, startLine: lineNumber });
            } else if (utils.isHeaderLine(text)) {
                const currentLevel = utils.getStarPrefixCount(text);

                // close previous sections
                while (stack.length > 0 && stack[stack.length - 1].level >= currentLevel) {
                    const top = stack.pop();
                    this.createSection(top, lineNumber - 1);
                }

                const title = utils.getHeaderTitle(text);
                stack.push({ type: ChunkType.SECTION, title, level: currentLevel, startLine: lineNumber });
            }
        }

        let top: Chunk;
        while ((top = stack.pop()) != null) {
            this.createSection(top, count - 1);
        }
    }

    private createSection(chunk: Chunk, endLine) {
        this.ranges.push(new FoldingRange(chunk.startLine, endLine));
        this.symbols.push(new SymbolInformation(
            chunk.title,
            chunk.type.valueOf(),
            new Range(
                new Position(chunk.startLine, 0),
                new Position(endLine, 0)
            )
        ));
    }

    private extractBlockTitle(line: string) : string {
        let titleStartAt = line.indexOf('_') + 1;
        if(titleStartAt == 0) {
            titleStartAt = line.indexOf(':') + 2;
        }
        return line.substr(titleStartAt);
    }
}
