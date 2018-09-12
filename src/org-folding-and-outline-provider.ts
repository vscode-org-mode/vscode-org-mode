import {
    FoldingRangeProvider,
    DocumentSymbolProvider,
    CancellationToken,
    TextDocument,
    FoldingRange,
    SymbolInformation,
    ProviderResult,
    SymbolKind,
    Range,
    Position
} from 'vscode';

// ChunkType value is used as SymbolKind for outline
enum ChunkType {
    SECTION = SymbolKind.Constant,
    BLOCK = SymbolKind.Number
}
type Chunk = { type: ChunkType, title: string, level: number, startLine: number };

export class OrgFoldingAndOutlineProvider implements FoldingRangeProvider, DocumentSymbolProvider {

    private documentStateRegistry: WeakMap<TextDocument, OrgFoldingAndOutlineDocumentState>;;

    constructor() {
        this.documentStateRegistry = new WeakMap()
    }

    provideFoldingRanges(document: TextDocument, token: CancellationToken): ProviderResult<FoldingRange[]> {
        let state = this.getOrCreateDocumentState(document);
        return state.getRanges(document);
    }

    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        let state = this.getOrCreateDocumentState(document);
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

    getRanges(document: TextDocument): FoldingRange[] {
        this.compute(document);
        return this.ranges;
    }

    getSymbols(document: TextDocument): SymbolInformation[] {
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
        let stack: Chunk[] = [];
        let inBlock = false;

        for (let lineNumber = 0; lineNumber < count; lineNumber++) {
            const element = document.lineAt(lineNumber);
            const text = element.text;

            if (inBlock) {
                // we look for the end of the block
                if (/^ *#\+END_/i.test(text)) {
                    inBlock = false;
                    if (stack.length > 0 && stack[stack.length - 1].type === ChunkType.BLOCK) {
                        const top = stack.pop();
                        this.createSection(top, lineNumber)
                    }
                }
            } else if (/^ *#\+BEGIN_/i.test(text)) { // block beginning
                inBlock = true;
                let title = text.substr(text.indexOf('_') + 1);
                stack.push({ type: ChunkType.BLOCK, title, level: Number.MAX_SAFE_INTEGER, startLine: lineNumber });
            } else if (/^\*+ /.test(text)) { // header
                // compute level
                let currentLevel = -1;
                while (text[++currentLevel] === '*');

                // close previous sections
                while (stack.length > 0 && stack[stack.length - 1].level >= currentLevel) {
                    const top = stack.pop();
                    this.createSection(top, lineNumber - 1)
                }

                let title = text.substr(text.indexOf(' ') + 1);
                stack.push({ type: ChunkType.SECTION, title, level: currentLevel, startLine: lineNumber });
            }
        }

        let top: Chunk;
        while ((top = stack.pop()) != null) {
            this.createSection(top, count - 1)
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
}
