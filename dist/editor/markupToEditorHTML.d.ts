/**
 * Converts markup string → editor-safe innerHTML.
 * Each tagged span carries data-tag (always the canonical short form)
 * so displayToMarkup can round-trip it.
 */
export declare function markupToEditorHTML(markup: string): string;
