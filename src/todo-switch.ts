import { workspace, window } from 'vscode';
import { getKeywords, getUniq } from './utils/general_utils';

export default function (todoString: string, action: string) {
    const todoKeywords = getUniq(getKeywords());
    let nextKeywordIdx = todoKeywords.indexOf(todoString);
    if (nextKeywordIdx < 0) {
        window.showErrorMessage(`Keyword '${todoString}' not found`);
        return todoString;
    } else {
        const mod = action === "UP" ? 1 : -1;
        nextKeywordIdx = (nextKeywordIdx + mod);
        if (nextKeywordIdx < 0) {
            nextKeywordIdx = todoKeywords.length - 1;
        } else {
            nextKeywordIdx %= todoKeywords.length;
        }
    }

    let nextWord = todoKeywords[nextKeywordIdx];
    if (todoString === "") {
        nextWord += " ";
    }

    return nextWord;
}