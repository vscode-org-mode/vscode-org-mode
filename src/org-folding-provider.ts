import {
    FoldingRangeProvider,
    CancellationToken,
    TextDocument,
    FoldingRange,
    ProviderResult
} from 'vscode';

type FoldStart = { level: number, lineNumber: number };

export class OrgFoldingProvider implements FoldingRangeProvider {
    provideFoldingRanges(document: TextDocument, token: CancellationToken): ProviderResult<FoldingRange[]> {
        const count = document.lineCount;

        let stack: FoldStart[] = [];
        let ranges: FoldingRange[] = [];

        for (let lineNumber = 0; lineNumber < count; lineNumber++) {
            const element = document.lineAt(lineNumber);
            const text = element.text;

            if (!text.startsWith("*")) {
                continue;
            }

            let level = 0;
            while (text[level] === '*') {
                level++;
            }

            const adjustmentCount = stack.length - level + 1;
            for (let i = 0; i < adjustmentCount; i++) {
                const top = stack.pop();
                ranges.push(new FoldingRange(top.lineNumber, lineNumber - 1));
            }

            stack.push({ level, lineNumber });
        }

        let top: FoldStart;
        while ((top = stack.pop()) != null) {
            ranges.push(new FoldingRange(top.lineNumber, count - 1));
        }

        return ranges;
    }
}
