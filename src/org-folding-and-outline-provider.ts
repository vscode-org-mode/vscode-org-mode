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

type SectionStart = { title: string, level: number, lineNumber: number };

export class OrgFoldingAndOutlineProvider implements FoldingRangeProvider, DocumentSymbolProvider {
    private static readonly HEADLINE_SYMBOL = SymbolKind.Struct;

    private ranges: FoldingRange[];
    private symbols: SymbolInformation[];
    private text: string;

    private compute(document: TextDocument) {
        if(document.getText() === this.text) {
            return;
        }
        this.text = document.getText();
        this.ranges = [];
        this.symbols = [];

        const count = document.lineCount;
        let stack: SectionStart[] = [];

        for (let lineNumber = 0; lineNumber < count; lineNumber++) {
            const element = document.lineAt(lineNumber);
            const text = element.text;

            if (text.match(/^\*+ /)) {
                // compute level
                let currentLevel = -1;
                while(text[++currentLevel] === '*');

                // close previous sections
                while(stack.length > 0 && stack[stack.length - 1].level >= currentLevel ) {
                    const top = stack.pop();
                    this.createSection(top.title, top.lineNumber, lineNumber - 1)
                }

                let title = text.substr(text.indexOf(' ') + 1);
                stack.push({ title, level: currentLevel, lineNumber });
            }
        }

        let top: SectionStart;
        while ((top = stack.pop()) != null) {
            this.createSection(top.title, top.lineNumber, count - 1)
        }
    }

    provideFoldingRanges(document: TextDocument, token: CancellationToken): ProviderResult<FoldingRange[]> {
        this.compute(document);
        return this.ranges;
    }

    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        this.compute(document);
        return this.symbols;
    }

    private createSection(title: string, startLine: number, endLine) {
        this.ranges.push(new FoldingRange(startLine, endLine));
        this.symbols.push(new SymbolInformation(
            title,
            OrgFoldingAndOutlineProvider.HEADLINE_SYMBOL,
            new Range(
                new Position(startLine,0),
                new Position(endLine,0)
            )
        ));
    }
}
